import { trait } from 'koota';
import * as THREE from 'three';

/**
 * DamageFlash trait:
 *  - timer: how long the entity should keep flashing (in seconds)
 *  - duration: total time to flash on each hit
 *  - originalColors: record of each mesh's original color by mesh.uuid
 *  - initialized: once we store original colors, set true
 */
export const DamageFlash = trait({
  timer: 0,
  duration: 0.2,
  // A map from mesh.uuid -> THREE.Color
  originalColors: () => new Map<string, THREE.Color>(),
  initialized: false,
});