import { useEffect } from 'react';
import type { GameState, GameAction } from '../types.js';
import { AI_DELAY_MS } from '../logic/constants.js';
import { chooseAIPawn } from '../logic/aiStrategy.js';

export function useAI(state: GameState, dispatch: React.Dispatch<GameAction>): void {
  useEffect(() => {
    if (state.phase !== 'ai_thinking') return;
    if (!state.players.length) return;

    const currentPlayer = state.players[state.turnOrder[state.currentPlayerIndex]];
    if (!currentPlayer?.isAI) return;

    if (state.diceValue === null) {
      const timer = setTimeout(() => dispatch({ type: 'ROLL_DICE' }), AI_DELAY_MS);
      return () => clearTimeout(timer);
    }

    const timer = setTimeout(() => {
      if (state.movablePawns.length > 0) {
        const chosen = chooseAIPawn(currentPlayer, state.movablePawns, state.diceValue!, state.players);
        if (chosen !== null) dispatch({ type: 'MOVE_PAWN', payload: { pawnId: chosen } });
        else dispatch({ type: 'NEXT_PLAYER' });
      } else {
        const hasActivePawns = currentPlayer.pawns.some(p => p.status === 'board' || p.status === 'corridor');
        const hasHomePawns   = currentPlayer.pawns.some(p => p.status === 'home');
        if (state.diceValue === 6 && (hasActivePawns || hasHomePawns)) dispatch({ type: 'ROLL_DICE' });
        else dispatch({ type: 'NEXT_PLAYER' });
      }
    }, AI_DELAY_MS);

    return () => clearTimeout(timer);

  // IMPORTANT : consecutiveSixes est requis dans les dépendances.
  // Sans lui, quand l'IA obtient 6 plusieurs fois de suite avec movablePawns=[],
  // diceValue reste à 6 et movablePawns.length reste à 0 entre deux relances.
  // Le useEffect ne se redéclencherait donc pas → timer jamais recréé → jeu figé.
  // consecutiveSixes s'incrémente à chaque relance (1→2→3), garantissant
  // que le useEffect se relance après chaque ROLL_DICE.
  }, [state.phase, state.currentPlayerIndex, state.diceValue, state.movablePawns.length, state.consecutiveSixes]);
}
