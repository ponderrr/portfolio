import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useGPUBenchmark } from '@/hooks/useGPUBenchmark';

type Props = {
  onComplete: (quality: 'low' | 'medium' | 'high') => void;
  minDuration?: number; // Minimum display time in ms (default 1500)
};

export const BootSequence = ({ onComplete, minDuration = 1500 }: Props) => {
  const [visible, setVisible] = useState(true);
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);
  const [statusText, setStatusText] = useState('[SYSTEM INITIALIZING...]');

  const benchmark = useGPUBenchmark();

  // Minimum display timer
  useEffect(() => {
    const timer = setTimeout(() => {
      setMinTimeElapsed(true);
    }, minDuration);

    return () => clearTimeout(timer);
  }, [minDuration]);

  // Update status text based on benchmark progress
  useEffect(() => {
    if (benchmark.done) {
      setStatusText(`[GPU BENCHMARK: ${benchmark.fps} FPS → ${benchmark.quality.toUpperCase()}]`);
    }
  }, [benchmark.done, benchmark.fps, benchmark.quality]);

  // Complete when both minimum time elapsed AND benchmark done
  useEffect(() => {
    if (minTimeElapsed && benchmark.done) {
      const fadeTimer = setTimeout(() => {
        setVisible(false);
        onComplete(benchmark.quality);
      }, 300); // Small delay after both conditions met

      return () => clearTimeout(fadeTimer);
    }
  }, [minTimeElapsed, benchmark.done, benchmark.quality, onComplete]);

  if (!visible) return null;

  return (
    <motion.div
      className="fixed inset-0 z-50 bg-black-pure flex items-center justify-center"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-center space-y-4 font-mono">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0 }}
          className="text-orange-primary text-sm"
        >
          {statusText}
        </motion.div>

        <motion.div
          initial={{ width: 0 }}
          animate={{ width: benchmark.done && minTimeElapsed ? '300px' : `${Math.min(250, 100 + (benchmark.done ? 100 : 0) + (minTimeElapsed ? 50 : 0))}px` }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="h-1 bg-orange-primary mx-auto"
        />

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-white-dim text-xs"
        >
          {benchmark.done ? 'READY' : 'LOADING PORTFOLIO...'}
        </motion.div>
      </div>

      {/* Scan line effect */}
      <motion.div
        className="absolute top-0 left-0 w-full h-0.5 bg-orange-primary opacity-50"
        animate={{
          top: ['0%', '100%'],
        }}
        transition={{
          duration: 2,
          ease: 'linear',
          repeat: Infinity,
        }}
      />
    </motion.div>
  );
};
