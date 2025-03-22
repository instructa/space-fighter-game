import { World, Entity } from 'koota';
import { Explosion, Transform } from '../traits';

/**
 * Basic object pool for explosions:
 *  - Creates a queue of inactive explosion entities.
 *  - If available, reuses them; otherwise spawns a new one.
 *
 * For simplicity, the explosion logic (tickExplosion) must reset the entity at end-of-life,
 * then push it back into the pool rather than calling entity.destroy().
 *
 * This file is a demonstration only. Integration would require refactoring tickExplosion
 * so it doesn't destroy the entity, and hooking an "onEnded" callback that returns the
 * explosion entity to the pool.
 */
const explosionPool: Entity[] = [];
const MAX_POOL_SIZE = 20;

export function getPooledExplosion(world: World) {
	// If we have an inactive explosion entity in the pool, reuse it:
	while (explosionPool.length > 0) {
		const e = explosionPool.pop()!;
		if (!e.destroyed) {
			// reset explosion data
			const ex = e.get(Explosion);
			if (ex) {
				ex.current = 0;
				// optionally reset other fields if needed
			}
			return e;
		}
	}

	// If no pool entity, create a new one
	return world.spawn(Explosion(), Transform());
}

export function returnExplosionToPool(entity: Entity) {
	if (explosionPool.length < MAX_POOL_SIZE) {
		explosionPool.push(entity);
	} else {
		// if pool is full, just destroy the entity
		entity.destroy();
	}
}
