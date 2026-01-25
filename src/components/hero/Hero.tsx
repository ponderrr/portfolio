import { useState, createContext, useContext } from 'react';
import { ParticleBackground } from './ParticleBackground';
import { BootSequence } from './BootSequence';
import { HeroText } from './HeroText';
import { StatusIndicators } from './StatusIndicators';
import { Navigation } from './Navigation';
import { CornerBrackets } from '../ui/CornerBrackets';
import type { VisualQuality } from '@/hooks/useVisualQuality';

// Context for sharing benchmark quality across the app
type BenchmarkContextType = {
  quality: VisualQuality;
  benchmarkFps: number;
};

export const BenchmarkContext = createContext<BenchmarkContextType>({
  quality: 'medium',
  benchmarkFps: 60,
});

export const useBenchmarkQuality = () => useContext(BenchmarkContext);

export const Hero = () => {
  const [bootComplete, setBootComplete] = useState(false);
  const [benchmarkQuality, setBenchmarkQuality] = useState<VisualQuality>('medium');

  const handleBootComplete = (quality: VisualQuality) => {
    setBenchmarkQuality(quality);
    setBootComplete(true);
  };

  return (
    <BenchmarkContext.Provider value={{ quality: benchmarkQuality, benchmarkFps: 60 }}>
      <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Boot sequence overlay */}
        {!bootComplete && <BootSequence onComplete={handleBootComplete} />}

        {/* Particle background */}
        {bootComplete && <ParticleBackground />}

        {/* Status indicators */}
        {bootComplete && <StatusIndicators />}

        {/* Main content */}
        <div className="relative z-20 max-w-7xl mx-auto px-6">
          {bootComplete && <HeroText />}
        </div>

        {/* Navigation */}
        {bootComplete && <Navigation />}

        {/* Screen corners */}
        <CornerBrackets className="opacity-20" size="lg" />
      </section>
    </BenchmarkContext.Provider>
  );
};
