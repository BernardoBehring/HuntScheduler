import { AdminLayout } from "@/components/admin-layout";
import { useStore, User } from "@/lib/mockData";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TrendingUp, TrendingDown, Search, Headphones, Server as ServerIcon, MessageSquare, Check, X } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useTranslation } from "react-i18next";
import { api, UserServerSettings, TsPosition } from "@/lib/api";

export default function AdminUsers() {
  const { users, servers, characters, getRoleName, tsPositions, currentUser, loadFromApi } = useStore();
  const { t } = useTranslation();
  
  const activeServers = servers.filter(s => s.isActive);
  const [filterServer, setFilterServer] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isPointsDialogOpen, setIsPointsDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [pointsAmount, setPointsAmount] = useState("");
  const [pointsReason, setPointsReason] = useState("");
  const [pointsOperation, setPointsOperation] = useState<"add" | "remove">("add");
  const [userServerSettingsMap, setUserServerSettingsMap] = useState<Record<string, UserServerSettings[]>>({});
  const [editingTsDescription, setEditingTsDescription] = useState<string | null>(null);
  const [tsDescriptionValue, setTsDescriptionValue] = useState("");

  useEffect(() => {
    const fetchAllUserServerSettings = async () => {
      const settingsMap: Record<string, UserServerSettings[]> = {};
      for (const user of users) {
        try {
          const userId = typeof user.id === 'string' ? parseInt(user.id) : user.id;
          const settings = await api.userServerSettings.getByUser(userId);
          settingsMap[user.id] = settings;
        } catch (error) {
          settingsMap[user.id] = [];
        }
      }
      setUserServerSettingsMap(settingsMap);
    };
    if (users.length > 0) {
      fetchAllUserServerSettings();
    }
  }, [users]);

  const handleSetTsPosition = async (userId: string | number, serverId: string | number, tsPositionId: number | null) => {
    try {
      const userIdNum = typeof userId === 'string' ? parseInt(userId) : userId;
      const serverIdNum = typeof serverId === 'string' ? parseInt(serverId) : serverId;
      
      await api.userServerSettings.update(userIdNum, serverIdNum, {
        tsPositionId: tsPositionId,
        clearTsPosition: tsPositionId === null
      });
      
      const updatedSettings = await api.userServerSettings.getByUser(userIdNum);
      setUserServerSettingsMap(prev => ({
        ...prev,
        [userId]: updatedSettings
      }));
      
      toast({ 
        title: t('admin.users.tsPositionUpdated'),
        description: t('admin.users.tsPositionUpdatedDesc')
      });
    } catch (error) {
      toast({ title: t('errors.saveFailed'), variant: 'destructive' });
    }
  };

  const handleSaveTsDescription = async (userId: string | number, serverId: string | number) => {
    try {
      const userIdNum = typeof userId === 'string' ? parseInt(userId) : userId;
      const serverIdNum = typeof serverId === 'string' ? parseInt(serverId) : serverId;
      
      await api.userServerSettings.update(userIdNum, serverIdNum, {
        tsDescription: tsDescriptionValue
      });
      
      const updatedSettings = await api.userServerSettings.getByUser(userIdNum);
      setUserServerSettingsMap(prev => ({
        ...prev,
        [userId]: updatedSettings
      }));
      
      setEditingTsDescription(null);
      toast({ 
        title: t('admin.users.tsDescriptionUpdated'),
        description: t('admin.users.tsDescriptionUpdatedDesc')
      });
    } catch (error) {
      toast({ title: t('errors.saveFailed'), variant: 'destructive' });
    }
  };

  const startEditingTsDescription = (userId: string | number, serverId: string | number, currentValue: string) => {
    setEditingTsDescription(`${userId}-${serverId}`);
    setTsDescriptionValue(currentValue || "");
  };

  const getUserServerSettings = (userId: string | number, serverId: string | number) => {
    const settings = userServerSettingsMap[userId] || [];
    const serverIdNum = typeof serverId === 'string' ? parseInt(serverId) : serverId;
    return settings.find(s => s.serverId === serverIdNum);
  };

  const getUserServersWithCharacters = (userId: string | number) => {
    const userIdStr = String(userId);
    const userChars = characters.filter(c => String(c.userId) === userIdStr);
    const serverIdStrs = Array.from(new Set(userChars.map(c => String(c.serverId))));
    return activeServers.filter(s => serverIdStrs.includes(String(s.id)));
  };

  const getUserTsPositionForServer = (userId: string | number, serverId: string | number) => {
    const settings = userServerSettingsMap[userId] || [];
    const serverIdNum = typeof serverId === 'string' ? parseInt(serverId) : serverId;
    const serverSettings = settings.find(s => s.serverId === serverIdNum);
    if (serverSettings?.tsPositionId) {
      return tsPositions.find(p => String(p.id) === String(serverSettings.tsPositionId));
    }
    return undefined;
  };

  const filteredUsers = users.filter(u => {
    const matchesServer = filterServer === "all" || characters.some(c => c.userId === u.id && c.serverId === filterServer);
    if (!matchesServer) return false;
    
    if (!searchQuery.trim()) return true;
    
    const query = searchQuery.toLowerCase();
    const usernameMatch = u.username.toLowerCase().includes(query);
    const characterMatch = characters.some(c => c.userId === u.id && c.name.toLowerCase().includes(query));
    return usernameMatch || characterMatch;
  });

  const openPointsDialog = (user: User, operation: "add" | "remove") => {
    setSelectedUser(user);
    setPointsOperation(operation);
    setPointsAmount("");
    setPointsReason("");
    setIsPointsDialogOpen(true);
  };

  const handlePointsSubmit = async () => {
    if (!selectedUser || !pointsAmount || !pointsReason) return;
    const amount = parseInt(pointsAmount);
    if (isNaN(amount) || amount <= 0) return;
    
    const finalAmount = pointsOperation === "remove" ? -amount : amount;
    const adminId = currentUser ? (typeof currentUser.id === 'string' ? parseInt(currentUser.id) : currentUser.id) : 1;
    const userId = typeof selectedUser.id === 'string' ? parseInt(selectedUser.id) : selectedUser.id;
    
    try {
      await api.pointTransactions.create({
        userId,
        adminId,
        amount: finalAmount,
        reason: pointsReason,
      });
      
      await loadFromApi();
      setIsPointsDialogOpen(false);
      
      const isAdding = pointsOperation === "add";
      toast({ 
        title: isAdding ? t('admin.points.pointsAdded') : t('admin.points.pointsRemoved'), 
        description: isAdding 
          ? t('admin.points.pointsAddedDesc', { amount: Math.abs(finalAmount), user: selectedUser.username })
          : t('admin.points.pointsRemovedDesc', { amount: Math.abs(finalAmount), user: selectedUser.username })
      });
    } catch (error) {
      toast({ title: t('errors.saveFailed'), variant: 'destructive' });
    }
  };

  const sortedTsPositions = [...tsPositions].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <AdminLayout title={t('admin.tabs.users')} description={t('admin.users.description')}>
      <div className="flex flex-col sm:flex-row gap-3 justify-between mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('common.searchUsers')}
            className="pl-9"
            data-testid="input-search-users"
          />
        </div>
        <Select value={filterServer} onValueChange={setFilterServer}>
          <SelectTrigger className="w-[180px]" data-testid="select-filter-users-server">
            <SelectValue placeholder={t('common.allServers')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('common.allServers')}</SelectItem>
            {activeServers.map(s => (
              <SelectItem key={s.id} value={s.id}>{s.name} ({s.region})</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card className="bg-card/30 border-border/50">
        <CardHeader>
          <CardTitle className="text-base">{t('admin.users.title')}</CardTitle>
          <CardDescription>{t('admin.users.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredUsers.length === 0 && (
              <p className="text-muted-foreground text-center py-10">{t('common.noData')}</p>
            )}
            {filteredUsers.map(user => {
              const userIdStr = String(user.id);
              const userCharacters = characters.filter(c => String(c.userId) === userIdStr);
              const userServers = getUserServersWithCharacters(user.id);
              
              const getCharactersForServer = (serverId: string | number) => {
                const serverIdStr = String(serverId);
                return userCharacters.filter(c => String(c.serverId) === serverIdStr);
              };
              
              return (
                <div key={user.id} className="p-4 border border-border/40 rounded-lg bg-card/40" data-testid={`user-item-${user.id}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                        {user.username[0]}
                      </div>
                      <div>
                        <p className="font-bold text-sm">{user.username}</p>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">{t(`roles.${getRoleName(user.roleId)}`)}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="text-right mr-2">
                        <p className="text-sm font-medium text-primary">{user.points} {t('common.points').toUpperCase()}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => openPointsDialog(user, "remove")} data-testid={`button-remove-points-${user.id}`}>
                          <TrendingDown className="h-3 w-3 mr-1" /> {t('admin.points.remove')}
                        </Button>
                        <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => openPointsDialog(user, "add")} data-testid={`button-add-points-${user.id}`}>
                          <TrendingUp className="h-3 w-3 mr-1" /> {t('admin.points.add')}
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  {userServers.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-border/30 space-y-3">
                      {userServers.map(server => {
                        const currentTsPosition = getUserTsPositionForServer(user.id, server.id);
                        const serverCharacters = getCharactersForServer(server.id);
                        const serverSettings = getUserServerSettings(user.id, server.id);
                        const editKey = `${user.id}-${server.id}`;
                        const isEditing = editingTsDescription === editKey;
                        return (
                          <div key={server.id} className="space-y-2 p-2 rounded-md bg-muted/10 border border-border/20" data-testid={`user-server-section-${user.id}-${server.id}`}>
                            <div className="flex items-center justify-between flex-wrap gap-2">
                              <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2 text-xs">
                                  <ServerIcon className="h-3 w-3 text-muted-foreground" />
                                  <span className="font-medium">{server.name}</span>
                                </div>
                                <div className="flex items-center gap-1 text-xs">
                                  <Headphones className="h-3 w-3 text-muted-foreground" />
                                  <Select 
                                    value={currentTsPosition?.id?.toString() || "none"} 
                                    onValueChange={(value) => handleSetTsPosition(user.id, server.id, value === "none" ? null : parseInt(value))}
                                  >
                                    <SelectTrigger className="h-6 w-[130px] text-xs border-border/30 bg-muted/20 px-2" data-testid={`select-ts-position-${user.id}-${server.id}`}>
                                      <SelectValue>
                                        {currentTsPosition ? (
                                          <span className="flex items-center gap-1">
                                            <span 
                                              className="w-2 h-2 rounded-full" 
                                              style={{ backgroundColor: currentTsPosition.color }}
                                            />
                                            {currentTsPosition.name}
                                          </span>
                                        ) : (
                                          <span className="text-muted-foreground">{t('admin.users.noTsPosition')}</span>
                                        )}
                                      </SelectValue>
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="none">
                                        <span className="text-muted-foreground">{t('admin.users.noTsPosition')}</span>
                                      </SelectItem>
                                      {sortedTsPositions.map(pos => (
                                        <SelectItem key={pos.id} value={pos.id.toString()}>
                                          <span className="flex items-center gap-2">
                                            <span 
                                              className="w-2 h-2 rounded-full" 
                                              style={{ backgroundColor: pos.color }}
                                            />
                                            {pos.name}
                                          </span>
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-start gap-2 pl-5">
                              <MessageSquare className="h-3 w-3 text-muted-foreground mt-0.5 flex-shrink-0" />
                              {isEditing ? (
                                <div className="flex-1 flex items-center gap-1">
                                  <Input
                                    value={tsDescriptionValue}
                                    onChange={(e) => setTsDescriptionValue(e.target.value)}
                                    className="h-6 text-xs flex-1"
                                    placeholder={t('admin.users.tsDescriptionPlaceholder')}
                                    data-testid={`input-ts-description-${user.id}-${server.id}`}
                                  />
                                  <Button 
                                    size="sm" 
                                    variant="ghost" 
                                    className="h-6 w-6 p-0"
                                    onClick={() => handleSaveTsDescription(user.id, server.id)}
                                    data-testid={`button-save-ts-description-${user.id}-${server.id}`}
                                  >
                                    <Check className="h-3 w-3 text-green-500" />
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="ghost" 
                                    className="h-6 w-6 p-0"
                                    onClick={() => setEditingTsDescription(null)}
                                    data-testid={`button-cancel-ts-description-${user.id}-${server.id}`}
                                  >
                                    <X className="h-3 w-3 text-red-500" />
                                  </Button>
                                </div>
                              ) : (
                                <div 
                                  className="flex-1 text-xs text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                                  onClick={() => startEditingTsDescription(user.id, server.id, serverSettings?.tsDescription || "")}
                                  data-testid={`ts-description-display-${user.id}-${server.id}`}
                                >
                                  {serverSettings?.tsDescription || <span className="italic">{t('admin.users.clickToAddDescription')}</span>}
                                </div>
                              )}
                            </div>
                            <div className="flex flex-wrap gap-1.5 pl-5">
                              {serverCharacters.map(char => (
                                <div 
                                  key={char.id}
                                  className={`text-xs px-2 py-0.5 rounded-md border ${char.isMain ? 'bg-primary/10 border-primary/30 text-primary' : 'bg-muted/30 border-border/30'}`}
                                  data-testid={`character-badge-${char.id}`}
                                >
                                  <span className="font-medium">{char.name}</span>
                                  {char.vocation && <span className="text-muted-foreground ml-1">({char.vocation})</span>}
                                  {char.isMain && <span className="ml-1 text-primary">★</span>}
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  
                  {userServers.length === 0 && userCharacters.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-border/30">
                      <p className="text-xs text-muted-foreground mb-2">{t('common.characters')}:</p>
                      <div className="flex flex-wrap gap-2">
                        {userCharacters.map(char => {
                          const server = servers.find(s => s.id === char.serverId);
                          return (
                            <div 
                              key={char.id}
                              className={`text-xs px-2 py-1 rounded-md border ${char.isMain ? 'bg-primary/10 border-primary/30 text-primary' : 'bg-muted/30 border-border/30'}`}
                              data-testid={`character-badge-${char.id}`}
                            >
                              <span className="font-medium">{char.name}</span>
                              {char.vocation && <span className="text-muted-foreground ml-1">({char.vocation})</span>}
                              {server && <span className="text-muted-foreground ml-1">• {server.name}</span>}
                              {char.isMain && <span className="ml-1 text-primary">★</span>}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isPointsDialogOpen} onOpenChange={setIsPointsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {pointsOperation === "add" ? t('admin.points.addPoints') : t('admin.points.removePoints')}
            </DialogTitle>
            <DialogDescription>
              {pointsOperation === "add" ? t('admin.points.addPointsDesc') : t('admin.points.removePointsDesc')} {selectedUser?.username}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>{t('admin.points.amount')}</Label>
              <Input 
                type="number" 
                min="1" 
                value={pointsAmount} 
                onChange={(e) => setPointsAmount(e.target.value)} 
                placeholder="e.g. 50"
                data-testid="input-points-amount" 
              />
            </div>
            <div className="space-y-2">
              <Label>{t('admin.points.reason')}</Label>
              <Textarea 
                value={pointsReason} 
                onChange={(e) => setPointsReason(e.target.value)} 
                placeholder={t('admin.points.reasonPlaceholder')}
                data-testid="input-points-reason" 
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handlePointsSubmit} data-testid="button-confirm-points">
              {pointsOperation === "add" ? t('admin.points.confirmAdd') : t('admin.points.confirmRemove')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
