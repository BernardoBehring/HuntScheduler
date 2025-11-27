import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Login from "@/pages/login";
import Admin from "@/pages/admin";
import { HuntSchedule } from "@/components/hunt-schedule";
import { Layout } from "@/components/layout";
import { useStore } from "@/lib/mockData";

function ProtectedRoute({ component: Component, adminOnly = false }: { component: React.ComponentType, adminOnly?: boolean }) {
  const { currentUser } = useStore();

  if (!currentUser) return <Redirect to="/login" />;
  if (adminOnly && currentUser.role !== 'admin') return <Redirect to="/" />;

  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      
      <Route path="/">
        <Dashboard />
      </Route>
      
      <Route path="/schedule">
        <Layout>
           <h1 className="text-3xl font-display font-bold text-primary mb-6">Hunt Schedule</h1>
           <HuntSchedule />
        </Layout>
      </Route>
      
      <Route path="/admin">
        <ProtectedRoute component={Admin} adminOnly />
      </Route>
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
