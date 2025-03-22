import { Entity } from 'koota';
import { useQuery } from 'koota/react';
import { useRef, useCallback, useEffect } from 'react';
import { Group, Mesh, MeshStandardMaterial } from 'three';
import * as THREE from 'three';
import { IsEnemy, Transform, Ref, DamageFlash } from '../traits';

/**
 * EnemyView component that renders a simple enemy spaceship using basic geometries
 * instead of loading a GLTF model.
 */
function EnemyView({ entity }: { entity: Entity }) {
	const groupRef = useRef<Group | null>(null);

	// Attach the 3D group to ECS
	const setInitial = useCallback(
		(group: Group | null) => {
			if (!group) return;
			groupRef.current = group;
			entity.add(Ref(group));

			// If no transform trait, create one for default positioning
			if (!entity.has(Transform)) {
				entity.set(Transform, {
					position: new THREE.Vector3(0, 0, 0),
					rotation: new THREE.Euler(0, 0, 0),
					scale: new THREE.Vector3(1, 1, 1),
				});
			}
		},
		[entity]
	);

	// Handle DamageFlash effect
	useEffect(() => {
		try {
			const df = entity.get(DamageFlash);
			if (!df || !groupRef.current || df.initialized) return;

			groupRef.current.traverse((obj) => {
				if (obj instanceof Mesh && obj.material && 'color' in obj.material) {
					const mat = obj.material as MeshStandardMaterial;
					df.originalColors.set(obj.uuid, mat.color.clone());
				}
			});
			df.initialized = true;
		} catch (error) {
			console.error('Error in DamageFlash setup:', error);
		}
	}, [entity]);

	return (
		<group ref={setInitial}>
			{/* Main body of the enemy ship - a red ship with wings */}
			<group>
				{/* Ship body */}
				<mesh position={[0, 0, 0]} rotation={[0, Math.PI, 0]}>
					<coneGeometry args={[0.5, 1.5, 8]} />
					<meshStandardMaterial color="#aa3333" metalness={0.5} roughness={0.2} />
				</mesh>

				{/* Wings */}
				<mesh position={[0, 0, 0.3]}>
					<boxGeometry args={[1.5, 0.1, 0.5]} />
					<meshStandardMaterial color="#661111" metalness={0.5} roughness={0.2} />
				</mesh>

				{/* Cockpit */}
				<mesh position={[0, 0.2, -0.2]}>
					<sphereGeometry args={[0.25, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
					<meshStandardMaterial color="#66ccff" metalness={0.9} roughness={0.1} />
				</mesh>

				{/* Engine glow */}
				<mesh position={[0, 0, 0.8]}>
					<cylinderGeometry args={[0.2, 0.3, 0.1, 16]} />
					<meshStandardMaterial color="#ff7700" emissive="#ff3300" emissiveIntensity={2} />
				</mesh>
			</group>

			{/* Yellow wireframe hitbox */}
			<mesh>
				<boxGeometry args={[1.5, 0.5, 1.6]} />
				<meshBasicMaterial color="yellow" wireframe={true} />
			</mesh>
		</group>
	);
}

export function EnemyRenderer() {
	// Query all entities that have IsEnemy and Transform
	const enemies = useQuery(IsEnemy, Transform);

	return (
		<>
			{enemies.map((enemy) => (
				<EnemyView key={enemy.id()} entity={enemy} />
			))}
		</>
	);
}
