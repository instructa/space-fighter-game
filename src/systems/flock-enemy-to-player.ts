import { World } from 'koota';
import * as THREE from 'three';
import { IsEnemy, Movement, IsPlayer, Transform, FollowPlayer } from '../traits';

/**
	* We add a desiredDistance so that enemies won't come too close,
	* plus they rotate to face the player.
	*/
const acceleration = new THREE.Vector3();
const DESIRED_DISTANCE = 30;

export const flockEnemyToPlayer = (world: World) => {
	const player = world.queryFirst(IsPlayer, Transform);
	if (!player) return;

	const playerTransform = player.get(Transform)!;

	world.query(FollowPlayer, Transform, Movement).updateEach(([transform, movement]) => {
	const { velocity, thrust } = movement;

	// Vector toward player
	acceleration.copy(playerTransform.position).sub(transform.position);
	const distance = acceleration.length();

	// Face the player: let's only rotate around Y for basic 2D turning
	// If you want them to pitch up/down, you can adjust the Euler.x as well
	const toPlayer = acceleration.clone().normalize();
	// Yaw
	transform.rotation.y = Math.atan2(toPlayer.x, -toPlayer.z);

	// Maintain some distance from the player
	if (distance > DESIRED_DISTANCE) {
		// accelerate towards player
		velocity.add(acceleration.normalize().multiplyScalar(thrust));
	} else {
		// If they're too close, gently push away
		velocity.add(acceleration.normalize().multiplyScalar(-0.5 * thrust));
	}
	});
};