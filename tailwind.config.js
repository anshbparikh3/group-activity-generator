module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        poppins: ['var(--font-poppins)', 'sans-serif'],
        'source-sans': ['var(--font-source-sans)', 'sans-serif'],
      },
      colors: {
        primary: '#3B82F6',
        secondary: '#8B5CF6',
        // Our new custom theme color
        beige: {
          DEFAULT: '#E5D9C5', // Premium light brown/beige
          dark: '#D0C1AA',    // Slightly darker for hover states
        }
      },
    },
  },
  plugins: [],
}