"use client";

import { gsap } from "gsap";
import type { RefObject } from "react";

/**
 * GSAP Animation Utilities
 * Reusable animation functions for consistent interactions
 */

// Button hover scale animation
export const animateButtonHover = (element: HTMLElement | null) => {
  if (!element) return;
  
  gsap.to(element, {
    scale: 1.05,
    duration: 0.2,
    ease: "power2.out",
  });
};

export const animateButtonHoverOut = (element: HTMLElement | null) => {
  if (!element) return;
  
  gsap.to(element, {
    scale: 1,
    duration: 0.2,
    ease: "power2.out",
  });
};

// Button press animation
export const animateButtonPress = (element: HTMLElement | null) => {
  if (!element) return;
  
  gsap.timeline()
    .to(element, {
      scale: 0.95,
      duration: 0.1,
      ease: "power2.in",
    })
    .to(element, {
      scale: 1,
      duration: 0.15,
      ease: "elastic.out(1, 0.3)",
    });
};

// Card hover lift animation
export const animateCardHover = (element: HTMLElement | null) => {
  if (!element) return;
  
  gsap.to(element, {
    y: -4,
    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.15)",
    duration: 0.3,
    ease: "power2.out",
  });
};

export const animateCardHoverOut = (element: HTMLElement | null) => {
  if (!element) return;
  
  gsap.to(element, {
    y: 0,
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
    duration: 0.3,
    ease: "power2.out",
  });
};

// Fade in from bottom animation
export const animateFadeInUp = (
  element: HTMLElement | null,
  delay = 0
) => {
  if (!element) return;
  
  gsap.fromTo(
    element,
    {
      opacity: 0,
      y: 30,
    },
    {
      opacity: 1,
      y: 0,
      duration: 0.6,
      delay,
      ease: "power3.out",
    }
  );
};

// Fade in from left animation
export const animateFadeInLeft = (
  element: HTMLElement | null,
  delay = 0
) => {
  if (!element) return;
  
  gsap.fromTo(
    element,
    {
      opacity: 0,
      x: -30,
    },
    {
      opacity: 1,
      x: 0,
      duration: 0.5,
      delay,
      ease: "power3.out",
    }
  );
};

// Scale in animation
export const animateScaleIn = (element: HTMLElement | null, delay = 0) => {
  if (!element) return;
  
  gsap.fromTo(
    element,
    {
      opacity: 0,
      scale: 0.8,
    },
    {
      opacity: 1,
      scale: 1,
      duration: 0.5,
      delay,
      ease: "back.out(1.7)",
    }
  );
};

// Ripple effect animation
export const animateRipple = (
  element: HTMLElement | null,
  x: number,
  y: number
) => {
  if (!element) return;
  
  const ripple = document.createElement("span");
  ripple.style.position = "absolute";
  ripple.style.width = "20px";
  ripple.style.height = "20px";
  ripple.style.borderRadius = "50%";
  ripple.style.backgroundColor = "rgba(255, 255, 255, 0.5)";
  ripple.style.left = `${x}px`;
  ripple.style.top = `${y}px`;
  ripple.style.transform = "translate(-50%, -50%)";
  ripple.style.pointerEvents = "none";
  
  element.appendChild(ripple);
  
  gsap.to(ripple, {
    scale: 4,
    opacity: 0,
    duration: 0.6,
    ease: "power2.out",
    onComplete: () => {
      ripple.remove();
    },
  });
};

// Shake animation (for errors)
export const animateShake = (element: HTMLElement | null) => {
  if (!element) return;
  
  gsap.timeline()
    .to(element, { x: -10, duration: 0.1 })
    .to(element, { x: 10, duration: 0.1 })
    .to(element, { x: -10, duration: 0.1 })
    .to(element, { x: 10, duration: 0.1 })
    .to(element, { x: 0, duration: 0.1 });
};

// Pulse animation (for notifications)
export const animatePulse = (element: HTMLElement | null) => {
  if (!element) return;
  
  gsap.timeline({ repeat: 2 })
    .to(element, {
      scale: 1.1,
      duration: 0.3,
      ease: "power2.out",
    })
    .to(element, {
      scale: 1,
      duration: 0.3,
      ease: "power2.in",
    });
};

// Stagger children animation
export const animateStaggerChildren = (
  parent: HTMLElement | null,
  childSelector: string,
  delay = 0
) => {
  if (!parent) return;
  
  const children = parent.querySelectorAll(childSelector);
  
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
      stagger: 0.1,
      delay,
      ease: "power2.out",
    }
  );
};

// Smooth scroll animation
export const animateSmoothScroll = (
  element: HTMLElement | null,
  target: number
) => {
  if (!element) return;
  
  gsap.to(element, {
    scrollTop: target,
    duration: 0.5,
    ease: "power2.inOut",
  });
};

// Icon bounce animation
export const animateIconBounce = (element: HTMLElement | null) => {
  if (!element) return;
  
  gsap.timeline()
    .to(element, {
      y: -8,
      duration: 0.3,
      ease: "power2.out",
    })
    .to(element, {
      y: 0,
      duration: 0.3,
      ease: "bounce.out",
    });
};

// Rotate animation (for loading states)
export const animateRotate = (
  element: HTMLElement | null,
  continuous = false
) => {
  if (!element) return;
  
  if (continuous) {
    gsap.to(element, {
      rotation: 360,
      duration: 1,
      ease: "linear",
      repeat: -1,
    });
  } else {
    gsap.to(element, {
      rotation: 360,
      duration: 0.5,
      ease: "power2.inOut",
    });
  }
};

// Glow effect animation
export const animateGlow = (element: HTMLElement | null) => {
  if (!element) return;
  
  gsap.timeline({ repeat: -1, yoyo: true })
    .to(element, {
      boxShadow: "0 0 20px rgba(59, 130, 246, 0.5)",
      duration: 1.5,
      ease: "power1.inOut",
    });
};

// Slide in from right animation
export const animateSlideInRight = (
  element: HTMLElement | null,
  delay = 0
) => {
  if (!element) return;
  
  gsap.fromTo(
    element,
    {
      opacity: 0,
      x: 100,
    },
    {
      opacity: 1,
      x: 0,
      duration: 0.5,
      delay,
      ease: "power3.out",
    }
  );
};

// Slide out to right animation
export const animateSlideOutRight = (element: HTMLElement | null) => {
  if (!element) return;
  
  return gsap.to(element, {
    opacity: 0,
    x: 100,
    duration: 0.4,
    ease: "power2.in",
  });
};

// Elastic bounce animation
export const animateElasticBounce = (element: HTMLElement | null) => {
  if (!element) return;
  
  gsap.fromTo(
    element,
    {
      scale: 0,
    },
    {
      scale: 1,
      duration: 0.8,
      ease: "elastic.out(1, 0.5)",
    }
  );
};

// Morph animation (for shape changes)
export const animateMorph = (
  element: HTMLElement | null,
  toProperties: gsap.TweenVars
) => {
  if (!element) return;
  
  gsap.to(element, {
    ...toProperties,
    duration: 0.6,
    ease: "power2.inOut",
  });
};
