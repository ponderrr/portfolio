import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { CornerBrackets } from '../ui/CornerBrackets';

interface CardProps {
  children: ReactNode;
  className?: string;
  withBrackets?: boolean;
  hoverable?: boolean;
}

export const Card = ({ 
  children, 
  className = '', 
  withBrackets = false,
  hoverable = true 
}: CardProps) => {
  return (
    <motion.div
      className={`relative bg-black-elevated border border-gray-dark p-6 ${className}`}
      whileHover={hoverable ? { 
        borderColor: '#ff4500',
        boxShadow: '0 0 30px rgba(255, 69, 0, 0.3)',
        y: -4
      } : {}}
      transition={{ duration: 0.3 }}
    >
      {withBrackets && <CornerBrackets />}
      {children}
    </motion.div>
  );
};

