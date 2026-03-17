import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate, useLocation } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import RecordPage from "./pages/RecordPage";
import RecordingsPage from "./pages/RecordingsPage";
import RecordingDetailPage from "./pages/RecordingDetailPage";
import DigestsPage from "./pages/DigestsPage";
import DigestDetailPage from "./pages/DigestDetailPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AuthGuard({ children }: { children: React.ReactNode }) {
  const isAuth = !!localStorage.getItem("token");
  const location = useLocation();
  if (!isAuth) return <Navigate to="/login" state={{ from: location }} replace />;
  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const isAuth = !!localStorage.getItem("token");
  if (isAuth) return <Navigate to="/" replace />;
  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
          <Route path="/" element={<AuthGuard><RecordPage /></AuthGuard>} />
          <Route path="/recordings" element={<AuthGuard><RecordingsPage /></AuthGuard>} />
          <Route path="/recordings/:id" element={<AuthGuard><RecordingDetailPage /></AuthGuard>} />
          <Route path="/digests" element={<AuthGuard><DigestsPage /></AuthGuard>} />
          <Route path="/digests/:id" element={<AuthGuard><DigestDetailPage /></AuthGuard>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
