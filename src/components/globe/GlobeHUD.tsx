import { motion } from 'framer-motion';

interface GlobeHUDProps {
  currentLat: number;
  currentLng: number;
  isVisible: boolean;
}

export const GlobeHUD = ({ currentLat, currentLng, isVisible }: GlobeHUDProps) => {
  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute top-8 right-8 font-mono text-xs text-white-dim z-10"
    >
      <div className="bg-black-elevated/80 border border-orange-primary/30 p-4 backdrop-blur-sm">
        <div className="text-orange-primary mb-2">// COORDINATES</div>
        <div>LAT: {currentLat.toFixed(4)}°</div>
        <div>LNG: {currentLng.toFixed(4)}°</div>
      </div>
    </motion.div>
  );
};

