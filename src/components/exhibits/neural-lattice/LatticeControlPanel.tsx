import { motion } from 'framer-motion';
import { useLatticeControls, activationLabels, type ActivationFunctionType } from './LatticeControls';
import { inputPatternPresets, generateRandomPattern } from './InputPatternPresets';

type Props = {
    isOpen: boolean;
    onToggle: () => void;
};

export function LatticeControlPanel({ isOpen, onToggle }: Props) {
    const {
        activationFunction,
        setActivationFunction,
        setInputPattern,
        weightScale,
        setWeightScale,
    } = useLatticeControls();

    const handlePatternSelect = (patternName: string) => {
        if (patternName === 'random') {
            setInputPattern(generateRandomPattern());
        } else {
            const preset = inputPatternPresets.find((p) => p.name === patternName);
            if (preset) {
                setInputPattern(preset.pattern);
            }
        }
    };

    const handleClearPattern = () => {
        setInputPattern(null);
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="ap-glass absolute top-6 left-6 z-20 rounded-2xl overflow-hidden"
            style={{ maxWidth: isOpen ? 280 : 48 }}
        >
            {/* Toggle button */}
            <button
                type="button"
                onClick={onToggle}
                className="w-12 h-12 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
                aria-label={isOpen ? 'Close controls' : 'Open controls'}
            >
                <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <circle cx="12" cy="12" r="3" />
                    <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                </svg>
            </button>

            {isOpen && (
                <div className="px-4 pb-4 space-y-4">
                    {/* Activation Function */}
                    <div>
                        <div className="text-[10px] tracking-[0.2em] uppercase text-zinc-500 mb-2">
                            Activation
                        </div>
                        <div className="flex flex-wrap gap-1">
                            {(Object.keys(activationLabels) as ActivationFunctionType[]).map((fn) => (
                                <button
                                    key={fn}
                                    type="button"
                                    onClick={() => setActivationFunction(fn)}
                                    className={`px-2 py-1 text-xs rounded transition-colors ${activationFunction === fn
                                            ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-500/50'
                                            : 'bg-zinc-800/50 text-zinc-400 border border-zinc-700/50 hover:text-white'
                                        }`}
                                >
                                    {activationLabels[fn]}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Weight Scale */}
                    <div>
                        <div className="text-[10px] tracking-[0.2em] uppercase text-zinc-500 mb-2">
                            Weight Scale: {weightScale.toFixed(1)}x
                        </div>
                        <input
                            type="range"
                            min="0.1"
                            max="3"
                            step="0.1"
                            value={weightScale}
                            onChange={(e) => setWeightScale(parseFloat(e.target.value))}
                            className="w-full h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                        />
                    </div>

                    {/* Input Patterns */}
                    <div>
                        <div className="text-[10px] tracking-[0.2em] uppercase text-zinc-500 mb-2">
                            Input Patterns
                        </div>
                        <div className="flex flex-wrap gap-1">
                            {inputPatternPresets.map((preset) => (
                                <button
                                    key={preset.name}
                                    type="button"
                                    onClick={() => handlePatternSelect(preset.name)}
                                    className="w-8 h-8 text-sm rounded bg-zinc-800/50 text-zinc-400 border border-zinc-700/50 hover:text-white hover:border-cyan-500/50 transition-colors"
                                >
                                    {preset.label}
                                </button>
                            ))}
                            <button
                                type="button"
                                onClick={handleClearPattern}
                                className="px-2 h-8 text-xs rounded bg-zinc-800/50 text-zinc-400 border border-zinc-700/50 hover:text-white hover:border-orange-500/50 transition-colors"
                            >
                                Clear
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </motion.div>
    );
}

export default LatticeControlPanel;
