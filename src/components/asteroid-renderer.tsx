import { Entity } from 'koota';
import { useQuery } from 'koota/react';
import { useCallback, useRef } from 'react';
import { Group } from 'three';
import * as THREE from 'three';
import { Transform, Ref } from '../traits';
import { IsAsteroid, Health } from '../traits/is-asteroid'; // We'll re-export Health if we want to check it

/**
 * View for a single asteroid entity.
 * We just create a mesh with random geometry or a sphere for now.
 */
function AsteroidView({ entity }: { entity: Entity }) {
	const meshRef = useRef<Group>(null);

	const setInitial = useCallback(
		(group: Group | null) => {
			if (!group) return;
			entity.add(Ref(group));
			meshRef.current = group;
		},
		[entity]
	);

	return (
		<group ref={setInitial}>
			{/*
        For variety, you could randomly pick geometry or load a model.
        For demonstration, let's just use an icosahedron geometry
      */}
			<mesh>
				<icosahedronGeometry args={[1, 1]} />
				<meshStandardMaterial color="grey" metalness={0.2} roughness={0.7} />
			</mesh>
		</group>
	);
}

/**
 * Container component that queries and renders all asteroids.
 */
export function AsteroidRenderer() {
	// Query all entities that have IsAsteroid and Transform
	const asteroids = useQuery(IsAsteroid, Transform);

	return (
		<>
			{asteroids.map((asteroid) => (
				<AsteroidView key={asteroid.id()} entity={asteroid} />
			))}
		</>
	);
}
