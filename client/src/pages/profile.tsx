import { useTranslation } from "react-i18next";
import { Layout } from "@/components/layout";
import { useStore } from "@/lib/mockData";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Link } from "wouter";
import { languages } from "@/i18n";
import { cn } from "@/lib/utils";
import { 
  User, 
  Shield, 
  Award, 
  Swords, 
  Globe, 
  ChevronRight,
  Star,
  Calendar,
  Clock
} from "lucide-react";

export default function ProfilePage() {
  const { t, i18n } = useTranslation();
  const { currentUser, getRoleName } = useStore();

  const userId = currentUser?.id ? parseInt(currentUser.id) : undefined;

  const { data: characters = [] } = useQuery({
    queryKey: ['characters', 'user', userId],
    queryFn: () => userId ? api.characters.getByUser(userId) : Promise.resolve([]),
    enabled: !!userId,
  });

  const { data: requests = [] } = useQuery({
    queryKey: ['requests'],
    queryFn: () => api.requests.getAll(),
  });

  const { data: pointClaims = [] } = useQuery({
    queryKey: ['pointClaims', 'user', userId],
    queryFn: () => userId ? api.pointClaims.getByUser(userId) : Promise.resolve([]),
    enabled: !!userId,
  });

  const myRequests = requests.filter(r => r.userId === userId);
  const approvedRequests = myRequests.filter(r => r.statusId === 2);
  const pendingClaims = pointClaims.filter(c => c.status === 'pending');
  const approvedClaims = pointClaims.filter(c => c.status === 'approved');
  const mainCharacter = characters.find(c => c.isMain);

  const resolvedLang = i18n.resolvedLanguage || i18n.language?.split('-')[0] || 'en';
  const currentLanguage = languages.find(l => l.code === resolvedLang) || languages[0];

  const isAdmin = getRoleName(currentUser?.roleId || '') === 'admin';

  if (!currentUser) return null;

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-display font-bold text-primary">{t('profile.title')}</h1>
          <p className="text-muted-foreground mt-1">{t('profile.description')}</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                {t('profile.accountInfo')}
              </CardTitle>
              <CardDescription>{t('profile.accountInfoDesc')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center border-2 border-primary/30">
                  <span className="font-display font-bold text-primary text-2xl">
                    {currentUser.username[0].toUpperCase()}
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold">{currentUser.username}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    {isAdmin ? (
                      <Badge className="bg-primary/20 text-primary border-primary/30">
                        <Shield className="h-3 w-3 mr-1" />
                        {t('roles.admin')}
                      </Badge>
                    ) : (
                      <Badge variant="outline">
                        <User className="h-3 w-3 mr-1" />
                        {t('roles.user')}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">{t('profile.guildPoints')}</p>
                  <p className="text-2xl font-bold text-primary flex items-center gap-1">
                    <Award className="h-5 w-5" />
                    {currentUser.points}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">{t('profile.mainCharacter')}</p>
                  <p className="text-lg font-medium flex items-center gap-1">
                    {mainCharacter ? (
                      <>
                        <Star className="h-4 w-4 text-primary fill-primary" />
                        {mainCharacter.name}
                      </>
                    ) : (
                      <span className="text-muted-foreground">{t('profile.noMainCharacter')}</span>
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-primary" />
                {t('profile.preferences')}
              </CardTitle>
              <CardDescription>{t('profile.preferencesDesc')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-2">{t('profile.language')}</p>
                <div className="flex flex-wrap gap-2">
                  {languages.map((lang) => (
                    <Button
                      key={lang.code}
                      variant={resolvedLang === lang.code ? "default" : "outline"}
                      size="sm"
                      onClick={() => i18n.changeLanguage(lang.code)}
                      className={cn(
                        resolvedLang === lang.code && "bg-primary text-primary-foreground"
                      )}
                      data-testid={`button-language-${lang.code}`}
                    >
                      <span className="mr-1">{lang.flag}</span>
                      {lang.name}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Swords className="h-5 w-5 text-primary" />
              {t('profile.activitySummary')}
            </CardTitle>
            <CardDescription>{t('profile.activitySummaryDesc')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="p-4 rounded-lg bg-muted/50 border border-border/40">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Swords className="h-4 w-4" />
                  <span className="text-xs uppercase tracking-wider">{t('profile.characters')}</span>
                </div>
                <p className="text-2xl font-bold">{characters.length}</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50 border border-border/40">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Calendar className="h-4 w-4" />
                  <span className="text-xs uppercase tracking-wider">{t('profile.huntRequests')}</span>
                </div>
                <p className="text-2xl font-bold">{myRequests.length}</p>
                <p className="text-xs text-muted-foreground">{approvedRequests.length} {t('status.approved').toLowerCase()}</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50 border border-border/40">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Award className="h-4 w-4" />
                  <span className="text-xs uppercase tracking-wider">{t('profile.pointsClaimed')}</span>
                </div>
                <p className="text-2xl font-bold">{approvedClaims.reduce((sum, c) => sum + c.pointsRequested, 0)}</p>
                <p className="text-xs text-muted-foreground">{pendingClaims.length} {t('status.pending').toLowerCase()}</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50 border border-border/40">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Clock className="h-4 w-4" />
                  <span className="text-xs uppercase tracking-wider">{t('profile.totalClaims')}</span>
                </div>
                <p className="text-2xl font-bold">{pointClaims.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 sm:grid-cols-2">
          <Link href="/characters">
            <Card className="cursor-pointer hover:border-primary/50 transition-colors">
              <CardContent className="flex items-center justify-between p-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <Swords className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{t('profile.manageCharacters')}</h3>
                    <p className="text-sm text-muted-foreground">{characters.length} {t('profile.charactersLinked')}</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </CardContent>
            </Card>
          </Link>
          <Link href="/schedule">
            <Card className="cursor-pointer hover:border-primary/50 transition-colors">
              <CardContent className="flex items-center justify-between p-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{t('profile.viewSchedule')}</h3>
                    <p className="text-sm text-muted-foreground">{t('profile.bookHuntSlots')}</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </Layout>
  );
}
