import { World } from 'koota';
import { Projectile, SpatialHashMap, Transform, Explosion, IsEnemy } from '../traits';
import { IsAsteroid } from '../traits/is-asteroid';
import { Health } from '../traits/health';
import { IsPlayer } from '../traits/is-player';
import { between } from '../utils/between';
import { DamageFlash } from '../traits/damage-flash';
import { EnemySpaceshipBehaviour } from '../traits/enemy-spaceship-behaviour';
import { actions } from '../actions';

/**
 * Collide projectiles with:
 * 1. Enemies
 * 2. Asteroids
 * 3. Player
 *
 * If an enemy is hit, we mark it as alerted.
 */
export const collideProjectilesWithTargets = (world: World) => {
	const spatialHashMap = world.get(SpatialHashMap)!;
	if (!spatialHashMap) {
		console.error('SpatialHashMap not found! Collisions will not work.');
		return;
	}

	world.query(Projectile, Transform).updateEach(([projectile, transform], projectileEntity) => {
		const { position } = transform;

		// Increase search radius slightly to improve hit chances
		const searchRadius = 2.5;
		const nearbyEntities = spatialHashMap.getNearbyEntities(position.x, position.y, position.z, searchRadius);

		const hitTarget = nearbyEntities.find((candidate) => {
			// Skip self
			if (candidate === projectileEntity) return false;

			// Entity must have a Transform
			if (!candidate.has(Transform)) return false;

			// Must be a valid target type
			const isValidTarget = candidate.has(IsEnemy) || candidate.has(IsAsteroid) || candidate.has(IsPlayer);
			if (!isValidTarget) return false;

			// Distance check
			const targetPos = candidate.get(Transform)!.position;
			const dist = targetPos.distanceTo(position);

			// Adjust collision radius based on target type for better gameplay
			let collisionRadius = 1.8; // Default increased from 1.5

			// Make player slightly easier to hit for better gameplay
			if (candidate.has(IsPlayer)) {
				collisionRadius = 2.0;
			}

			return dist < collisionRadius;
		});

		if (!hitTarget) return;

		// Destroy projectile to prevent multiple hits
		projectileEntity.destroy();
		console.log(`Projectile hit target: ${hitTarget.id()}`);

		// Visual feedback - damage flash
		if (hitTarget.has(DamageFlash)) {
			const flash = hitTarget.get(DamageFlash)!;
			flash.timer = flash.duration;
		}

		// Get target position for explosions
		const hitTransform = hitTarget.get(Transform)!;

		// If target is an enemy
		if (hitTarget.has(IsEnemy)) {
			// Mark as alerted if they have EnemySpaceshipBehaviour
			if (hitTarget.has(EnemySpaceshipBehaviour)) {
				const enemyBehavior = hitTarget.get(EnemySpaceshipBehaviour)!;
				enemyBehavior.alerted = true;
				enemyBehavior.state = 'Attacking';
			}

			// Get health component
			const targetHealth = hitTarget.get(Health);
			if (!targetHealth) {
				// No health trait - just destroy
				console.log('[projectileCollision] Enemy destroyed - no health trait');
				const { spawnExplosion } = actions(world);
				spawnExplosion(hitTransform.position);
				hitTarget.destroy();
				return;
			}

			// Apply damage
			const damageTaken = projectile.damage;
			targetHealth.amount -= damageTaken;
			console.log(`[projectileCollision] Enemy hit for ${damageTaken}. Health now ${targetHealth.amount}`);

			// Check for destruction
			if (targetHealth.amount <= 0) {
				console.log('[projectileCollision] Enemy destroyed by projectile');
				const { spawnExplosion } = actions(world);
				spawnExplosion(hitTransform.position);
				hitTarget.destroy();
			}
			return;
		}

		// If target is an asteroid
		if (hitTarget.has(IsAsteroid)) {
			const targetHealth = hitTarget.get(Health);

			if (!targetHealth) {
				// No Health => destroy immediately
				const { spawnExplosion } = actions(world);
				spawnExplosion(hitTransform.position);
				hitTarget.destroy();
				return;
			}

			// Apply fixed damage to asteroids
			const asteroidDamage = 20;
			targetHealth.amount -= asteroidDamage;

			if (targetHealth.amount <= 0) {
				const { spawnExplosion } = actions(world);
				spawnExplosion(hitTransform.position);
				hitTarget.destroy();
			}
			return;
		}

		// If target is player
		if (hitTarget.has(IsPlayer)) {
			const playerHealth = hitTarget.get(Health);

			if (playerHealth) {
				// Apply damage from projectile
				const damageTaken = projectile.damage;
				playerHealth.amount -= damageTaken;

				console.log(`[projectileCollision] Player hit for ${damageTaken}. Health now ${playerHealth.amount}`);

				// Check if player is destroyed
				if (playerHealth.amount <= 0) {
					const { spawnExplosion } = actions(world);
					// Create bigger explosion for player
					spawnExplosion(hitTransform.position);
					console.log('[projectileCollision] Player destroyed');
					hitTarget.destroy();
					return;
				}
			}

			// Always create a small explosion effect for player hits
			world.spawn(
				Explosion({ count: Math.floor(between(8, 12)) }),
				Transform({
					position: hitTransform.position.clone(),
				})
			);
		}
	});
};
