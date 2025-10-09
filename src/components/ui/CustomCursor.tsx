import { useEffect, useState, useRef } from 'react';
import { motion, useSpring } from 'framer-motion';

type CursorState = 'default' | 'link' | 'button' | 'card' | 'drag';

export const CustomCursor = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [cursorState, setCursorState] = useState<CursorState>('default');
  const [isVisible, setIsVisible] = useState(true);
  const [trail, setTrail] = useState<Array<{ x: number; y: number; id: number }>>([]);
  const trailIdRef = useRef(0);

  // Smooth spring animation for cursor
  const cursorX = useSpring(mousePosition.x, { damping: 25, stiffness: 400 });
  const cursorY = useSpring(mousePosition.y, { damping: 25, stiffness: 400 });

  useEffect(() => {
    const updateMousePosition = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
      
      // Add trail point
      setTrail(prev => {
        const newPoint = { x: e.clientX, y: e.clientY, id: trailIdRef.current++ };
        const updated = [...prev, newPoint].slice(-8); // Keep last 8 points
        return updated;
      });
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      if (target.tagName === 'A') {
        setCursorState('link');
      } else if (target.tagName === 'BUTTON' || target.classList.contains('cursor-pointer')) {
        setCursorState('button');
      } else if (target.closest('.project-card')) {
        setCursorState('card');
      } else {
        setCursorState('default');
      }
    };

    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    window.addEventListener('mousemove', updateMousePosition);
    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      window.removeEventListener('mousemove', updateMousePosition);
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, []);

  // Remove trail points after delay
  useEffect(() => {
    const timer = setInterval(() => {
      setTrail(prev => prev.slice(1));
    }, 50);
    return () => clearInterval(timer);
  }, []);

  const getCursorSize = () => {
    switch (cursorState) {
      case 'link': return 32;
      case 'button': return 28;
      case 'card': return 24;
      default: return 20;
    }
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Trail */}
      {trail.map((point, index) => (
        <motion.div
          key={point.id}
          className="fixed w-2 h-2 rounded-full bg-orange-primary pointer-events-none z-[9998] mix-blend-screen"
          style={{
            left: point.x - 4,
            top: point.y - 4,
            opacity: (index / trail.length) * 0.3,
          }}
          initial={{ scale: 1 }}
          animate={{ scale: 0 }}
          transition={{ duration: 0.3 }}
        />
      ))}

      {/* Main cursor */}
      <motion.div
        className="fixed pointer-events-none z-[9999] mix-blend-difference"
        style={{
          left: cursorX,
          top: cursorY,
          x: '-50%',
          y: '-50%',
        }}
      >
        <motion.div
          animate={{
            width: getCursorSize(),
            height: getCursorSize(),
          }}
          transition={{ type: 'spring', stiffness: 500, damping: 28 }}
          className="relative"
        >
          {/* Core */}
          <div className="absolute inset-0 rounded-full bg-orange-primary" />
          
          {/* Link state - crosshair */}
          {cursorState === 'link' && (
            <>
              <motion.div
                className="absolute top-1/2 left-0 w-full h-px bg-orange-primary"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.2 }}
              />
              <motion.div
                className="absolute left-1/2 top-0 h-full w-px bg-orange-primary"
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ duration: 0.2 }}
              />
            </>
          )}
          
          {/* Button state - glow ring */}
          {cursorState === 'button' && (
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-orange-primary"
              initial={{ scale: 1, opacity: 1 }}
              animate={{ scale: 2, opacity: 0 }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          )}
          
          {/* Card state - targeting reticle */}
          {cursorState === 'card' && (
            <>
              <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-orange-primary" />
              <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-orange-primary" />
              <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-orange-primary" />
              <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-orange-primary" />
            </>
          )}
        </motion.div>
      </motion.div>
    </>
  );
};
