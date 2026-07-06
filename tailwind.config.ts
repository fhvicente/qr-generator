import type { Config } from "tailwindcss";

const config: Config = {
  // dark mode controlado pelo atributo data-theme="dark" no <html>
  darkMode: ["class", '[data-theme="dark"]'],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      // cores mapeadas a CSS variables (definidas em globals.css) -> tema claro/escuro
      colors: {
        bg: "var(--bg)",
        surface: "var(--surface)",
        "surface-2": "var(--surface-2)",
        ink: "var(--ink)",
        "ink-soft": "var(--ink-soft)",
        "ink-faint": "var(--ink-faint)",
        line: "var(--line)",
        accent: "var(--accent)",
        "accent-ink": "var(--accent-ink)",
        ad: "var(--ad-bg)",
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
      },
      borderRadius: {
        xl2: "18px",
      },
      maxWidth: {
        site: "1180px",
      },
      boxShadow: {
        soft: "0 1px 2px rgba(22,21,15,.04), 0 12px 30px -12px rgba(22,21,15,.18)",
      },
      keyframes: {
        pop: {
          from: { opacity: "0", transform: "scale(.92)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        fade: {
          from: { opacity: "0", transform: "translateY(-4px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        pop: "pop .35s cubic-bezier(.2,.9,.3,1.2)",
        fade: "fade .35s ease",
      },
    },
  },
  plugins: [],
};

export default config;
