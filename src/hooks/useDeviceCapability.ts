import { useState, useEffect } from 'react';

export type QualityTier = 'ultra' | 'high' | 'standard' | 'performance';

export interface DeviceCapability {
  tier: QualityTier;
  isDesktop: boolean;
  isTablet: boolean;
  isMobile: boolean;
  screenWidth: number;
  screenHeight: number;
  pixelRatio: number;
  hasWebGL2: boolean;
}

const detectWebGL2 = (): boolean => {
  try {
    const canvas = document.createElement('canvas');
    return !!(
      canvas.getContext('webgl2') ||
      canvas.getContext('experimental-webgl2')
    );
  } catch (e) {
    return false;
  }
};

const detectDeviceTier = (): QualityTier => {
  const width = window.innerWidth;
  const pixelRatio = window.devicePixelRatio || 1;
  const hasWebGL2 = detectWebGL2();
  
  // Desktop with high DPI and WebGL2
  if (width >= 1280 && pixelRatio >= 1.5 && hasWebGL2) {
    return 'ultra';
  }
  
  // Desktop or high-end tablet
  if (width >= 1024 && hasWebGL2) {
    return 'high';
  }
  
  // Tablet or low-end desktop
  if (width >= 768) {
    return 'standard';
  }
  
  // Mobile
  return 'performance';
};

export const useDeviceCapability = (): DeviceCapability => {
  const [capability, setCapability] = useState<DeviceCapability>(() => ({
    tier: detectDeviceTier(),
    isDesktop: window.innerWidth >= 1024,
    isTablet: window.innerWidth >= 768 && window.innerWidth < 1024,
    isMobile: window.innerWidth < 768,
    screenWidth: window.innerWidth,
    screenHeight: window.innerHeight,
    pixelRatio: window.devicePixelRatio || 1,
    hasWebGL2: detectWebGL2(),
  }));
  
  useEffect(() => {
    const handleResize = () => {
      setCapability({
        tier: detectDeviceTier(),
        isDesktop: window.innerWidth >= 1024,
        isTablet: window.innerWidth >= 768 && window.innerWidth < 1024,
        isMobile: window.innerWidth < 768,
        screenWidth: window.innerWidth,
        screenHeight: window.innerHeight,
        pixelRatio: window.devicePixelRatio || 1,
        hasWebGL2: detectWebGL2(),
      });
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return capability;
};

