import { trait } from 'koota';
import * as THREE from 'three';

export const Input = trait(() => ({
	x: 0,
	y: 0,
	mouseDelta: new THREE.Vector2(),
	roll: 0,
	forward: 0,
	strafe: 0,
	brake: false,
	boost: false,
	shoot: false,
	pointerLocked: false,
}));
