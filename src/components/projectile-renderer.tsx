import { Entity } from 'koota';
import { useQuery } from 'koota/react';
import { useCallback } from 'react';
import * as THREE from 'three';
import { Projectile, Transform, Ref } from '../traits';

const projectileColor = new THREE.Color('lime'); // bright green or choose something red

/**
	* We'll do a short cylinder oriented along Z. We'll use emissive color for a glow effect.
	*/
function LaserProjectileView({ entity }: { entity: Entity }) {
	const setInitial = useCallback(
	(group: THREE.Group | null) => {
		if (!group) return;
		entity.add(Ref(group));
	},
	[entity]
	);

	// A short cylinder, rotated so that it aligns with the entity's forward (Z-axis).
	// Make it narrower for a laser look.
	return (
	<group ref={setInitial}>
		<mesh rotation={[Math.PI * 0.5, 0, 0]} scale={[0.06, 1.2, 0.06]}>
		<cylinderGeometry args={[1, 1, 1, 8, 1, true]} />
		<meshStandardMaterial
			emissive={projectileColor}
			emissiveIntensity={4}
			color={projectileColor}
			metalness={0.2}
			roughness={0.1}
		/>
		</mesh>
	</group>
	);
}

export function ProjectileRenderer() {
	const projectiles = useQuery(Projectile, Transform);
	return projectiles.map((projectile) => (
	<LaserProjectileView key={projectile.id()} entity={projectile} />
	));
}