"use client";

import { gsap } from "gsap";
import { type ReactNode, useEffect, useRef } from "react";

interface AnimatedMessageWrapperProps {
  children: ReactNode;
  delay?: number;
}

export function AnimatedMessageWrapper({
  children,
  delay = 0,
}: AnimatedMessageWrapperProps) {
  const messageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = messageRef.current;
    if (!element) return;

    gsap.fromTo(
      element,
      {
        opacity: 0,
        y: 20,
        scale: 0.98,
      },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.4,
        delay,
        ease: "power3.out",
      }
    );

    return () => {
      gsap.killTweensOf(element);
    };
  }, [delay]);

  return <div ref={messageRef}>{children}</div>;
}
