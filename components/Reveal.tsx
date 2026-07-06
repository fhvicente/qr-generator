"use client";

import { useEffect } from "react";

/*
  Revela secções .reveal ao entrar no viewport (adiciona classe .in).
  Sem este observer as secções ficam em opacity:0 (invisíveis).
  Fallback: se IntersectionObserver não existir, mostra tudo já.
*/
export default function Reveal() {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>(".reveal"));
    if (!("IntersectionObserver" in window)) {
      els.forEach((el) => el.classList.add("in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { rootMargin: "200px 0px 200px 0px", threshold: 0 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return null;
}
