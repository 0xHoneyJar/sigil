/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        sigil: {
          bg: 'var(--sigil-bg, #0f0f0f)',
          surface: 'var(--sigil-surface, #1a1a1a)',
          border: 'var(--sigil-border, #2a2a2a)',
          text: 'var(--sigil-text, #fafafa)',
          muted: 'var(--sigil-muted, #888888)',
          accent: 'var(--sigil-accent, #3b82f6)',
          success: 'var(--sigil-success, #22c55e)',
          warning: 'var(--sigil-warning, #f59e0b)',
          danger: 'var(--sigil-danger, #ef4444)',
        },
      },
      borderRadius: {
        sigil: 'var(--sigil-border-radius, 8px)',
      },
      transitionDuration: {
        sigil: 'var(--sigil-transition-duration, 200ms)',
      },
      spacing: {
        sigil: 'var(--sigil-spacing-unit, 8px)',
        'sigil-gap': 'var(--sigil-gap, 16px)',
      },
    },
  },
  plugins: [],
};
