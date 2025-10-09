import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const LoadingScreen = () => {
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    // Simulate loading
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setIsComplete(true), 500);
          return 100;
        }
        return prev + 2;
      });
    }, 20);

    return () => clearInterval(interval);
  }, []);

  if (isComplete) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[10000] bg-black-pure flex flex-col items-center justify-center"
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        {/* Logo/Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <h1 className="text-6xl font-heading font-bold text-orange-primary">AP</h1>
        </motion.div>

        {/* Loading text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-sm font-mono text-white-dim mb-4"
        >
          {progress < 100 ? 'INITIALIZING SYSTEM...' : 'SYSTEM READY'}
        </motion.p>

        {/* Progress bar */}
        <div className="w-80 h-1 bg-gray-dark rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-orange-primary to-orange-glow"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.1 }}
          />
        </div>

        {/* Percentage */}
        <motion.p
          className="text-xs font-mono text-gray-light mt-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {progress}%
        </motion.p>

        {/* Corner brackets */}
        <div className="absolute top-8 left-8 w-8 h-8 border-l-2 border-t-2 border-orange-primary opacity-30" />
        <div className="absolute top-8 right-8 w-8 h-8 border-r-2 border-t-2 border-orange-primary opacity-30" />
        <div className="absolute bottom-8 left-8 w-8 h-8 border-l-2 border-b-2 border-orange-primary opacity-30" />
        <div className="absolute bottom-8 right-8 w-8 h-8 border-r-2 border-b-2 border-orange-primary opacity-30" />
      </motion.div>
    </AnimatePresence>
  );
};

