import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import type { CharacterModel } from "./types";
import s from "./ModelViewer.module.css";

type Command = "reset" | "in" | "out" | "left" | "right";
function disposeObject(root: THREE.Object3D) {
  const geometries = new Set<THREE.BufferGeometry>(),
    materials = new Set<THREE.Material>(),
    textures = new Set<THREE.Texture>();
  root.traverse((node) => {
    if (!(node instanceof THREE.Mesh)) return;
    geometries.add(node.geometry);
    for (const material of Array.isArray(node.material)
      ? node.material
      : [node.material]) {
      materials.add(material);
      for (const value of Object.values(material))
        if (value instanceof THREE.Texture) textures.add(value);
    }
  });
  for (const texture of textures) {
    texture.dispose();
    if (
      typeof ImageBitmap !== "undefined" &&
      texture.image instanceof ImageBitmap
    )
      texture.image.close();
  }
  for (const material of materials) material.dispose();
  for (const geometry of geometries) geometry.dispose();
}

export default function ModelCanvas({ model }: { model: CharacterModel }) {
  const host = useRef<HTMLDivElement>(null),
    command = useRef<(value: Command) => void>(() => {});
  const [status, setStatus] = useState("Загрузка модели…"),
    [failed, setFailed] = useState(false),
    [ready, setReady] = useState(false);
  useEffect(() => {
    const element = host.current;
    if (!element) return;
    let disposed = false,
      frame = 0,
      renderer: THREE.WebGLRenderer | undefined,
      controls: OrbitControls | undefined,
      observer: ResizeObserver | undefined;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, 1, 0.01, 100);
    const dispose = () => {
      if (disposed) return;
      disposed = true;
      cancelAnimationFrame(frame);
      observer?.disconnect();
      controls?.dispose();
      renderer?.domElement.removeEventListener("webglcontextlost", lost);
      disposeObject(scene);
      scene.clear();
      renderer?.dispose();
      renderer?.forceContextLoss();
      renderer?.domElement.remove();
      command.current = () => {};
    };
    const fail = () => {
      if (!disposed) {
        setFailed(true);
        setReady(false);
        setStatus(
          "WebGL недоступен или модель не загрузилась. Описание персонажа остаётся доступным.",
        );
        dispose();
      }
    };
    const lost = (event: Event) => {
      event.preventDefault();
      fail();
    };
    const render = () => {
      if (disposed || frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        if (!disposed) renderer?.render(scene, camera);
      });
    };
    const init = async () => {
      try {
        renderer = new THREE.WebGLRenderer({
          antialias: true,
          alpha: true,
          powerPreference: "low-power",
        });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.domElement.setAttribute(
          "aria-label",
          `${model.label}: интерактивная модель`,
        );
        renderer.domElement.setAttribute("role", "img");
        renderer.domElement.addEventListener("webglcontextlost", lost);
        element.appendChild(renderer.domElement);
        controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = false;
        controls.enablePan = false;
        controls.maxPolarAngle = Math.PI * 0.92;
        controls.addEventListener("change", render);
        scene.add(new THREE.HemisphereLight(0xe2eaff, 0x635047, 2.2));
        const key = new THREE.DirectionalLight(0xffead5, 2.8);
        key.position.set(3, 6, -5);
        scene.add(key);
        const fill = new THREE.DirectionalLight(0x97b4ff, 1.6);
        fill.position.set(-4, 3, 4);
        scene.add(fill);
        observer = new ResizeObserver(() => {
          if (!renderer || disposed) return;
          const width = Math.max(element.clientWidth, 1),
            height = Math.max(element.clientHeight, 1);
          renderer.setSize(width, height, false);
          camera.aspect = width / height;
          camera.updateProjectionMatrix();
          render();
        });
        observer.observe(element);
        const gltf = await new GLTFLoader().loadAsync(model.src);
        if (disposed) {
          disposeObject(gltf.scene);
          return;
        }
        scene.add(gltf.scene);
        const bounds = new THREE.Box3().setFromObject(gltf.scene),
          center = bounds.getCenter(new THREE.Vector3());
        const radius = bounds.getBoundingSphere(new THREE.Sphere()).radius;
        if (!Number.isFinite(radius) || radius <= 0)
          throw new Error("Empty model");
        controls.target.copy(center);
        controls.minDistance = radius * 1.1;
        controls.maxDistance = radius * 8;
        const reset = () => {
          // Fit the real box in camera space, including portrait viewports.
          const direction = new THREE.Vector3(
            ...model.cameraDirection,
          ).normalize();
          const right = new THREE.Vector3(0, 1, 0).cross(direction).normalize();
          const up = direction.clone().cross(right).normalize();
          const size = bounds.getSize(new THREE.Vector3());
          const extent = (axis: THREE.Vector3) =>
            (Math.abs(axis.x) * size.x +
              Math.abs(axis.y) * size.y +
              Math.abs(axis.z) * size.z) /
            2;
          const tangent = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
          const distance =
            (Math.max(
              extent(up) / tangent,
              extent(right) / (tangent * camera.aspect),
            ) +
              extent(direction)) *
            1.05;
          camera.position.copy(center).add(direction.multiplyScalar(distance));
          controls?.target.copy(center);
          controls?.update();
          render();
        };
        command.current = (value) => {
          if (!controls || disposed) return;
          if (value === "reset") {
            reset();
            return;
          }
          const offset = camera.position.clone().sub(controls.target);
          if (value === "left" || value === "right")
            offset.applyAxisAngle(
              new THREE.Vector3(0, 1, 0),
              value === "left" ? Math.PI / 12 : -Math.PI / 12,
            );
          else
            offset.setLength(
              THREE.MathUtils.clamp(
                offset.length() * (value === "in" ? 0.8 : 1.25),
                controls.minDistance,
                controls.maxDistance,
              ),
            );
          camera.position.copy(controls.target).add(offset);
          controls.update();
          render();
        };
        // No perpetual loop or automatic animation, including reduced-motion mode.
        reset();
        setStatus(
          "Модель загружена. Статическая поза; анимации пока не воспроизводятся.",
        );
        setReady(true);
      } catch {
        fail();
      }
    };
    void init();
    return dispose;
  }, [model]);
  return (
    <>
      {!failed && <div ref={host} className={s.canvas} />}
      <p role="status" className={s.status}>
        {status}
      </p>
      {!failed && (
        <div className={s.controls} aria-label="Управление камерой">
          <button
            type="button"
            disabled={!ready}
            onClick={() => command.current("left")}
            aria-label="Повернуть влево"
          >
            ←
          </button>
          <button
            type="button"
            disabled={!ready}
            onClick={() => command.current("right")}
            aria-label="Повернуть вправо"
          >
            →
          </button>
          <button
            type="button"
            disabled={!ready}
            onClick={() => command.current("in")}
            aria-label="Приблизить"
          >
            +
          </button>
          <button
            type="button"
            disabled={!ready}
            onClick={() => command.current("out")}
            aria-label="Отдалить"
          >
            −
          </button>
          <button
            type="button"
            disabled={!ready}
            onClick={() => command.current("reset")}
          >
            Сбросить камеру
          </button>
        </div>
      )}
      {!failed && (
        <p className={s.hint}>
          Потяните мышью или одним пальцем для вращения. Колесо или жест двумя
          пальцами меняет масштаб.
        </p>
      )}
    </>
  );
}
