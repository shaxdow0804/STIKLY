/** Design tokens come from the "Vinyl Editorial" system in the Stitch export. */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#FAF8F5',
        paper2: '#F5F2EB',
        line: '#E7E2D8',
        ink: '#18181B',
        violet: { DEFAULT: '#7C3AED', dark: '#630ED4', soft: '#EDE0FF' },
        coral: { DEFAULT: '#FF5757', dark: '#B6212A' },
        citrus: '#FBBF24',
        mint: '#10B981',
        cobalt: '#2563EB',
      },
      fontFamily: {
        display: ['Syne', 'system-ui', 'sans-serif'],
        body: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        label: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'hard-sm': '1px 1px 0 #18181B',
        hard: '3px 3px 0 #18181B',
        'hard-lg': '6px 6px 0 #18181B',
        violet: '2px 2px 0 #7C3AED',
      },
      keyframes: {
        float: { '0%,100%': { transform: 'translateY(0) rotate(var(--r,0deg))' }, '50%': { transform: 'translateY(-10px) rotate(var(--r,0deg))' } },
        shimmer: { '100%': { transform: 'translateX(100%)' } },
        pop: { '0%': { opacity: 0, transform: 'translateY(12px) scale(.98)' }, '100%': { opacity: 1, transform: 'none' } },
      },
      animation: { float: 'float 6s ease-in-out infinite', pop: 'pop .35s ease-out both' },
    },
  },
  plugins: [],
};
