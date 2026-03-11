import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
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
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppShell>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/tasks" element={<Tasks />} />
              <Route path="/groceries" element={<Groceries />} />
              <Route path="/meals" element={<Meals />} />
              <Route path="/trips" element={<Trips />} />
              <Route path="/shopping" element={<ShoppingList />} />
              <Route path="/reminders" element={<Reminders />} />
              <Route path="/maintenance" element={<Maintenance />} />
              <Route path="/notes" element={<Notes />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AppShell>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
