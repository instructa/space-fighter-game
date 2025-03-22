import { createActions, World } from 'koota';
import * as THREE from 'three';
import {
	IsPlayer,
	Transform,
	IsCamera,
	Movement,
	Input,
	MaxSpeed,
	Projectile,
	IsAsteroid,
	IsEnemy,
	Health,
	Explosion,
	DamageFlash,
} from './traits';
import { between } from './utils/between';
import { spawnAsteroid } from './utils/spawnAsteroid';
import { spawnAsteroids } from './utils/spawnAsteroids';
import { EnemySpaceshipBehaviour } from './traits/enemy-spaceship-behaviour';

// Helper for fast enemy
function spawnFastEnemy(world: World, position?: THREE.Vector3) {
	const pos = position
		? position.clone()
		: new THREE.Vector3(
				THREE.MathUtils.randFloatSpread(200),
				THREE.MathUtils.randFloatSpread(100),
				THREE.MathUtils.randFloatSpread(200)
		  );

	console.log('[actions] Spawning FAST enemy at', pos.toArray());

	return world.spawn(
		IsEnemy,
		Transform({ position: pos }),
		Movement({
			velocity: new THREE.Vector3(),
			thrust: 4,
			damping: 0.99,
			force: new THREE.Vector3(),
		}),
		MaxSpeed({ maxSpeed: 15 }),
		Health({ amount: 100 }),
		DamageFlash(),
		EnemySpaceshipBehaviour({
			aggression: 0.7,
		})
	);
}

// Helper for slow enemy
function spawnSlowEnemy(world: World, position?: THREE.Vector3) {
	const pos = position
		? position.clone()
		: new THREE.Vector3(
				THREE.MathUtils.randFloatSpread(200),
				THREE.MathUtils.randFloatSpread(100),
				THREE.MathUtils.randFloatSpread(200)
		  );

	console.log('[actions] Spawning SLOW enemy at', pos.toArray());

	return world.spawn(
		IsEnemy,
		Transform({ position: pos }),
		Movement({
			velocity: new THREE.Vector3(),
			thrust: 1.5,
			damping: 0.995,
			force: new THREE.Vector3(),
		}),
		MaxSpeed({ maxSpeed: 6 }),
		Health({ amount: 150 }),
		DamageFlash(),
		EnemySpaceshipBehaviour({
			aggression: 0.3,
		})
	);
}

export const actions = createActions((world) => ({
	spawnPlayer: () =>
		world.spawn(
			IsPlayer,
			Transform,
			Movement({
				velocity: new THREE.Vector3(),
				thrust: 5,
				damping: 0.99,
				force: new THREE.Vector3(),
			}),
			Input,
			MaxSpeed({ maxSpeed: 20 }),
			Health({ amount: 100 }),
			DamageFlash()
		),

	spawnCamera: (position: [number, number, number]) => {
		return world.spawn(Transform({ position: new THREE.Vector3(...position) }), IsCamera);
	},

	spawnProjectile: (
		position: THREE.Vector3,
		rotation: THREE.Euler,
		options?: Partial<{
			speed: number;
			damage: number;
			direction: THREE.Vector3;
		}>
	) => {
		const forward = new THREE.Vector3(0, 0, -1).applyEuler(rotation).multiplyScalar(2);
		const spawnPos = position.clone().add(forward);

		const defaults = {
			speed: 25,
			damage: 20,
			direction: new THREE.Vector3(0, 0, -1).applyEuler(rotation),
		};
		const merged = { ...defaults, ...options };

		return world.spawn(
			Transform({
				position: spawnPos,
				rotation: rotation.clone(),
			}),
			Projectile({
				speed: merged.speed,
				damage: merged.damage,
				direction: merged.direction,
				lifetime: 4, // slightly extended
			})
		);
	},

	// Improved enemy projectile shooting with better positioning and speed
	spawnEnemyProjectile: (position: THREE.Vector3, rotation: THREE.Euler, direction?: THREE.Vector3) => {
		if (!direction) {
			direction = new THREE.Vector3(0, 0, -1).applyEuler(rotation);
		}

		// Adjust spawn position to be further from enemy to avoid self-collisions
		const offsetDir = direction.clone().multiplyScalar(3);
		const spawnPos = position.clone().add(offsetDir);

		// Log the enemy projectile spawn for debugging
		console.log(`[actions] Spawning enemy projectile at ${spawnPos.toArray()}`);

		return world.spawn(
			Transform({
				position: spawnPos,
				rotation: rotation.clone(),
			}),
			Projectile({
				speed: 35, // Increased speed for better hit chance
				damage: 20, // Enemy damage
				direction,
				lifetime: 6, // Extended lifetime for longer range
			})
		);
	},

	spawnAsteroid: (position: THREE.Vector3) => {
		return spawnAsteroid(world, position);
	},

	spawnAsteroids: (count = 50, regionSize = [200, 100, 200]) => {
		return spawnAsteroids(world, count, regionSize);
	},

	spawnExplosion: (position: THREE.Vector3) => {
		return world.spawn(Explosion({ count: 15 }), Transform({ position: position.clone() }));
	},

	restartGame: () => {
		const spawnPos: [number, number, number] = [0, 0, 50];

		world.entities.forEach((entity) => {
			entity.destroy();
		});

		actions(world).spawnCamera(spawnPos);
		actions(world).spawnPlayer();
		actions(world).spawnAsteroids(40, [400, 100, 400]);
	},

	spawnEnemy: (position?: THREE.Vector3) => {
		const r = between(0, 2);
		if (r < 1) {
			return spawnSlowEnemy(world, position);
		} else {
			return spawnFastEnemy(world, position);
		}
	},

	spawnSlowEnemy: (position?: THREE.Vector3) => {
		return spawnSlowEnemy(world, position);
	},

	spawnFastEnemy: (position?: THREE.Vector3) => {
		return spawnFastEnemy(world, position);
	},
}));
