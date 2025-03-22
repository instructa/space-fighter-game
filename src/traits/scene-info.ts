import { trait } from 'koota';

/**
 * Stores metrics about the scene for debugging purposes
 */
export const SceneInfo = trait({
	drawCalls: 0,
	triangles: 0,
	frameTime: 0,
	renderTime: 0,
	frameNumber: 0,
	numberDroppedFrames: 0,
	percentDroppedFrames: 0,
	fps: 0,
	memory: 0,
	entityCount: 0,
});
