import { motion } from 'framer-motion';
import { ReactNode, useRef, useState } from 'react';

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  href?: string;
}

export const Button = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  size = 'md',
  className = '',
  href 
}: ButtonProps) => {
  const buttonRef = useRef<HTMLButtonElement | HTMLAnchorElement>(null);
  const [magnetPosition, setMagnetPosition] = useState({ x: 0, y: 0 });

  const baseClasses = 'font-mono uppercase tracking-wider cursor-pointer transition-all duration-300 inline-block';
  
  const variantClasses = {
    primary: 'bg-orange-primary text-white hover:bg-orange-glow glow-orange hover:glow-orange-strong',
    secondary: 'border-2 border-orange-primary text-orange-primary hover:bg-orange-primary hover:text-white',
    ghost: 'text-white-dim hover:text-orange-primary',
  };

  const sizeClasses = {
    sm: 'px-4 py-2 text-xs',
    md: 'px-6 py-3 text-sm',
    lg: 'px-8 py-4 text-base',
  };

  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!buttonRef.current) return;
    
    const rect = buttonRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) * 0.3;
    const y = (e.clientY - rect.top - rect.height / 2) * 0.3;
    
    setMagnetPosition({ x, y });
  };

  const handleMouseLeave = () => {
    setMagnetPosition({ x: 0, y: 0 });
  };

  if (href) {
    return (
      <motion.a
        ref={buttonRef as any}
        href={href}
        className={classes}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        animate={{ x: magnetPosition.x, y: magnetPosition.y }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        target={href.startsWith('http') ? '_blank' : undefined}
        rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
      >
        {children}
      </motion.a>
    );
  }

  return (
    <motion.button
      ref={buttonRef as any}
      onClick={onClick}
      className={classes}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ x: magnetPosition.x, y: magnetPosition.y }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {children}
    </motion.button>
  );
};
