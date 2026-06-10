import { useRef, useEffect, useState } from 'react';
import type { GameState, GameAction, Color } from '../../types.js';
import Board from '../board/Board.jsx';
import Dice from '../ui/Dice.jsx';
import PlayerPanel from '../ui/PlayerPanel.jsx';
import { PLAYER_COLORS, PLAYER_LABELS, APP_NAME, APP_SUBTITLE } from '../../logic/constants.js';

interface GameScreenProps {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
}

export default function GameScreen({ state, dispatch }: GameScreenProps) {
  const {
    players, turnOrder, currentPlayerIndex,
    phase, diceValue, lastDiceValue, movablePawns, consecutiveSixes, message,
  } = state;

  const containerRef = useRef<HTMLDivElement>(null);
  const [boardSize, setBoardSize] = useState(360);

  useEffect(() => {
    function measure() {
      if (!containerRef.current) return;
      const { width, height } = containerRef.current.getBoundingClientRect();
      const isLandscape = width > height;
      const maxW = isLandscape ? width - 220 : width - 16;
      const maxH = isLandscape ? height - 16 : height - 172;
      setBoardSize(Math.floor(Math.min(maxW, maxH, 600)));
    }
    measure();
    const ro = new ResizeObserver(measure);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  if (!players.length) return null;

  // État d'erreur
  if (phase === 'error') {
    return (
      <div style={{
        width: '100vw', height: '100dvh', display: 'flex',
        flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        gap: 24, background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
        padding: 24, boxSizing: 'border-box',
      }}>
        <div style={{ fontSize: 48 }}>⚠️</div>
        <p style={{ color: '#E74C3C', fontWeight: '600', fontSize: '1rem',
                    textAlign: 'center', maxWidth: 340, lineHeight: 1.6 }}>
          {state.errorMessage ?? 'Une erreur inattendue est survenue.'}
        </p>
        <button onClick={() => dispatch({ type: 'NEW_GAME' })}
          style={{ padding: '12px 32px', borderRadius: 12, fontWeight: 'bold',
                   background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                   color: '#1a1a2e', border: 'none', cursor: 'pointer', fontSize: '1rem' }}>
          Nouvelle Partie
        </button>
      </div>
    );
  }

  const currentPlayerId  = turnOrder[currentPlayerIndex];
  const currentPlayer    = players[currentPlayerId];
  const isHumanTurn      = !currentPlayer?.isAI;
  const accentColor      = PLAYER_COLORS[currentPlayer?.color] ?? '#FFD700';
  const canRoll          = isHumanTurn && phase === 'roll';
  const isShowingResult  = phase === 'showing_result';
  const isBetweenTurns   = phase === 'between_turns';
  const diceSize         = Math.max(48, Math.min(80, Math.round(boardSize * 0.13)));

  function handleRoll(): void {
    if (canRoll) dispatch({ type: 'ROLL_DICE' });
  }

  function handlePawnClick(color: Color, pawnId: number): void {
    if (phase !== 'move') return;
    if (color !== currentPlayer.color) return;
    if (!movablePawns.includes(pawnId)) return;
    dispatch({ type: 'MOVE_PAWN', payload: { pawnId } });
  }

  const boardProps = {
    players,
    movablePawns: phase === 'move' ? movablePawns : [],
    onPawnClick: handlePawnClick,
    humanColor: state.humanColor,
    currentPlayerColor: currentPlayer?.color,
    size: boardSize,
  };

  const StatusBar = (
    <div className="flex items-center justify-between w-full px-3 py-2 flex-shrink-0"
         style={{ background: `${accentColor}18`, borderBottom: `1px solid ${accentColor}33` }}>
      <div>
        <span className="text-white font-bold tracking-widest text-sm"
              style={{ fontFamily: 'Georgia, serif', textShadow: `0 0 10px ${accentColor}55` }}>
          {APP_NAME}
        </span>
        <span className="text-white/30 text-xs ml-2 hidden sm:inline">{APP_SUBTITLE}</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-2.5 h-2.5 rounded-full" style={{ background: accentColor }} />
        <span className="text-white text-sm font-medium">
          {PLAYER_LABELS[currentPlayer?.color]}
          {currentPlayer?.isAI ? ' 🤖' : ' 👤'}
        </span>
        {consecutiveSixes > 0 && (
          <span className="text-yellow-300 text-xs font-bold animate-pulse">
            {'⚡'.repeat(consecutiveSixes)} lancer {consecutiveSixes + 1}
          </span>
        )}
      </div>
      <button onClick={() => dispatch({ type: 'NEW_GAME' })}
        className="text-white/40 hover:text-white/80 text-xs transition-colors px-2 py-1 rounded-lg hover:bg-white/10">
        ↺ Quitter
      </button>
    </div>
  );

  const DiceZone = (
    <div className="flex flex-col items-center gap-2 flex-shrink-0">
      {message && (
        <p className="text-white/70 text-xs text-center max-w-[260px] fade-in leading-snug px-2">
          {message}
        </p>
      )}
      <div className="flex items-center gap-4">
        <Dice value={lastDiceValue ?? diceValue} onRoll={handleRoll} canRoll={canRoll} size={diceSize} />
        {phase === 'move'         && <span className="text-yellow-300 text-sm animate-pulse font-medium">Choisissez un pion</span>}
        {isShowingResult          && <span className="text-green-300 text-sm animate-pulse font-medium">Résultat affiché…</span>}
        {isBetweenTurns           && <span className="text-white/50 text-sm animate-pulse">Changement de joueur…</span>}
        {phase === 'ai_thinking'  && <span className="text-blue-300 text-sm animate-pulse">IA réfléchit…</span>}
      </div>
    </div>
  );

  return (
    <div ref={containerRef} className="safe-bottom"
         style={{ width: '100vw', height: '100dvh', display: 'flex', flexDirection: 'column',
                  background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
                  overflow: 'hidden' }}>
      {StatusBar}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', minHeight: 0 }}>

        {/* Mode paysage */}
        <div className="hidden landscape:flex w-full h-full">
          <div style={{ width: 200, flexShrink: 0, display: 'flex', flexDirection: 'column',
                        gap: 12, padding: '12px 10px',
                        borderRight: '1px solid rgba(255,255,255,0.08)', overflowY: 'auto' }}>
            <PlayerPanel players={players} currentPlayerId={currentPlayerId} phase={phase} />
          </div>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 8 }}>
            <Board {...boardProps} />
          </div>
          <div style={{ width: 140, flexShrink: 0, display: 'flex', flexDirection: 'column',
                        alignItems: 'center', justifyContent: 'center', gap: 16,
                        padding: '12px 10px', borderLeft: '1px solid rgba(255,255,255,0.08)' }}>
            {DiceZone}
          </div>
        </div>

        {/* Mode portrait */}
        <div className="flex landscape:hidden flex-col w-full h-full items-center">
          <div style={{ flex: 1, display: 'flex', alignItems: 'center',
                        justifyContent: 'center', padding: '6px 6px 0', minHeight: 0 }}>
            <Board {...boardProps} />
          </div>
          <div style={{ flexShrink: 0, width: '100%', display: 'flex', flexDirection: 'column',
                        gap: 8, padding: '6px 10px 10px',
                        borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <PlayerPanel players={players} currentPlayerId={currentPlayerId} phase={phase} compact />
            <div className="flex justify-center">{DiceZone}</div>
          </div>
        </div>

      </div>
    </div>
  );
}
