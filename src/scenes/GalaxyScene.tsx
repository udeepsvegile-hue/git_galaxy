/**
 * GitVerse — GalaxyScene
 * Root 3D scene: Canvas setup, postprocessing pipeline, scene graph orchestration.
 */

import { Suspense, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { AdaptiveDpr, AdaptiveEvents, PerformanceMonitor } from "@react-three/drei";
import {
  EffectComposer,
  Bloom,
  Vignette,
  ChromaticAberration,
} from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import { Vector2 } from "three";

import { useAppStore, selectGalaxyConfig } from "@/hooks/useAppStore";
import SceneGraph from "./SceneGraph";
import CameraController from "./CameraController";
import GalaxyHUD from "@/components/hud/GalaxyHUD";

export default function GalaxyScene() {
  const galaxyConfig = useAppStore(selectGalaxyConfig);
  const degraded = useRef(false);

  if (!galaxyConfig) return null;

  return (
    <div
      style={{ width: "100%", height: "100%", position: "relative", background: "#000814" }}
    >
      {/* ── Three.js Canvas ───────────────────────── */}
      <Canvas
        camera={{ position: [0, 25, 70], fov: 55, near: 0.05, far: 3000 }}
        gl={{
          antialias: true,
          powerPreference: "high-performance",
          alpha: false,
          stencil: false,
          depth: true,
        }}
        dpr={[1, 2]}
        shadows={false}
        style={{ position: "absolute", inset: 0 }}
      >
        <PerformanceMonitor onDecline={() => { degraded.current = true; }}>
          <AdaptiveDpr pixelated />
          <AdaptiveEvents />

          <Suspense fallback={null}>
            <SceneGraph config={galaxyConfig} />
            <CameraController />

            <EffectComposer multisampling={degraded.current ? 0 : 4}>
              <Bloom
                intensity={1.4}
                luminanceThreshold={0.15}
                luminanceSmoothing={0.9}
                mipmapBlur
                radius={0.8}
              />
              <ChromaticAberration
                blendFunction={BlendFunction.NORMAL}
                offset={new Vector2(0.0005, 0.0005)}
                radialModulation={true}
                modulationOffset={0.15}
              />
              <Vignette
                offset={0.25}
                darkness={0.6}
                blendFunction={BlendFunction.NORMAL}
              />
            </EffectComposer>
          </Suspense>
        </PerformanceMonitor>
      </Canvas>

      {/* ── HUD (HTML layered above canvas) ──────── */}
      <GalaxyHUD />
    </div>
  );
}
