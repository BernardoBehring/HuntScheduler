import { Link, useLocation, Redirect } from "wouter";
import { useStore } from "@/lib/mockData";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { 
  LayoutDashboard, 
  Shield, 
  LogOut, 
  Swords, 
  Scroll, 
  Users,
  Menu,
  X,
  Globe,
  ClipboardList,
  Calendar,
  MapPin,
  Server,
  History,
  FileCheck,
  ChevronLeft
} from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { languages } from "@/i18n";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import generatedImage from "@assets/generated_images/dark_fantasy_map_texture_background.png";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
  description?: string;
}

export function AdminLayout({ children, title, description }: AdminLayoutProps) {
  const [location, setLocation] = useLocation();
  const { currentUser, logout, getRoleName } = useStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t, i18n } = useTranslation();

  const { data: pointClaims = [] } = useQuery({
    queryKey: ['pointClaims', 'all'],
    queryFn: () => api.pointClaims.getAll(),
  });

  const pendingClaimsCount = pointClaims.filter(c => c.status === 'pending').length;

  const handleLogout = () => {
    logout();
    setLocation("/login");
  };

  if (!currentUser) {
    return <Redirect to="/login" />;
  }

  if (getRoleName(currentUser.roleId) !== "admin") {
    return <Redirect to="/" />;
  }

  const adminNavItems = [
    { href: "/admin", label: t('admin.tabs.requests'), icon: ClipboardList },
    { href: "/admin/periods", label: t('admin.tabs.periods'), icon: Calendar },
    { href: "/admin/respawns", label: t('admin.tabs.respawns'), icon: MapPin },
    { href: "/admin/servers", label: t('admin.tabs.servers'), icon: Server },
    { href: "/admin/users", label: t('admin.tabs.users'), icon: Users },
    { href: "/admin/history", label: t('admin.tabs.pointsHistory'), icon: History },
    { href: "/admin/claims", label: t('admin.tabs.claims'), icon: FileCheck, badge: pendingClaimsCount },
  ];

  const resolvedLang = i18n.resolvedLanguage || i18n.language?.split('-')[0] || 'en';

  return (
    <div className="min-h-screen flex bg-background text-foreground font-sans selection:bg-primary/20">
      <div 
        className="fixed inset-0 z-0 opacity-10 pointer-events-none mix-blend-overlay"
        style={{ backgroundImage: `url(${generatedImage})`, backgroundSize: 'cover' }}
      />

      <header className="fixed top-0 left-0 right-0 h-14 bg-card/90 backdrop-blur-md border-b border-border/40 z-50 md:hidden flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          <span className="font-display font-bold text-primary">{t('admin.title')}</span>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Globe className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {languages.map((lang) => (
                <DropdownMenuItem
                  key={lang.code}
                  onClick={() => i18n.changeLanguage(lang.code)}
                  className={cn(resolvedLang === lang.code && "bg-primary/10")}
                >
                  <span className="mr-2">{lang.flag}</span>
                  {lang.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </header>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden" onClick={() => setMobileMenuOpen(false)}>
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
          <nav className="absolute top-14 left-0 right-0 bg-card border-b border-border/40 p-4 space-y-1 max-h-[70vh] overflow-y-auto">
            <Link 
              href="/"
              className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground rounded-md hover:bg-accent/10 mb-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              <ChevronLeft className="h-4 w-4" />
              {t('nav.dashboard')}
            </Link>
            <div className="border-t border-border/40 pt-2">
              {adminNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = location === item.href || (item.href !== "/admin" && location.startsWith(item.href));
                const isExactMatch = location === item.href;
                const shouldHighlight = item.href === "/admin" ? isExactMatch : isActive;
                return (
                  <Link 
                    key={item.href} 
                    href={item.href} 
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-200",
                      shouldHighlight
                        ? "bg-primary/10 text-primary border border-primary/20" 
                        : "text-muted-foreground hover:bg-accent/5"
                    )}
                  >
                    <Icon className={cn("h-4 w-4", shouldHighlight ? "text-primary" : "text-muted-foreground")} />
                    <span className="text-sm font-medium">{item.label}</span>
                    {item.badge && item.badge > 0 && (
                      <Badge variant="destructive" className="ml-auto h-5 min-w-5 px-1.5 flex items-center justify-center text-xs">
                        {item.badge}
                      </Badge>
                    )}
                  </Link>
                );
              })}
            </div>
            <div className="pt-2 border-t border-border/40 mt-2">
              <Button 
                variant="outline" 
                className="w-full justify-start gap-2 border-destructive/30 hover:bg-destructive/10 hover:text-destructive text-muted-foreground"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" />
                {t('auth.logout')}
              </Button>
            </div>
          </nav>
        </div>
      )}
      
      <aside className="w-64 border-r border-border/40 bg-card/50 backdrop-blur-sm z-10 hidden md:flex flex-col fixed h-full">
        <div className="p-4 border-b border-border/40">
          <Link href="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-3">
            <ChevronLeft className="h-4 w-4" />
            {t('nav.dashboard')}
          </Link>
          <h1 className="text-xl font-display font-bold text-primary flex items-center gap-2">
            <Shield className="h-5 w-5" />
            {t('admin.title')}
          </h1>
          <Badge variant="outline" className="mt-2 border-primary/50 text-primary text-xs">
            {t('admin.accessGranted')}
          </Badge>
        </div>

        <ScrollArea className="flex-1 py-3">
          <nav className="px-3 space-y-1">
            {adminNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.href || (item.href !== "/admin" && location.startsWith(item.href));
              const isExactMatch = location === item.href;
              const shouldHighlight = item.href === "/admin" ? isExactMatch : isActive;
              return (
                <Link key={item.href} href={item.href} className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-200 group cursor-pointer",
                    shouldHighlight
                      ? "bg-primary/10 text-primary border border-primary/20 shadow-[0_0_15px_-3px_var(--color-primary)]" 
                      : "hover:bg-accent/5 text-muted-foreground hover:text-foreground"
                  )}>
                    <Icon className={cn("h-4 w-4", shouldHighlight ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
                    <span className="text-sm font-medium flex-1">{item.label}</span>
                    {item.badge && item.badge > 0 && (
                      <Badge variant="destructive" className="h-5 min-w-5 px-1.5 flex items-center justify-center text-xs">
                        {item.badge}
                      </Badge>
                    )}
                </Link>
              );
            })}
          </nav>
        </ScrollArea>

        <div className="p-3 border-t border-border/40 bg-background/20">
          <div className="flex items-center gap-2 mb-3 px-2">
            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
              <span className="font-display font-bold text-primary text-sm">{currentUser.username[0]}</span>
            </div>
            <div className="overflow-hidden flex-1">
              <p className="font-medium truncate text-sm">{currentUser.username}</p>
              <p className="text-xs text-primary">{t('roles.admin')}</p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <Globe className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {languages.map((lang) => (
                  <DropdownMenuItem
                    key={lang.code}
                    onClick={() => i18n.changeLanguage(lang.code)}
                    className={cn(resolvedLang === lang.code && "bg-primary/10")}
                  >
                    <span className="mr-2">{lang.flag}</span>
                    {lang.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            className="w-full justify-start gap-2 border-destructive/30 hover:bg-destructive/10 hover:text-destructive text-muted-foreground"
            onClick={handleLogout}
          >
            <LogOut className="h-3.5 w-3.5" />
            {t('auth.logout')}
          </Button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden relative z-10 pt-14 md:pt-0 md:ml-64">
        <div className="flex-1 overflow-auto p-4 md:p-6">
          <div className="max-w-6xl mx-auto space-y-4 pb-20 animate-in fade-in duration-500">
            <div className="mb-6">
              <h1 className="text-2xl font-display font-bold text-primary">{title}</h1>
              {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
            </div>
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
