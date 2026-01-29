/**
 * Animation utilities and variants for Enable
 * Using Framer Motion for smooth, spring-based animations
 */

import type { Variants, Transition } from "framer-motion";

/**
 * Spring physics presets
 */
export const springs = {
  // Snappy spring for quick interactions
  snappy: {
    type: "spring" as const,
    stiffness: 400,
    damping: 30,
    mass: 0.8,
  },
  // Smooth spring for gentle animations
  smooth: {
    type: "spring" as const,
    stiffness: 300,
    damping: 25,
    mass: 1,
  },
  // Bouncy spring for playful elements
  bouncy: {
    type: "spring" as const,
    stiffness: 260,
    damping: 20,
    mass: 1.2,
  },
  // Gentle spring for subtle effects
  gentle: {
    type: "spring" as const,
    stiffness: 200,
    damping: 20,
    mass: 1,
  },
} as const;

/**
 * Easing functions
 */
export const easings = {
  easeOut: [0.16, 1, 0.3, 1],
  easeIn: [0.7, 0, 0.84, 0],
  easeInOut: [0.87, 0, 0.13, 1],
  smoothInOut: [0.4, 0, 0.2, 1],
} as const;

/**
 * Duration presets (in seconds)
 */
export const durations = {
  instant: 0.1,
  fast: 0.2,
  normal: 0.3,
  slow: 0.5,
  slower: 0.7,
} as const;

/**
 * Fade animations
 */
export const fadeVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: springs.smooth,
  },
  exit: {
    opacity: 0,
    transition: { duration: durations.fast },
  },
};

/**
 * Slide animations
 */
export const slideVariants = {
  fromBottom: {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: springs.snappy,
    },
    exit: {
      opacity: 0,
      y: 20,
      transition: { duration: durations.fast },
    },
  },
  fromTop: {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: springs.snappy,
    },
    exit: {
      opacity: 0,
      y: -20,
      transition: { duration: durations.fast },
    },
  },
  fromLeft: {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: springs.snappy,
    },
    exit: {
      opacity: 0,
      x: -20,
      transition: { duration: durations.fast },
    },
  },
  fromRight: {
    hidden: { opacity: 0, x: 20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: springs.snappy,
    },
    exit: {
      opacity: 0,
      x: 20,
      transition: { duration: durations.fast },
    },
  },
} as const;

/**
 * Scale animations
 */
export const scaleVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: springs.snappy,
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: { duration: durations.fast },
  },
};

/**
 * Spring scale animations (for buttons, etc.)
 */
export const springScaleVariants: Variants = {
  rest: { scale: 1 },
  hover: {
    scale: 1.05,
    transition: springs.snappy,
  },
  tap: {
    scale: 0.98,
    transition: springs.snappy,
  },
};

/**
 * Stagger children animations
 */
export const staggerChildren = {
  visible: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
} as const;

/**
 * List item animations
 */
export const listItemVariants: Variants = {
  hidden: { opacity: 0, x: -10 },
  visible: {
    opacity: 1,
    x: 0,
    transition: springs.smooth,
  },
};

/**
 * Card animations
 */
export const cardVariants: Variants = {
  hidden: { 
    opacity: 0, 
    y: 20,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: springs.smooth,
  },
  hover: {
    y: -4,
    scale: 1.02,
    transition: springs.snappy,
  },
};

/**
 * Modal/Dialog animations
 */
export const modalVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
    y: 10,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: springs.smooth,
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 10,
    transition: { duration: durations.fast },
  },
};

/**
 * Backdrop animations
 */
export const backdropVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: durations.normal },
  },
  exit: {
    opacity: 0,
    transition: { duration: durations.fast },
  },
};

/**
 * Rotate animations
 */
export const rotateVariants: Variants = {
  hidden: { rotate: -180, opacity: 0 },
  visible: {
    rotate: 0,
    opacity: 1,
    transition: springs.bouncy,
  },
};

/**
 * Pulse animation
 */
export const pulseVariants: Variants = {
  pulse: {
    scale: [1, 1.05, 1],
    opacity: [1, 0.8, 1],
    transition: {
      duration: 2,
      repeat: Number.POSITIVE_INFINITY,
      ease: "easeInOut",
    },
  },
};

/**
 * Shake animation (for errors)
 */
export const shakeVariants: Variants = {
  shake: {
    x: [0, -10, 10, -10, 10, 0],
    transition: {
      duration: 0.5,
      ease: "easeInOut",
    },
  },
};

/**
 * Typing indicator animation
 */
export const typingDotVariants: Variants = {
  animate: {
    y: [0, -8, 0],
    transition: {
      duration: 0.6,
      repeat: Number.POSITIVE_INFINITY,
      ease: "easeInOut",
    },
  },
};

/**
 * Micro-interaction: Button press
 */
export const buttonPressVariants: Variants = {
  rest: { scale: 1 },
  pressed: {
    scale: 0.95,
    transition: { duration: 0.1 },
  },
};

/**
 * Micro-interaction: Lift on hover
 */
export const liftVariants: Variants = {
  rest: { y: 0 },
  hover: {
    y: -2,
    transition: springs.snappy,
  },
};

/**
 * Page transition variants
 */
export const pageTransitionVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: durations.normal,
      ease: easings.smoothInOut,
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: durations.fast,
      ease: easings.smoothInOut,
    },
  },
};

/**
 * Utility function to create custom spring transition
 */
export function createSpring(config: {
  stiffness?: number;
  damping?: number;
  mass?: number;
}): Transition {
  return {
    type: "spring",
    stiffness: config.stiffness ?? 300,
    damping: config.damping ?? 25,
    mass: config.mass ?? 1,
  };
}

/**
 * Utility function to create custom tween transition
 */
export function createTween(config: {
  duration?: number;
  ease?: number[] | string;
  delay?: number;
}): Transition {
  return {
    type: "tween",
    duration: config.duration ?? durations.normal,
    ease: config.ease ?? easings.smoothInOut,
    delay: config.delay ?? 0,
  };
}
