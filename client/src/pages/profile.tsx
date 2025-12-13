import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Layout } from "@/components/layout";
import { useStore } from "@/lib/mockData";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, Server, UserServerSettings } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Link } from "wouter";
import { languages } from "@/i18n";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { 
  User, 
  Shield, 
  Award, 
  Swords, 
  Globe, 
  ChevronRight,
  Star,
  Calendar,
  Clock,
  Mail,
  Phone,
  Pencil,
  Save,
  X,
  Headphones,
  Server as ServerIcon
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function ProfilePage() {
  const { t, i18n } = useTranslation();
  const { currentUser, getRoleName, setCurrentUser } = useStore();
  const queryClient = useQueryClient();

  const userId = currentUser?.id ? parseInt(currentUser.id) : undefined;
  
  const [isEditing, setIsEditing] = useState(false);
  const [email, setEmail] = useState(currentUser?.email || '');
  const [whatsapp, setWhatsapp] = useState(currentUser?.whatsapp || '');
  
  const [selectedServerId, setSelectedServerId] = useState<number | null>(null);
  const [editingTsServer, setEditingTsServer] = useState<number | null>(null);
  const [serverTsDescription, setServerTsDescription] = useState('');

  useEffect(() => {
    if (currentUser) {
      setEmail(currentUser.email || '');
      setWhatsapp(currentUser.whatsapp || '');
    }
  }, [currentUser]);

  const updateProfileMutation = useMutation({
    mutationFn: (data: { email?: string; whatsapp?: string }) =>
      userId ? api.users.updateProfile(userId, data) : Promise.reject(),
    onSuccess: () => {
      if (currentUser) {
        setCurrentUser({ ...currentUser, email, whatsapp });
      }
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setIsEditing(false);
      toast({
        title: t('profile.profileUpdated'),
        description: t('profile.profileUpdatedDesc'),
      });
    },
    onError: (error: Error) => {
      toast({
        title: t('common.error'),
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const updateServerSettingsMutation = useMutation({
    mutationFn: ({ serverId, tsDescription }: { serverId: number; tsDescription: string }) =>
      userId ? api.userServerSettings.update(userId, serverId, { tsDescription }) : Promise.reject(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userServerSettings', userId] });
      setEditingTsServer(null);
      toast({
        title: t('profile.tsSettingsUpdated'),
        description: t('profile.tsSettingsUpdatedDesc'),
      });
    },
    onError: (error: Error) => {
      toast({
        title: t('common.error'),
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleSave = () => {
    updateProfileMutation.mutate({ email: email || undefined, whatsapp: whatsapp || undefined });
  };

  const handleCancel = () => {
    setEmail(currentUser?.email || '');
    setWhatsapp(currentUser?.whatsapp || '');
    setIsEditing(false);
  };

  const handleSaveServerTs = (serverId: number) => {
    updateServerSettingsMutation.mutate({ serverId, tsDescription: serverTsDescription });
  };

  const handleEditServerTs = (serverId: number, currentDescription: string) => {
    setEditingTsServer(serverId);
    setServerTsDescription(currentDescription || '');
  };

  const handleCancelServerTs = () => {
    setEditingTsServer(null);
    setServerTsDescription('');
  };

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

  const { data: servers = [] } = useQuery({
    queryKey: ['servers'],
    queryFn: () => api.servers.getAll(),
  });

  const { data: userServerSettings = [] } = useQuery({
    queryKey: ['userServerSettings', userId],
    queryFn: () => userId ? api.userServerSettings.getByUser(userId) : Promise.resolve([]),
    enabled: !!userId,
  });

  const activeServers = servers.filter((s: Server) => s.isActive);
  
  const getServerTsDescription = (serverId: number): string => {
    const setting = userServerSettings.find((s: UserServerSettings) => s.serverId === serverId);
    return setting?.tsDescription || '';
  };

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
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-primary" />
                  {t('profile.contactInfo')}
                </CardTitle>
                <CardDescription>{t('profile.contactInfoDesc')}</CardDescription>
              </div>
              {!isEditing ? (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setIsEditing(true)}
                  data-testid="button-edit-profile"
                >
                  <Pencil className="h-4 w-4 mr-1" />
                  {t('common.edit')}
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleCancel}
                    data-testid="button-cancel-edit"
                  >
                    <X className="h-4 w-4 mr-1" />
                    {t('common.cancel')}
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={handleSave}
                    disabled={updateProfileMutation.isPending}
                    data-testid="button-save-profile"
                  >
                    <Save className="h-4 w-4 mr-1" />
                    {t('common.save')}
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditing ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="email">{t('profile.email')}</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={t('profile.emailPlaceholder')}
                      data-testid="input-email"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="whatsapp">{t('profile.whatsapp')}</Label>
                    <Input
                      id="whatsapp"
                      type="tel"
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      placeholder={t('profile.whatsappPlaceholder')}
                      data-testid="input-whatsapp"
                    />
                  </div>
                </>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">{t('profile.email')}</p>
                      <p className="font-medium">
                        {currentUser.email || <span className="text-muted-foreground italic">{t('profile.notProvided')}</span>}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">{t('profile.whatsapp')}</p>
                      <p className="font-medium">
                        {currentUser.whatsapp || <span className="text-muted-foreground italic">{t('profile.notProvided')}</span>}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          </div>

        {activeServers.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Headphones className="h-5 w-5 text-primary" />
                {t('profile.tsSettingsTitle')}
              </CardTitle>
              <CardDescription>{t('profile.tsSettingsDesc')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activeServers.map((server: Server) => {
                  const currentTsDesc = getServerTsDescription(server.id);
                  const isEditingThis = editingTsServer === server.id;
                  
                  return (
                    <div key={server.id} className="p-4 rounded-lg border border-border/40 bg-muted/30">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <ServerIcon className="h-4 w-4 text-primary" />
                          <span className="font-medium">{server.name}</span>
                          <Badge variant="outline" className="text-xs">{server.region}</Badge>
                        </div>
                        {!isEditingThis ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditServerTs(server.id, currentTsDesc)}
                            data-testid={`button-edit-ts-${server.id}`}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        ) : (
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={handleCancelServerTs}
                              data-testid={`button-cancel-ts-${server.id}`}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleSaveServerTs(server.id)}
                              disabled={updateServerSettingsMutation.isPending}
                              data-testid={`button-save-ts-${server.id}`}
                            >
                              <Save className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                      
                      {isEditingThis ? (
                        <Textarea
                          value={serverTsDescription}
                          onChange={(e) => setServerTsDescription(e.target.value)}
                          placeholder={t('profile.tsDescriptionPlaceholder')}
                          rows={2}
                          className="mt-2"
                          data-testid={`input-ts-description-${server.id}`}
                        />
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          {currentTsDesc || <span className="italic">{t('profile.notProvided')}</span>}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

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
                <p className="text-2xl font-bold">{approvedClaims.reduce((sum, c) => sum + (c.pointsAwarded || 0), 0)}</p>
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
