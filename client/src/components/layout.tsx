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
  Users 
} from "lucide-react";
import generatedImage from "@assets/generated_images/dark_fantasy_map_texture_background.png";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const { currentUser, logout, getRoleName } = useStore();

  const handleLogout = () => {
    logout();
    setLocation("/login");
  };

  if (!currentUser) {
    return <Redirect to="/login" />;
  }

  const navItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/schedule", label: "Hunt Schedule", icon: Scroll },
  ];

  if (getRoleName(currentUser.roleId) === "admin") {
    navItems.push({ href: "/admin", label: "Admin Panel", icon: Shield });
  }

  return (
    <div className="min-h-screen flex bg-background text-foreground font-sans selection:bg-primary/20">
      {/* Background Texture Overlay */}
      <div 
        className="fixed inset-0 z-0 opacity-10 pointer-events-none mix-blend-overlay"
        style={{ backgroundImage: `url(${generatedImage})`, backgroundSize: 'cover' }}
      />
      
      {/* Sidebar */}
      <aside className="w-64 border-r border-border/40 bg-card/50 backdrop-blur-sm z-10 hidden md:flex flex-col">
        <div className="p-6 border-b border-border/40">
          <h1 className="text-2xl font-display font-bold text-primary flex items-center gap-2">
            <Swords className="h-6 w-6" />
            GuildHall
          </h1>
          <p className="text-xs text-muted-foreground mt-1">Tibia Hunt Manager</p>
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
            <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
              <span className="font-display font-bold text-primary">{currentUser.username[0]}</span>
            </div>
            <div className="overflow-hidden">
              <p className="font-medium truncate text-sm">{currentUser.username}</p>
              <p className="text-xs text-primary flex items-center gap-1">
                <Users className="h-3 w-3" />
                {currentUser.points} pts
              </p>
            </div>
          </div>
          <Button 
            variant="outline" 
            className="w-full justify-start gap-2 border-destructive/30 hover:bg-destructive/10 hover:text-destructive text-muted-foreground"
            onClick={handleLogout}
            data-testid="button-logout"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative z-10">
        <div className="flex-1 overflow-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto space-y-8 pb-20 animate-in fade-in duration-500">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
