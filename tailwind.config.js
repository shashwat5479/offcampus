/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#15171c",       // primary text / buttons
        subtle: "#6b7280",    // secondary text
        faint: "#9aa1ab",
        line: "#ececee",      // hairline borders
        paper: "#ffffff",     // surfaces
        canvas: "#fafafa",    // page background
        accent: "#3b5bfd",    // used sparingly (links / active)
        up: "#e8543a",
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
