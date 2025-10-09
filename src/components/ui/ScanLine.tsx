import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

export const ScanLine = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <div ref={ref} className="absolute inset-0 pointer-events-none overflow-hidden">
      {isInView && (
        <motion.div
          className="absolute top-0 left-0 w-full h-px bg-orange-primary opacity-50"
          initial={{ y: 0 }}
          animate={{ y: '100vh' }}
          transition={{ duration: 2, ease: 'linear' }}
        />
      )}
    </div>
  );
};

