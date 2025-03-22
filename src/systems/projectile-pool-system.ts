import { World, Entity } from 'koota';
import { Projectile } from '../traits';

export function projectilePoolSystem(world: World) {
  const projectiles = world.query(Projectile);

  if (projectiles.length <= 10) {
    return;
  }

  // We have more than 10; remove the oldest until only 10 remain.
  // "Oldest" means the one with the greatest timeAlive
  // Sort descending by timeAlive
  const sorted = [...projectiles].sort((a, b) => {
    const pa = a.get(Projectile)!;
    const pb = b.get(Projectile)!;
    return pb.timeAlive - pa.timeAlive;
  });

  // We'll remove the oldest ones from the front of this sorted array
  const excess = sorted.slice(0, sorted.length - 10);
  for (const e of excess) {
    e.destroy();
  }
}