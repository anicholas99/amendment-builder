# Polish Animations Implementation Guide

This guide shows how to add subtle, polished animations to your Amendment Builder app section by section.

## Available Animation Effects

### 1. Smooth Hover Effects
Perfect for buttons, cards, and interactive elements.

```tsx
// Basic smooth hover
<button className="smooth-hover">Click me</button>

// Hover with scale
<div className="smooth-hover-scale">Card content</div>

// Hover with glow effect
<button className="smooth-hover-glow">Premium Button</button>
```

### 2. Slight Tilt Effects
Great for cards and feature highlights.

```tsx
import { useTiltEffect } from '@/hooks/usePolishAnimations';

function FeatureCard() {
  const { ref, style } = useTiltEffect(10); // 10 degrees max tilt
  
  return (
    <div ref={ref} style={style} className="p-6 bg-background border rounded-xl">
      <h3>Feature Title</h3>
      <p>Feature description</p>
    </div>
  );
}
```

### 3. Scroll Fade-in Effects
For content that appears as users scroll.

```tsx
import { useScrollFadeIn } from '@/hooks/usePolishAnimations';

function ContentSection() {
  const { ref, className } = useScrollFadeIn();
  
  return (
    <section ref={ref} className={className}>
      <h2>This fades in when scrolled into view</h2>
    </section>
  );
}
```

### 4. Glitch Effect for Hero Headings
Subtle glitch effect for main headings.

```tsx
import { useGlitchEffect } from '@/hooks/usePolishAnimations';

function HeroSection() {
  const { glitchProps } = useGlitchEffect("Amendment Builder", "subtle");
  
  return <h1 {...glitchProps}>Amendment Builder</h1>;
}
```

### 5. Inertia Scroll Sections
For full-page sections with smooth snapping.

```tsx
import { useInertiaScroll } from '@/hooks/usePolishAnimations';

function LandingPage() {
  const { containerRef, containerProps } = useInertiaScroll();
  
  return (
    <div ref={containerRef} {...containerProps}>
      <section className="inertia-section">Section 1</section>
      <section className="inertia-section">Section 2</section>
    </div>
  );
}
```

## Implementation by Section

### Projects Dashboard
```tsx
// In ProjectCard component
<div className="smooth-hover-scale p-6 bg-background border rounded-lg">
  {/* Card content */}
</div>

// In project list
<StaggeredList items={projects} />
```

### Patent Editor
```tsx
// Section headers with fade-in
<FadeInSection>
  <h2>Claims</h2>
  {/* Claims content */}
</FadeInSection>

// Toolbar buttons
<button className="smooth-hover px-3 py-2">
  <Icon />
</button>
```

### Modals and Dialogs
```tsx
// Modal content with tilt
<TiltCard 
  title="Confirm Action" 
  description="Are you sure you want to proceed?"
/>
```

### Navigation Elements
```tsx
// Sidebar items
<li className="smooth-hover px-4 py-2 rounded">
  Navigation Item
</li>

// Header buttons
<button className="smooth-hover-glow">
  Sign In
</button>
```

### Landing/Marketing Pages
```tsx
// Hero section
<section className="inertia-section">
  <GlitchHeading text="Patent Drafting AI" intensity="subtle" />
  <p className="scroll-fade-in delay-200">
    Streamline your patent application process
  </p>
</section>

// Feature cards
<div className="grid grid-cols-3 gap-6">
  {features.map((feature, i) => (
    <div key={i} className={`scroll-fade-in-stagger delay-${i * 100}`}>
      <TiltCard {...feature} />
    </div>
  ))}
</div>
```

## Best Practices

1. **Keep it Subtle**: Less is more. Use animations to enhance, not distract.

2. **Performance First**: 
   - Use `gpu-accelerated` class for complex animations
   - Animations automatically disable for `prefers-reduced-motion`
   - Use `will-change` sparingly

3. **Consistency**: Apply similar animations to similar elements throughout the app.

4. **Progressive Enhancement**: Animations should enhance the experience, not be required for functionality.

5. **Dark Mode Compatibility**: All animations work seamlessly with dark mode transitions.

## Performance Tips

- Use CSS transforms instead of position changes
- Batch animations with `requestAnimationFrame`
- Use `contain: layout` on animated containers
- Limit the number of simultaneous animations
- Test on lower-end devices

## Accessibility

All animations respect the `prefers-reduced-motion` media query and will automatically disable for users who prefer reduced motion.

```css
/* Animations are automatically disabled when prefers-reduced-motion is set */
@media (prefers-reduced-motion: reduce) {
  /* All animations become instant */
}
```