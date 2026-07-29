"use client";

import { useEffect, useId, useRef } from "react";

type GooeyTextProps = {
  texts: string[];
  morphTime?: number;
  cooldownTime?: number;
  className?: string;
  textClassName?: string;
};

/** A lightweight, accessible text transition for short editorial phrases. */
export function GooeyText({
  texts,
  morphTime = 0.9,
  cooldownTime = 1.4,
  className = "",
  textClassName = "",
}: GooeyTextProps) {
  const text1Ref = useRef<HTMLSpanElement>(null);
  const text2Ref = useRef<HTMLSpanElement>(null);
  const filterId = useId().replace(/:/g, "");

  useEffect(() => {
    if (texts.length < 2 || !text1Ref.current || !text2Ref.current) return;

    let textIndex = 0;
    let lastTime = performance.now();
    let morph = 0;
    let cooldown = cooldownTime;
    let frameId = 0;

    text1Ref.current.textContent = texts[0];
    text2Ref.current.textContent = texts[1];

    const setMorph = (fraction: number) => {
      if (!text1Ref.current || !text2Ref.current) return;

      const incoming = Math.max(fraction, 0.001);
      const outgoing = Math.max(1 - fraction, 0.001);
      text2Ref.current.style.filter = `blur(${Math.min(8 / incoming - 8, 100)}px)`;
      text2Ref.current.style.opacity = `${Math.pow(incoming, 0.4)}`;
      text1Ref.current.style.filter = `blur(${Math.min(8 / outgoing - 8, 100)}px)`;
      text1Ref.current.style.opacity = `${Math.pow(outgoing, 0.4)}`;
    };

    const resetMorph = () => {
      if (!text1Ref.current || !text2Ref.current) return;
      morph = 0;
      text1Ref.current.style.filter = "";
      text1Ref.current.style.opacity = "1";
      text2Ref.current.style.filter = "";
      text2Ref.current.style.opacity = "0";
    };

    resetMorph();

    const animate = (now: number) => {
      const elapsed = (now - lastTime) / 1000;
      lastTime = now;
      const wasCoolingDown = cooldown > 0;
      cooldown -= elapsed;

      if (cooldown <= 0) {
        if (wasCoolingDown) {
          textIndex = (textIndex + 1) % texts.length;
          if (text1Ref.current && text2Ref.current) {
            text1Ref.current.textContent = texts[textIndex];
            text2Ref.current.textContent = texts[(textIndex + 1) % texts.length];
          }
        }

        morph += elapsed;
        const fraction = Math.min(morph / morphTime, 1);
        setMorph(fraction);
        if (fraction >= 1) {
          cooldown = cooldownTime;
        }
      } else {
        resetMorph();
      }

      frameId = requestAnimationFrame(animate);
    };

    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [cooldownTime, morphTime, texts]);

  if (texts.length === 0) return null;

  return (
    <div aria-label={texts.join(" · ")} className={`relative ${className}`}>
      <svg aria-hidden="true" className="pointer-events-none absolute h-0 w-0 overflow-hidden" focusable="false">
        <defs>
          <filter id={filterId}>
            <feColorMatrix
              in="SourceGraphic"
              type="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9"
            />
          </filter>
        </defs>
      </svg>
      <div aria-hidden="true" className="flex items-center justify-center" style={{ filter: `url(#${filterId})` }}>
        <span className={`absolute inline-block select-none text-center ${textClassName}`} ref={text1Ref}>
          {texts[0]}
        </span>
        <span className={`absolute inline-block select-none text-center opacity-0 ${textClassName}`} ref={text2Ref}>
          {texts[1] ?? ""}
        </span>
      </div>
    </div>
  );
}
