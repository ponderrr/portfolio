import { ReactNode } from 'react';

interface ContainerProps {
  children: ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'full';
}

export const Container = ({ 
  children, 
  className = '', 
  size = 'lg' 
}: ContainerProps) => {
  const sizeClasses = {
    sm: 'max-w-4xl',
    md: 'max-w-6xl',
    lg: 'max-w-7xl',
    full: 'max-w-full',
  };

  return (
    <div className={`mx-auto px-6 ${sizeClasses[size]} ${className}`}>
      {children}
    </div>
  );
};

