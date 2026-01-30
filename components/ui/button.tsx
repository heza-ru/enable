import { cva, type VariantProps } from "class-variance-authority";
import { Slot as SlotPrimitive } from "radix-ui";
import * as React from "react";
import { gsap } from "gsap";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium text-sm ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-lg hover:-translate-y-0.5",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 hover:shadow-lg hover:-translate-y-0.5",
        outline:
          "border border-[#2a2836] bg-background hover:bg-accent hover:text-accent-foreground hover:border-accent-foreground/20 hover:shadow-md",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 hover:shadow-md",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
        "icon-sm": "h-8 w-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? SlotPrimitive.Slot : "button";
    const buttonRef = React.useRef<HTMLButtonElement>(null);
    const combinedRef = ref || buttonRef;

  // Add GSAP hover and click animations
  React.useEffect(() => {
    const element = (combinedRef as React.RefObject<HTMLButtonElement>).current;
    if (!element || asChild || props.disabled) return;

    // Check if hover scale is disabled (for absolutely positioned elements)
    const disableHoverScale = element.dataset.disableHoverScale === "true";

    const handleMouseEnter = () => {
      if (!disableHoverScale) {
        gsap.to(element, {
          scale: 1.02,
          duration: 0.2,
          ease: "power2.out",
        });
      }
    };

    const handleMouseLeave = () => {
      if (!disableHoverScale) {
        gsap.to(element, {
          scale: 1,
          duration: 0.2,
          ease: "power2.out",
        });
      }
    };

    const handleMouseDown = () => {
      if (!disableHoverScale) {
        gsap.to(element, {
          scale: 0.98,
          duration: 0.1,
          ease: "power2.in",
        });
      }
    };

    const handleMouseUp = () => {
      if (!disableHoverScale) {
        gsap.to(element, {
          scale: 1.02,
          duration: 0.15,
          ease: "elastic.out(1, 0.3)",
        });
      }
    };

    element.addEventListener("mouseenter", handleMouseEnter);
    element.addEventListener("mouseleave", handleMouseLeave);
    element.addEventListener("mousedown", handleMouseDown);
    element.addEventListener("mouseup", handleMouseUp);

    return () => {
      element.removeEventListener("mouseenter", handleMouseEnter);
      element.removeEventListener("mouseleave", handleMouseLeave);
      element.removeEventListener("mousedown", handleMouseDown);
      element.removeEventListener("mouseup", handleMouseUp);
      gsap.killTweensOf(element);
    };
  }, [combinedRef, asChild, props.disabled]);

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={combinedRef as React.Ref<HTMLButtonElement>}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
