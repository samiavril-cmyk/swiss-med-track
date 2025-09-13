import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { useEffect } from "react";
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
import { AuthProvider } from "./hooks/useAuth";
import ErrorBoundary from "./components/ErrorBoundary";

const queryClient = new QueryClient();

// Component to handle SPA routing on GitHub Pages
const SPARouter = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if there's an intended route stored in sessionStorage
    const intendedRoute = sessionStorage.getItem('intendedRoute');
    if (intendedRoute) {
      // Clear the stored route
      sessionStorage.removeItem('intendedRoute');
      // Navigate to the intended route
      navigate(intendedRoute);
    }
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

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ErrorBoundary>
        <Toaster />
        <Sonner />
        <BrowserRouter basename="/swiss-med-track">
          <SPARouter />
        </BrowserRouter>
      </ErrorBoundary>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
