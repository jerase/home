import type { GameState, GameAction } from '../../types.js';
import { PLAYER_COLORS, PLAYER_LABELS } from '../../logic/constants.js';

interface VictoryScreenProps {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
}

export default function VictoryScreen({ state, dispatch }: VictoryScreenProps) {
  const winner = state.players.find(p => p.id === state.winner);
  if (!winner) return null;
  const color = PLAYER_COLORS[winner.color];

  return (
    <div style={{
      width: '100vw', height: '100dvh', display: 'flex',
      flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      gap: 24, padding: 24,
      background: 'linear-gradient(135deg, #1a1a2e, #16213e, #0f3460)',
      boxSizing: 'border-box',
    }}>
      <div className="victory-pop text-center flex flex-col items-center gap-4">
        <div style={{ fontSize: 'clamp(4rem, 15vw, 7rem)' }}>🏆</div>
        <div style={{
          color, fontSize: 'clamp(2rem, 10vw, 4rem)', fontWeight: 'bold',
          fontFamily: 'Georgia, serif', textShadow: `0 0 40px ${color}66`,
        }}>
          {PLAYER_LABELS[winner.color]}
        </div>
        <p className="text-white/70 tracking-widest uppercase"
           style={{ fontSize: 'clamp(0.8rem, 3vw, 1.1rem)' }}>
          a gagné la partie !
        </p>
        <button onClick={() => dispatch({ type: 'NEW_GAME' })}
          className="mt-4 rounded-2xl font-bold tracking-wider transition-all focus:outline-none"
          style={{
            padding: 'clamp(10px,3vw,16px) clamp(28px,8vw,52px)',
            fontSize: 'clamp(0.9rem, 3vw, 1.15rem)',
            background: `linear-gradient(135deg, ${color}, ${color}bb)`,
            color: '#1a1a2e', boxShadow: `0 0 36px ${color}44`,
          }}>
          Nouvelle Partie
        </button>
      </div>
    </div>
  );
}
