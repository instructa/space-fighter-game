import { trait } from 'koota';

/**
 * EnemySpaceshipBehaviour trait:
 * - State: Attacking or Evading
 * - minAttackTime, maxAttackTime, minEvadeTime, maxEvadeTime, minEngageDistance
 * - timeInState, timeToNextState
 * - aggression factor: influences how quickly they shoot or how often they switch states
 * - internal accumulators for shooting logic
 * - shotRange: how far away they can shoot
 * - alerted: becomes true when they get shot (makes them turn to the player, remain in Attacking state)
 * - rotationSpeed: controls how quickly the enemy rotates to face the player (dogfighting)
 */
export const EnemySpaceshipBehaviour = trait({
	state: 'Attacking' as 'Attacking' | 'Evading',
	timeInState: 0,
	timeToNextState: 0,

	minAttackTime: 10,
	maxAttackTime: 20,
	minEvadeTime: 2,
	maxEvadeTime: 6,

	minEngageDistance: 25,
	aggression: 0.7,

	shotCooldown: 0,
	shotAccumulator: 0,

	shotRange: 150,

	shotSpeed: 15,
	shotDamage: 20,

	alerted: false,

	// How quickly the enemy rotates to face the player (0-1)
	rotationSpeed: 2.0,
});
