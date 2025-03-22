import { World } from 'koota';
import * as THREE from 'three';
import { Projectile, Time, Transform } from '../traits';

const tmpVec3 = new THREE.Vector3();

export const updateProjectiles = (world: World) => {
	const { delta } = world.get(Time)!;

	world.query(Projectile, Transform).updateEach(([projectile, transform], entity) => {
		// Update projectile position
		transform.position.add(tmpVec3.copy(projectile.direction).multiplyScalar(projectile.speed * delta));

		// Update lifetime
		projectile.timeAlive += delta;
		if (projectile.timeAlive >= projectile.lifetime) {
			entity.destroy();
			return;
		}
	});
};
