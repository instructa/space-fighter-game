import * as THREE from 'three';
import { Health, IsAsteroid, Movement, Transform } from '../traits';
import { World } from 'koota';

export function spawnAsteroid(world: World, position: THREE.Vector3) {
  // random scale
  const scaleVal = THREE.MathUtils.randFloat(0.8, 2.5);
  const rotX = THREE.MathUtils.randFloat(0, Math.PI * 2);
  const rotY = THREE.MathUtils.randFloat(0, Math.PI * 2);

  // random direction, random speed [1..3]
  const direction = new THREE.Vector3(
    THREE.MathUtils.randFloatSpread(1),
    THREE.MathUtils.randFloatSpread(1),
    THREE.MathUtils.randFloatSpread(1)
  ).normalize();
  const speed = THREE.MathUtils.randFloat(1, 3);
  const velocity = direction.multiplyScalar(speed);

  return world.spawn(
    IsAsteroid,
    Transform({
      position: position.clone(),
      rotation: new THREE.Euler(rotX, rotY, 0),
      scale: new THREE.Vector3(scaleVal, scaleVal, scaleVal),
    }),
    Movement({
      velocity,
      damping: 0.998,
      thrust: 0,
      force: new THREE.Vector3(),
    }),
    Health({ amount: 25 })
  );
}