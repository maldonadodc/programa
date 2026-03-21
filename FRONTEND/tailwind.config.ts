import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ash: '#191614',
        soot: '#0b0908',
        cinder: '#2a211d',
        rust: '#5a201c',
        ember: '#7b2f26',
        brass: '#8a6a43',
        bone: '#cdbda2',
        parchment: '#9d8b71',
      },
      boxShadow: {
        casket: '0 18px 40px rgba(0, 0, 0, 0.4)',
        insetWear: 'inset 0 0 0 1px rgba(205, 189, 162, 0.08), inset 0 18px 30px rgba(255,255,255,0.02)',
      },
      backgroundImage: {
        hatch: 'linear-gradient(rgba(205,189,162,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(205,189,162,0.05) 1px, transparent 1px)',
        dust: 'radial-gradient(circle at 20% 30%, rgba(255,255,255,0.07), transparent 18%), radial-gradient(circle at 80% 70%, rgba(205,189,162,0.06), transparent 20%)',
      },
      animation: {
        swaySlow: 'swaySlow 8s ease-in-out infinite',
        emberPulse: 'emberPulse 4.5s ease-in-out infinite',
        dustShift: 'dustShift 16s linear infinite',
      },
      keyframes: {
        swaySlow: {
          '0%, 100%': { transform: 'translate3d(0, 0, 0)' },
          '50%': { transform: 'translate3d(0, -4px, 0)' },
        },
        emberPulse: {
          '0%, 100%': { opacity: '0.22', transform: 'scale(1)' },
          '50%': { opacity: '0.42', transform: 'scale(1.04)' },
        },
        dustShift: {
          '0%': { transform: 'translate3d(0, 0, 0)' },
          '50%': { transform: 'translate3d(-1%, 1%, 0)' },
          '100%': { transform: 'translate3d(1%, -1%, 0)' },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
