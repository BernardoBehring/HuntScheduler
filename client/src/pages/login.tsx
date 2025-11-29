import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Swords, Globe, Loader2 } from "lucide-react";
import { useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import { languages } from "@/i18n";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { useStore } from "@/lib/mockData";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import generatedImage from "@assets/generated_images/dark_fantasy_map_texture_background.png";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { setCurrentUser, loadFromApi } = useStore();
  const [, setLocation] = useLocation();
  const { t, i18n } = useTranslation();
  const resolvedLang = i18n.resolvedLanguage || i18n.language?.split('-')[0] || 'en';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const user = await api.auth.login(username, password);
      setCurrentUser(user);
      await loadFromApi();
      setLocation("/");
    } catch (err: any) {
      setError(err.message || t('auth.invalidCredentials'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative bg-background overflow-hidden">
      <div 
        className="absolute inset-0 opacity-20 pointer-events-none mix-blend-overlay"
        style={{ backgroundImage: `url(${generatedImage})`, backgroundSize: 'cover' }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/90 pointer-events-none" />

      <div className="absolute top-4 right-4 z-20">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2 border-primary/30" data-testid="button-language-login">
              <Globe className="h-4 w-4" />
              {languages.find(l => l.code === resolvedLang)?.flag}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {languages.map((lang) => (
              <DropdownMenuItem
                key={lang.code}
                onClick={() => i18n.changeLanguage(lang.code)}
                className={cn(resolvedLang === lang.code && "bg-primary/10")}
                data-testid={`language-option-login-${lang.code}`}
              >
                <span className="mr-2">{lang.flag}</span>
                {lang.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Card className="w-[400px] z-10 border-primary/20 bg-card/80 backdrop-blur-md shadow-2xl shadow-primary/5">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center border border-primary/40 mb-4 ring-4 ring-primary/5">
            <Swords className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-3xl font-display font-bold text-primary tracking-wider">{t('app.name')}</CardTitle>
          <CardDescription>{t('app.enterSystem')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">{t('auth.username')}</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={t('auth.usernamePlaceholder')}
                disabled={isLoading}
                data-testid="input-username"
                className="bg-background/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t('auth.password')}</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('auth.passwordPlaceholder')}
                disabled={isLoading}
                data-testid="input-password"
                className="bg-background/50"
              />
            </div>
            
            {error && (
              <p className="text-sm text-destructive text-center" data-testid="text-error">{error}</p>
            )}

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading || !username || !password}
              data-testid="button-login"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('auth.loggingIn')}
                </>
              ) : (
                t('auth.login')
              )}
            </Button>

            <div className="text-xs text-muted-foreground text-center pt-2 space-y-1">
              <p>{t('auth.demoCredentials')}</p>
              <p className="font-mono bg-muted/30 p-2 rounded">admin / admin123</p>
              <p className="font-mono bg-muted/30 p-2 rounded">player1 / player123</p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
