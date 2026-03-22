import { Dashboard } from './components/Dashboard';
import { GameProgressProvider } from './context/GameProgressContext';

export default function App() {
  return (
    <GameProgressProvider>
      <Dashboard />
    </GameProgressProvider>
  );
}
