import { World } from 'koota';
import * as THREE from 'three';
import { AutoAim, IsPlayer, IsEnemy, Movement, Transform, Time } from '../traits';
import { actions } from '../actions';
import { between } from '../utils/between';

/**
	* updateAutoAim:
	*  - Queries entities that have IsEnemy + AutoAim + Transform.
	*  - Every 2-3 seconds, spawn an enemy projectile using leading aim.
	*/
export function updateAutoAim(world: World) {
	const time = world.get(Time);
	if (!time) return;
	const { delta } = time;

	// Try to find the player
	const player = world.queryFirst(IsPlayer, Transform, Movement);
	if (!player) return;

	const playerTransform = player.get(Transform)!;
	const playerMovement = player.get(Movement);

	world
	.query(IsEnemy, AutoAim, Transform)
	.updateEach(([autoAim, enemyTransform], enemyEntity) => {
		autoAim.current += delta * 1000; // accumulate ms

		// If we're not past the cooldown, skip
		if (autoAim.current < autoAim.cooldown) return;

		// Check if within firing range
		const dist = enemyTransform.position.distanceTo(playerTransform.position);
		if (dist > autoAim.radius) {
		// out of range for firing
		// reset partial time so we don't immediately shoot after player re-enters range
		autoAim.current = 0;
		return;
		}

		// We are within range and cooldown is up, let's shoot
		autoAim.current = 0;
		// Randomize next cooldown 2000-3000
		autoAim.cooldown = between(2000, 3000);

		// Leading shot calculation
		// Projectile speed = 8 (set in spawnEnemyProjectile)
		const projectileSpeed = 8;
		const enemyPos = enemyTransform.position;
		const playerPos = playerTransform.position.clone();
		const playerVel = playerMovement ? playerMovement.velocity.clone() : new THREE.Vector3();

		// Estimate intercept time
		const distance = enemyPos.distanceTo(playerPos);
		const tti = distance / projectileSpeed; // time to impact if direct path

		// predicted position
		const predictedPos = playerPos.add(playerVel.multiplyScalar(tti));

		const fireDir = predictedPos.clone().sub(enemyPos).normalize();

		// We spawn an enemy projectile
		const { spawnEnemyProjectile } = actions(world);

		// Create a dummy Euler from the direction (not strictly needed, but we pass rotation)
		const rot = new THREE.Euler();
		rot.y = Math.atan2(fireDir.x, -fireDir.z);

		// For a more advanced approach, you'd compute pitch as well:
		// But let's keep it simple:
		spawnEnemyProjectile(enemyPos, rot, fireDir);
	});
}