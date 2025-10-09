import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

export const BootSequence = ({ onComplete }: { onComplete: () => void }) => {
  const [visible, setVisible] = useState(true);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onComplete();
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [onComplete]);

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
          [SYSTEM INITIALIZING...]
        </motion.div>
        
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: '300px' }}
          transition={{ delay: 0.3, duration: 1 }}
          className="h-1 bg-orange-primary mx-auto"
        />
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="text-white-dim text-xs"
        >
          LOADING PORTFOLIO...
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
        }}
      />
    </motion.div>
  );
};
