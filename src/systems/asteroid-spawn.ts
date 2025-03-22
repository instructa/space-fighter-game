import { World } from "koota";
import * as THREE from "three";
import { IsAsteroid } from "../traits/is-asteroid";
import { actions } from "../actions";
import { Time } from "../traits";

/**
 * Periodically spawns asteroids at random positions if total < 60.
 * The user story calls for "AsteroidSpawnSystem for random placement".
 */
let accumulator = 0;
const SPAWN_INTERVAL = 5000; // ms
const MAX_ASTEROIDS = 60;

export function asteroidSpawnSystem(world: World) {
  const time = world.get(Time);
  if (!time) return;

  accumulator += time.delta * 1000;

  // Each time we accumulate 5s, spawn an asteroid if < 60
  if (accumulator >= SPAWN_INTERVAL) {
    accumulator = 0;

    // Count current asteroids
    const count = world.query(IsAsteroid).length;
    if (count < MAX_ASTEROIDS) {
      const { spawnAsteroid } = actions(world);

      // Random position range e.g. ±400 in XZ, ±50 in Y
      const pos = new THREE.Vector3(
        THREE.MathUtils.randFloatSpread(800),
        THREE.MathUtils.randFloatSpread(100),
        THREE.MathUtils.randFloatSpread(800)
      );

      spawnAsteroid(pos);
    }
  }
}