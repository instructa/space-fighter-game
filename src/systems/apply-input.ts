import { World } from 'koota';
import * as THREE from 'three';
import { IsPlayer, Transform, Input, Movement, Time } from '../traits';

/**
	* Based on a typical flight model:
	* - We accelerate forward when W is pressed.
	* - We brake/slow down when S is pressed.
	* - We allow negative throttle for reverse.
	* - We also have a boost if SHIFT or SPACE (depending on pollInput) is set.
	* - We use mouseDelta to yaw/pitch, and Q/E to roll.
	*
	* Changes:
	*  - Increased forward acceleration and brake deceleration.
	*  - Lowered boost from 500 to 30 so it’s not so extreme.
	*  - Slightly adjusted rotation to try to reduce "buggy" feeling for pitch/yaw.
	*/

const MOUSE_SENSITIVITY = 0.0025;
const ROTATION_SMOOTH_FACTOR = 0.15;
const PITCH_LIMIT = Math.PI * 0.5; // limit pitch to +/- 90 degrees

// Adjusted accelerations
const FORWARD_ACCEL = 8.0;
const BRAKE_ACCEL = 12.0;
const THROTTLE_BOOST_ACCEL = 30.0; // lowered from 500

const REVERSE_THROTTLE_LIMIT = -15;
const MAX_THROTTLE = 50;  // raised from 40
const STRAFE_SPEED = 100.0;
const ROLL_SPEED = 3.0;

export function playerFlightSystem(world: World) {
	const time = world.get(Time);
	if (!time) return;

	const { delta } = time;

	world.query(IsPlayer, Transform, Input, Movement).updateEach(([transform, input, movement]) => {
	// 1) ROTATION: Yaw & Pitch from mouseDelta, Roll from Q/E keys
	const currentQuat = new THREE.Quaternion().setFromEuler(transform.rotation);

	// Mouse rotation for yaw/pitch
	const yaw = -input.mouseDelta.x * MOUSE_SENSITIVITY;
	const pitch = -input.mouseDelta.y * MOUSE_SENSITIVITY;

	const yawQ = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, yaw, 0, 'XYZ'));
	const pitchQ = new THREE.Quaternion().setFromEuler(new THREE.Euler(pitch, 0, 0, 'XYZ'));

	const desiredQuat = currentQuat.clone().multiply(yawQ).multiply(pitchQ);

	currentQuat.slerp(desiredQuat, ROTATION_SMOOTH_FACTOR);
	transform.rotation.setFromQuaternion(currentQuat);

	// After slerp, clamp pitch
	if (transform.rotation.x > PITCH_LIMIT) transform.rotation.x = PITCH_LIMIT;
	if (transform.rotation.x < -PITCH_LIMIT) transform.rotation.x = -PITCH_LIMIT;

	// Apply roll from Q/E keys
	if (input.roll !== 0) {
		transform.rotation.z += input.roll * ROLL_SPEED * delta;
	}

	// 2) THROTTLE
	if (typeof movement['throttle'] !== 'number') {
		(movement as any).throttle = 0; // initialize if missing
	}
	const oldThrottle = (movement as any).throttle;

	// If W => accelerate, if S => brake
	let newThrottle = oldThrottle;
	if (input.forward > 0) {
		newThrottle += FORWARD_ACCEL * delta;
	}
	if (input.brake) {
		newThrottle -= BRAKE_ACCEL * delta;
	}

	// Boost if requested
	if (input.boost) {
		newThrottle += THROTTLE_BOOST_ACCEL * delta;
	}

	// Limit to min/max
	newThrottle = Math.max(REVERSE_THROTTLE_LIMIT, Math.min(MAX_THROTTLE, newThrottle));
	(movement as any).throttle = newThrottle;

	// 3) BUILD VELOCITY
	const forwardDir = new THREE.Vector3(0, 0, -1).applyEuler(transform.rotation);
	const newVelocity = forwardDir.multiplyScalar(newThrottle);

	// strafe A/D
	if (input.strafe !== 0) {
		const strafeDir = new THREE.Vector3(1, 0, 0).applyEuler(transform.rotation);
		const throttleForStrafe = Math.abs(newThrottle);
		newVelocity.addScaledVector(strafeDir, input.strafe * STRAFE_SPEED * (1 + throttleForStrafe * 0.05));
	}

	// Write final velocity
	movement.velocity.copy(newVelocity);
	});
}