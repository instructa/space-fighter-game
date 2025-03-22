import { World } from 'koota';
import * as THREE from 'three';
import { DamageFlash, Ref, Time } from '../traits';

function setFlashColor(
  root: THREE.Object3D,
  color: THREE.Color | null,
  originalColors: Map<string, THREE.Color>
) {
  root.traverse((obj) => {
    if (obj instanceof THREE.Mesh && obj.material && 'color' in obj.material) {
      const mat = obj.material as THREE.MeshStandardMaterial;
      if (color) {
        // Flash color
        mat.color.copy(color);
      } else {
        // revert to original color
        const original = originalColors.get(obj.uuid);
        if (original) {
          mat.color.copy(original);
        }
      }
    }
  });
}

/**
 * damageFlashSystem:
 * - If DamageFlash.timer > 0, set color to flash color
 * - Decrement timer
 * - If timer <= 0, revert each mesh to its original color
 */
export function damageFlashSystem(world: World) {
  const time = world.get(Time);
  if (!time) return;

  const { delta } = time;

  world.query(DamageFlash, Ref).updateEach(([flash, ref]) => {
    if (!flash.initialized) return; // originalColors not set yet

    if (flash.timer > 0) {
      flash.timer -= delta;
      const flashColor = new THREE.Color('red');
      setFlashColor(ref, flashColor, flash.originalColors);
    } else {
      // revert
      setFlashColor(ref, null, flash.originalColors);
    }
  });
}