import type { Config } from 'tailwindcss';

/**
 * COSMOS design tokens.
 * cinematic editorial dark mode + subtle astronomy + glassmorphism.
 * Noir = User 1 · Blossom = User 2 · Together = the two worlds merging.
 */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Base surfaces — almost black, never fully black.
        void: '#0F0F11',
        surface: {
          DEFAULT: '#18181B',
          elevated: '#27272A',
        },
        line: '#3F3F46',
        ink: {
          DEFAULT: '#F4F4F5',
          soft: '#A1A1AA',
          faint: '#71717A',
        },
        // Noir — sober, elegant, cinematic (User 1).
        noir: {
          DEFAULT: '#E4E4E7',
          soft: '#A1A1AA',
          deep: '#52525B',
        },
        // Blossom — soft, warm, luminous (User 2). Never an aggressive pink.
        blossom: {
          DEFAULT: '#F472B6',
          soft: '#F9A8D4',
          faint: '#FBCFE8',
        },
        // Nedi's signature glow.
        aura: '#67E8F9',
      },
      fontFamily: {
        display: ['"Fraunces"', 'Georgia', 'serif'],
        sans: [
          '"Inter"',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'sans-serif',
        ],
      },
      borderRadius: {
        xs: '0.375rem',
        sm: '0.625rem',
        DEFAULT: '0.875rem',
        lg: '1.125rem',
        xl: '1.5rem',
        '2xl': '2rem',
      },
      spacing: {
        'safe-t': 'env(safe-area-inset-top)',
        'safe-b': 'env(safe-area-inset-bottom)',
        'safe-l': 'env(safe-area-inset-left)',
        'safe-r': 'env(safe-area-inset-right)',
        nav: '5.25rem',
      },
      boxShadow: {
        glass: '0 1px 0 0 rgba(255,255,255,0.04) inset, 0 10px 40px -12px rgba(0,0,0,0.7)',
        lift: '0 20px 60px -20px rgba(0,0,0,0.8)',
        blossom: '0 0 40px -8px rgba(244,114,182,0.45)',
        aura: '0 0 32px -4px rgba(103,232,249,0.5)',
      },
      backdropBlur: {
        glass: '18px',
      },
      transitionTimingFunction: {
        cosmos: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      keyframes: {
        twinkle: {
          '0%, 100%': { opacity: '0.15', transform: 'scale(0.9)' },
          '50%': { opacity: '0.9', transform: 'scale(1.15)' },
        },
        floaty: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        'aura-pulse': {
          '0%, 100%': { opacity: '0.5', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.06)' },
        },
        'rise-in': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        twinkle: 'twinkle 4s ease-in-out infinite',
        floaty: 'floaty 6s ease-in-out infinite',
        'aura-pulse': 'aura-pulse 3.2s ease-in-out infinite',
        'rise-in': 'rise-in 0.5s cubic-bezier(0.22,1,0.36,1) both',
      },
    },
  },
  plugins: [],
} satisfies Config;
