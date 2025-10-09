import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

interface SkillBarProps {
  name: string;
  level: number;
  delay?: number;
}

export const SkillBar = ({ name, level, delay = 0 }: SkillBarProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -50 }}
      animate={isInView ? { opacity: 1, x: 0 } : {}}
      transition={{ delay, duration: 0.5 }}
      className="space-y-2"
    >
      <div className="flex justify-between items-center">
        <span className="text-sm font-mono text-white-dim">{name}</span>
        <span className="text-xs font-mono text-orange-primary">{level}%</span>
      </div>
      
      {/* Progress bar track */}
      <div className="h-1 bg-gray-dark rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-orange-primary to-orange-glow"
          initial={{ width: 0 }}
          animate={isInView ? { width: `${level}%` } : {}}
          transition={{ delay: delay + 0.2, duration: 0.8, ease: 'easeOut' }}
        />
      </div>
    </motion.div>
  );
};

