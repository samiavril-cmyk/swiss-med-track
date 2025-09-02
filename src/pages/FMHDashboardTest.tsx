import React from 'react';
import { Header } from '@/components/Header';
import { Card } from '@/components/ui/card';

export const FMHDashboardTest: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <Card className="medical-card p-8">
          <h1 className="text-3xl font-bold text-card-foreground mb-4">
            FMH Dashboard Test
          </h1>
          <p className="text-muted-foreground">
            Diese Seite lädt korrekt. Das Problem liegt in der ursprünglichen FMHDashboard-Komponente.
          </p>
        </Card>
      </main>
    </div>
  );
};
