import React from 'react';
import { cn } from '@/lib/utils';

interface ProgressBarProps {
  progress: number;
  label?: string;
  showPercentage?: boolean;
  variant?: 'default' | 'medical' | 'compact';
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  label,
  showPercentage = true,
  variant = 'default',
  className
}) => {
  const clampedProgress = Math.min(Math.max(progress, 0), 100);
  
  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-progress-complete';
    if (progress >= 50) return 'bg-progress-partial';
    return 'bg-progress-pending';
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'medical':
        return {
          container: 'h-3 bg-swiss-gray rounded-full overflow-hidden shadow-progress',
          bar: 'h-full transition-progress rounded-full bg-gradient-progress'
        };
      case 'compact':
        return {
          container: 'h-2 bg-swiss-gray rounded-full overflow-hidden',
          bar: 'h-full transition-progress rounded-full'
        };
      default:
        return {
          container: 'h-4 bg-swiss-gray rounded-full overflow-hidden shadow-card',
          bar: 'h-full transition-progress rounded-full'
        };
    }
  };

  const variantClasses = getVariantClasses();

  return (
    <div className={cn('w-full', className)}>
      {(label || showPercentage) && (
        <div className="flex justify-between items-center mb-2">
          {label && (
            <span className="text-sm font-medium text-card-foreground">
              {label}
            </span>
          )}
          {showPercentage && (
            <span className="text-sm font-medium text-muted-foreground">
              {clampedProgress}%
            </span>
          )}
        </div>
      )}
      <div className={variantClasses.container}>
        <div
          className={cn(variantClasses.bar, getProgressColor(clampedProgress))}
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
    </div>
  );
};