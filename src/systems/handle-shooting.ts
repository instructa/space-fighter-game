import { World } from 'koota';
import { actions } from '../actions';
import { IsPlayer, Time, Transform, Input } from '../traits';

/**
	* handleShooting:
	* - We track timeSinceLastShot.
	* - If user is holding left mouse (input.shoot === true) and enough time passed, spawn a projectile.
	* - This prevents stuck or missed shots, allowing continuous fire when holding the mouse.
	*/

const SHOOT_INTERVAL = 0.15; // seconds between shots
let timeSinceLastShot = 0;

export const handleShooting = (world: World) => {
	const { delta } = world.get(Time)!;
	// Accumulate time
	timeSinceLastShot += delta;

	const { spawnProjectile } = actions(world);

	// Query player
	const player = world.queryFirst(IsPlayer, Transform, Input);
	if (!player) return;

	const input = player.get(Input)!;

	// If shooting and timeSinceLastShot >= SHOOT_INTERVAL => fire
	if (input.shoot && timeSinceLastShot >= SHOOT_INTERVAL) {
	// spawn projectile
	const transform = player.get(Transform)!;
	spawnProjectile(transform.position, transform.rotation);
	// reset timer
	timeSinceLastShot = 0;
	}
};