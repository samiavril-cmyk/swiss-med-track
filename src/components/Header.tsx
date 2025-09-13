import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { GraduationCap, LogOut, Settings, User, Users } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export const Header: React.FC = () => {
  const { user, signOut, isAdmin, userProfile, loading } = useAuth();
  const navigate = useNavigate();
  
  // Debug logging
  console.log('[Header] Loading:', loading);
  console.log('[Header] User:', user?.email);
  console.log('[Header] UserProfile:', userProfile);
  console.log('[Header] UserProfile Role:', userProfile?.role);

  const handleSignOut = async () => {
    try {
      console.log('[Header] Starting sign out...');
      await signOut();
      console.log('[Header] Sign out completed, navigating to home...');
      // Force page reload to ensure clean state
      window.location.href = '/';
    } catch (error) {
      console.error('[Header] Error during sign out:', error);
      // Still navigate to home even if sign out fails
      window.location.href = '/';
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-card-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-medical overflow-hidden">
            <img 
              src="https://samiavril-cmyk.github.io/swiss-med-track/logo.png" 
              alt="ResidentTrack Logo" 
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <h1 className="text-xl font-bold text-card-foreground">ResidentTrack</h1>
            <p className="text-xs text-muted-foreground">FMH Medical Training</p>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {user ? (
            <>
              <Link to="/fmh" className="text-sm font-medium text-muted-foreground hover:text-card-foreground transition-colors">
                FMH Tracking
              </Link>
              <Link to="/dashboard" className="text-sm font-medium text-muted-foreground hover:text-card-foreground transition-colors">
                Dashboard
              </Link>
              <Link to="/courses" className="text-sm font-medium text-muted-foreground hover:text-card-foreground transition-colors">
                Courses
              </Link>
              <Link to="/publications" className="text-sm font-medium text-muted-foreground hover:text-card-foreground transition-colors">
                Publikationen
              </Link>
              {user && (userProfile?.role === 'supervisor' || userProfile?.role === 'admin' || isAdmin) && (
                <Link to="/supervisor" className="text-sm font-medium text-muted-foreground hover:text-card-foreground transition-colors flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  Supervisor
                </Link>
              )}
              {isAdmin && (
                <Link to="/admin" className="text-sm font-medium text-muted-foreground hover:text-card-foreground transition-colors flex items-center gap-1">
                  <Settings className="h-4 w-4" />
                  Admin
                </Link>
              )}
            </>
          ) : (
            <>
              <Link to="/features" className="text-sm font-medium text-muted-foreground hover:text-card-foreground transition-colors">
                Features
              </Link>
              <Link to="/courses" className="text-sm font-medium text-muted-foreground hover:text-card-foreground transition-colors">
                Courses
              </Link>
              <Link to="/contact" className="text-sm font-medium text-muted-foreground hover:text-card-foreground transition-colors">
                Kontakt
              </Link>
            </>
          )}
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          {loading ? (
            <div className="text-sm text-muted-foreground">Loading...</div>
          ) : user ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {userProfile?.full_name || user.email}
                </span>
              </div>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Abmelden
              </Button>
            </div>
          ) : (
            <>
              <Link to="/auth">
                <Button variant="ghost" size="sm" className="hidden md:inline-flex">
                  Anmelden
                </Button>
              </Link>
              <Link to="/auth">
                <Button variant="medical" size="sm">
                  Kostenlos testen
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
