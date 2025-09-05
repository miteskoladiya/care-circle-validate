import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Communities from "./pages/Communities.jsx";
import Admin from "./pages/Admin.jsx";
import NotFound from "./pages/NotFound.jsx";
import RequireAdmin from "./components/RequireAdmin.jsx";

const queryClient = new QueryClient();

// Toggle this flag to switch between smoke test UI and the full app.
const USE_SMOKE_TEST = false;

const FullApp = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/communities" element={<Communities />} />
          <Route path="/admin" element={<RequireAdmin><Admin /></RequireAdmin>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
)

const SmokeApp = () => (
  <div style={{ padding: 24 }}>
    <h1>CareCircle — smoke test</h1>
    <p>If you see this, React and Vite are working; the full app was replaced for diagnostics.</p>
    <p>Navigate to <code>/dashboard</code> or other routes when the full app is restored.</p>
  </div>
)

const App = USE_SMOKE_TEST ? SmokeApp : FullApp

export default App;
