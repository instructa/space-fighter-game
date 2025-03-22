import { useGLTF } from '@react-three/drei';
import { Entity } from 'koota';
import { useQueryFirst, useTraitEffect } from 'koota/react';
import { useRef, MutableRefObject, useCallback, useEffect } from 'react';
import * as THREE from 'three';
import { Group } from 'three';
import src from '../assets/ships/fighter.glb?url';
import { IsPlayer, Transform, Ref, DamageFlash } from '../traits';

export function PlayerView({ entity }: { entity: Entity }) {
	const { scene } = useGLTF(src);
	const groupRef = useRef<Group | null>(null) as MutableRefObject<Group | null>;

	// Initialize the ref
	const setInitial = useCallback(
		(group: Group | null) => {
			if (!group) return;
			groupRef.current = group;

			// Add to ECS
			entity.add(Ref(group));

			// If no transform, create one with default pos/rot/scale
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

	// Watch for collision events via DamageFlash trait
	useTraitEffect(entity, DamageFlash, (df) => {
		if (df && !df.initialized) {
			console.log('[PlayerCollision] Player has been hit!');
		}
	});

	// Record original mesh colors if DamageFlash is present
	useEffect(() => {
		const df = entity.get(DamageFlash);
		if (!df || !groupRef.current || df.initialized) return;

		groupRef.current.traverse((obj) => {
			if (obj instanceof THREE.Mesh && obj.material && 'color' in obj.material) {
				const mat = obj.material as THREE.MeshStandardMaterial;
				df.originalColors.set(obj.uuid, mat.color.clone());
			}
		});
		df.initialized = true;
	}, [entity]);

	return (
		<group ref={setInitial}>
			<primitive object={scene} />
		</group>
	);
}

export function PlayerRenderer() {
	const player = useQueryFirst(IsPlayer, Transform);
	return player ? <PlayerView entity={player} /> : null;
}
