/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
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
          DEFAULT: '#ffffff',
          dim: '#e5e5e5',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        heading: ['Space Grotesk', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        'hero': '96px',
        '5xl': '64px',
        '4xl': '48px',
        '3xl': '32px',
        'xl': '20px',
        'base': '16px',
        'sm': '14px',
        'xs': '12px',
      },
      spacing: {
        'xs': '4px',
        'sm': '8px',
        'md': '16px',
        'lg': '24px',
        'xl': '32px',
        '2xl': '48px',
        '3xl': '64px',
        '4xl': '96px',
      },
      animation: {
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
        'scan-line': 'scanLine 2s linear infinite',
      },
      keyframes: {
        glowPulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        scanLine: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        }
      }
    },
  },
  plugins: [],
}

