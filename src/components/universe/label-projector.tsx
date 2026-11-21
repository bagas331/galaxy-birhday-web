"use client";

import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { bodyRegistry } from "./body-registry";
import { labelPositions } from "./label-bridge";

const worldPos = new THREE.Vector3();

/**
 * Projects every registered celestial body's label anchor to screen
 * space each frame and publishes it on the label bridge — consumed by
 * the DOM overlay outside the canvas.
 */
export function LabelProjector() {
  useFrame(({ camera, size }) => {
    for (const [id, entry] of bodyRegistry) {
      entry.object.getWorldPosition(worldPos);
      worldPos.y += entry.labelOffset ?? entry.size + 0.8;
      const projected = worldPos.clone().project(camera);
      const onScreen =
        projected.z < 1 && Math.abs(projected.x) < 1.3 && Math.abs(projected.y) < 1.3;
      // Clamp into the viewport (with margins) so labels never get cut
      // off at the screen edge — important on narrow phones.
      const rawX = (projected.x * 0.5 + 0.5) * size.width;
      const rawY = (-projected.y * 0.5 + 0.5) * size.height;
      const marginX = Math.min(90, size.width * 0.22);
      labelPositions.set(id, {
        x: Math.min(Math.max(rawX, marginX), Math.max(marginX, size.width - marginX)),
        y: Math.min(Math.max(rawY, 34), Math.max(34, size.height - 34)),
        visible: onScreen,
      });
    }
  });
  return null;
}
