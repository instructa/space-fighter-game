import { Canvas } from '@react-three/fiber';
import { CameraRenderer } from './components/camera-renderer';
import { PlayerRenderer } from './components/player-renderer';
import { GameLoop } from './frameloop';
import { Startup } from './startup';
import { AsteroidRenderer } from './components/asteroid-renderer';
import { ProjectileRenderer } from './components/projectile-renderer';
import { Stars } from '@react-three/drei';
import { ScoreTracker } from './components/score-tracker';
import { EnemyRenderer } from './components/enemy-renderer';
import { HealthTracker } from './components/health-tracker';
import { GameOverText } from './components/game-over';
import { DebugMetricsOverlay } from './components/debug-metrics-overlay';

export function App() {
	return (
		<>
			<ScoreTracker />
			<HealthTracker />
			<GameOverText />
			<DebugMetricsOverlay />

			<Canvas>
				<Startup initialCameraPosition={[0, 5, 20]} />
				<GameLoop />

				<CameraRenderer />
				<PlayerRenderer />
				<ProjectileRenderer />
				<AsteroidRenderer />

				<EnemyRenderer />

				<ambientLight intensity={1.02} />
				<directionalLight position={[10.41789, -5.97702, 10]} intensity={2.98} color={'#c31829'} />
				<directionalLight position={[10.55754, 5.89323, 9.99894]} intensity={4.88} color={'#ffffff'} />

				<Stars factor={10} radius={200} fade={false} />
			</Canvas>
		</>
	);
}
