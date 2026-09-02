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
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Roboto", "Helvetica", "Arial", "sans-serif"],
        display: ["var(--font-display)", "var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      maxWidth: { feed: "42rem", shell: "72rem" },
      borderRadius: { xl2: "1rem" },
      boxShadow: {
        glow: "0 0 0 1px rgb(var(--c-accent) / 0.35), 0 10px 34px -10px rgb(var(--c-accent) / 0.55)",
        soft: "0 1px 2px rgb(0 0 0 / 0.04), 0 8px 24px -12px rgb(0 0 0 / 0.35)",
      },
    },
  },
  plugins: [],
};