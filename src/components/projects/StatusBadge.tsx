import { motion } from 'framer-motion';

interface StatusBadgeProps {
  status: 'ACTIVE' | 'DEPLOYED' | 'OPERATIONAL';
}

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  const statusColors = {
    ACTIVE: 'bg-orange-primary',
    DEPLOYED: 'bg-green-500',
    OPERATIONAL: 'bg-blue-500',
  };

  return (
    <motion.div 
      className="flex items-center gap-2"
      whileHover={{ scale: 1.05 }}
    >
      <div className={`w-2 h-2 rounded-full ${statusColors[status]} animate-glow-pulse`} />
      <span className="text-xs font-mono text-white-dim">{status}</span>
    </motion.div>
  );
};
