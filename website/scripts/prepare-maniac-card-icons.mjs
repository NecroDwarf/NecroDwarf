// Offline asset preparation; no renderer or Sharp dependency enters site code.
import { execFileSync } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import sharp from "sharp";

const repo =
  process.env.MANIAC_SOURCE_REPO || "E:/coding/Github/Maniac-mod-evolution";
const commit = "8692f66dc76582144be85d553d43a41f189b64e7";
const root = "src/main/resources/assets/maniacrev/";
const output = "src/app/projects/maniac/assets/wiki/restored";
const sources = new Map();
function source(path) {
  if (!sources.has(path))
    sources.set(
      path,
      execFileSync("git", [
        "-c",
        `safe.directory=${repo}`,
        "-C",
        repo,
        "show",
        `${commit}:${path}`,
      ]),
    );
  return sources.get(path);
}
const sha = (bytes) => createHash("sha256").update(bytes).digest("hex");
function rotate(p, axis, angle) {
  const a = (angle * Math.PI) / 180,
    c = Math.cos(a),
    s = Math.sin(a);
  const q = [...p],
    i = (axis + 1) % 3,
    j = (axis + 2) % 3;
  q[i] = c * p[i] - s * p[j];
  q[j] = s * p[i] + c * p[j];
  return q;
}
function facePoints(dir, [x, y, z], [X, Y, Z]) {
  return {
    south: [
      [x, Y, Z],
      [x, y, Z],
      [X, y, Z],
      [X, Y, Z],
    ],
    north: [
      [X, Y, z],
      [X, y, z],
      [x, y, z],
      [x, Y, z],
    ],
    east: [
      [X, Y, Z],
      [X, y, Z],
      [X, y, z],
      [X, Y, z],
    ],
    west: [
      [x, Y, z],
      [x, y, z],
      [x, y, Z],
      [x, Y, Z],
    ],
    up: [
      [x, Y, z],
      [x, Y, Z],
      [X, Y, Z],
      [X, Y, z],
    ],
    down: [
      [x, y, Z],
      [x, y, z],
      [X, y, z],
      [X, y, Z],
    ],
  }[dir];
}
async function renderModel(name) {
  const modelPath = `${root}models/item/${name}.json`;
  const model = JSON.parse(source(modelPath));
  if (!model.elements?.length) throw Error(`No cuboid geometry: ${name}`);
  const textures = new Map();
  async function texture(key) {
    if (textures.has(key)) return textures.get(key);
    let ref = model.textures[key];
    const seen = new Set([key]);
    while (ref?.startsWith("#")) {
      const next = ref.slice(1);
      if (seen.has(next)) throw Error("Cyclic texture reference");
      seen.add(next);
      ref = model.textures[next];
    }
    let image;
    if (!ref && key === "missing") {
      // Minecraft's unresolved texture; keep the original geometry visible.
      const data = Buffer.alloc(16 * 16 * 4);
      for (let y = 0; y < 16; y++)
        for (let x = 0; x < 16; x++) {
          const i = (y * 16 + x) * 4,
            on = x < 8 === y < 8;
          data[i] = on ? 248 : 0;
          data[i + 2] = on ? 248 : 0;
          data[i + 3] = 255;
        }
      image = { data, width: 16, height: 16 };
    } else {
      if (!ref?.startsWith("maniacrev:"))
        throw Error(`Unknown texture ${key}: ${ref}`);
      const { data, info } = await sharp(
        source(`${root}textures/${ref.split(":")[1]}.png`),
      )
        .ensureAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });
      image = { data, width: info.width, height: info.height };
    }
    textures.set(key, image);
    return image;
  }
  const faces = [];
  const gui = model.display?.gui ?? {};
  for (const element of model.elements) {
    for (const [dir, face] of Object.entries(element.faces ?? {})) {
      if (!face.uv) throw Error(`Implicit UV not supported: ${name}/${dir}`);
      const image = await texture(face.texture.replace(/^#/, ""));
      const points = facePoints(dir, element.from, element.to).map((point) => {
        let p = [...point];
        if (element.rotation) {
          const { axis, angle, origin, rescale } = element.rotation,
            index = "xyz".indexOf(axis);
          p = p.map((v, i) => v - origin[i]);
          if (rescale)
            p = p.map((v, i) =>
              i === index ? v : v / Math.cos((angle * Math.PI) / 180),
            );
          p = rotate(p, index, angle).map((v, i) => v + origin[i]);
        }
        p = p.map((v, i) => (v - 8) * (gui.scale?.[i] ?? 1));
        for (const axis of [2, 1, 0])
          p = rotate(p, axis, gui.rotation?.[axis] ?? [30, 225, 0][axis]);
        return p;
      });
      const [u, v, U, V] = face.uv;
      const uv = [
        [u, v],
        [u, V],
        [U, V],
        [U, v],
      ];
      const turns = (face.rotation ?? 0) / 90;
      faces.push({ points, image, uv: uv.map((_, i) => uv[(i + turns) % 4]) });
    }
  }
  const all = faces.flatMap((f) => f.points),
    xs = all.map((p) => p[0]),
    ys = all.map((p) => p[1]);
  const cx = (Math.min(...xs) + Math.max(...xs)) / 2,
    cy = (Math.min(...ys) + Math.max(...ys)) / 2;
  const size = 256,
    scale =
      224 /
      Math.max(
        Math.max(...xs) - Math.min(...xs),
        Math.max(...ys) - Math.min(...ys),
      );
  const pixels = Buffer.alloc(size * size * 4),
    depth = new Float64Array(size * size).fill(-Infinity);
  for (const { points, image, uv } of faces) {
    const a = points[1].map((v, i) => v - points[0][i]),
      b = points[2].map((v, i) => v - points[0][i]);
    let n = [
      a[1] * b[2] - a[2] * b[1],
      a[2] * b[0] - a[0] * b[2],
      a[0] * b[1] - a[1] * b[0],
    ];
    const length = Math.hypot(...n);
    if (length < 1e-9) continue;
    n = n.map((v) => (v / length) * (n[2] < 0 ? -1 : 1));
    const light =
      0.68 +
      0.38 *
        Math.max(
          0,
          (-0.3 * n[0] + 0.6 * n[1] + n[2]) / Math.hypot(0.3, 0.6, 1),
        );
    const p = points.map(([x, y, z]) => [
      (x - cx) * scale + size / 2,
      size / 2 - (y - cy) * scale,
      z,
    ]);
    for (const indices of [
      [0, 1, 2],
      [0, 2, 3],
    ]) {
      const [A, B, C] = indices.map((i) => p[i]),
        [ta, tb, tc] = indices.map((i) => uv[i]);
      const denominator =
        (B[1] - C[1]) * (A[0] - C[0]) + (C[0] - B[0]) * (A[1] - C[1]);
      if (Math.abs(denominator) < 1e-8) continue;
      const minX = Math.max(0, Math.floor(Math.min(A[0], B[0], C[0]))),
        maxX = Math.min(size - 1, Math.ceil(Math.max(A[0], B[0], C[0])));
      const minY = Math.max(0, Math.floor(Math.min(A[1], B[1], C[1]))),
        maxY = Math.min(size - 1, Math.ceil(Math.max(A[1], B[1], C[1])));
      for (let y = minY; y <= maxY; y++)
        for (let x = minX; x <= maxX; x++) {
          const w1 =
            ((B[1] - C[1]) * (x + 0.5 - C[0]) +
              (C[0] - B[0]) * (y + 0.5 - C[1])) /
            denominator;
          const w2 =
              ((C[1] - A[1]) * (x + 0.5 - C[0]) +
                (A[0] - C[0]) * (y + 0.5 - C[1])) /
              denominator,
            w3 = 1 - w1 - w2;
          if (Math.min(w1, w2, w3) < -1e-7) continue;
          const z = w1 * A[2] + w2 * B[2] + w3 * C[2],
            at = y * size + x;
          if (z < depth[at]) continue;
          const u = w1 * ta[0] + w2 * tb[0] + w3 * tc[0],
            v = w1 * ta[1] + w2 * tb[1] + w3 * tc[1];
          const tx = Math.max(
              0,
              Math.min(image.width - 1, Math.floor((u / 16) * image.width)),
            ),
            ty = Math.max(
              0,
              Math.min(image.height - 1, Math.floor((v / 16) * image.height)),
            );
          const from = (ty * image.width + tx) * 4,
            to = at * 4;
          if (image.data[from + 3] < 8) continue;
          for (let i = 0; i < 3; i++)
            pixels[to + i] = Math.min(
              255,
              Math.round(image.data[from + i] * light),
            );
          pixels[to + 3] = image.data[from + 3];
          depth[at] = z;
        }
    }
  }
  return {
    bytes: await sharp(pixels, {
      raw: { width: size, height: size, channels: 4 },
    })
      .png()
      .toBuffer(),
    width: size,
    height: size,
    modelPath,
  };
}
await mkdir(output, { recursive: true });
const files = [];
for (const [slug, model] of [
  ["death-scythe", "death_scythe"],
  ["plague-lantern", "plague_lantern"],
  ["agent47-tablet", "agent47_tablet_base"],
]) {
  const result = await renderModel(model);
  await writeFile(`${output}/${slug}.png`, result.bytes);
  files.push({
    slug,
    width: result.width,
    height: result.height,
    kind: "item-render",
    sha256: sha(result.bytes),
    model: result.modelPath,
  });
}
for (const [slug, path] of [
  ["clarity", "textures/item/clarity.png"],
  ["rose-colored-glasses", "textures/mob_effect/rose_colored_glasses.png"],
]) {
  const bytes = source(root + path);
  await writeFile(`${output}/${slug}.png`, bytes);
  files.push({
    slug,
    width: bytes.readUInt32BE(16),
    height: bytes.readUInt32BE(20),
    kind: "pixel-texture",
    sha256: sha(bytes),
    source: root + path,
  });
}
await writeFile(
  `${output}/imports.json`,
  JSON.stringify(
    {
      commit,
      renderer:
        "Orthographic CPU cuboid/UV rasterization, original GUI rotation, depth buffer; 256px transparent PNG",
      files,
      sources: [...sources].map(([path, bytes]) => ({
        path,
        sha256: sha(bytes),
      })),
    },
    null,
    2,
  ) + "\n",
);
console.log(
  `Prepared ${files.length} original game icons from ${sources.size} pinned source files.`,
);
