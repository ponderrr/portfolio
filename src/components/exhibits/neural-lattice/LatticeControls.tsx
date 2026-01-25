import { createContext, useContext, useState, type ReactNode } from 'react';

export type ActivationFunctionType = 'relu' | 'sigmoid' | 'tanh' | 'leakyRelu';

// Activation function implementations
export const activationFunctions = {
    relu: (x: number) => (x > 0 ? x : 0),
    sigmoid: (x: number) => 1 / (1 + Math.exp(-x)),
    tanh: (x: number) => Math.tanh(x),
    leakyRelu: (x: number) => (x > 0 ? x : 0.01 * x),
};

export const activationLabels: Record<ActivationFunctionType, string> = {
    relu: 'ReLU',
    sigmoid: 'Sigmoid',
    tanh: 'Tanh',
    leakyRelu: 'Leaky ReLU',
};

type LatticeControlsContextType = {
    activationFunction: ActivationFunctionType;
    setActivationFunction: (fn: ActivationFunctionType) => void;
    inputPattern: number[] | null;
    setInputPattern: (pattern: number[] | null) => void;
    weightScale: number;
    setWeightScale: (scale: number) => void;
};

const defaultContext: LatticeControlsContextType = {
    activationFunction: 'relu',
    setActivationFunction: () => { },
    inputPattern: null,
    setInputPattern: () => { },
    weightScale: 1.0,
    setWeightScale: () => { },
};

export const LatticeControlsContext = createContext<LatticeControlsContextType>(defaultContext);

export const useLatticeControls = () => useContext(LatticeControlsContext);

export function LatticeControlsProvider({ children }: { children: ReactNode }) {
    const [activationFunction, setActivationFunction] = useState<ActivationFunctionType>('relu');
    const [inputPattern, setInputPattern] = useState<number[] | null>(null);
    const [weightScale, setWeightScale] = useState(1.0);

    return (
        <LatticeControlsContext.Provider
            value={{
                activationFunction,
                setActivationFunction,
                inputPattern,
                setInputPattern,
                weightScale,
                setWeightScale,
            }}
        >
            {children}
        </LatticeControlsContext.Provider>
    );
}
