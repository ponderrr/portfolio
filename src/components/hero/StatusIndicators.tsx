import { motion } from 'framer-motion';

const indicators = [
  { label: 'SYSTEM STATUS', value: 'ONLINE', delay: 0.3 },
  { label: 'CONNECTION', value: 'SECURE', delay: 0.5 },
  { label: 'CREATIVITY', value: 'ACTIVE', delay: 0.7 },
];

export const StatusIndicators = () => {
  return (
    <div className="absolute top-8 right-8 space-y-2 font-mono text-xs hidden md:block">
      {indicators.map((indicator, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: indicator.delay, duration: 0.3 }}
          className="flex items-center gap-3"
        >
          <div className="w-2 h-2 rounded-full bg-orange-primary animate-glow-pulse" />
          <span className="text-gray-light">{indicator.label}:</span>
          <span className="text-orange-primary">{indicator.value}</span>
        </motion.div>
      ))}
    </div>
  );
};
