import { World } from 'koota';
import { Input, IsPlayer } from '../traits';
import * as THREE from 'three';

const keys = {
	arrowUp: false,
	arrowDown: false,
	arrowLeft: false,
	arrowRight: false,
	w: false,
	a: false,
	s: false,
	d: false,
	q: false,
	e: false,
	space: false,
	escape: false,
	mousedownLeft: false,
	k: false,
	touchpadClick: false,
};

// Track mouse movement
const mouseDelta = new THREE.Vector2();
let prevMouseX = 0;
let prevMouseY = 0;

// Track pointer lock state
let isPointerLocked = false;

// Request pointer lock when canvas is clicked
document.addEventListener('click', () => {
	// Only request pointer lock if it's not already active
	if (!isPointerLocked) {
		// Find the canvas element
		const canvas = document.querySelector('canvas');
		if (canvas) {
			canvas.requestPointerLock();
		}
	}
});

// Listen for pointer lock changes
document.addEventListener('pointerlockchange', () => {
	isPointerLocked = document.pointerLockElement !== null;
});

// Add Escape key detection to exit pointer lock
document.addEventListener('keydown', (e) => {
	if (e.key === 'Escape') {
		keys.escape = true;
		// Pointer lock is automatically released by the browser when Escape is pressed
	}
});
document.addEventListener('keyup', (e) => {
	if (e.key === 'Escape') {
		keys.escape = false;
	}
});

// Mouse movement
window.addEventListener('mousemove', (e) => {
	if (isPointerLocked) {
		// Use movement deltas directly when pointer locked
		mouseDelta.x += e.movementX;
		mouseDelta.y += e.movementY;
	} else {
		// Traditional delta when not locked
		mouseDelta.x = e.clientX - prevMouseX;
		mouseDelta.y = e.clientY - prevMouseY;
		prevMouseX = e.clientX;
		prevMouseY = e.clientY;
	}
});

// Keyboard events
window.addEventListener('keydown', (e) => {
	switch (e.key.toLowerCase()) {
		case 'arrowup':
		case 'w':
			keys.arrowUp = true;
			keys.w = true;
			break;
		case 'arrowdown':
		case 's':
			keys.arrowDown = true;
			keys.s = true;
			break;
		case 'arrowleft':
		case 'a':
			keys.arrowLeft = true;
			keys.a = true;
			break;
		case 'arrowright':
		case 'd':
			keys.arrowRight = true;
			keys.d = true;
			break;
		case 'q':
			keys.q = true;
			break;
		case 'e':
			keys.e = true;
			break;
		case ' ':
			keys.space = true;
			break;
		case 'k':
			keys.k = true;
			break;
	}
});
window.addEventListener('keyup', (e) => {
	switch (e.key.toLowerCase()) {
		case 'arrowup':
		case 'w':
			keys.arrowUp = false;
			keys.w = false;
			break;
		case 'arrowdown':
		case 's':
			keys.arrowDown = false;
			keys.s = false;
			break;
		case 'arrowleft':
		case 'a':
			keys.arrowLeft = false;
			keys.a = false;
			break;
		case 'arrowright':
		case 'd':
			keys.arrowRight = false;
			keys.d = false;
			break;
		case 'q':
			keys.q = false;
			break;
		case 'e':
			keys.e = false;
			break;
		case ' ':
			keys.space = false;
			break;
		case 'k':
			keys.k = false;
			break;
	}
});

// Mouse button events for left-click
window.addEventListener('mousedown', (e) => {
	if (e.button === 0) {
		keys.mousedownLeft = true;
		// Mac touchpad clicks are detected as mouse clicks
		keys.touchpadClick = true;
	}
});
window.addEventListener('mouseup', (e) => {
	if (e.button === 0) {
		keys.mousedownLeft = false;
		keys.touchpadClick = false;
	}
});

export function pollInput(world: World) {
	world.query(IsPlayer, Input).updateEach(([input]) => {
		// Horizontal/vertical input
		const horizontal = (keys.arrowRight || keys.d ? 1 : 0) - (keys.arrowLeft || keys.a ? 1 : 0);
		const vertical = (keys.arrowUp || keys.w ? 1 : 0) - (keys.arrowDown || keys.s ? 1 : 0);

		// Normalize diagonal movement
		const length = Math.sqrt(horizontal * horizontal + vertical * vertical);
		if (length > 0) {
			input.x = horizontal / (length || 1);
			input.y = vertical / (length || 1);
		} else {
			input.x = 0;
			input.y = 0;
		}

		// WASD/Space inputs
		input.forward = keys.w || keys.arrowUp ? 1 : 0;
		input.brake = keys.s || keys.arrowDown;
		input.strafe = horizontal;
		input.boost = keys.space;

		// Q/E roll
		input.roll = (keys.q ? 1 : 0) - (keys.e ? 1 : 0);

		// Mouse delta
		input.mouseDelta.copy(mouseDelta);
		mouseDelta.set(0, 0);

		// Shooting with left mouse, K key, or touchpad click
		input.shoot = keys.mousedownLeft || keys.k || keys.touchpadClick;

		// Track pointer lock state
		input.pointerLocked = isPointerLocked;
	});
}
