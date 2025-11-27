import { useStore } from "@/lib/mockData";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Swords } from "lucide-react";
import { useLocation } from "wouter";
import generatedImage from "@assets/generated_images/dark_fantasy_map_texture_background.png";

export default function Login() {
  const { users, login } = useStore();
  const [, setLocation] = useLocation();

  const handleLogin = (userId: string) => {
    login(userId);
    setLocation("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative bg-background overflow-hidden">
      {/* Background Texture */}
      <div 
        className="absolute inset-0 opacity-20 pointer-events-none mix-blend-overlay"
        style={{ backgroundImage: `url(${generatedImage})`, backgroundSize: 'cover' }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/90 pointer-events-none" />

      <Card className="w-[400px] z-10 border-primary/20 bg-card/80 backdrop-blur-md shadow-2xl shadow-primary/5">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center border border-primary/40 mb-4 ring-4 ring-primary/5">
            <Swords className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-3xl font-display font-bold text-primary tracking-wider">GuildHall</CardTitle>
          <CardDescription>Enter the hunt management system</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3">
            <Label className="text-xs uppercase tracking-widest text-muted-foreground">Select User Role Demo</Label>
            {users.map(user => (
              <Button 
                key={user.id} 
                variant="outline" 
                className="w-full justify-between h-12 border-border/50 hover:border-primary/50 hover:bg-primary/5 group"
                onClick={() => handleLogin(user.id)}
              >
                <span className="font-medium group-hover:text-primary transition-colors">{user.username}</span>
                <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded uppercase">{user.role}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
