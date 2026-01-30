"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

/**
 * Custom hook for GSAP animations
 * Provides easy access to GSAP animations with React refs
 */

export const useGSAPAnimation = () => {
  const gsapRef = useRef(gsap);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      gsapRef.current.killTweensOf("*");
    };
  }, []);

  return gsapRef.current;
};

/**
 * Hook for entrance animations
 */
export const useEntranceAnimation = (
  ref: React.RefObject<HTMLElement>,
  options?: {
    delay?: number;
    duration?: number;
    from?: "bottom" | "top" | "left" | "right" | "scale";
  }
) => {
  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const { delay = 0, duration = 0.6, from = "bottom" } = options || {};

    const animations = {
      bottom: { opacity: 0, y: 30 },
      top: { opacity: 0, y: -30 },
      left: { opacity: 0, x: -30 },
      right: { opacity: 0, x: 30 },
      scale: { opacity: 0, scale: 0.8 },
    };

    gsap.fromTo(
      element,
      animations[from],
      {
        opacity: 1,
        y: 0,
        x: 0,
        scale: 1,
        duration,
        delay,
        ease: "power3.out",
      }
    );

    return () => {
      gsap.killTweensOf(element);
    };
  }, [ref, options]);
};

/**
 * Hook for hover scale animation
 */
export const useHoverScale = (
  ref: React.RefObject<HTMLElement>,
  scale = 1.05
) => {
  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handleMouseEnter = () => {
      gsap.to(element, {
        scale,
        duration: 0.2,
        ease: "power2.out",
      });
    };

    const handleMouseLeave = () => {
      gsap.to(element, {
        scale: 1,
        duration: 0.2,
        ease: "power2.out",
      });
    };

    element.addEventListener("mouseenter", handleMouseEnter);
    element.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      element.removeEventListener("mouseenter", handleMouseEnter);
      element.removeEventListener("mouseleave", handleMouseLeave);
      gsap.killTweensOf(element);
    };
  }, [ref, scale]);
};

/**
 * Hook for click animation
 */
export const useClickAnimation = (ref: React.RefObject<HTMLElement>) => {
  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handleClick = () => {
      gsap.timeline()
        .to(element, {
          scale: 0.95,
          duration: 0.1,
          ease: "power2.in",
        })
        .to(element, {
          scale: 1,
          duration: 0.2,
          ease: "elastic.out(1, 0.3)",
        });
    };

    element.addEventListener("click", handleClick);

    return () => {
      element.removeEventListener("click", handleClick);
      gsap.killTweensOf(element);
    };
  }, [ref]);
};

/**
 * Hook for stagger animation on list items
 */
export const useStaggerAnimation = (
  containerRef: React.RefObject<HTMLElement>,
  childSelector: string,
  options?: {
    delay?: number;
    stagger?: number;
  }
) => {
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const { delay = 0, stagger = 0.1 } = options || {};
    const children = container.querySelectorAll(childSelector);

    gsap.fromTo(
      children,
      {
        opacity: 0,
        y: 20,
      },
      {
        opacity: 1,
        y: 0,
        duration: 0.4,
        stagger,
        delay,
        ease: "power2.out",
      }
    );

    return () => {
      gsap.killTweensOf(children);
    };
  }, [containerRef, childSelector, options]);
};
