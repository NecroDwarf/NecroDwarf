import { readFile, writeFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";
import { createHash } from "node:crypto";
import { Document, NodeIO } from "@gltf-transform/core";
import { dedup, prune, weld } from "@gltf-transform/functions";
import { Euler, Quaternion, Vector3 } from "three";

// Bedrock -> Blockbench coordinates: mirror X, negate X/Y rotations, ZYX.
// UV boxes and explicit up/down UV follow the original Bedrock importer.
// See docs/MANIAC_WIKI_FOUNDATION.md for primary references and limits.
const point = ([x = 0, y = 0, z = 0] = []) => new Vector3(-x, y, z);
const rotation = ([x = 0, y = 0, z = 0] = []) =>
  new Quaternion().setFromEuler(
    new Euler(
      (-x * Math.PI) / 180,
      (-y * Math.PI) / 180,
      (z * Math.PI) / 180,
      "ZYX",
    ),
  );

export function faceUVs(cube, mirrored = false) {
  if (!Array.isArray(cube.uv)) {
    return Object.fromEntries(
      Object.entries(cube.uv).map(([name, face]) => {
        if (face.uv_rotation)
          throw new Error("UV rotation needs explicit converter support");
        let [u, v] = face.uv,
          [w, h] = face.uv_size;
        if (name === "up" || name === "down") {
          u += w;
          v += h;
          w *= -1;
          h *= -1;
        }
        return [name, [u, v, u + w, v + h]];
      }),
    );
  }
  const [u, v] = cube.uv,
    [x, y, z] = cube.size.map((n) => Math.floor(n + 1e-7));
  const faces = {
    east: [0, z, z, y],
    west: [z + x, z, z, y],
    up: [z + x, z, -x, -z],
    down: [z + x * 2, 0, -x, z],
    south: [z * 2 + x, z, x, y],
    north: [z, z, x, y],
  };
  if (mirrored) {
    for (const face of Object.values(faces)) {
      face[0] += face[2];
      face[2] *= -1;
    }
    [faces.east, faces.west] = [faces.west, faces.east];
  }
  return Object.fromEntries(
    Object.entries(faces).map(([name, [a, b, w, h]]) => [
      name,
      [u + a, v + b, u + a + w, v + b + h],
    ]),
  );
}

function facePoint(name, a, b, from, to) {
  const lerp = (min, max, t) => min + (max - min) * t;
  const [x, y, z] = from,
    [X, Y, Z] = to;
  switch (name) {
    case "east":
      return new Vector3(X, lerp(Y, y, b), lerp(Z, z, a));
    case "west":
      return new Vector3(x, lerp(Y, y, b), lerp(z, Z, a));
    case "north":
      return new Vector3(lerp(X, x, a), lerp(Y, y, b), z);
    case "south":
      return new Vector3(lerp(x, X, a), lerp(Y, y, b), Z);
    case "up":
      return new Vector3(lerp(x, X, a), Y, lerp(z, Z, b));
    case "down":
      return new Vector3(lerp(x, X, a), y, lerp(Z, z, b));
    default:
      throw new Error(`Unknown face ${name}`);
  }
}

export function cubeGeometry(cube, bone, textureWidth, textureHeight) {
  const inflate = cube.inflate ?? bone.inflate ?? 0;
  const origin = point(cube.origin);
  origin.x -= cube.size[0];
  const from = origin.clone().addScalar(-inflate).toArray();
  const to = origin
    .clone()
    .add(new Vector3(...cube.size))
    .addScalar(inflate)
    .toArray();
  const pivot = point(cube.pivot),
    bonePivot = point(bone.pivot),
    q = rotation(cube.rotation);
  const result = { positions: [], normals: [], uvs: [], indices: [] };
  for (const [face, [u, v, U, V]] of Object.entries(
    faceUVs(cube, cube.mirror ?? bone.mirror),
  )) {
    const corners = [
      [0, 0],
      [1, 0],
      [0, 1],
      [1, 1],
    ].map(([a, b]) => facePoint(face, a, b, from, to));
    const normal = corners[2]
      .clone()
      .sub(corners[0])
      .cross(corners[1].clone().sub(corners[0]));
    // Flat cubes are real geometry (antlers/hair). Skip only zero-area faces.
    if (normal.lengthSq() < 1e-12) continue;
    normal.normalize().applyQuaternion(q);
    const offset = result.positions.length / 3;
    for (let i = 0; i < 4; i++) {
      const vertex = corners[i]
        .sub(pivot)
        .applyQuaternion(q)
        .add(pivot)
        .sub(bonePivot)
        .divideScalar(16);
      result.positions.push(...vertex.toArray());
      result.normals.push(...normal.toArray());
      result.uvs.push(
        (i % 2 ? U : u) / textureWidth,
        (i > 1 ? V : v) / textureHeight,
      );
    }
    result.indices.push(
      offset,
      offset + 2,
      offset + 1,
      offset + 2,
      offset + 3,
      offset + 1,
    );
  }
  return result;
}

export async function convertBedrock({
  folder,
  basename,
  textureFile,
  label,
  pose,
}) {
  const jsonBytes = await readFile(`${folder}/source/${basename}.geo.json`);
  const input = JSON.parse(jsonBytes);
  if (
    input.format_version !== "1.12.0" ||
    input["minecraft:geometry"].length !== 1
  )
    throw new Error("Expected one Bedrock 1.12.0 geometry");
  const geometry = input["minecraft:geometry"][0],
    bones = geometry.bones;
  const doc = new Document(),
    buffer = doc.createBuffer(basename === "windigo" ? "keeper" : basename);
  const texture = doc
    .createTexture(`${basename}-original`)
    .setImage(await readFile(`${folder}/source/${textureFile}`))
    .setMimeType("image/png");
  const material = doc
    .createMaterial(basename)
    .setBaseColorTexture(texture)
    .setRoughnessFactor(1)
    .setMetallicFactor(0)
    .setDoubleSided(true)
    .setAlphaMode("MASK")
    .setAlphaCutoff(0.5);
  material.getBaseColorTextureInfo().setMagFilter(9728).setMinFilter(9728);
  const scene = doc.createScene(label);
  const nodes = new Map(
    bones.map((bone) => [bone.name, doc.createNode(bone.name)]),
  );
  let cubes = 0,
    planes = 0,
    triangles = 0;
  for (const bone of bones) {
    const node = nodes.get(bone.name),
      parent = bones.find((b) => b.name === bone.parent);
    if (bone.parent && !parent)
      throw new Error(`Missing bone parent ${bone.parent}`);
    node
      .setTranslation(
        point(bone.pivot).sub(point(parent?.pivot)).divideScalar(16).toArray(),
      )
      .setRotation(rotation(bone.rotation).toArray());
    // Optional, explicitly numeric static snapshot; never evaluate Molang here.
    const transform = pose?.bones[bone.name];
    if (transform) {
      for (const channel of Object.values(transform))
        if (
          !Array.isArray(channel.vector) ||
          channel.vector.length !== 3 ||
          !channel.vector.every(Number.isFinite)
        )
          throw new Error(`Non-static pose channel: ${bone.name}`);
      if (transform.position)
        node.setTranslation(
          point(bone.pivot)
            .sub(point(parent?.pivot))
            .add(point(transform.position.vector))
            .divideScalar(16)
            .toArray(),
        );
      if (transform.rotation)
        node.setRotation(
          rotation(bone.rotation)
            .multiply(rotation(transform.rotation.vector))
            .toArray(),
        );
      if (transform.scale) node.setScale(transform.scale.vector);
    }
    if (parent) nodes.get(parent.name).addChild(node);
    else scene.addChild(node);
    const all = { positions: [], normals: [], uvs: [], indices: [] };
    for (const cube of bone.cubes ?? []) {
      const part = cubeGeometry(
        cube,
        bone,
        geometry.description.texture_width,
        geometry.description.texture_height,
      );
      const offset = all.positions.length / 3;
      all.indices.push(...part.indices.map((index) => index + offset));
      for (const key of ["positions", "normals", "uvs"])
        all[key].push(...part[key]);
      cubes++;
      if (cube.size.includes(0)) planes++;
    }
    if (!all.indices.length) continue;
    const accessor = (name, type, array) =>
      doc.createAccessor(name).setType(type).setArray(array).setBuffer(buffer);
    const primitive = doc
      .createPrimitive()
      .setAttribute(
        "POSITION",
        accessor(
          `${bone.name}-position`,
          "VEC3",
          new Float32Array(all.positions),
        ),
      )
      .setAttribute(
        "NORMAL",
        accessor(`${bone.name}-normal`, "VEC3", new Float32Array(all.normals)),
      )
      .setAttribute(
        "TEXCOORD_0",
        accessor(`${bone.name}-uv`, "VEC2", new Float32Array(all.uvs)),
      )
      .setIndices(
        accessor(
          `${bone.name}-indices`,
          "SCALAR",
          new Uint16Array(all.indices),
        ),
      )
      .setMaterial(material);
    node.setMesh(doc.createMesh(bone.name).addPrimitive(primitive));
    triangles += all.indices.length / 3;
  }
  await doc.transform(dedup(), weld(), prune({ keepLeaves: true }));
  const report = {
    converter: "bedrock-cubes-v1",
    sourceCommit: "8692f66dc76582144be85d553d43a41f189b64e7",
    sourceSha256: createHash("sha256").update(jsonBytes).digest("hex"),
    bones: bones.length,
    cubes,
    planes,
    triangles,
    units: "16 source units = 1 block",
    animations: pose
      ? `static ${pose.label ?? "numeric pose"} snapshot; no playback`
      : "static bind pose only",
  };
  doc.getRoot().setExtras(report);
  await new NodeIO().write(
    `${folder}/${basename === "windigo" ? "keeper" : basename}.glb`,
    doc,
  );
  await writeFile(
    `${folder}/conversion.json`,
    JSON.stringify(report, null, 2) + "\n",
  );
  console.log(
    `Converted ${cubes} cubes (${planes} flat) / ${bones.length} bones → ${basename}`,
  );
}
export async function convertKeeper() {
  return convertBedrock({
    folder: "src/app/projects/maniac/assets/models/keeper",
    basename: "windigo",
    textureFile: "windigo.png",
    label: "Хранитель кошмаров",
  });
}
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href
)
  await convertKeeper();
