// Globe configuration constants
export const GLOBE_CONFIG = {
  // Camera settings
  initialLat: 39.8283, // Center of USA
  initialLng: -98.5795,
  initialAltitude: 2.5,
  
  // Control settings
  minDistance: 150,
  maxDistance: 500,
  rotateSpeed: 0.5,
  dampingFactor: 0.1,
  autoRotate: false,
  
  // Visual settings
  atmosphereColor: 'rgba(255, 69, 0, 0.5)', // Orange tint
  atmosphereAltitude: 0.15,
  graticulesColor: 'rgba(255, 69, 0, 0.1)',
  
  // Pin settings
  pinSize: 0.5,
  pinColor: '#ff4500',
  pinAltitude: 0.01,
  pulseSpeed: 500, // milliseconds
  
  // Animation settings
  flyToDuration: 1500, // milliseconds
  modalDelay: 1600, // milliseconds after fly-to
};

