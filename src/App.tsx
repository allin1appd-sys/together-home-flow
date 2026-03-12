import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/hooks/useAuth";
import AuthGuard from "@/components/auth/AuthGuard";
import { AppShell } from "@/components/layout/AppShell";
import Index from "./pages/Index";
import Tasks from "./pages/Tasks";
import Groceries from "./pages/Groceries";
import Meals from "./pages/Meals";
import Trips from "./pages/Trips";
import ShoppingList from "./pages/ShoppingList";
import Settings from "./pages/Settings";
import Reminders from "./pages/Reminders";
import Maintenance from "./pages/Maintenance";
import Notes from "./pages/Notes";
import Budget from "./pages/Budget";
import PhoneSignup from "./pages/PhoneSignup";
import JoinHousehold from "./pages/JoinHousehold";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              {/* Public routes */}
              <Route path="/phone-signup" element={<PhoneSignup />} />
              <Route path="/join/:code" element={<JoinHousehold />} />

              {/* Protected routes */}
              <Route path="/" element={<AuthGuard><AppShell><Index /></AppShell></AuthGuard>} />
              <Route path="/tasks" element={<AuthGuard><AppShell><Tasks /></AppShell></AuthGuard>} />
              <Route path="/groceries" element={<AuthGuard><AppShell><Groceries /></AppShell></AuthGuard>} />
              <Route path="/meals" element={<AuthGuard><AppShell><Meals /></AppShell></AuthGuard>} />
              <Route path="/trips" element={<AuthGuard><AppShell><Trips /></AppShell></AuthGuard>} />
              <Route path="/shopping" element={<AuthGuard><AppShell><ShoppingList /></AppShell></AuthGuard>} />
              <Route path="/reminders" element={<AuthGuard><AppShell><Reminders /></AppShell></AuthGuard>} />
              <Route path="/maintenance" element={<AuthGuard><AppShell><Maintenance /></AppShell></AuthGuard>} />
              <Route path="/notes" element={<AuthGuard><AppShell><Notes /></AppShell></AuthGuard>} />
              <Route path="/budget" element={<AuthGuard><AppShell><Budget /></AppShell></AuthGuard>} />
              <Route path="/settings" element={<AuthGuard><AppShell><Settings /></AppShell></AuthGuard>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
