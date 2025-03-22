import { useWorld } from 'koota/react';
import { useEffect, useState } from 'react';
import { IsEnemy } from '../traits';
import { IsAsteroid } from '../traits/is-asteroid';
import { AnimatedCounter } from 'react-animated-counter';

export function ScoreTracker() {
	const world = useWorld();
	const [score, setScore] = useState(0);

	useEffect(() => {
		// When an enemy is removed, increment score by 1
		const unsubEnemy = world.onRemove([IsEnemy], () => {
			setScore((v) => v + 1);
		});

		// When an asteroid is removed, increment score by 50
		const unsubAsteroid = world.onRemove([IsAsteroid], () => {
			setScore((v) => v + 50);
		});

		// Start from 0 at the beginning
		setScore(0);

		return () => {
			unsubEnemy();
			unsubAsteroid();
		};
	}, [world]);

	return (
		<div
			style={{
				position: 'absolute',
				top: 0,
				left: 0,
				padding: 40,
				color: 'gold',
				fontSize: '3rem',
				fontFamily: 'Russo One',
				display: 'inline-flex',
				gap: '0.65rem',
				zIndex: 5,
			}}
		>
			Score:{' '}
			<div id="score-value">
				<AnimatedCounter
					value={score}
					fontSize="3rem"
					includeDecimals={false}
					color="gold"
					incrementColor="white"
				/>
			</div>
		</div>
	);
}
