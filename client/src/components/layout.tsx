import { Link, useLocation, Redirect } from "wouter";
import { useStore } from "@/lib/mockData";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  UserCircle
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

export function Layout({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const { currentUser, logout, getRoleName } = useStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t, i18n } = useTranslation();

  const handleLogout = () => {
    logout();
    setLocation("/login");
  };

  if (!currentUser) {
    return <Redirect to="/login" />;
  }

  const navItems = [
    { href: "/", label: t('nav.dashboard'), icon: LayoutDashboard },
    { href: "/schedule", label: t('nav.huntSchedule'), icon: Scroll },
    { href: "/characters", label: t('nav.myCharacters'), icon: UserCircle },
    { href: "/profile", label: t('nav.profile'), icon: Users },
  ];

  if (getRoleName(currentUser.roleId) === "admin") {
    navItems.push({ href: "/admin", label: t('nav.adminPanel'), icon: Shield });
  }

  const resolvedLang = i18n.resolvedLanguage || i18n.language?.split('-')[0] || 'en';
  const currentLanguage = languages.find(l => l.code === resolvedLang) || languages[0];

  return (
    <div className="min-h-screen flex bg-background text-foreground font-sans selection:bg-primary/20">
      {/* Background Texture Overlay */}
      <div 
        className="fixed inset-0 z-0 opacity-10 pointer-events-none mix-blend-overlay"
        style={{ backgroundImage: `url(${generatedImage})`, backgroundSize: 'cover' }}
      />

      {/* Mobile Header */}
      <header className="fixed top-0 left-0 right-0 h-14 bg-card/90 backdrop-blur-md border-b border-border/40 z-50 md:hidden flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Swords className="h-5 w-5 text-primary" />
          <span className="font-display font-bold text-primary">{t('app.name')}</span>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" data-testid="button-language-mobile">
                <Globe className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {languages.map((lang) => (
                <DropdownMenuItem
                  key={lang.code}
                  onClick={() => i18n.changeLanguage(lang.code)}
                  className={cn(i18n.language === lang.code && "bg-primary/10")}
                  data-testid={`language-option-${lang.code}`}
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
            data-testid="button-mobile-menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden" onClick={() => setMobileMenuOpen(false)}>
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
          <nav className="absolute top-14 left-0 right-0 bg-card border-b border-border/40 p-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.href;
              return (
                <Link 
                  key={item.href} 
                  href={item.href} 
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-md transition-all duration-200",
                    isActive 
                      ? "bg-primary/10 text-primary border border-primary/20" 
                      : "text-muted-foreground"
                  )}
                >
                  <Icon className={cn("h-5 w-5", isActive ? "text-primary" : "text-muted-foreground")} />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
            <div className="pt-2 border-t border-border/40 mt-2">
              <Link 
                href="/profile" 
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-2 mb-2 rounded-md hover:bg-accent/10 transition-colors cursor-pointer"
                data-testid="link-profile-mobile"
              >
                <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
                  <span className="font-display font-bold text-primary text-sm">{currentUser.username[0]}</span>
                </div>
                <div>
                  <p className="font-medium text-sm">{currentUser.username}</p>
                  <p className="text-xs text-primary">{currentUser.points} {t('common.points')}</p>
                </div>
              </Link>
              <Button 
                variant="outline" 
                className="w-full justify-start gap-2 border-destructive/30 hover:bg-destructive/10 hover:text-destructive text-muted-foreground"
                onClick={handleLogout}
                data-testid="button-logout-mobile"
              >
                <LogOut className="h-4 w-4" />
                {t('auth.logout')}
              </Button>
            </div>
          </nav>
        </div>
      )}
      
      {/* Sidebar - Desktop */}
      <aside className="w-64 border-r border-border/40 bg-card/50 backdrop-blur-sm z-10 hidden md:flex flex-col">
        <div className="p-6 border-b border-border/40">
          <h1 className="text-2xl font-display font-bold text-primary flex items-center gap-2">
            <Swords className="h-6 w-6" />
            {t('app.name')}
          </h1>
          <p className="text-xs text-muted-foreground mt-1">{t('app.tagline')}</p>
        </div>

        <ScrollArea className="flex-1 py-4">
          <nav className="px-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.href;
              return (
                <Link key={item.href} href={item.href} className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-md transition-all duration-200 group cursor-pointer",
                    isActive 
                      ? "bg-primary/10 text-primary border border-primary/20 shadow-[0_0_15px_-3px_var(--color-primary)]" 
                      : "hover:bg-accent/5 text-muted-foreground hover:text-foreground"
                  )}>
                    <Icon className={cn("h-5 w-5", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
                    <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </ScrollArea>

        <div className="p-4 border-t border-border/40 bg-background/20">
          <div className="flex items-center gap-3 mb-4">
            <Link 
              href="/profile" 
              className="flex items-center gap-3 flex-1 rounded-md hover:bg-accent/10 transition-colors cursor-pointer p-1 -m-1"
              data-testid="link-profile-desktop"
            >
              <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
                <span className="font-display font-bold text-primary">{currentUser.username[0]}</span>
              </div>
              <div className="overflow-hidden flex-1">
                <p className="font-medium truncate text-sm">{currentUser.username}</p>
                <p className="text-xs text-primary flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {currentUser.points} {t('common.points')}
                </p>
              </div>
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8" data-testid="button-language">
                  <Globe className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {languages.map((lang) => (
                  <DropdownMenuItem
                    key={lang.code}
                    onClick={() => i18n.changeLanguage(lang.code)}
                    className={cn(resolvedLang === lang.code && "bg-primary/10")}
                    data-testid={`language-option-${lang.code}`}
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
            className="w-full justify-start gap-2 border-destructive/30 hover:bg-destructive/10 hover:text-destructive text-muted-foreground"
            onClick={handleLogout}
            data-testid="button-logout"
          >
            <LogOut className="h-4 w-4" />
            {t('auth.logout')}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative z-10 pt-14 md:pt-0">
        <div className="flex-1 overflow-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto space-y-6 md:space-y-8 pb-20 animate-in fade-in duration-500">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
