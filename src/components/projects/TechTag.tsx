import { motion } from 'framer-motion';

interface TechTagProps {
  tech: string;
  delay?: number;
}

export const TechTag = ({ tech, delay = 0 }: TechTagProps) => {
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.3 }}
      whileHover={{ scale: 1.05 }}
      className="px-3 py-1 text-xs font-mono bg-black-elevated border border-gray-dark text-orange-primary rounded-sm cursor-default"
    >
      {tech}
    </motion.span>
  );
};
