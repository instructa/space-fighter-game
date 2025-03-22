import { useFrame } from '@react-three/fiber';
import { useWorld } from 'koota/react';
import { updateTime } from './systems/update-time';
import { pollInput } from './systems/poll-input';
import { playerFlightSystem } from './systems/apply-input';
import { applyForce } from './systems/apply-force';
import { limitSpeed } from './systems/limit-speed';
import { moveEntities } from './systems/move-entities';
import { handleShooting } from './systems/handle-shooting';
import { updateProjectiles } from './systems/update-projectile';
import { collideProjectilesWithTargets } from './systems/update-projectile-collisions';
import { cameraFollowPlayer } from './systems/camera-follow-player';
import { syncView } from './systems/sync-view';
import { asteroidSpawnSystem } from './systems/asteroid-spawn';
import { asteroidMovementSystem } from './systems/asteroid-movement';
import { pushAsteroids } from './systems/push-asteroids';
import { pushEnemies } from './systems/push-enemies';
import { updateAutoAim } from './systems/update-auto-aim';
import { projectilePoolSystem } from './systems/projectile-pool-system';
import { enemySpawnSystem } from './systems/enemy-spawn';
import { damageFlashSystem } from './systems/damage-flash-system';
import { tickExplosion } from './systems/tick-explosion';
import { updateDebugMetrics } from './systems/update-debug-metrics';
import { enemySpaceshipBehaviourSystem } from './systems/enemy-spaceship-behaviour-system';

export function GameLoop() {
	const world = useWorld();

	useFrame(({ gl }) => {
		// 1) Time / delta
		updateTime(world);

		// 2) Periodic spawn
		asteroidSpawnSystem(world);
		enemySpawnSystem(world);

		// 3) Player input
		pollInput(world);
		playerFlightSystem(world);

		// 4) Enemy AI - process all enemy logic together
		enemySpaceshipBehaviourSystem(world);
		updateAutoAim(world);

		// 5) Force, velocity (physics updates)
		applyForce(world);
		limitSpeed(world);
		moveEntities(world);

		// 6) Shooting and projectiles AFTER movement
		handleShooting(world);
		updateProjectiles(world);

		// 7) Collisions AFTER movement and projectile updates
		collideProjectilesWithTargets(world);
		projectilePoolSystem(world);

		// 8) Physics collisions for pushable objects
		asteroidMovementSystem(world);
		pushAsteroids(world);
		pushEnemies(world);

		// 9) Camera follows after all movement
		cameraFollowPlayer(world);

		// 10) Visual effects
		tickExplosion(world);
		damageFlashSystem(world);

		// 11) Sync ECS transforms to Three.js AFTER all game logic
		syncView(world);

		// 12) Debug info last
		updateDebugMetrics(world, gl);
	});

	return null;
}
