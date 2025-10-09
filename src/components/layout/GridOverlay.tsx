import { useScroll, useTransform, motion } from 'framer-motion';

export const GridOverlay = () => {
  const { scrollY } = useScroll();
  
  // Parallax effect - grid moves slower than content
  const y = useTransform(scrollY, [0, 1000], [0, -100]);

  return (
    <motion.div 
      style={{ y }}
      className="fixed inset-0 pointer-events-none z-0 opacity-10"
    >
      <div className="grid grid-cols-12 h-full">
        {Array.from({ length: 12 }).map((_, i) => (
          <motion.div 
            key={i} 
            className="border-r border-orange-primary"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.1 }}
            transition={{ delay: i * 0.05, duration: 0.5 }}
          />
        ))}
      </div>
      <div className="absolute inset-0 grid grid-rows-12">
        {Array.from({ length: 12 }).map((_, i) => (
          <motion.div 
            key={i} 
            className="border-b border-orange-primary"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.1 }}
            transition={{ delay: i * 0.05 + 0.3, duration: 0.5 }}
          />
        ))}
      </div>
    </motion.div>
  );
};
