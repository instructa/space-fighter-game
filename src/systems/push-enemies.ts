import { Entity, World } from 'koota';
import * as THREE from 'three';
import { IsEnemy, Movement, IsPlayer, SpatialHashMap, Transform, Health, Time, DamageFlash } from '../traits';
import { Explosion } from '../traits/explosion';
import { between } from '../utils/between';

const collisionRadius = 2.1;
const pushForce = new THREE.Vector3();
const enemyCollisionDamage = 5;
const collisionCooldown = 0.5;
let lastCollisionTime = 0;

const playerPushVec = new THREE.Vector3();
const enemyToPlayer = new THREE.Vector3();

export function pushEnemies(world: World) {
	const spatialHashMap = world.get(SpatialHashMap)!;
	const time = world.get(Time);
	if (!time) return;

	const currentTime = time.current;

	world
	.query(IsPlayer, Transform, Movement, Health)
	.select(Transform, Movement, Health)
	.updateEach(([playerTransform, playerMovement, playerHealth], playerEntity) => {
		const position = playerTransform.position;
		const nearbyEntities = spatialHashMap.getNearbyEntities(
		position.x,
		position.y,
		position.z,
		collisionRadius
		);

		const collidingEnemies: Entity[] = nearbyEntities.filter((entity) => {
		return (
			entity.has(IsEnemy) &&
			entity.get(Transform)!.position.distanceTo(position) <= collisionRadius
		);
		});

		if (
		collidingEnemies.length > 0 &&
		currentTime - lastCollisionTime > collisionCooldown * 1000
		) {
		playerHealth.amount -= enemyCollisionDamage;
		console.log(
			`[pushEnemies] Player hit by enemy collision for ${enemyCollisionDamage}. Health now ${playerHealth.amount}`
		);

		if (playerEntity.has(DamageFlash)) {
			const flash = playerEntity.get(DamageFlash)!;
			flash.timer = flash.duration;
		}

		lastCollisionTime = currentTime;

		if (playerHealth.amount <= 0) {
			world.spawn(
			Explosion({ count: Math.floor(between(25, 35)) }),
			Transform({
				position: position.clone(),
			})
			);
			console.log('[pushEnemies] Player destroyed by enemy collision');
			playerEntity.destroy();
			return;
		}
		}

		// Apply push force to colliding enemies and also push the player
		for (const enemy of collidingEnemies) {
		const enemyTransform = enemy.get(Transform)!;
		const enemyMovement = enemy.get(Movement)!;

		pushForce
			.copy(enemyTransform.position)
			.sub(position)
			.normalize()
			.multiplyScalar(20);

		enemyMovement.velocity.set(pushForce.x, pushForce.y, pushForce.z);

		// Also push the player slightly away from enemy
		enemyToPlayer.copy(position).sub(enemyTransform.position).normalize();
		playerPushVec.copy(enemyToPlayer).multiplyScalar(4);
		playerMovement.velocity.add(playerPushVec);
		}
	});
}