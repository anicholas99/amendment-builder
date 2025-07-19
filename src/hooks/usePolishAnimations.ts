import { useEffect, useRef, useState, useCallback } from 'react';
import { useInView } from 'react-intersection-observer';

/**
 * Hook for smooth hover effects
 */
export const useSmoothHover = () => {
  const [isHovered, setIsHovered] = useState(false);
  
  const handlers = {
    onMouseEnter: () => setIsHovered(true),
    onMouseLeave: () => setIsHovered(false),
  };
  
  return { isHovered, handlers };
};

/**
 * Hook for tilt effects on hover
 */
export const useTiltEffect = (maxTilt = 10) => {
  const ref = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!ref.current) return;
    
    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const tiltX = ((y - centerY) / centerY) * maxTilt;
    const tiltY = ((x - centerX) / centerX) * -maxTilt;
    
    setTilt({ x: tiltX, y: tiltY });
  }, [maxTilt]);
  
  const handleMouseLeave = useCallback(() => {
    setTilt({ x: 0, y: 0 });
  }, []);
  
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    
    element.addEventListener('mousemove', handleMouseMove);
    element.addEventListener('mouseleave', handleMouseLeave);
    
    return () => {
      element.removeEventListener('mousemove', handleMouseMove);
      element.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [handleMouseMove, handleMouseLeave]);
  
  const style = {
    transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
    transition: 'transform 0.1s ease-out',
  };
  
  return { ref, style, tilt };
};

/**
 * Hook for scroll fade-in animations
 */
export const useScrollFadeIn = (threshold = 0.1, rootMargin = '0px') => {
  const { ref, inView } = useInView({
    threshold,
    rootMargin,
    triggerOnce: true,
  });
  
  return {
    ref,
    className: `scroll-fade-in ${inView ? 'visible' : ''}`,
    isVisible: inView,
  };
};

/**
 * Hook for staggered fade-in animations
 */
export const useStaggeredFadeIn = (baseDelay = 0, increment = 100) => {
  const [visibleItems, setVisibleItems] = useState<Set<number>>(new Set());
  
  const getItemProps = (index: number) => {
    const delay = baseDelay + (index * increment);
    const isVisible = visibleItems.has(index);
    
    return {
      className: `scroll-fade-in-stagger ${isVisible ? 'visible' : ''} delay-${Math.min(delay, 500)}`,
      style: {
        transitionDelay: `${delay}ms`,
      },
    };
  };
  
  const triggerItem = (index: number) => {
    setVisibleItems(prev => new Set(prev).add(index));
  };
  
  const { ref: containerRef } = useInView({
    threshold: 0.1,
    triggerOnce: true,
    onChange: (inView) => {
      if (inView) {
        // Trigger all items when container is in view
        const items = Array.from({ length: 10 }, (_, i) => i);
        items.forEach((i, idx) => {
          setTimeout(() => triggerItem(i), idx * increment);
        });
      }
    },
  });
  
  return { containerRef, getItemProps };
};

/**
 * Hook for glitch effect
 */
export const useGlitchEffect = (text: string, intensity: 'subtle' | 'normal' = 'subtle') => {
  const [isGlitching, setIsGlitching] = useState(false);
  
  const triggerGlitch = useCallback(() => {
    setIsGlitching(true);
    setTimeout(() => setIsGlitching(false), 1000);
  }, []);
  
  const glitchProps = {
    'data-text': text,
    className: `glitch ${intensity === 'subtle' ? 'glitch-subtle' : ''} ${isGlitching ? 'active' : ''}`,
    onMouseEnter: intensity === 'normal' ? triggerGlitch : undefined,
  };
  
  return { glitchProps, triggerGlitch };
};

/**
 * Hook for inertia scroll sections
 */
export const useInertiaScroll = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentSection, setCurrentSection] = useState(0);
  
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    const handleScroll = () => {
      const scrollTop = container.scrollTop;
      const sectionHeight = window.innerHeight;
      const newSection = Math.round(scrollTop / sectionHeight);
      setCurrentSection(newSection);
    };
    
    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);
  
  const scrollToSection = useCallback((index: number) => {
    const container = containerRef.current;
    if (!container) return;
    
    const sectionHeight = window.innerHeight;
    container.scrollTo({
      top: index * sectionHeight,
      behavior: 'smooth',
    });
  }, []);
  
  return {
    containerRef,
    currentSection,
    scrollToSection,
    containerProps: {
      className: 'inertia-scroll',
      style: {
        height: '100vh',
        overflow: 'auto',
      },
    },
  };
};

/**
 * Combined hook for all polish animations
 */
export const usePolishAnimations = () => {
  return {
    smoothHover: useSmoothHover,
    tiltEffect: useTiltEffect,
    scrollFadeIn: useScrollFadeIn,
    staggeredFadeIn: useStaggeredFadeIn,
    glitchEffect: useGlitchEffect,
    inertiaScroll: useInertiaScroll,
  };
};