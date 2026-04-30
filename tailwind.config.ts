import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        /**
         * LEGACY NAMED COLORS
         * These are still here so any classes like `bg-background`, `text-text`,
         * `text-accent` etc. don't explode – mapped to the new
         * Digital Promo Codes slate + cyan palette.
         */
        background: '#020617',      // slate-950 – matches dark background
        container: '#020617',       // same as background for simplicity
        text: '#e5e7eb',            // slate-200 – good contrast on dark
        accent: '#0891B2',          // cyan-600 / teal-600 – primary brand accent
        'menu-item': '#9ca3af',     // gray-400 – neutral nav text
        'promo-bg': '#020617',      // dark surface
        'promo-border': '#1f2937',  // slate-800 border

        /**
         * THEME-* TOKENS (preferred)
         * These are the ones wired to CSS variables you set in globals.css.
         * Anything that uses `bg-theme-*`, `text-theme-*`, etc. will stay in sync
         * with the light/dark fintech palette from globals.css.
         */
        theme: {
          primary: 'var(--background-color)',
          secondary: 'var(--background-secondary)',
          tertiary: 'var(--background-tertiary)',
          text: {
            primary: 'var(--text-color)',
            secondary: 'var(--text-secondary)',
            muted: 'var(--text-muted)',
          },
          accent: {
            DEFAULT: 'var(--accent-color)',
            hover: 'var(--accent-hover)',
          },
          success: {
            DEFAULT: 'var(--success-color)',
            hover: 'var(--success-hover)',
          },
          border: {
            DEFAULT: 'var(--border-color)',
            hover: 'var(--border-hover)',
          },
          card: {
            bg: 'var(--card-bg)',
            border: 'var(--card-border)',
          },
          input: {
            bg: 'var(--input-bg)',
            border: 'var(--input-border)',
            focus: 'var(--input-focus)',
          },
        },
      },

      /**
       * Shadows – tuned for a clean fintech feel
       * Nothing neon, no heavy glows. Soft, directional shadows only.
       */
      boxShadow: {
        // Slight header separator – works on light & dark
        header: '0 1px 0 rgba(15, 23, 42, 0.12)', // slate-900 at low opacity

        // Deeper card / promo shadow – subtle elevation, not 2005 drop shadow
        promo: '0 14px 35px rgba(15, 23, 42, 0.22)',

        // Theme-driven variants (hooked to CSS vars in globals.css)
        'theme-header': 'var(--header-shadow)',
        'theme-promo': 'var(--promo-shadow)',
      },

      /**
       * Radii – keep your existing scale, these are used in components.
       * We'll reshape cards/buttons via class usage later, not by nuking the scale.
       */
      borderRadius: {
        large: '12px',
        button: '6px',
      },

      transitionProperty: {
        theme: 'background-color, color, border-color',
      },
    },
  },
  plugins: [],
};

export default config;
