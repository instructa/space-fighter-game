import { trait } from 'koota';

/**
	* For enemy AI auto-shooting logic.
	* We'll store a "current" time in ms and a "cooldown" that gets randomized after each shot.
	* "radius" can represent a maximum distance to consider the player in range.
	*/
export const AutoAim = trait({
	// nextShot accumulates time each frame
	current: 0,
	// cooldown for next shot, default to 2000ms
	cooldown: 2000,
	// We'll pick a random range between 2000-3000 after each shot
	radius: 200
});