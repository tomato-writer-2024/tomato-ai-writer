/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"],
      },
      colors: {
        brand: {
          primary: "#FF4757",
          light: "#FF6B81",
          dark: "#E84118",
        },
      },
      backgroundImage: {
        "brand-gradient":
          "linear-gradient(135deg, #FF4757 0%, #5F27CD 100%)",
        "brand-gradient-secondary":
          "linear-gradient(135deg, #FF6B81 0%, #2E86DE 100%)",
      },
    },
  },
  plugins: [],
};
