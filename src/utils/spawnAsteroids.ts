import { World } from 'koota';
import * as THREE from 'three';
import { spawnAsteroid } from './spawnAsteroid';

export function spawnAsteroids(
  world: World,
  count = 50,
  regionSize = [200, 100, 200]
) {
  const [rx, ry, rz] = regionSize;

  for (let i = 0; i < count; i++) {
    const pos = new THREE.Vector3(
      THREE.MathUtils.randFloatSpread(rx),
      THREE.MathUtils.randFloatSpread(ry),
      THREE.MathUtils.randFloatSpread(rz)
    );
    spawnAsteroid(world, pos);
  }
}