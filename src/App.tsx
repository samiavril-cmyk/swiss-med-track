import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Index from "./pages/Index";
import { Dashboard } from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Courses from "./pages/Courses";
import CourseDetail from "./pages/CourseDetail";
import { FMHDashboard } from "./pages/FMHDashboard";
import SupervisorDashboard from "./pages/SupervisorDashboard";
import Features from "./pages/Features";
import Contact from "./pages/Contact";
import { AdminCMS } from "./pages/AdminCMS";
import Publications from "./pages/Publications";
import AuthNew from "./pages/AuthNew";
import NotFound from "./pages/NotFound";
import { AuthProviderResilient } from "./hooks/useAuthResilient";
import AuthErrorBoundary from "./components/AuthErrorBoundary";
import { AuthHealthMonitor } from "./components/AuthHealthMonitor";
import { useAuthResilient } from "./hooks/useAuthResilient";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    },
    mutations: {
      retry: 2,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    },
  },
});

// Component to handle SPA routing on GitHub Pages
const SPARouter = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // HashRouter handles routing automatically, no special SPA logic needed
    console.log('HashRouter initialized, current hash:', window.location.hash);
  }, [navigate]);

  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/auth" element={<AuthNew />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/courses" element={<Courses />} />
      <Route path="/courses/:id" element={<CourseDetail />} />
      <Route path="/publications" element={<Publications />} />
      <Route path="/profile/:handle" element={<Profile />} />
      <Route path="/fmh" element={<FMHDashboard />} />
      <Route path="/supervisor" element={<SupervisorDashboard />} />
      <Route path="/features" element={<Features />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/admin" element={<AdminCMS />} />
      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

// Health Monitor Component
const HealthMonitorWrapper = () => {
  const { retryAuth, refreshProfile } = useAuthResilient();
  const [healthStatus, setHealthStatus] = useState({
    isOnline: navigator.onLine,
    isHealthy: true,
    lastCheck: Date.now(),
    responseTime: 0,
    errorCount: 0,
    retryCount: 0,
    circuitBreakerState: 'CLOSED' as const,
    cacheStats: { size: 0, keys: [] }
  });

  const handleRefresh = async () => {
    const startTime = Date.now();
    try {
      await refreshProfile();
      setHealthStatus(prev => ({
        ...prev,
        isHealthy: true,
        lastCheck: Date.now(),
        responseTime: Date.now() - startTime,
        errorCount: 0
      }));
    } catch (error) {
      setHealthStatus(prev => ({
        ...prev,
        isHealthy: false,
        lastCheck: Date.now(),
        responseTime: Date.now() - startTime,
        errorCount: prev.errorCount + 1
      }));
    }
  };

  const handleRetry = async () => {
    setHealthStatus(prev => ({ ...prev, retryCount: prev.retryCount + 1 }));
    await retryAuth();
  };

  // Online/Offline detection
  useEffect(() => {
    const handleOnline = () => setHealthStatus(prev => ({ ...prev, isOnline: true }));
    const handleOffline = () => setHealthStatus(prev => ({ ...prev, isOnline: false }));

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <AuthHealthMonitor
      healthStatus={healthStatus}
      onRefresh={handleRefresh}
      onRetry={handleRetry}
    />
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProviderResilient>
      <AuthErrorBoundary>
        <Toaster />
        <Sonner />
        <HashRouter>
          <SPARouter />
        </HashRouter>
        <HealthMonitorWrapper />
      </AuthErrorBoundary>
    </AuthProviderResilient>
  </QueryClientProvider>
);

export default App;
