import { useWorld, useActions } from 'koota/react';
import { useEffect, useState } from 'react';
import { Health } from '../traits';
import { actions } from '../actions';
import { ScoreTracker } from './score-tracker';

/**
 * When the player's health <= 0, we show a Game Over overlay with a final score and a restart option.
 */
export function GameOverText() {
	const world = useWorld();
	const { restartGame } = useActions(actions);

	const [gameOver, setGameOver] = useState(false);

	// We'll keep a local state copy of finalScore so we can show it at game over
	const [finalScore, setFinalScore] = useState(0);

	useEffect(() => {
		const unsub = world.onChange(Health, (player) => {
			const playerHealth = player.get(Health);
			if (playerHealth && playerHealth.amount <= 0) {
				// Gather the current score
				// We'll query the ScoreTracker system or component (which sets a global or we can read from the DOM)
				// For simplicity, we can handle this in a simpler way. We will just read from the score in the ScoreTracker
				// by hooking into the onRemove or direct hooking logic. But let's do a hack: we can do a quick query for the "score" from the DOM or a global store.
				// Instead let's just do a custom method. We'll set a "score" event on the ScoreTracker. We'll do a simpler approach:
				// We'll do "document.getElementById('score-value')" if it exists. This is hacky, but straightforward.
				const el = document.getElementById('score-value');
				let scoreVal = 0;
				if (el && el.innerText) {
					scoreVal = parseInt(el.innerText, 10) || 0;
				}
				setFinalScore(scoreVal);

				// Clear out everything except the UI
				world.query().updateEach((_, entity) => {
					entity.destroy();
				});
				setGameOver(true);
			}
		});
		return () => {
			unsub();
		};
	}, [world]);

	const submitScore = () => {
		// Placeholder for an actual remote submission
		alert(`Your score of ${finalScore} was submitted!`);
	};

	const handleRestart = () => {
		// Optionally submit the score
		submitScore();
		// Then run the restart action
		restartGame();
		// Hide gameover UI
		setGameOver(false);
	};

	return gameOver ? (
		<div
			style={{
				display: 'flex',
				alignItems: 'center',
				flexDirection: 'row',
				width: '100%',
				height: '100%',
			}}
		>
			<div
				style={{
					display: 'flex',
					alignItems: 'center',
					flexDirection: 'column',
					width: '100%',
				}}
			>
				<div
					style={{
						color: 'red',
						fontSize: '3rem',
						fontFamily: 'Russo One',
						gap: '0.65rem',
						marginBottom: '1rem',
					}}
				>
					GAME OVER
				</div>
				<div
					style={{
						color: 'gold',
						fontSize: '2rem',
						fontFamily: 'Russo One',
						marginBottom: '1rem',
					}}
				>
					FINAL SCORE: {finalScore}
				</div>
				<button
					onClick={handleRestart}
					style={{
						fontFamily: 'Russo One',
						fontSize: '1.5rem',
						padding: '0.5rem 2rem',
						cursor: 'pointer',
						backgroundColor: '#222',
						color: '#fff',
						border: '2px solid gold',
						borderRadius: '8px',
					}}
				>
					RESTART
				</button>
			</div>
		</div>
	) : null;
}
