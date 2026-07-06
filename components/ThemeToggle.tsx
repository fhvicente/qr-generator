"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const t = useTranslations("header");
  const [theme, setTheme] = useState<"light" | "dark">("light");

  // sincroniza com o atributo já definido pelo script inline do layout
  useEffect(() => {
    const current = (document.documentElement.getAttribute("data-theme") as "light" | "dark") || "light";
    setTheme(current);
  }, []);

  function toggle() {
    const next = theme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("qrkit-theme", next);
    setTheme(next);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={t("toggleTheme")}
      className="grid h-[42px] w-[42px] place-items-center rounded-[11px] border border-line bg-surface text-ink transition hover:-translate-y-0.5 hover:border-ink-faint active:translate-y-0"
    >
      {theme === "dark" ? (
        <svg className="h-[19px] w-[19px]" viewBox="0 0 24 24" fill="currentColor">
          <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
        </svg>
      ) : (
        <svg className="h-[19px] w-[19px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <circle cx="12" cy="12" r="4.5" />
          <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
        </svg>
      )}
    </button>
  );
}
