import { motion } from 'framer-motion';

const text = "I like web design.";

export const HeroText = () => {
  return (
    <div className="text-center relative">
      <motion.h1 
        className="text-5xl md:text-6xl lg:text-7xl xl:text-hero font-heading font-bold text-orange-primary mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.5 }}
      >
        {text.split('').map((char, index) => (
          <motion.span
            key={index}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ 
              delay: 0.8 + (index * 0.05),
              duration: 0.1 
            }}
            className="inline-block"
          >
            {char === ' ' ? '\u00A0' : char}
          </motion.span>
        ))}
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2.2, duration: 0.5 }}
        className="text-lg md:text-xl text-white-dim font-light"
      >
        Building digital experiences with creative precision
      </motion.p>

      {/* Corner brackets around text */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.5 }}
        className="absolute -inset-8 pointer-events-none hidden lg:block"
      >
        <div className="absolute top-0 left-0 w-8 h-8 border-l-2 border-t-2 border-orange-primary opacity-50" />
        <div className="absolute top-0 right-0 w-8 h-8 border-r-2 border-t-2 border-orange-primary opacity-50" />
        <div className="absolute bottom-0 left-0 w-8 h-8 border-l-2 border-b-2 border-orange-primary opacity-50" />
        <div className="absolute bottom-0 right-0 w-8 h-8 border-r-2 border-b-2 border-orange-primary opacity-50" />
      </motion.div>
    </div>
  );
};
