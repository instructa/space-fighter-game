import { World } from 'koota';
import { Time, IsEnemy, IsPlayer, Transform } from '../traits';
import { actions } from '../actions';
import * as THREE from 'three';

/**
 * Adjust these as desired.
 */
const SPAWN_INTERVAL = 15000; // ms between spawn attempts
const SWARM_SIZE_MIN = 3; // min enemies in a swarm
const SWARM_SIZE_MAX = 4; // max enemies in a swarm
const SPAWN_RADIUS = 40; // Reduced from 60 - how far from the player enemies appear
const MAX_ENEMIES = 20; // total max

let accumulator = 0;

/**
 * Example system: spawn 3–4 enemies near the player every 15 seconds
 * if total enemies < MAX_ENEMIES.
 */
export function enemySpawnSystem(world: World) {
	const time = world.get(Time);
	if (!time) return;

	accumulator += time.delta * 1000;
	if (accumulator < SPAWN_INTERVAL) return;

	accumulator = 0;

	// Count how many enemies are currently alive
	const enemyCount = world.query(IsEnemy).length;
	if (enemyCount >= MAX_ENEMIES) {
		console.log('[enemySpawnSystem] Max enemies reached. Skipping wave.');
		return;
	}

	// We need the player's position
	const player = world.queryFirst(IsPlayer, Transform);
	if (!player) return;

	const playerTransform = player.get(Transform)!;
	const playerPos = playerTransform.position.clone();

	// Decide how many enemies in this swarm (3-4)
	const swarmSize = THREE.MathUtils.randInt(SWARM_SIZE_MIN, SWARM_SIZE_MAX);

	// But ensure we don't exceed MAX_ENEMIES total
	const canSpawn = Math.min(swarmSize, MAX_ENEMIES - enemyCount);

	// If there's no room, skip
	if (canSpawn <= 0) return;

	const { spawnEnemy } = actions(world);

	console.log(`[enemySpawnSystem] Spawning wave of ${canSpawn} enemies. Current count=${enemyCount}`);

	// For each enemy in the swarm
	for (let i = 0; i < canSpawn; i++) {
		// Random offset within a sphere for spawn location
		const offset = new THREE.Vector3(
			THREE.MathUtils.randFloatSpread(SPAWN_RADIUS),
			THREE.MathUtils.randFloatSpread(SPAWN_RADIUS * 0.5),
			THREE.MathUtils.randFloatSpread(SPAWN_RADIUS)
		);
		const spawnPos = playerPos.clone().add(offset);
		spawnEnemy(spawnPos);
	}
}
