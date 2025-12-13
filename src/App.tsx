import { Hero } from '@/components/hero/Hero';
import { CustomCursor } from '@/components/ui/CustomCursor';
import NeuralLatticeSection from '@/components/exhibits/neural-lattice/NeuralLatticeSection';
import PrismCoreSection from "./components/exhibits/prism-core/PrismCoreSection";
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';

function App() {
  useKeyboardShortcuts();

  return (
    <>
      <CustomCursor />
      <div className="relative">
        <Hero />
        <NeuralLatticeSection />
        <PrismCoreSection />
      </div>
    </>
  );
}

export default App;
