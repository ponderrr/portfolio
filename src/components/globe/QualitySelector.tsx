import { motion } from 'framer-motion';
import { QualityTier } from '@/hooks/useDeviceCapability';

interface QualitySelectorProps {
  currentTier: QualityTier;
  onChange: (tier: QualityTier) => void;
}

export const QualitySelector = ({ currentTier, onChange }: QualitySelectorProps) => {
  const tiers: QualityTier[] = ['ultra', 'high', 'standard', 'performance'];

  return (
    <div className="absolute bottom-8 left-8 font-mono text-xs z-10">
      <div className="bg-black-elevated/80 border border-orange-primary/30 p-3 backdrop-blur-sm">
        <div className="text-orange-primary mb-2">// QUALITY</div>
        <div className="flex gap-2">
          {tiers.map((tier) => (
            <motion.button
              key={tier}
              onClick={() => onChange(tier)}
              className={`px-2 py-1 border ${
                currentTier === tier
                  ? 'border-orange-primary bg-orange-primary/20 text-orange-primary'
                  : 'border-gray-dark text-white-dim hover:border-orange-primary/50'
              } uppercase text-[10px]`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {tier}
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
};

