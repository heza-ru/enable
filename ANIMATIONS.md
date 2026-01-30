# GSAP Animations Guide

This document provides an overview of the GSAP-powered animations implemented throughout the enable application.

## 🎨 Installation

GSAP 3.14.2 is installed and configured for all interactive animations.

```bash
pnpm add gsap
```

## 📁 Animation Files

### Core Utilities

#### `lib/animations/gsap-utils.ts`
Reusable GSAP animation functions:
- `animateButtonHover()` - Button scale on hover
- `animateButtonPress()` - Elastic button press effect
- `animateCardHover()` - Card lift animation
- `animateFadeInUp()` - Entrance animation from bottom
- `animateScaleIn()` - Scale entrance with bounce
- `animateShake()` - Error shake animation
- `animatePulse()` - Notification pulse effect
- `animateStaggerChildren()` - List item stagger
- `animateElasticBounce()` - Playful entrance animation

#### `lib/animations/cursor-animations.ts`
Advanced cursor interaction effects:
- `createMagneticEffect()` - Elements follow cursor
- `createParallaxEffect()` - Scroll-based movement
- `createTiltEffect()` - 3D tilt on hover

### React Hooks

#### `hooks/use-gsap-animation.ts`
Custom React hooks for common animation patterns:
- `useGSAPAnimation()` - Access GSAP with auto-cleanup
- `useEntranceAnimation()` - Entrance effects (bottom, top, left, right, scale)
- `useHoverScale()` - Hover scale animation
- `useClickAnimation()` - Click feedback
- `useStaggerAnimation()` - List item stagger

### Component Wrappers

#### `components/animated-input-wrapper.tsx`
Wraps input fields with focus animations:
- Scale up on focus
- Glowing border effect
- Smooth transitions

#### `components/animated-message-wrapper.tsx`
Animates message entrance:
- Fade in from bottom
- Scale animation
- Configurable delay for stagger effect

## 🎯 Components with Animations

### UI Components

#### Buttons (`components/ui/button.tsx`)
- **Hover:** Scale to 1.02
- **Press:** Scale to 0.98 → elastic bounce back
- **Duration:** 0.2s hover, 0.1s press
- **Easing:** power2.out, elastic.out

```tsx
<Button>Animated Button</Button>
```

#### Cards (`components/ui/card.tsx`)
- **Hover:** Lift -6px with shadow
- **Leave:** Return smoothly
- **Duration:** 0.3s
- **Easing:** power2.out

```tsx
<Card>Hover over me!</Card>
```

#### Dialogs (`components/ui/dialog.tsx`)
- **Entrance:** Fade in + scale from 0.9 + Y offset
- **Duration:** 0.3s
- **Easing:** back.out(1.7) for bounce

```tsx
<Dialog>
  <DialogContent>Animated Dialog</DialogContent>
</Dialog>
```

## 🚀 Usage Examples

### Basic Hover Animation

```tsx
import { animateButtonHover, animateButtonHoverOut } from "@/lib/animations/gsap-utils";

const buttonRef = useRef<HTMLButtonElement>(null);

<button
  ref={buttonRef}
  onMouseEnter={() => animateButtonHover(buttonRef.current)}
  onMouseLeave={() => animateButtonHoverOut(buttonRef.current)}
>
  Hover Me
</button>
```

### Entrance Animation Hook

```tsx
import { useEntranceAnimation } from "@/hooks/use-gsap-animation";

function Component() {
  const ref = useRef<HTMLDivElement>(null);
  
  useEntranceAnimation(ref, {
    delay: 0.2,
    duration: 0.6,
    from: "bottom" // or "top", "left", "right", "scale"
  });

  return <div ref={ref}>I fade in!</div>;
}
```

### Stagger Animation

```tsx
import { animateStaggerChildren } from "@/lib/animations/gsap-utils";

useEffect(() => {
  animateStaggerChildren(containerRef.current, ".list-item", 0);
}, []);

<div ref={containerRef}>
  <div className="list-item">Item 1</div>
  <div className="list-item">Item 2</div>
  <div className="list-item">Item 3</div>
</div>
```

### Magnetic Effect

```tsx
import { createMagneticEffect } from "@/lib/animations/cursor-animations";

useEffect(() => {
  const element = ref.current;
  if (!element) return;

  return createMagneticEffect(element);
}, []);
```

## ⚡ Performance Tips

1. **Cleanup:** All animations automatically clean up on unmount
2. **Disabled State:** Button animations respect `disabled` prop
3. **Kill Tweens:** Use `gsap.killTweensOf(element)` in cleanup
4. **Passive Listeners:** Scroll listeners use `{ passive: true }`

## 🎭 Animation Timing

| Animation Type | Duration | Easing |
|---------------|----------|--------|
| Hover | 0.2s | power2.out |
| Click | 0.1s | power2.in |
| Entrance | 0.4-0.6s | power3.out |
| Card Lift | 0.3s | power2.out |
| Dialog | 0.3s | back.out(1.7) |
| Stagger | 0.4s | power2.out |
| Elastic | 0.15s | elastic.out(1, 0.3) |

## 🎨 Easing Functions

- **power2.out** - Smooth deceleration (most common)
- **power2.in** - Smooth acceleration (press down)
- **power3.out** - Stronger deceleration (entrances)
- **elastic.out** - Bouncy spring effect (clicks)
- **back.out** - Overshoot and return (dialogs)

## 🔧 Customization

All animation functions accept parameters for customization:

```tsx
animateFadeInUp(element, delay = 0.2);
animateScaleIn(element, delay = 0);
animateCardHover(element);
```

## 🐛 Debugging

Enable GSAP debug mode in development:

```tsx
import { gsap } from "gsap";

if (process.env.NODE_ENV === "development") {
  gsap.config({ nullTargetWarn: false });
}
```

## 📚 Resources

- [GSAP Documentation](https://greensock.com/docs/)
- [GSAP Easing Visualizer](https://greensock.com/ease-visualizer/)
- [GSAP Cheat Sheet](https://ihatetomatoes.net/greensock-cheat-sheet/)

## 🎯 Future Enhancements

- Scroll-triggered animations (ScrollTrigger plugin)
- Morph/shape animations (MorphSVG plugin)
- Advanced timeline sequences
- 3D transforms and rotations
- Physics-based spring animations
