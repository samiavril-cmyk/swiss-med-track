import React, { useState, useEffect } from 'react';
import { ProgressBar } from './ProgressBar';
import { ProgressRing } from './ProgressRing';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Play, RotateCcw } from 'lucide-react';

interface PGYLevel {
  level: number;
  title: string;
  procedures: number;
  required: number;
  courses: number;
  cmePoints: number;
}

const pgyData: PGYLevel[] = [
  { level: 1, title: 'PGY1 - Foundation', procedures: 45, required: 60, courses: 3, cmePoints: 25 },
  { level: 2, title: 'PGY2 - Core Skills', procedures: 85, required: 120, courses: 5, cmePoints: 40 },
  { level: 3, title: 'PGY3 - Specialization', procedures: 140, required: 180, courses: 4, cmePoints: 35 },
  { level: 4, title: 'PGY4 - Advanced', procedures: 200, required: 250, courses: 6, cmePoints: 50 },
  { level: 5, title: 'PGY5 - Expert', procedures: 180, required: 200, courses: 3, cmePoints: 30 },
  { level: 6, title: 'PGY6 - Senior', procedures: 95, required: 100, courses: 2, cmePoints: 20 }
];

export const InteractiveProgressDemo: React.FC = () => {
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const [animationProgress, setAnimationProgress] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isAnimating) {
      const interval = setInterval(() => {
        setAnimationProgress(prev => {
          if (prev >= 100) {
            setIsAnimating(false);
            return 100;
          }
          return prev + 2;
        });
      }, 50);
      return () => clearInterval(interval);
    }
  }, [isAnimating]);

  const startDemo = () => {
    setAnimationProgress(0);
    setIsAnimating(true);
    setSelectedLevel(null);
  };

  const resetDemo = () => {
    setAnimationProgress(0);
    setIsAnimating(false);
    setSelectedLevel(null);
  };

  const getOverallProgress = () => {
    const totalCompleted = pgyData.reduce((sum, level) => 
      sum + Math.min(level.procedures, level.required), 0
    );
    const totalRequired = pgyData.reduce((sum, level) => sum + level.required, 0);
    return Math.round((totalCompleted / totalRequired) * 100);
  };

  const getPGYProgress = (level: PGYLevel) => {
    return Math.round((level.procedures / level.required) * 100);
  };

  const getPGYBadgeVariant = (progress: number) => {
    if (progress >= 90) return 'default';
    if (progress >= 70) return 'secondary';
    return 'outline';
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      {/* Demo Controls */}
      <div className="flex justify-center gap-4 mb-8">
        <Button
          onClick={startDemo}
          variant="medical"
          size="lg"
          className="gap-2"
          disabled={isAnimating}
        >
          <Play className="w-4 h-4" />
          {isAnimating ? 'Demo läuft...' : 'Demo starten'}
        </Button>
        <Button
          onClick={resetDemo}
          variant="outline"
          size="lg"
          className="gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          Zurücksetzen
        </Button>
      </div>

      {/* Overall Progress */}
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold mb-4 text-card-foreground">
          FMH Ausbildungsfortschritt - Gesamtübersicht
        </h3>
        <div className="flex justify-center">
          <ProgressRing
            progress={isAnimating ? Math.min(animationProgress, getOverallProgress()) : getOverallProgress()}
            variant="large"
            label="Gesamtfortschritt"
            className="mb-6"
          />
        </div>
      </div>

      {/* PGY Level Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {pgyData.map((level, index) => {
          const progress = getPGYProgress(level);
          const displayProgress = isAnimating 
            ? Math.min(animationProgress * 0.8 + index * 5, progress)
            : progress;
          
          return (
            <Card
              key={level.level}
              className={`medical-card p-6 cursor-pointer transition-all duration-300 ${
                selectedLevel === level.level 
                  ? 'ring-2 ring-medical-primary shadow-medical scale-105' 
                  : 'hover:shadow-card'
              }`}
              onClick={() => setSelectedLevel(
                selectedLevel === level.level ? null : level.level
              )}
            >
              <div className="flex items-center justify-between mb-4">
                <Badge variant={getPGYBadgeVariant(progress)} className="text-sm font-semibold">
                  PGY{level.level}
                </Badge>
                <span className="text-2xl font-bold text-medical-primary">
                  {Math.round(displayProgress)}%
                </span>
              </div>
              
              <h4 className="font-semibold text-card-foreground mb-3">
                {level.title}
              </h4>
              
              <ProgressBar
                progress={displayProgress}
                variant="medical"
                className="mb-4"
              />
              
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex justify-between">
                  <span>Prozeduren:</span>
                  <span className="font-medium">
                    {level.procedures}/{level.required}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Kurse:</span>
                  <span className="font-medium">{level.courses}</span>
                </div>
                <div className="flex justify-between">
                  <span>CME Punkte:</span>
                  <span className="font-medium">{level.cmePoints}</span>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Selected Level Details */}
      {selectedLevel && (
        <Card className="medical-card p-6 bg-gradient-hero">
          <div className="text-center">
            <h4 className="text-xl font-bold mb-4 text-card-foreground">
              {pgyData.find(l => l.level === selectedLevel)?.title} - Detailansicht
            </h4>
            <p className="text-muted-foreground mb-4">
              Hier würden detaillierte Informationen zu spezifischen Prozeduren, 
              absolvierten Kursen und fehlenden Anforderungen angezeigt.
            </p>
            <div className="flex justify-center gap-4">
              <Button variant="medical" size="sm">
                Prozeduren anzeigen
              </Button>
              <Button variant="swiss" size="sm">
                Passende Kurse finden
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};