/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./src/**/*.{js,jsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "rgb(var(--c-ink) / <alpha-value>)",
        subtle: "rgb(var(--c-subtle) / <alpha-value>)",
        faint: "rgb(var(--c-faint) / <alpha-value>)",
        line: "rgb(var(--c-line) / <alpha-value>)",
        paper: "rgb(var(--c-paper) / <alpha-value>)",
        canvas: "rgb(var(--c-canvas) / <alpha-value>)",
        accent: "rgb(var(--c-accent) / <alpha-value>)",
        up: "rgb(var(--c-up) / <alpha-value>)",
      },
      fontFamily: {
        sans: ['ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
      },
      maxWidth: {
        feed: "42rem",
        shell: "72rem",
      },
      borderRadius: {
        xl2: "1rem",
      },
    },
  },
  plugins: [],
};
