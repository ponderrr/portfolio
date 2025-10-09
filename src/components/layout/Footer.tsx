import { motion } from 'framer-motion';

export const Footer = () => {
  return (
    <footer className="py-12 px-6 bg-black-pure border-t border-gray-dark">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row justify-between items-center gap-4"
        >
          <p className="text-xs font-mono text-gray-light">
            © 2025 Andrew Ponder. Built with React + TypeScript + Tailwind.
          </p>
          
          <div className="flex items-center gap-2 text-xs font-mono text-gray-light">
            <span>Designed & developed with</span>
            <motion.span
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="text-orange-primary"
            >
              ❤
            </motion.span>
            <span>by Andrew</span>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

