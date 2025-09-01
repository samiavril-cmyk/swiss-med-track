import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { User, BookOpen, GraduationCap, LogOut, Settings } from 'lucide-react';

// Simplified Header for Index page - no auth dependencies
export const Header: React.FC = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-card-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-medical rounded-medical flex items-center justify-center">
            <GraduationCap className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-card-foreground">ResidentTrack</h1>
            <p className="text-xs text-muted-foreground">FMH Medical Training</p>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-card-foreground transition-colors">
            Features
          </a>
          <Link to="/courses" className="text-sm font-medium text-muted-foreground hover:text-card-foreground transition-colors">
            Courses
          </Link>
          <a href="#contact" className="text-sm font-medium text-muted-foreground hover:text-card-foreground transition-colors">
            Kontakt
          </a>
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <Link to="/auth">
            <Button variant="default" size="sm">
              <User className="h-4 w-4 mr-2" />
              Anmelden
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
};