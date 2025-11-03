import { useState, useEffect, useRef } from 'react';

export const useGlobePerformance = () => {
  const [fps, setFps] = useState(60);
  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(Date.now());

  useEffect(() => {
    let animationId: number;

    const measureFPS = () => {
      frameCountRef.current++;
      const currentTime = Date.now();
      const deltaTime = currentTime - lastTimeRef.current;

      if (deltaTime >= 1000) {
        const currentFps = Math.round((frameCountRef.current * 1000) / deltaTime);
        setFps(currentFps);
        frameCountRef.current = 0;
        lastTimeRef.current = currentTime;
      }

      animationId = requestAnimationFrame(measureFPS);
    };

    animationId = requestAnimationFrame(measureFPS);

    return () => cancelAnimationFrame(animationId);
  }, []);

  return { fps };
};

