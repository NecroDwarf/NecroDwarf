// Build-time only. No renderer/Three dependency is imported by Wiki pages.
import { readFile, writeFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import { createServer } from "vite";
const { chromium } = await import(
  pathToFileURL(process.env.PLAYWRIGHT_MODULE).href
);
const jobs = JSON.parse(
  await readFile("../.audit/maniac-3c-render-queue.json", "utf8"),
);
const server = await createServer({
  server: { host: "127.0.0.1", port: 5187 },
  appType: "custom",
  plugins: [
    {
      name: "system-art-render",
      resolveId(id) {
        if (id === "/render-system-entry.js") return id;
      },
      load(id) {
        if (id === "/render-system-entry.js")
          return "import * as THREE from 'three'; window.systemTHREE=THREE;";
      },
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url !== "/") return next();
          res.setHeader("Content-Type", "text/html");
          res.end(
            '<html><script type="module" src="/render-system-entry.js"></script></html>',
          );
        });
      },
    },
  ],
});
await server.listen();
const address = server.httpServer.address();
const browser = await chromium.launch({ channel: "msedge", headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 320, height: 320 } });
  await page.goto(`http://127.0.0.1:${address.port}/`);
  await page.waitForFunction(() => window.systemTHREE);
  for (const job of jobs) {
    if (
      process.argv.includes("--missing") &&
      (await readFile(job.output).then(
        () => true,
        () => false,
      ))
    )
      continue;
    const result = await page.evaluate(async (job) => {
      const T = window.systemTHREE;
      const renderer = new T.WebGLRenderer({
        alpha: true,
        antialias: true,
        preserveDrawingBuffer: true,
      });
      renderer.setSize(320, 320);
      renderer.setClearColor(0, 0);
      renderer.outputColorSpace = T.SRGBColorSpace;
      const scene = new T.Scene(),
        group = new T.Group();
      scene.add(group);
      scene.add(new T.HemisphereLight(0xffffff, 0x888899, 2));
      const light = new T.DirectionalLight(0xffffff, 2);
      light.position.set(-3, 5, 8);
      scene.add(light);
      const textures = {};
      const load = async (key, seen = []) => {
        if (textures[key]) return textures[key];
        if (seen.includes(key)) throw Error("texture reference cycle");
        let value = job.textures[key];
        if (!value) throw Error("missing texture " + key);
        if (value.startsWith("#")) return load(value.slice(1), [...seen, key]);
        const texture = await new T.TextureLoader().loadAsync(value);
        texture.colorSpace = T.SRGBColorSpace;
        texture.magFilter = T.NearestFilter;
        texture.minFilter = T.NearestFilter;
        textures[key] = texture;
        return texture;
      };
      const faceVertices = (dir, a, b) => {
        const [x, y, z] = a,
          [X, Y, Z] = b;
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
      };
      for (const el of job.model.elements) {
        const part = new T.Group();
        group.add(part);
        for (const [dir, face] of Object.entries(el.faces || {})) {
          const points = faceVertices(dir, el.from, el.to);
          if (!points) throw Error("unknown face");
          const tex = await load(face.texture.replace(/^#/, ""));
          const uv = face.uv;
          if (!uv) throw Error("implicit UV unsupported; do not guess");
          let coords = [
            [uv[0] / 16, 1 - uv[1] / 16],
            [uv[0] / 16, 1 - uv[3] / 16],
            [uv[2] / 16, 1 - uv[3] / 16],
            [uv[2] / 16, 1 - uv[1] / 16],
          ];
          const turns = (face.rotation || 0) / 90;
          coords = coords.map((_, i) => coords[(i + turns) % 4]);
          const geo = new T.BufferGeometry();
          geo.setAttribute(
            "position",
            new T.Float32BufferAttribute(points.flat(), 3),
          );
          geo.setAttribute(
            "uv",
            new T.Float32BufferAttribute(coords.flat(), 2),
          );
          geo.setIndex([0, 1, 2, 0, 2, 3]);
          geo.computeVertexNormals();
          part.add(
            new T.Mesh(
              geo,
              new T.MeshLambertMaterial({
                map: tex,
                transparent: true,
                alphaTest: 0.03,
                side: T.DoubleSide,
              }),
            ),
          );
        }
        if (el.rotation) {
          const { origin, axis, angle, rescale } = el.rotation;
          const pivot = new T.Group();
          group.remove(part);
          group.add(pivot);
          pivot.position.fromArray(origin);
          part.position.set(...origin.map((v) => -v));
          pivot.add(part);
          pivot.rotation[axis] = T.MathUtils.degToRad(angle);
          if (rescale) {
            const factor = 1 / Math.cos(T.MathUtils.degToRad(angle));
            for (const a of ["x", "y", "z"])
              if (a !== axis) pivot.scale[a] = factor;
          }
        }
      }
      const centered = new T.Group();
      scene.remove(group);
      centered.add(group);
      group.position.set(-8, -8, -8);
      scene.add(centered);
      const gui = job.model.display?.gui;
      centered.rotation.set(
        ...(gui?.rotation || [30, 225, 0]).map(T.MathUtils.degToRad),
      );
      if (gui?.scale) centered.scale.fromArray(gui.scale);
      if (gui?.translation) centered.position.fromArray(gui.translation);
      scene.updateMatrixWorld(true);
      const bounds = new T.Box3().setFromObject(centered),
        center = bounds.getCenter(new T.Vector3()),
        size = bounds.getSize(new T.Vector3());
      const extent = Math.max(size.x, size.y) * 0.64;
      const camera = new T.OrthographicCamera(
        -extent,
        extent,
        extent,
        -extent,
        0.1,
        1000,
      );
      camera.position.set(center.x, center.y, center.z + 100);
      camera.lookAt(center);
      renderer.render(scene, camera);
      const url = renderer.domElement.toDataURL("image/png");
      renderer.dispose();
      return url;
    }, job);
    await writeFile(job.output, Buffer.from(result.split(",")[1], "base64"));
    console.log("Rendered", job.entityId);
  }
} finally {
  await browser.close();
  await server.close();
}
