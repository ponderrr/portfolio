interface CornerBracketsProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const CornerBrackets = ({ className = '', size = 'md' }: CornerBracketsProps) => {
  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-6 h-6',
  };

  const bracketSize = sizeClasses[size];

  return (
    <div className={`absolute inset-0 ${className}`}>
      {/* Top Left */}
      <div className={`absolute top-0 left-0 ${bracketSize} border-l-2 border-t-2 border-orange-primary`} />
      {/* Top Right */}
      <div className={`absolute top-0 right-0 ${bracketSize} border-r-2 border-t-2 border-orange-primary`} />
      {/* Bottom Left */}
      <div className={`absolute bottom-0 left-0 ${bracketSize} border-l-2 border-b-2 border-orange-primary`} />
      {/* Bottom Right */}
      <div className={`absolute bottom-0 right-0 ${bracketSize} border-r-2 border-b-2 border-orange-primary`} />
    </div>
  );
};

