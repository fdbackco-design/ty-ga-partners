"use client";

import { useState } from "react";
import { FAQ } from "@/lib/data";
import Reveal from "../Reveal";

export default function Faq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="py-[160px] bg-white">
      <div className="wrap max-w-[860px]">
        <Reveal>
          <h2 className="section-title text-center">
            자주묻는질문
            <br />
            FAQ
          </h2>
        </Reveal>
        <div className="mt-12">
          {FAQ.map((item, idx) => {
            const isOpen = open === idx;
            return (
              <article key={item.q} className={`faq-item ${isOpen ? "is-open" : ""}`}>
                <button type="button" onClick={() => setOpen(isOpen ? null : idx)}>
                  <span>
                    <span className="faq-q">Q.</span>
                    {item.q}
                  </span>
                  <span className="text-[22px] text-[var(--sub)]">{isOpen ? "−" : "+"}</span>
                </button>
                <div className="faq-body px-1 leading-7 text-[var(--sub)]">
                  {item.a.map((line) => (
                    <p key={line}>{line}</p>
                  ))}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
