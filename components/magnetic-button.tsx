"use client";

import { gsap } from "gsap";
import { type ComponentProps, useEffect, useRef } from "react";
import { Button } from "./ui/button";

interface MagneticButtonProps extends ComponentProps<typeof Button> {
  magneticStrength?: number;
  disableHoverScale?: boolean;
}

export function MagneticButton({
  children,
  className,
  magneticStrength = 0.3,
  disableHoverScale = false,
  ...props
}: MagneticButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const button = buttonRef.current;
    if (!button) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = button.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      gsap.to(button, {
        x: x * magneticStrength,
        y: y * magneticStrength,
        duration: 0.3,
        ease: "power2.out",
      });
    };

    const handleMouseLeave = () => {
      gsap.to(button, {
        x: 0,
        y: 0,
        duration: 0.5,
        ease: "elastic.out(1, 0.3)",
      });
    };

    button.addEventListener("mousemove", handleMouseMove);
    button.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      button.removeEventListener("mousemove", handleMouseMove);
      button.removeEventListener("mouseleave", handleMouseLeave);
      gsap.killTweensOf(button);
    };
  }, [magneticStrength]);

  return (
    <Button
      ref={buttonRef}
      className={className}
      data-disable-hover-scale={disableHoverScale}
      {...props}
    >
      {children}
    </Button>
  );
}
