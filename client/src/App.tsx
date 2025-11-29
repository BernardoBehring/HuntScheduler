import { useEffect, useState } from "react";
import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Login from "@/pages/login";
import AdminRequests from "@/pages/admin/requests";
import AdminPeriods from "@/pages/admin/periods";
import AdminRespawns from "@/pages/admin/respawns";
import AdminServers from "@/pages/admin/servers";
import AdminUsers from "@/pages/admin/users";
import AdminHistory from "@/pages/admin/history";
import AdminClaims from "@/pages/admin/claims";
import { HuntSchedule } from "@/components/hunt-schedule";
import { Layout } from "@/components/layout";
import { useStore } from "@/lib/mockData";
import { useTranslation } from "react-i18next";
import { Loader2 } from "lucide-react";

function ProtectedRoute({ component: Component, adminOnly = false }: { component: React.ComponentType, adminOnly?: boolean }) {
  const { currentUser, getRoleName } = useStore();

  if (!currentUser) return <Redirect to="/login" />;
  if (adminOnly && getRoleName(currentUser.roleId) !== 'admin') return <Redirect to="/" />;

  return <Component />;
}

function SchedulePage() {
  const { t } = useTranslation();
  return (
    <Layout>
      <h1 className="text-3xl font-display font-bold text-primary mb-6">{t('schedule.title')}</h1>
      <HuntSchedule />
    </Layout>
  );
}

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}

function Router() {
  const [isInitializing, setIsInitializing] = useState(true);
  const { loadFromApi, checkAuth } = useStore();

  useEffect(() => {
    const initialize = async () => {
      await Promise.all([
        loadFromApi(),
        checkAuth()
      ]);
      setIsInitializing(false);
    };
    initialize();
  }, [loadFromApi, checkAuth]);

  if (isInitializing) {
    return <LoadingScreen />;
  }

  return (
    <Switch>
      <Route path="/login" component={Login} />
      
      <Route path="/">
        <Dashboard />
      </Route>
      
      <Route path="/schedule">
        <SchedulePage />
      </Route>
      
      <Route path="/admin">
        <ProtectedRoute component={AdminRequests} adminOnly />
      </Route>
      
      <Route path="/admin/periods">
        <ProtectedRoute component={AdminPeriods} adminOnly />
      </Route>
      
      <Route path="/admin/respawns">
        <ProtectedRoute component={AdminRespawns} adminOnly />
      </Route>
      
      <Route path="/admin/servers">
        <ProtectedRoute component={AdminServers} adminOnly />
      </Route>
      
      <Route path="/admin/users">
        <ProtectedRoute component={AdminUsers} adminOnly />
      </Route>
      
      <Route path="/admin/history">
        <ProtectedRoute component={AdminHistory} adminOnly />
      </Route>
      
      <Route path="/admin/claims">
        <ProtectedRoute component={AdminClaims} adminOnly />
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
