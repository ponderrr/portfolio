export const COLORS = {
  black: {
    pure: '#000000',
    base: '#0a0a0a',
    elevated: '#1a1a1a',
  },
  gray: {
    dark: '#2a2a2a',
    mid: '#4a4a4a',
    light: '#8a8a8a',
  },
  orange: {
    primary: '#ff4500',
    glow: '#ff6b35',
  },
  red: {
    alert: '#ff2e2e',
  },
  white: {
    default: '#ffffff',
    dim: '#e5e5e5',
  }
} as const;

export const FONTS = {
  heading: 'Space Grotesk, system-ui, sans-serif',
  body: 'Inter, system-ui, sans-serif',
  mono: 'JetBrains Mono, monospace',
} as const;

export const BREAKPOINTS = {
  mobile: 320,
  tablet: 768,
  laptop: 1024,
  desktop: 1440,
} as const;

export const ANIMATION_DURATION = {
  fast: 150,
  base: 300,
  slow: 500,
  verySlow: 1000,
} as const;

export const EASING = {
  default: 'cubic-bezier(0.4, 0, 0.2, 1)',
  inOut: 'cubic-bezier(0.4, 0, 0.6, 1)',
  out: 'cubic-bezier(0, 0, 0.2, 1)',
} as const;

export const SKILLS: {
  frontend: { name: string; level: number }[];
  backend: { name: string; level: number }[];
  tools: { name: string; level: number }[];
  ai: { name: string; level: number }[];
} = {
  frontend: [
    { name: 'React', level: 85 },
    { name: 'TypeScript', level: 75 },
    { name: 'Tailwind CSS', level: 90 },
    { name: 'Framer Motion', level: 80 },
    { name: 'HTML/CSS', level: 95 },
  ],
  backend: [
    { name: 'Python', level: 80 },
    { name: 'Node.js', level: 70 },
    { name: 'Supabase', level: 75 },
    { name: 'PostgreSQL', level: 65 },
  ],
  tools: [
    { name: 'Git/GitHub', level: 85 },
    { name: 'VS Code', level: 90 },
    { name: 'Figma', level: 70 },
    { name: 'Vite', level: 80 },
  ],
  ai: [
    { name: 'OpenAI APIs', level: 85 },
    { name: 'Machine Learning', level: 65 },
    { name: 'Data Analysis', level: 75 },
    { name: 'Automation', level: 80 },
  ],
};

