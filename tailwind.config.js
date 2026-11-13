/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      // Palette « vieille bibliothèque » (valeurs dans src/index.css)
      colors: {
        bois: {
          950: 'var(--bois-950)',
          900: 'var(--bois-900)',
          800: 'var(--bois-800)',
          700: 'var(--bois-700)',
          600: 'var(--bois-600)',
          500: 'var(--bois-500)',
          400: 'var(--bois-400)',
        },
        parchemin: { DEFAULT: 'var(--parchemin)', fonce: 'var(--parchemin-fonce)' },
        encre: { DEFAULT: 'var(--encre)', douce: 'var(--encre-douce)' },
        laiton: { DEFAULT: 'var(--laiton)', clair: 'var(--laiton-clair)', fonce: 'var(--laiton-fonce)' },
        cuir: 'var(--cuir)',
        cire: 'var(--cire)',
      },
      fontFamily: {
        titre: ['"Playfair Display"', 'Georgia', '"Times New Roman"', 'serif'],
        texte: ['"EB Garamond"', 'Georgia', '"Times New Roman"', 'serif'],
        fiche: ['"Courier New"', 'Courier', 'monospace'],
      },
    },
  },
  plugins: [],
};
