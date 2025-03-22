import { Entity } from 'koota';
import { Transform } from '../traits';

/**
 * Enhanced SpatialHashMap:
 * - Allows dynamic cellSize (passed in constructor).
 * - Reuses a shared results array if the user passes one to reduce allocations.
 * - Uses squared distance checks if the caller requests it, for early-out rejections.
 */

type Cell = Set<Entity>;

export class SpatialHashMap {
	protected cells = new Map<string, Cell>();
	protected entityToCell = new Map<Entity, Cell>();

	/**
	 * You can tweak cellSize to better match the typical scale of your scene for performance.
	 */
	constructor(public cellSize: number) {}

	setEntity(entity: Entity, x: number, y: number, z: number) {
		const cell = this.getCell(x, y, z);

		// Remove from previous cell if assigned
		const oldCell = this.entityToCell.get(entity);
		if (oldCell && oldCell !== cell) {
			oldCell.delete(entity);
		}

		cell.add(entity);
		this.entityToCell.set(entity, cell);
	}

	removeEntity(entity: Entity) {
		const cell = this.entityToCell.get(entity);
		if (cell) {
			cell.delete(entity);
			this.entityToCell.delete(entity);
		}
	}

	/**
	 * Returns an array of entities near (x,y,z) within radius.
	 * Optionally pass your own array in the 'entities' param to reduce allocations.
	 * If you pass `maxEntities`, the search will early-out when that is reached.
	 */
	getNearbyEntities(
		x: number,
		y: number,
		z: number,
		radius: number,
		entities: Entity[] = [],
		maxEntities = Infinity,
		useSquaredDistance = false
	) {
		entities.length = 0;
		let count = 0;

		// Determine bounding cells of the query region
		const minCellX = Math.floor((x - radius) / this.cellSize);
		const maxCellX = Math.floor((x + radius) / this.cellSize);
		const minCellY = Math.floor((y - radius) / this.cellSize);
		const maxCellY = Math.floor((y + radius) / this.cellSize);
		const minCellZ = Math.floor((z - radius) / this.cellSize);
		const maxCellZ = Math.floor((z + radius) / this.cellSize);

		const radiusSq = radius * radius;

		for (let cx = minCellX; cx <= maxCellX; cx++) {
			for (let cy = minCellY; cy <= maxCellY; cy++) {
				for (let cz = minCellZ; cz <= maxCellZ; cz++) {
					const cell = this.getCellByIndices(cx, cy, cz);
					if (!cell) continue;

					for (const entity of cell) {
						// Optional squared distance check to reduce false positives:
						if (useSquaredDistance) {
							const ePos = entity.get(Transform)?.position;
							if (ePos) {
								const dx = x - ePos.x;
								const dy = y - ePos.y;
								const dz = z - ePos.z;
								const distSq = dx * dx + dy * dy + dz * dz;
								if (distSq <= radiusSq) {
									entities.push(entity);
									count++;
									if (count >= maxEntities) return entities;
								}
							}
						} else {
							// if user doesn't want the squared check, we just push directly
							entities.push(entity);
							count++;
							if (count >= maxEntities) return entities;
						}
					}
				}
			}
		}

		return entities;
	}

	reset() {
		this.cells.clear();
		this.entityToCell.clear();
	}

	protected getCell(x: number, y: number, z: number): Cell {
		const hx = Math.floor(x / this.cellSize);
		const hy = Math.floor(y / this.cellSize);
		const hz = Math.floor(z / this.cellSize);
		return this.getCellByIndices(hx, hy, hz, true)!;
	}

	protected getCellByIndices(cx: number, cy: number, cz: number, createIfMissing = false): Cell | undefined {
		const hash = `${cx}:${cy}:${cz}`;
		if (!this.cells.has(hash)) {
			if (!createIfMissing) return undefined;
			this.cells.set(hash, new Set());
		}
		return this.cells.get(hash);
	}
}
