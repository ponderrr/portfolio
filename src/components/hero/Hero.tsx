import { useState } from 'react';
import { ParticleBackground } from './ParticleBackground';
import { BootSequence } from './BootSequence';
import { HeroText } from './HeroText';
import { StatusIndicators } from './StatusIndicators';
import { Navigation } from './Navigation';
import { CornerBrackets } from '../ui/CornerBrackets';

export const Hero = () => {
  const [bootComplete, setBootComplete] = useState(false);

  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Boot sequence overlay */}
      {!bootComplete && <BootSequence onComplete={() => setBootComplete(true)} />}
      
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
  );
};
