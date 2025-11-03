import { motion } from 'framer-motion';
import { SocialLinks } from '../contact/SocialLinks';

export const Footer = () => {
  return (
    <footer className="py-16 px-6 bg-black-pure border-t border-gray-dark">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="flex flex-col items-center gap-8"
        >
          {/* Social Links */}
          <SocialLinks />
          
          {/* Request Briefing CTA */}
          <motion.a
            href="mailto:andrew.ponderrr@icloud.com"
            className="px-6 py-3 border-2 border-orange-primary text-orange-primary hover:bg-orange-primary hover:text-white transition-colors text-sm font-mono uppercase tracking-wider"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            REQUEST BRIEFING →
          </motion.a>

          {/* Copyright */}
          <p className="text-xs font-mono text-gray-light text-center">
            © 2025 Andrew Ponder. Built with React + TypeScript + Tailwind.
          </p>
        </motion.div>
      </div>
    </footer>
  );
};

