import React from 'react';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

interface AnimatedSectionProps {
  children: React.ReactNode;
  className?: string;
  animation?: 'fadeIn' | 'slideUp' | 'slideLeft' | 'slideRight' | 'scaleIn';
  delay?: number;
  duration?: number;
  threshold?: number;
}

const AnimatedSection: React.FC<AnimatedSectionProps> = ({
  children,
  className = '',
  animation = 'fadeIn',
  delay = 0,
  duration = 600,
  threshold = 0.1
}) => {
  const { ref, isVisible } = useScrollAnimation({ threshold });

  const getAnimationClasses = () => {
    const baseClasses = 'transition-all ease-out';
    
    if (!isVisible) {
      switch (animation) {
        case 'fadeIn':
          return `${baseClasses} opacity-0`;
        case 'slideUp':
          return `${baseClasses} opacity-0 translate-y-8`;
        case 'slideLeft':
          return `${baseClasses} opacity-0 translate-x-8`;
        case 'slideRight':
          return `${baseClasses} opacity-0 -translate-x-8`;
        case 'scaleIn':
          return `${baseClasses} opacity-0 scale-95`;
        default:
          return `${baseClasses} opacity-0`;
      }
    }
    
    return `${baseClasses} opacity-100 translate-y-0 translate-x-0 scale-100`;
  };

  return (
    <div
      ref={ref}
      className={`${getAnimationClasses()} ${className}`}
      style={{
        transitionDuration: `${duration}ms`,
        transitionDelay: `${delay}ms`
      }}
    >
      {children}
    </div>
  );
};

// Komponente für gestaffelte Animationen
interface StaggeredContainerProps {
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
  animation?: 'fadeIn' | 'slideUp';
}

export const StaggeredContainer: React.FC<StaggeredContainerProps> = ({
  children,
  className = '',
  staggerDelay = 100,
  animation = 'fadeIn'
}) => {
  const childrenArray = React.Children.toArray(children);
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.1 });

  return (
    <div ref={ref} className={className}>
      {childrenArray.map((child, index) => (
        <AnimatedSection
          key={index}
          animation={animation}
          delay={isVisible ? index * staggerDelay : 0}
          duration={600}
        >
          {child}
        </AnimatedSection>
      ))}
    </div>
  );
};

export default AnimatedSection;
