import { Entity, World } from 'koota';
import * as THREE from 'three';
import {
	IsAsteroid,
	Transform,
	Movement,
	Health,
	IsPlayer,
	SpatialHashMap,
	Time,
	DamageFlash,
} from '../traits';
import { Explosion } from '../traits/explosion';
import { between } from '../utils/between';

const collisionRadius = 2.5;
const collisionRadiusSq = collisionRadius * collisionRadius;
const pushForce = new THREE.Vector3();
const asteroidDamage = 10;
const collisionCooldown = 0.7;
let lastAsteroidCollisionTime = 0;

const playerPushVec = new THREE.Vector3();
const asteroidToPlayer = new THREE.Vector3();

export function pushAsteroids(world: World) {
	const spatialHashMap = world.get(SpatialHashMap)!;
	const time = world.get(Time);
	if (!time) return;

	const currentTime = time.current;

	const player = world.queryFirst(IsPlayer, Transform, Movement, Health);
	if (!player) return;

	const playerTransform = player.get(Transform)!;
	const playerMovement = player.get(Movement)!;
	const playerHealth = player.get(Health)!;

	// We'll do a single getNearbyEntities call that uses squared distance checks
	const nearby = spatialHashMap.getNearbyEntities(
	playerTransform.position.x,
	playerTransform.position.y,
	playerTransform.position.z,
	collisionRadius,
	[],
	Infinity,
	true // useSquaredDistance
	);

	let collidedAsteroids = 0;

	for (const candidate of nearby) {
	if (!candidate.has(IsAsteroid)) continue;
	const aTransform = candidate.get(Transform)!;
	// distance squared
	const dx = playerTransform.position.x - aTransform.position.x;
	const dy = playerTransform.position.y - aTransform.position.y;
	const dz = playerTransform.position.z - aTransform.position.z;
	const distSq = dx * dx + dy * dy + dz * dz;

	if (distSq <= collisionRadiusSq) {
		collidedAsteroids++;
		// collision
		if (currentTime - lastAsteroidCollisionTime > collisionCooldown * 1000) {
		playerHealth.amount -= asteroidDamage;
		if (player.has(DamageFlash)) {
			const flash = player.get(DamageFlash)!;
			flash.timer = flash.duration;
		}
		lastAsteroidCollisionTime = currentTime;
		if (playerHealth.amount <= 0) {
			// spawn explosion
			world.spawn(
			Explosion({ count: Math.floor(between(25, 35)) }),
			Transform({ position: playerTransform.position.clone() })
			);
			player.destroy();
			return;
		}
		}

		// Push away logic
		const aMovement = candidate.get(Movement)!;
		pushForce.set(dx, dy, dz).normalize().multiplyScalar(20);
		// push asteroid away from player
		aMovement.velocity.copy(pushForce);

		// also push player
		asteroidToPlayer.set(-dx, -dy, -dz).normalize(); // reversed
		playerPushVec.copy(asteroidToPlayer).multiplyScalar(5);
		playerMovement.velocity.add(playerPushVec);
	}
	}
}