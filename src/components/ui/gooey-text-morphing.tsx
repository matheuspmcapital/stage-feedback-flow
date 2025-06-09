"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface GooeyTextProps {
  texts: string[];
  morphTime?: number;
  cooldownTime?: number;
  className?: string;
  textClassName?: string;
}

export function GooeyText({
  texts,
  morphTime = 1,
  cooldownTime = 0.25,
  className,
  textClassName
}: GooeyTextProps) {
  const text1Ref = React.useRef<HTMLSpanElement>(null);
  const text2Ref = React.useRef<HTMLSpanElement>(null);
  const animationStateRef = React.useRef({
    textIndex: texts.length - 1,
    time: new Date(),
    morph: 0,
    cooldown: cooldownTime
  });

  React.useEffect(() => {
    const setMorph = (fraction: number) => {
      if (text1Ref.current && text2Ref.current) {
        text2Ref.current.style.filter = `blur(${Math.min(8 / fraction - 8, 100)}px)`;
        text2Ref.current.style.opacity = `${Math.pow(fraction, 0.4) * 100}%`;

        fraction = 1 - fraction;
        text1Ref.current.style.filter = `blur(${Math.min(8 / fraction - 8, 100)}px)`;
        text1Ref.current.style.opacity = `${Math.pow(fraction, 0.4) * 100}%`;
      }
    };

    const doCooldown = () => {
      animationStateRef.current.morph = 0;
      if (text1Ref.current && text2Ref.current) {
        text2Ref.current.style.filter = "";
        text2Ref.current.style.opacity = "100%";
        text1Ref.current.style.filter = "";
        text1Ref.current.style.opacity = "0%";
      }
    };

    const doMorph = () => {
      animationStateRef.current.morph -= animationStateRef.current.cooldown;
      animationStateRef.current.cooldown = 0;
      let fraction = animationStateRef.current.morph / morphTime;

      if (fraction > 1) {
        animationStateRef.current.cooldown = cooldownTime;
        fraction = 1;
      }

      setMorph(fraction);
    };

    function animate() {
      requestAnimationFrame(animate);
      const newTime = new Date();
      const shouldIncrementIndex = animationStateRef.current.cooldown > 0;
      const dt = (newTime.getTime() - animationStateRef.current.time.getTime()) / 1000;
      animationStateRef.current.time = newTime;

      animationStateRef.current.cooldown -= dt;

      if (animationStateRef.current.cooldown <= 0) {
        if (shouldIncrementIndex) {
          animationStateRef.current.textIndex = (animationStateRef.current.textIndex + 1) % texts.length;
          if (text1Ref.current && text2Ref.current) {
            text1Ref.current.textContent = texts[animationStateRef.current.textIndex % texts.length];
            text2Ref.current.textContent = texts[(animationStateRef.current.textIndex + 1) % texts.length];
          }
        }
        doMorph();
      } else {
        doCooldown();
      }
    }

    animate();

    return () => {
      // Cleanup function if needed
    };
  }, [texts, morphTime, cooldownTime]);

  return (
    <div className={cn("relative", className)}>
      <svg className="absolute h-0 w-0" aria-hidden="true" focusable="false">
        <defs>
          <filter id="threshold">
            <feColorMatrix
              in="SourceGraphic"
              type="matrix"
              values="1 0 0 0 0
                      0 1 0 0 0
                      0 0 1 0 0
                      0 0 0 255 -140"
            />
          </filter>
        </defs>
      </svg>

      <div
        className="flex items-center justify-center"
        style={{ filter: "url(#threshold)" }}
      >
        <span
          ref={text1Ref}
          className={cn(
            "absolute inline-block select-none text-center text-6xl md:text-[60pt]",
            "text-[#ffffff]",
            textClassName
          )}
        />
        <span
          ref={text2Ref}
          className={cn(
            "absolute inline-block select-none text-center text-6xl md:text-[60pt]",
            "text-[#ffffff]",
            textClassName
          )}
        />
      </div>
    </div>
  );
}