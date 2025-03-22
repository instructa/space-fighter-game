import { World } from 'koota';
import { SceneInfo, Time } from '../traits';
import { WebGLRenderer } from 'three';

// Extend Performance to include memory property
interface ExtendedPerformance extends Performance {
	memory?: {
		usedJSHeapSize: number;
		jsHeapSizeLimit: number;
		totalJSHeapSize: number;
	};
}

declare global {
	interface Window {
		performance: ExtendedPerformance;
	}
}

export function updateDebugMetrics(world: World, gl: WebGLRenderer) {
	const drawCalls = gl.info.render.calls;
	const time = world.get(Time)!;
	const now = performance.now();
	const renderTime = performance.now() - now;

	if (!(gl.info.render.frame % 10) && world.has(SceneInfo)) {
		world.set(SceneInfo, {
			drawCalls,
			triangles: gl.info.render.triangles,
			renderTime,
			frameTime: time.delta * 1000,
			frameNumber: gl.info.render.frame,
			numberDroppedFrames: 0, // Need to implement tracking logic
			percentDroppedFrames: 0, // Need to implement tracking logic
			fps: 1000 / (time.delta * 1000),
			memory: (performance as ExtendedPerformance).memory
				? Math.round((performance as ExtendedPerformance).memory!.usedJSHeapSize / (1024 * 1024))
				: 0,
			entityCount: world.query().length,
		});
	}
}
