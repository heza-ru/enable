"use client";

import { gsap } from "gsap";
import { type ReactNode, useEffect, useRef } from "react";

interface AnimatedInputWrapperProps {
  children: ReactNode;
}

export function AnimatedInputWrapper({ children }: AnimatedInputWrapperProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    // Find the textarea element
    const textarea = wrapper.querySelector("textarea");
    if (!textarea) return;

    const handleFocus = () => {
      gsap.to(wrapper, {
        boxShadow: "0 0 0 2px rgba(59, 130, 246, 0.3)",
        duration: 0.2,
        ease: "power2.out",
      });

      gsap.to(wrapper, {
        scale: 1.01,
        duration: 0.2,
        ease: "power2.out",
      });
    };

    const handleBlur = () => {
      gsap.to(wrapper, {
        boxShadow: "none",
        duration: 0.2,
        ease: "power2.out",
      });

      gsap.to(wrapper, {
        scale: 1,
        duration: 0.2,
        ease: "power2.out",
      });
    };

    textarea.addEventListener("focus", handleFocus);
    textarea.addEventListener("blur", handleBlur);

    return () => {
      textarea.removeEventListener("focus", handleFocus);
      textarea.removeEventListener("blur", handleBlur);
      gsap.killTweensOf(wrapper);
    };
  }, []);

  return (
    <div ref={wrapperRef} className="relative transition-all">
      {children}
    </div>
  );
}
