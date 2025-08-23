import React from 'react';
import { cn } from '@/lib/utils';

interface ProgressRingProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  showPercentage?: boolean;
  variant?: 'default' | 'medical' | 'large';
  className?: string;
}

export const ProgressRing: React.FC<ProgressRingProps> = ({
  progress,
  size = 120,
  strokeWidth = 8,
  label,
  showPercentage = true,
  variant = 'default',
  className
}) => {
  const clampedProgress = Math.min(Math.max(progress, 0), 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (clampedProgress / 100) * circumference;

  const getStrokeColor = (progress: number) => {
    if (progress >= 80) return 'stroke-progress-complete';
    if (progress >= 50) return 'stroke-progress-partial';
    return 'stroke-progress-pending';
  };

  const getSizeClasses = () => {
    switch (variant) {
      case 'medical':
        return { size: 140, strokeWidth: 10 };
      case 'large':
        return { size: 160, strokeWidth: 12 };
      default:
        return { size, strokeWidth };
    }
  };

  const variantSizes = getSizeClasses();

  return (
    <div className={cn('flex flex-col items-center', className)}>
      <div className="relative">
        <svg
          width={variantSizes.size}
          height={variantSizes.size}
          className="progress-ring"
        >
          {/* Background circle */}
          <circle
            cx={variantSizes.size / 2}
            cy={variantSizes.size / 2}
            r={radius}
            stroke="hsl(var(--swiss-gray))"
            strokeWidth={variantSizes.strokeWidth}
            fill="transparent"
          />
          {/* Progress circle */}
          <circle
            cx={variantSizes.size / 2}
            cy={variantSizes.size / 2}
            r={radius}
            stroke="url(#progressGradient)"
            strokeWidth={variantSizes.strokeWidth}
            fill="transparent"
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className={cn('transition-progress', getStrokeColor(clampedProgress))}
          />
          {/* Gradient definition */}
          <defs>
            <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: 'hsl(var(--progress-complete))' }} />
              <stop offset="100%" style={{ stopColor: 'hsl(var(--medical-primary))' }} />
            </linearGradient>
          </defs>
        </svg>
        
        {showPercentage && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xl font-bold text-card-foreground">
              {Math.round(clampedProgress)}%
            </span>
          </div>
        )}
      </div>
      
      {label && (
        <span className="mt-2 text-sm font-medium text-center text-muted-foreground">
          {label}
        </span>
      )}
    </div>
  );
};