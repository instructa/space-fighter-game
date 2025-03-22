import { useFrame } from '@react-three/fiber';
import { useActions, useWorld } from 'koota/react';
import { useEffect } from 'react';
import { actions } from './actions';
import { SceneInfo } from './traits';
import { updateSpatialHashing } from './systems/update-spatial-hashing';
import * as THREE from 'three';

/**
 * Startup spawns initial entities but no longer handles the spatial hash updates each frame.
 */
export function Startup({
	initialCameraPosition = [0, 0, 50],
	initialEnemies = 5,
}: {
	initialCameraPosition?: [number, number, number];
	initialEnemies?: number;
}) {
	const { spawnPlayer, spawnCamera, spawnAsteroids, spawnEnemy } = useActions(actions);
	const world = useWorld();

	useEffect(() => {
		world.add(SceneInfo);

		// Spawn camera
		spawnCamera(initialCameraPosition);

		// Large asteroid field
		spawnAsteroids(40, [400, 100, 400]);

		// Spawn player
		const player = spawnPlayer();

		// Spawn initial enemies at closer, defined positions
		for (let i = 0; i < initialEnemies; i++) {
			// Create a position in front of the player (where the camera is looking)
			const angle = (i / initialEnemies) * Math.PI * 2;
			const distance = 30 + Math.random() * 20; // Closer positions between 30-50 units
			const x = Math.sin(angle) * distance;
			const z = -Math.cos(angle) * distance; // Negative z is forward in three.js
			const y = THREE.MathUtils.randFloatSpread(15); // Small vertical spread

			const position = new THREE.Vector3(x, y, z);
			spawnEnemy(position);
		}

		return () => {
			// remove the player entity if needed
			player.destroy();
		};
	}, [spawnPlayer, spawnCamera, spawnAsteroids, spawnEnemy, initialCameraPosition, initialEnemies, world]);

	// We update spatial hashing in startup rather than frameloop to ensure it runs
	// before any systems in the main game loop that might need accurate spatial data.
	// This guarantees the spatial hash is always up-to-date at the beginning of each frame.
	useFrame(() => {
		updateSpatialHashing(world);
	});

	return null;
}
