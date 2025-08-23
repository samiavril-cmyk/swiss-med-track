import React from 'react';
import { cn } from '@/lib/utils';

interface ActivityRingProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  backgroundColor?: string;
  label?: string;
  showPercentage?: boolean;
  className?: string;
  onClick?: () => void;
  variant?: 'mint' | 'coral' | 'lavender' | 'amber';
}

export const ActivityRing: React.FC<ActivityRingProps> = ({
  progress,
  size = 80,
  strokeWidth = 6,
  color,
  backgroundColor = 'hsl(var(--swiss-gray))',
  label,
  showPercentage = false,
  className,
  onClick,
  variant = 'mint'
}) => {
  const clampedProgress = Math.min(Math.max(progress, 0), 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (clampedProgress / 100) * circumference;

  // Get color based on variant
  const getVariantColor = () => {
    if (color) return color;
    
    switch (variant) {
      case 'mint':
        return 'hsl(var(--activity-mint))';
      case 'coral':
        return 'hsl(var(--activity-coral))';
      case 'lavender':
        return 'hsl(var(--activity-lavender))';
      case 'amber':
        return 'hsl(var(--activity-amber))';
      default:
        return 'hsl(var(--activity-mint))';
    }
  };

  return (
    <div 
      className={cn(
        'flex flex-col items-center cursor-pointer transition-transform hover:scale-105',
        className
      )}
      onClick={onClick}
    >
      <div className="relative">
        <svg
          width={size}
          height={size}
          className="progress-ring -rotate-90"
        >
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={backgroundColor}
            strokeWidth={strokeWidth}
            fill="transparent"
            opacity={0.2}
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={getVariantColor()}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
            style={{
              transformOrigin: 'center',
            }}
          />
        </svg>
        
        {showPercentage && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm font-bold text-card-foreground">
              {Math.round(clampedProgress)}%
            </span>
          </div>
        )}
      </div>
      
      {label && (
        <span className="mt-1 text-xs font-medium text-center text-muted-foreground max-w-20">
          {label}
        </span>
      )}
    </div>
  );
};