"use client";

import { useEffect } from "react";

export default function ApplyFooterShift() {
  useEffect(() => {
    const footer = document.querySelector(".site-footer");
    const root = document.documentElement;

    const update = () => {
      const overlap = footer ? Math.max(0, Math.round(window.innerHeight - footer.getBoundingClientRect().top)) : 0;
      root.style.setProperty("--apply-footer-shift", `${overlap}px`);
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      root.style.removeProperty("--apply-footer-shift");
    };
  }, []);

  return null;
}
