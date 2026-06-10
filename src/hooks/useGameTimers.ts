import { useEffect } from 'react';
import type { GameState, GameAction } from '../types.js';
import { SHOW_RESULT_DELAY_MS, BETWEEN_TURNS_DELAY_MS } from '../logic/constants.js';

export function useGameTimers(state: GameState, dispatch: React.Dispatch<GameAction>): void {
  useEffect(() => {
    if (state.phase !== 'showing_result') return;
    const timer = setTimeout(() => dispatch({ type: 'SHOW_RESULT_DONE' }), SHOW_RESULT_DELAY_MS);
    return () => clearTimeout(timer);
  }, [state.phase]);

  useEffect(() => {
    if (state.phase !== 'between_turns') return;
    const timer = setTimeout(() => dispatch({ type: 'BETWEEN_TURNS_DONE' }), BETWEEN_TURNS_DELAY_MS);
    return () => clearTimeout(timer);
  }, [state.phase]);
}
