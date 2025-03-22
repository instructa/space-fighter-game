import { trait } from 'koota';
import * as THREE from 'three';

export const Projectile = trait({
	speed: 60,
	damage: 20,
	direction: () => new THREE.Vector3(),
	lifetime: 2,
	timeAlive: 0
});