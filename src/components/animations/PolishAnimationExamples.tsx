import React from 'react';
import { 
  useSmoothHover, 
  useTiltEffect, 
  useScrollFadeIn, 
  useStaggeredFadeIn, 
  useGlitchEffect,
  useInertiaScroll 
} from '@/hooks/usePolishAnimations';

/**
 * Example: Smooth Hover Button
 */
export const SmoothHoverButton: React.FC<{ children: React.ReactNode; onClick?: () => void }> = ({ 
  children, 
  onClick 
}) => {
  const { handlers } = useSmoothHover();
  
  return (
    <button
      className="smooth-hover px-6 py-3 bg-primary text-white rounded-lg font-medium"
      onClick={onClick}
      {...handlers}
    >
      {children}
    </button>
  );
};

/**
 * Example: Tilt Card
 */
export const TiltCard: React.FC<{ 
  title: string; 
  description: string;
  className?: string;
}> = ({ title, description, className = '' }) => {
  const { ref, style } = useTiltEffect(15);
  
  return (
    <div
      ref={ref}
      style={style}
      className={`p-6 bg-background border rounded-xl shadow-lg gpu-accelerated ${className}`}
    >
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
};

/**
 * Example: Fade In Section
 */
export const FadeInSection: React.FC<{ 
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => {
  const { ref, className: fadeClass } = useScrollFadeIn();
  
  return (
    <section ref={ref} className={`${fadeClass} ${className}`}>
      {children}
    </section>
  );
};

/**
 * Example: Staggered List
 */
export const StaggeredList: React.FC<{ 
  items: Array<{ id: string; title: string; description: string }>;
}> = ({ items }) => {
  const { containerRef, getItemProps } = useStaggeredFadeIn();
  
  return (
    <div ref={containerRef} className="space-y-4">
      {items.map((item, index) => (
        <div
          key={item.id}
          {...getItemProps(index)}
          className="p-4 bg-background border rounded-lg"
        >
          <h4 className="font-medium">{item.title}</h4>
          <p className="text-sm text-muted-foreground">{item.description}</p>
        </div>
      ))}
    </div>
  );
};

/**
 * Example: Glitch Hero Heading
 */
export const GlitchHeading: React.FC<{ 
  text: string;
  className?: string;
  intensity?: 'subtle' | 'normal';
}> = ({ text, className = '', intensity = 'subtle' }) => {
  const { glitchProps } = useGlitchEffect(text, intensity);
  
  return (
    <h1 
      {...glitchProps}
      className={`text-6xl font-bold ${glitchProps.className} ${className}`}
    >
      {text}
    </h1>
  );
};

/**
 * Example: Full Page with Inertia Scroll
 */
export const InertiaScrollPage: React.FC = () => {
  const { containerRef, currentSection, scrollToSection, containerProps } = useInertiaScroll();
  
  const sections = [
    { id: '1', title: 'Welcome', content: 'Scroll down to explore' },
    { id: '2', title: 'Features', content: 'Amazing features await' },
    { id: '3', title: 'About', content: 'Learn more about us' },
    { id: '4', title: 'Contact', content: 'Get in touch' },
  ];
  
  return (
    <div ref={containerRef} {...containerProps}>
      {sections.map((section, index) => (
        <div key={section.id} className="inertia-section flex items-center justify-center">
          <FadeInSection className="text-center">
            <GlitchHeading text={section.title} intensity="subtle" />
            <p className="mt-4 text-xl text-muted-foreground">{section.content}</p>
            {index < sections.length - 1 && (
              <button
                onClick={() => scrollToSection(index + 1)}
                className="mt-8 animate-bounce"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </button>
            )}
          </FadeInSection>
        </div>
      ))}
      
      {/* Section indicators */}
      <div className="fixed right-4 top-1/2 transform -translate-y-1/2 space-y-2">
        {sections.map((_, index) => (
          <button
            key={index}
            onClick={() => scrollToSection(index)}
            className={`w-2 h-2 rounded-full transition-all ${
              currentSection === index ? 'bg-primary w-8' : 'bg-muted'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

/**
 * Example: Combined Effects Card
 */
export const PolishedCard: React.FC<{
  title: string;
  description: string;
  image?: string;
}> = ({ title, description, image }) => {
  const { ref: tiltRef, style: tiltStyle } = useTiltEffect(10);
  const { ref: fadeRef, className: fadeClass } = useScrollFadeIn();
  
  return (
    <div ref={fadeRef} className={fadeClass}>
      <div
        ref={tiltRef}
        style={tiltStyle}
        className="smooth-hover-glow relative overflow-hidden rounded-xl bg-background border shadow-lg"
      >
        {image && (
          <div className="h-48 overflow-hidden">
            <img 
              src={image} 
              alt={title}
              className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
            />
          </div>
        )}
        <div className="p-6">
          <h3 className="text-xl font-semibold mb-2">{title}</h3>
          <p className="text-muted-foreground">{description}</p>
          <button className="mt-4 smooth-hover text-primary font-medium">
            Learn More →
          </button>
        </div>
      </div>
    </div>
  );
};