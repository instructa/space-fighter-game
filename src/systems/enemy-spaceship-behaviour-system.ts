import { World } from 'koota';
import * as THREE from 'three';
import { IsEnemy, Transform, Movement, Time, Health, IsPlayer } from '../traits';
import { EnemySpaceshipBehaviour } from '../traits/enemy-spaceship-behaviour';
import { actions } from '../actions';

// Reusable temp vectors to reduce allocations.
const _forwardDir = new THREE.Vector3();
const _playerForward = new THREE.Vector3();
const _toPlayer = new THREE.Vector3();
const _targetRotation = new THREE.Quaternion();
const _currentRotation = new THREE.Quaternion();
const _upVector = new THREE.Vector3(0, 1, 0);
const _targetDirection = new THREE.Vector3();
const _euler = new THREE.Euler();

export function enemySpaceshipBehaviourSystem(world: World) {
	const time = world.get(Time);
	if (!time) return;
	const delta = time.delta;

	const player = world.queryFirst(IsPlayer, Transform, Movement, Health);
	if (!player) return;

	const playerTransform = player.get(Transform)!;

	world
		.query(IsEnemy, EnemySpaceshipBehaviour, Transform, Movement)
		.updateEach(([enemyBehaviour, enemyTransform, enemyMovement], entity) => {
			// If they've been alerted by a hit, remain attacking
			if (enemyBehaviour.alerted) {
				enemyBehaviour.state = 'Attacking';
			}

			enemyBehaviour.timeInState += delta;
			if (enemyBehaviour.timeToNextState <= 0) {
				if (enemyBehaviour.state === 'Attacking') {
					const range = enemyBehaviour.maxAttackTime - enemyBehaviour.minAttackTime;
					const baseTime = enemyBehaviour.minAttackTime + Math.random() * range;
					enemyBehaviour.timeToNextState = baseTime + enemyBehaviour.aggression * baseTime;
				} else {
					const range = enemyBehaviour.maxEvadeTime - enemyBehaviour.minEvadeTime;
					const baseTime = enemyBehaviour.minEvadeTime + Math.random() * range;
					enemyBehaviour.timeToNextState = baseTime * (1.0 - enemyBehaviour.aggression * 0.5);
				}
			}

			// Possibly swap states
			if (enemyBehaviour.timeInState >= enemyBehaviour.timeToNextState) {
				if (!enemyBehaviour.alerted) {
					// only switch if not alerted
					enemyBehaviour.state = enemyBehaviour.state === 'Attacking' ? 'Evading' : 'Attacking';
				}
				enemyBehaviour.timeInState = 0;
				enemyBehaviour.timeToNextState = 0;
			}

			// Basic movement
			// _toPlayer = playerPos - enemyPos
			_toPlayer.copy(playerTransform.position).sub(enemyTransform.position);
			const dist = _toPlayer.length();

			// 3D rotation logic with quaternions
			if (enemyBehaviour.state === 'Attacking') {
				// Normalized direction to player
				_targetDirection.copy(_toPlayer).normalize();

				// Create quaternion for looking at player
				_targetRotation.setFromRotationMatrix(
					new THREE.Matrix4().lookAt(
						new THREE.Vector3(0, 0, 0), // origin
						_targetDirection, // look at direction
						_upVector // up vector
					)
				);

				// Get current rotation as quaternion
				_currentRotation.setFromEuler(enemyTransform.rotation);

				// Smoothly interpolate current rotation towards target rotation
				_currentRotation.slerp(_targetRotation, enemyBehaviour.rotationSpeed * delta);

				// Convert back to euler and apply
				_euler.setFromQuaternion(_currentRotation);
				enemyTransform.rotation.copy(_euler);
			} else {
				// Evade => face away from player (only yaw for simplicity in evasion)
				const yaw = Math.atan2(_toPlayer.x, -_toPlayer.z) + Math.PI;
				enemyTransform.rotation.y = yaw;
			}

			// Throttle
			let throttle = 0;
			if (enemyBehaviour.state === 'Attacking') {
				if (dist > enemyBehaviour.minEngageDistance) {
					throttle = 3 + 2 * enemyBehaviour.aggression;
				} else {
					throttle = 0.5;
				}
			} else {
				throttle = 3.0; // Evading
			}

			// Build velocity
			_forwardDir.set(0, 0, -1).applyEuler(enemyTransform.rotation);
			if (enemyBehaviour.state === 'Evading') {
				// use the reversed direction
				_forwardDir.multiplyScalar(-1);
			}

			enemyMovement.velocity.copy(_forwardDir).multiplyScalar(throttle);

			// Firing logic
			if (enemyBehaviour.state === 'Attacking' && dist < enemyBehaviour.shotRange) {
				// Get forward direction for shooting (towards player)
				_playerForward.set(0, 0, -1).applyEuler(enemyTransform.rotation).normalize();

				// Check if player is within shooting angle
				const normalizedToPlayer = _toPlayer.clone().normalize();
				const dot = _playerForward.dot(normalizedToPlayer);

				// Reduce debug noise
				if (Math.random() < 0.01) {
					// Only log occasionally (1% chance)
					console.log(
						`Enemy ${entity.id()} - dot: ${dot.toFixed(2)}, shotRange: ${
							enemyBehaviour.shotRange
						}, dist: ${dist.toFixed(2)}`
					);
				}

				// cos(20 deg) ~ 0.94 - only shoot if pointed at player
				// Reduced threshold to improve hit chance
				if (dot > 0.9) {
					// Accumulate time for firing cooldown
					enemyBehaviour.shotAccumulator += delta;

					// Initialize shotCooldown if it's 0
					if (enemyBehaviour.shotCooldown <= 0) {
						const shotsPerSecond = 2 + 3 * enemyBehaviour.aggression;
						enemyBehaviour.shotCooldown = 1 / shotsPerSecond;
					}

					// When cooldown is reached, fire
					if (enemyBehaviour.shotAccumulator >= enemyBehaviour.shotCooldown) {
						// Reset accumulator but NOT cooldown to prevent resetting in the middle of firing
						enemyBehaviour.shotAccumulator = 0;

						// Fire projectile
						const { spawnEnemyProjectile } = actions(world);
						const direction = new THREE.Vector3(0, 0, -1).applyEuler(enemyTransform.rotation);

						// Add a small random spread to make some shots miss
						const spread = 0.05; // Slight spread
						direction.x += THREE.MathUtils.randFloatSpread(spread);
						direction.y += THREE.MathUtils.randFloatSpread(spread);
						direction.z += THREE.MathUtils.randFloatSpread(spread);
						direction.normalize();

						spawnEnemyProjectile(enemyTransform.position, enemyTransform.rotation, direction);

						if (Math.random() < 0.1) {
							// Only log occasionally (10% chance per shot)
							console.log(`Enemy ${entity.id()} firing, cooldown: ${enemyBehaviour.shotCooldown.toFixed(2)}`);
						}
					}
				}
			}
		});
}
