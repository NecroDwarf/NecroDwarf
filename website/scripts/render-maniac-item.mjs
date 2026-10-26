import { createServer } from "vite";
import { readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { pathToFileURL } from "node:url";
import { format } from "prettier";

// A build-time renderer only. Playwright can be installed separately or supplied
// by the workspace runtime; it is not a dependency of the website or its build.
const { chromium } = await import(
  process.env.MANIAC_PLAYWRIGHT_MODULE
    ? pathToFileURL(process.env.MANIAC_PLAYWRIGHT_MODULE).href
    : "playwright"
);
const folder = "src/app/projects/maniac/assets/models/nightmare-lighter";
const output =
  "src/app/projects/maniac/assets/wiki/nightmare-lighter-render.png";
const cameraDirection = [1, 0.65, -1];
const source = `
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
const renderer = new THREE.WebGLRenderer({alpha:true, antialias:true, preserveDrawingBuffer:true});
renderer.setSize(512,512); renderer.setPixelRatio(1);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.setClearColor(0x000000,0);
document.body.append(renderer.domElement);
const scene = new THREE.Scene();
scene.add(new THREE.HemisphereLight(0xffffff,0x606060,2));
const key=new THREE.DirectionalLight(0xffffff,1.8);key.position.set(3,6,-5);scene.add(key);
const fill=new THREE.DirectionalLight(0xffffff,1);fill.position.set(-4,2,3);scene.add(fill);
const gltf=await new GLTFLoader().loadAsync('/${folder}/nightmare_lighter.glb');
scene.add(gltf.scene); scene.updateMatrixWorld(true);
const bounds=new THREE.Box3().setFromObject(gltf.scene);
const center=bounds.getCenter(new THREE.Vector3());
const direction=new THREE.Vector3(...${JSON.stringify(cameraDirection)}).normalize();
const camera=new THREE.OrthographicCamera(-1,1,1,-1,0.01,100);
camera.position.copy(center).add(direction.clone().multiplyScalar(5));camera.lookAt(center);camera.updateMatrixWorld();
const projected=new THREE.Box3();
gltf.scene.traverse(n=>{
 if(!n.isMesh) return;
 const p=n.geometry.getAttribute('position');
 for(let i=0;i<p.count;i++) projected.expandByPoint(new THREE.Vector3().fromBufferAttribute(p,i).applyMatrix4(n.matrixWorld).applyMatrix4(camera.matrixWorldInverse));
});
const size=projected.getSize(new THREE.Vector3());
const half=Math.max(size.x,size.y)/2/0.86;
const mid=projected.getCenter(new THREE.Vector3());
camera.left=mid.x-half;camera.right=mid.x+half;camera.bottom=mid.y-half;camera.top=mid.y+half;
camera.updateProjectionMatrix();renderer.render(scene,camera);
window.renderedIcon={png:renderer.domElement.toDataURL('image/png'),bounds:projected.min.toArray().concat(projected.max.toArray())};
`;
const server = await createServer({
  appType: "custom",
  server: { host: "127.0.0.1", port: 5186, strictPort: true },
  plugins: [
    {
      name: "build-time-item-render",
      resolveId(id) {
        if (id === "/item-render.js") return "\0item-render";
      },
      load(id) {
        if (id === "\0item-render") return source;
      },
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url !== "/") return next();
          res.setHeader("Content-Type", "text/html");
          res.end(
            '<html><body style="margin:0"><script type="module" src="/item-render.js"></script></body></html>',
          );
        });
      },
    },
  ],
});
let browser;
try {
  await server.listen();
  browser = await chromium.launch({
    channel: process.env.MANIAC_BROWSER ?? "msedge",
    headless: true,
  });
  const page = await browser.newPage();
  page.on("pageerror", (error) => console.error(error));
  await page.goto("http://127.0.0.1:5186");
  await page.waitForFunction(() => window.renderedIcon, null, {
    timeout: 30000,
  });
  const result = await page.evaluate(() => window.renderedIcon);
  const bytes = Buffer.from(result.png.split(",")[1], "base64");
  await writeFile(output, bytes);
  const hash = (data) => createHash("sha256").update(data).digest("hex");
  await writeFile(
    `${folder}/render.json`,
    await format(
      JSON.stringify(
        {
          sourceCommit: "8692f66dc76582144be85d553d43a41f189b64e7",
          modelSha256: hash(await readFile(`${folder}/nightmare_lighter.glb`)),
          output,
          sha256: hash(bytes),
          size: [512, 512],
          pose: "original opening animation at 1.5833s (open lid, original flame geometry)",
          cameraDirection,
          projection: "orthographic",
          visibleOccupancy: 0.86,
          renderer:
            "Three.js; nearest original texture; studio lighting, no Minecraft shaders",
          three: "0.186.1",
          browser: await browser.version(),
          projectedBounds: result.bounds,
        },
        null,
        2,
      ),
      { parser: "json" },
    ),
  );
  console.log(`Rendered original lighter → ${output} (${bytes.length} bytes)`);
} finally {
  await browser?.close();
  await server.close();
}
