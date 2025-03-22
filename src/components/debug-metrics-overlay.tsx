import { useEffect, useRef } from 'react';
import { useTraitEffect, useWorld } from 'koota/react';
import { SceneInfo } from '../traits';

export function DebugMetricsOverlay() {
	const world = useWorld();
	const isActiveRef = useRef(true);

	const drawCallsRef = useRef<HTMLElement>(null!);
	const trianglesRef = useRef<HTMLElement>(null!);
	const renderTimeRef = useRef<HTMLElement>(null!);
	const frameTimeRef = useRef<HTMLElement>(null!);
	const numDroppedFramesRef = useRef<HTMLElement>(null!);
	const entityCountRef = useRef<HTMLElement>(null!);
	const fpsRef = useRef<HTMLElement>(null!);
	const memoryRef = useRef<HTMLElement>(null!);

	useTraitEffect(world, SceneInfo, (info) => {
		if (info && !(info.frameNumber % 5)) {
			drawCallsRef.current.innerHTML = `${info.drawCalls ?? 0}`;
			trianglesRef.current.innerHTML = `${info.triangles ?? 0}`;
			frameTimeRef.current.innerHTML = `${(info.frameTime ?? 0).toFixed(2)}`;
			renderTimeRef.current.innerHTML = `${(info.renderTime ?? 0).toFixed(2)}`;
			numDroppedFramesRef.current.innerHTML = `${info.numberDroppedFrames ?? 0} – ${(
				(info.percentDroppedFrames ?? 0) * 100
			).toFixed(3)}%`;
			entityCountRef.current.innerHTML = `${info.entityCount ?? 0}`;
			fpsRef.current.innerHTML = `${Math.round(info.fps ?? 0)}`;
			memoryRef.current.innerHTML = `${Math.round(info.memory ?? 0)}`;
		}
	});

	// F3 Toggle handler
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === 'F3' || e.key === 'f3') {
				isActiveRef.current = !isActiveRef.current;
				const container = document.getElementById('debug-metrics-container');
				if (container) {
					container.style.display = isActiveRef.current ? 'block' : 'none';
				}
			}
		};

		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	}, []);

	return (
		<div
			id="debug-metrics-container"
			className="absolute bottom-0 leading-none right-0 p-10 bg-black/60 text-white text-xs font-mono rounded z-10"
		>
			<div>
				FPS: <span ref={fpsRef}>0</span>
			</div>
			<div>
				MEM: <span ref={memoryRef}>0</span> MB
			</div>
			<div>
				Entities: <span ref={entityCountRef}>0</span>
			</div>
			<div>
				Draw Calls: <span ref={drawCallsRef}>0</span>
			</div>
			<div>
				Triangles: <span ref={trianglesRef}>0</span>
			</div>
			<div>
				Render Time: <span ref={renderTimeRef}>0</span> ms
			</div>
			<div>
				Frame Time: <span ref={frameTimeRef}>0</span> ms
			</div>
			<div>
				Dropped Frames: <span ref={numDroppedFramesRef}>0 – 0.000%</span>
			</div>
		</div>
	);
}
