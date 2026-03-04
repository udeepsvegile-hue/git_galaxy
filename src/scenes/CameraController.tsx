/**
 * GitVerse — CameraController
 * Manages camera behavior:
 *  - Default: OrbitControls (mouse pan/zoom/rotate)
 *  - On planet selection: smooth lerp to focus that planet
 *  - ESC / deselect: return to overview position
 */

import { useRef, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";

import { useAppStore } from "@/hooks/useAppStore";

const OVERVIEW_POSITION  = new THREE.Vector3(0, 25, 70);
const OVERVIEW_TARGET    = new THREE.Vector3(0, 0, 0);
const LERP_SPEED         = 0.04; // smoothness 0–1

export default function CameraController() {
  const { camera } = useThree();
  const controlsRef = useRef<OrbitControlsImpl>(null);

  const selectedPlanet = useAppStore((s) => s.selectedPlanet);

  // Target positions for lerp
  const targetPos    = useRef(OVERVIEW_POSITION.clone());
  const targetLookAt = useRef(OVERVIEW_TARGET.clone());
  const isLerping    = useRef(false);

  // When planet selection changes, compute new camera target
  useEffect(() => {
    if (selectedPlanet) {
      // Planet is at (orbitRadius, 0, 0) in its orbit group.
      // At the moment of click the planet could be anywhere on orbit.
      // We focus at a comfortable distance from the planet along its last known position.
      // Simple approximation: aim at the orbit ring position.
      const approxX = selectedPlanet.orbitRadius;
      const approxZ = 0;
      const focusDist = selectedPlanet.planetRadius * 6 + 8;

      targetLookAt.current.set(approxX, 0, approxZ);
      targetPos.current.set(approxX, focusDist * 0.6, approxZ + focusDist);
      isLerping.current = true;
    } else {
      // Return to overview
      targetPos.current.copy(OVERVIEW_POSITION);
      targetLookAt.current.copy(OVERVIEW_TARGET);
      isLerping.current = true;
    }
  }, [selectedPlanet]);

  // Keyboard ESC to deselect
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        useAppStore.getState().setSelectedPlanet(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useFrame(() => {
    if (!isLerping.current) return;
    const controls = controlsRef.current;

    // Lerp camera position
    camera.position.lerp(targetPos.current, LERP_SPEED);

    // Lerp orbit controls target
    if (controls) {
      controls.target.lerp(targetLookAt.current, LERP_SPEED);
      controls.update();
    }

    // Stop lerping when close enough
    const distPos  = camera.position.distanceTo(targetPos.current);
    const distTgt  = controls
      ? controls.target.distanceTo(targetLookAt.current)
      : 0;

    if (distPos < 0.1 && distTgt < 0.1) {
      isLerping.current = false;
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      enablePan
      enableZoom
      enableRotate
      minDistance={4}
      maxDistance={400}
      zoomSpeed={0.8}
      rotateSpeed={0.5}
      panSpeed={0.8}
      dampingFactor={0.08}
      enableDamping
    />
  );
}
