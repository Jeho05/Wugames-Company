"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

type GooeyTextProps = {
  texts: string[];
  morphTime?: number;
  cooldownTime?: number;
  className?: string;
  textClassName?: string;
};

export function GooeyText({
  texts,
  morphTime = 0.9,
  cooldownTime = 1.4,
  className = "",
  textClassName = "",
}: GooeyTextProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (texts.length < 2) return;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % texts.length);
    }, (morphTime + cooldownTime) * 1000);
    return () => clearInterval(timer);
  }, [texts.length, morphTime, cooldownTime]);

  if (texts.length === 0) return null;

  return (
    <div aria-label={texts.join(" · ")} className={"relative " + className}>
      <AnimatePresence mode="wait">
        <motion.span
          key={texts[index]}
          className={"inline-block select-none text-center " + textClassName}
          initial={{ filter: "blur(8px)", opacity: 0 }}
          animate={{ filter: "blur(0px)", opacity: 1 }}
          exit={{ filter: "blur(8px)", opacity: 0 }}
          transition={{ duration: morphTime, ease: "easeInOut" }}
        >
          {texts[index]}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}
