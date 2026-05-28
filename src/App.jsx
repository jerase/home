import { useGameState } from './hooks/useGameState.js';
import { useAI } from './hooks/useAI.js';
import SetupScreen from './components/screens/SetupScreen.jsx';
import GameScreen from './components/screens/GameScreen.jsx';
import VictoryScreen from './components/screens/VictoryScreen.jsx';

export default function App() {
  const { state, dispatch } = useGameState();
  useAI(state, dispatch);

  if (state.screen === 'setup')   return <SetupScreen dispatch={dispatch} />;
  if (state.screen === 'game')    return <GameScreen state={state} dispatch={dispatch} />;
  if (state.screen === 'victory') return <VictoryScreen state={state} dispatch={dispatch} />;
  return null;
}
