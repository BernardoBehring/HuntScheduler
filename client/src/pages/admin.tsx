import { Layout } from "@/components/layout";
import { useStore, Respawn, Server } from "@/lib/mockData";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Check, X, Plus, Trash2, Edit } from "lucide-react";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTranslation } from "react-i18next";

export default function Admin() {
  const { requests, users, updateRequestStatus, addPoints, servers, respawns, periods, addPeriod, togglePeriod, addRespawn, updateRespawn, deleteRespawn, addServer, updateServer, deleteServer, getStatusName, getDifficultyName, getRoleName, characters, slots } = useStore();
  const [activeTab, setActiveTab] = useState("requests");
  const { t } = useTranslation();

  const [requestFilterServer, setRequestFilterServer] = useState<string>("all");
  const [periodFilterServer, setPeriodFilterServer] = useState<string>("all");
  const [userFilterServer, setUserFilterServer] = useState<string>("all");

  const filteredPendingRequests = (requestFilterServer === "all" 
    ? requests.filter(r => r.statusId === '1')
    : requests.filter(r => r.statusId === '1' && r.serverId === requestFilterServer)
  ).sort((a, b) => b.createdAt - a.createdAt);

  const filteredProcessedRequests = (requestFilterServer === "all"
    ? requests.filter(r => r.statusId !== '1')
    : requests.filter(r => r.statusId !== '1' && r.serverId === requestFilterServer)
  ).sort((a, b) => b.createdAt - a.createdAt);

  const filteredPeriods = periodFilterServer === "all"
    ? periods
    : periods.filter(p => p.serverId === periodFilterServer);

  const filteredUsers = userFilterServer === "all"
    ? users
    : users.filter(u => characters.some(c => c.userId === u.id && c.serverId === userFilterServer));

  const pendingRequests = requests.filter(r => r.statusId === '1').sort((a, b) => b.createdAt - a.createdAt);
  const processedRequests = requests.filter(r => r.statusId !== '1').sort((a, b) => b.createdAt - a.createdAt);

  const [newPeriodName, setNewPeriodName] = useState("");
  const [newPeriodStart, setNewPeriodStart] = useState("");
  const [newPeriodEnd, setNewPeriodEnd] = useState("");

  const [isAddRespawnOpen, setIsAddRespawnOpen] = useState(false);
  const [isEditRespawnOpen, setIsEditRespawnOpen] = useState(false);
  const [editingRespawnId, setEditingRespawnId] = useState<string | null>(null);
  
  const [newRespawnName, setNewRespawnName] = useState("");
  const [newRespawnServer, setNewRespawnServer] = useState(servers[0]?.id || "");
  const [newRespawnDifficulty, setNewRespawnDifficulty] = useState("2");
  const [newRespawnMaxPlayers, setNewRespawnMaxPlayers] = useState("4");
  
  const [newPeriodServer, setNewPeriodServer] = useState(servers[0]?.id || "");

  const [respawnFilterServer, setRespawnFilterServer] = useState<string>("all");

  const filteredRespawns = respawnFilterServer === "all" 
    ? respawns 
    : respawns.filter(r => r.serverId === respawnFilterServer);

  const [isAddServerOpen, setIsAddServerOpen] = useState(false);
  const [isEditServerOpen, setIsEditServerOpen] = useState(false);
  const [editingServerId, setEditingServerId] = useState<string | null>(null);
  const [newServerName, setNewServerName] = useState("");
  const [newServerRegion, setNewServerRegion] = useState("");

  const getTranslatedStatus = (statusId: string) => {
    const statusMap: Record<string, string> = {
      '1': 'pending',
      '2': 'approved', 
      '3': 'rejected',
      '4': 'cancelled'
    };
    return t(`status.${statusMap[statusId] || 'pending'}`);
  };

  const getTranslatedDifficulty = (difficultyId: string) => {
    const difficultyMap: Record<string, string> = {
      '1': 'easy',
      '2': 'medium', 
      '3': 'hard',
      '4': 'nightmare'
    };
    return t(`difficulty.${difficultyMap[difficultyId] || 'medium'}`);
  };

  const getCharacterName = (userId: string, serverId: string) => {
    const character = characters.find(c => c.userId === userId && c.serverId === serverId && c.isMain);
    if (character) return character.name;
    const anyCharacter = characters.find(c => c.userId === userId && c.serverId === serverId);
    if (anyCharacter) return anyCharacter.name;
    const user = users.find(u => u.id === userId);
    return user?.username || `User #${userId}`;
  };

  const handleReview = (id: string, statusId: string, reason?: string) => {
    updateRequestStatus(id, statusId, reason);
    const statusKey = statusId === '2' ? 'approved' : 'rejected';
    toast({
      title: t(`admin.requests.request${statusId === '2' ? 'Approved' : 'Rejected'}`),
      description: t('admin.requests.requestStatus', { status: t(`status.${statusKey}`).toLowerCase() }),
      variant: statusId === '2' ? 'default' : 'destructive',
    });
  };

  const handleAddPoints = (userId: string, amount: number) => {
    addPoints(userId, amount);
    toast({ 
      title: t('admin.users.pointsUpdated'), 
      description: t('admin.users.pointsUpdatedDesc', { amount: Math.abs(amount) })
    });
  };

  const handleCreatePeriod = () => {
    if (!newPeriodName || !newPeriodStart || !newPeriodEnd || !newPeriodServer) return;
    addPeriod({
      serverId: newPeriodServer,
      name: newPeriodName,
      startDate: newPeriodStart,
      endDate: newPeriodEnd,
      isActive: true
    });
    toast({ title: t('admin.periods.periodCreated'), description: t('admin.periods.periodCreatedDesc') });
    setNewPeriodName("");
    setNewPeriodStart("");
    setNewPeriodEnd("");
  };

  const openAddRespawnDialog = () => {
    setNewRespawnName("");
    setNewRespawnServer(servers[0]?.id || "");
    setNewRespawnDifficulty("2");
    setNewRespawnMaxPlayers("4");
    setIsAddRespawnOpen(true);
  };

  const openEditRespawnDialog = (respawn: Respawn) => {
    setEditingRespawnId(respawn.id);
    setNewRespawnName(respawn.name);
    setNewRespawnServer(respawn.serverId);
    setNewRespawnDifficulty(respawn.difficultyId);
    setNewRespawnMaxPlayers(respawn.maxPlayers.toString());
    setIsEditRespawnOpen(true);
  };

  const handleAddRespawn = () => {
    if (!newRespawnName || !newRespawnServer) return;
    addRespawn({
      name: newRespawnName,
      serverId: newRespawnServer,
      difficultyId: newRespawnDifficulty,
      maxPlayers: parseInt(newRespawnMaxPlayers) || 4
    });
    toast({ title: t('admin.respawns.respawnAdded'), description: t('admin.respawns.respawnAddedDesc') });
    setIsAddRespawnOpen(false);
  };

  const handleUpdateRespawn = () => {
    if (!editingRespawnId || !newRespawnName || !newRespawnServer) return;
    updateRespawn(editingRespawnId, {
      name: newRespawnName,
      serverId: newRespawnServer,
      difficultyId: newRespawnDifficulty,
      maxPlayers: parseInt(newRespawnMaxPlayers) || 4
    });
    toast({ title: t('admin.respawns.respawnUpdated'), description: t('admin.respawns.respawnUpdatedDesc') });
    setIsEditRespawnOpen(false);
    setEditingRespawnId(null);
  };

  const handleDeleteRespawn = (id: string) => {
    if (confirm(t('admin.respawns.confirmDelete'))) {
      deleteRespawn(id);
      toast({ title: t('admin.respawns.respawnDeleted'), description: t('admin.respawns.respawnDeletedDesc') });
    }
  };

  const openAddServerDialog = () => {
    setNewServerName("");
    setNewServerRegion("");
    setIsAddServerOpen(true);
  };

  const openEditServerDialog = (server: Server) => {
    setEditingServerId(server.id);
    setNewServerName(server.name);
    setNewServerRegion(server.region);
    setIsEditServerOpen(true);
  };

  const handleAddServer = async () => {
    if (!newServerName || !newServerRegion) return;
    try {
      await addServer({
        name: newServerName,
        region: newServerRegion,
      });
      toast({ title: t('admin.servers.serverAdded'), description: t('admin.servers.serverAddedDesc') });
      setIsAddServerOpen(false);
    } catch (error) {
      toast({ title: t('errors.saveFailed'), variant: 'destructive' });
    }
  };

  const handleUpdateServer = async () => {
    if (!editingServerId || !newServerName || !newServerRegion) return;
    try {
      await updateServer(editingServerId, {
        name: newServerName,
        region: newServerRegion,
      });
      toast({ title: t('admin.servers.serverUpdated'), description: t('admin.servers.serverUpdatedDesc') });
      setIsEditServerOpen(false);
      setEditingServerId(null);
    } catch (error) {
      toast({ title: t('errors.saveFailed'), variant: 'destructive' });
    }
  };

  const handleDeleteServer = async (id: string) => {
    if (confirm(t('admin.servers.confirmDelete'))) {
      try {
        await deleteServer(id);
        toast({ title: t('admin.servers.serverDeleted'), description: t('admin.servers.serverDeletedDesc') });
      } catch (error) {
        toast({ title: t('errors.saveFailed'), variant: 'destructive' });
      }
    }
  };

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-display font-bold text-primary">{t('admin.title')}</h1>
        <Badge variant="outline" className="border-primary/50 text-primary px-4 py-1">
          {t('admin.accessGranted')}
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-card/50 border border-border/50 p-1">
          <TabsTrigger value="requests" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary" data-testid="tab-requests">{t('admin.tabs.requests')}</TabsTrigger>
          <TabsTrigger value="periods" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary" data-testid="tab-periods">{t('admin.tabs.periods')}</TabsTrigger>
          <TabsTrigger value="respawns" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary" data-testid="tab-respawns">{t('admin.tabs.respawns')}</TabsTrigger>
          <TabsTrigger value="servers" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary" data-testid="tab-servers">{t('admin.tabs.servers')}</TabsTrigger>
          <TabsTrigger value="users" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary" data-testid="tab-users">{t('admin.tabs.users')}</TabsTrigger>
        </TabsList>

        <TabsContent value="requests" className="space-y-6">
          <div className="flex justify-end mb-4">
            <Select value={requestFilterServer} onValueChange={setRequestFilterServer}>
              <SelectTrigger className="w-[180px]" data-testid="select-filter-requests-server">
                <SelectValue placeholder={t('common.allServers')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('common.allServers')}</SelectItem>
                {servers.map(s => (
                  <SelectItem key={s.id} value={s.id}>{s.name} ({s.region})</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="bg-card/30 border-border/50 h-[600px] flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {t('admin.requests.pendingApproval')}
                  <Badge variant="secondary">{filteredPendingRequests.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 p-0 overflow-hidden">
                <ScrollArea className="h-full p-6 pt-0">
                  <div className="space-y-4">
                    {filteredPendingRequests.length === 0 && <p className="text-muted-foreground text-center py-10">{t('admin.requests.noPending')}</p>}
                    {filteredPendingRequests.map(req => {
                      const serverName = servers.find(s => s.id === req.serverId)?.name || t('common.unknown');
                      return (
                      <div key={req.id} className="p-4 rounded-lg border border-border/50 bg-card/50 space-y-3 hover:border-primary/30 transition-all" data-testid={`pending-request-${req.id}`}>
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-bold text-primary">{getCharacterName(req.userId, req.serverId)}</p>
                            <p className="text-sm text-muted-foreground">
                              {respawns.find(r => r.id === req.respawnId)?.name}
                            </p>
                            <p className="text-xs text-primary/70">{serverName}</p>
                          </div>
                          <div className="text-right">
                            <Badge variant="outline" className="mb-1">
                              {periods.find(p => p.id === req.periodId)?.name || t('common.unknown')}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="text-xs bg-muted/30 p-2 rounded text-muted-foreground">
                          Party: {req.partyMembers.length > 0 ? req.partyMembers.map(pm => pm.character?.name || pm.characterId).join(", ") : t('common.solo')}
                        </div>

                        <div className="flex gap-2 pt-2">
                          <Button size="sm" className="flex-1 bg-green-600 hover:bg-green-700 text-white" onClick={() => handleReview(req.id, '2')} data-testid={`button-approve-${req.id}`}>
                            <Check className="h-4 w-4 mr-1" /> {t('admin.requests.approve')}
                          </Button>
                          <Button size="sm" variant="destructive" className="flex-1" onClick={() => handleReview(req.id, '3', 'Admin declined')} data-testid={`button-reject-${req.id}`}>
                            <X className="h-4 w-4 mr-1" /> {t('admin.requests.reject')}
                          </Button>
                        </div>
                      </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            <Card className="bg-card/30 border-border/50 h-[600px] flex flex-col">
              <CardHeader>
                <CardTitle>{t('admin.requests.historyLog')}</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 p-0 overflow-hidden">
                <ScrollArea className="h-full p-6 pt-0">
                  <div className="space-y-4 opacity-70">
                    {filteredProcessedRequests.map(req => {
                      const statusName = getTranslatedStatus(req.statusId);
                      const respawnName = respawns.find(r => r.id === req.respawnId)?.name || t('common.unknown');
                      const slotInfo = slots.find(s => s.id === req.slotId);
                      const periodName = periods.find(p => p.id === req.periodId)?.name || t('common.unknown');
                      const serverName = servers.find(s => s.id === req.serverId)?.name || t('common.unknown');
                      return (
                        <div key={req.id} className="p-3 rounded border border-border/30 space-y-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-sm font-medium text-primary">{getCharacterName(req.userId, req.serverId)}</p>
                              <p className="text-xs text-muted-foreground">{respawnName}</p>
                              <p className="text-xs text-primary/70">{serverName}</p>
                            </div>
                            <Badge variant={req.statusId === '2' ? 'default' : 'destructive'}>
                              {statusName}
                            </Badge>
                          </div>
                          <div className="text-xs text-muted-foreground flex gap-2 flex-wrap">
                            <span>{periodName}</span>
                            {slotInfo && <span>• {slotInfo.startTime} - {slotInfo.endTime}</span>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="periods">
          <div className="flex justify-end mb-4">
            <Select value={periodFilterServer} onValueChange={setPeriodFilterServer}>
              <SelectTrigger className="w-[180px]" data-testid="select-filter-periods-server">
                <SelectValue placeholder={t('common.allServers')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('common.allServers')}</SelectItem>
                {servers.map(s => (
                  <SelectItem key={s.id} value={s.id}>{s.name} ({s.region})</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
             <Card className="bg-card/30 border-border/50">
               <CardHeader>
                 <CardTitle>{t('admin.periods.createNew')}</CardTitle>
                 <CardDescription>{t('admin.periods.defineSchedule')}</CardDescription>
               </CardHeader>
               <CardContent className="space-y-4">
                 <div className="space-y-2">
                   <Label>{t('admin.periods.periodName')}</Label>
                   <Input placeholder={t('admin.periods.periodNamePlaceholder')} value={newPeriodName} onChange={(e) => setNewPeriodName(e.target.value)} data-testid="input-period-name" />
                 </div>
                 <div className="space-y-2">
                   <Label>{t('common.server')}</Label>
                   <Select value={newPeriodServer} onValueChange={setNewPeriodServer}>
                     <SelectTrigger data-testid="select-period-server">
                       <SelectValue placeholder={t('schedule.selectServer')} />
                     </SelectTrigger>
                     <SelectContent>
                       {servers.map(s => (
                         <SelectItem key={s.id} value={s.id}>{s.name} ({s.region})</SelectItem>
                       ))}
                     </SelectContent>
                   </Select>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                     <Label>{t('admin.periods.startDate')}</Label>
                     <Input type="date" value={newPeriodStart} onChange={(e) => setNewPeriodStart(e.target.value)} data-testid="input-period-start" />
                   </div>
                   <div className="space-y-2">
                     <Label>{t('admin.periods.endDate')}</Label>
                     <Input type="date" value={newPeriodEnd} onChange={(e) => setNewPeriodEnd(e.target.value)} data-testid="input-period-end" />
                   </div>
                 </div>
                 <Button onClick={handleCreatePeriod} className="w-full mt-4" data-testid="button-create-period">{t('admin.periods.createPeriod')}</Button>
               </CardContent>
             </Card>

             <Card className="bg-card/30 border-border/50">
               <CardHeader>
                 <CardTitle>{t('admin.periods.activePeriods')}</CardTitle>
               </CardHeader>
               <CardContent>
                 <ScrollArea className="h-[300px]">
                   <div className="space-y-3">
                     {filteredPeriods.map(p => (
                       <div key={p.id} className="flex items-center justify-between p-3 rounded border border-border/40 bg-muted/10" data-testid={`period-item-${p.id}`}>
                         <div>
                           <span className="font-medium flex items-center gap-2">
                             {p.name}
                             {p.isActive && <Badge className="text-[10px] bg-primary/20 text-primary hover:bg-primary/20">{t('common.active')}</Badge>}
                           </span>
                           <p className="text-xs text-muted-foreground">
                             {format(new Date(p.startDate), "MMM d")} - {format(new Date(p.endDate), "MMM d, yyyy")}
                           </p>
                         </div>
                         <Button size="sm" variant="ghost" onClick={() => togglePeriod(p.id)} data-testid={`button-toggle-period-${p.id}`}>
                           {p.isActive ? t('admin.periods.deactivate') : t('admin.periods.activate')}
                         </Button>
                       </div>
                     ))}
                   </div>
                 </ScrollArea>
               </CardContent>
             </Card>
          </div>
        </TabsContent>

        <TabsContent value="users">
          <div className="flex justify-end mb-4">
            <Select value={userFilterServer} onValueChange={setUserFilterServer}>
              <SelectTrigger className="w-[180px]" data-testid="select-filter-users-server">
                <SelectValue placeholder={t('common.allServers')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('common.allServers')}</SelectItem>
                {servers.map(s => (
                  <SelectItem key={s.id} value={s.id}>{s.name} ({s.region})</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Card className="bg-card/30 border-border/50">
            <CardHeader>
              <CardTitle>{t('admin.users.title')}</CardTitle>
              <CardDescription>{t('admin.users.description')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredUsers.map(user => (
                  <div key={user.id} className="flex items-center justify-between p-4 border border-border/40 rounded-lg bg-card/40" data-testid={`user-item-${user.id}`}>
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                        {user.username[0]}
                      </div>
                      <div>
                        <p className="font-bold">{user.username}</p>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">{t(`roles.${getRoleName(user.roleId)}`)}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-right mr-4">
                        <p className="text-sm font-medium text-primary">{user.points} {t('common.points').toUpperCase()}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => handleAddPoints(user.id, -10)} data-testid={`button-remove-points-${user.id}`}>-</Button>
                        <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => handleAddPoints(user.id, 10)} data-testid={`button-add-points-${user.id}`}>+</Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="respawns">
           <Card className="bg-card/30 border-border/50">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>{t('admin.respawns.serverConfig')}</CardTitle>
                <CardDescription>{t('admin.respawns.manageRespawns')}</CardDescription>
              </div>
              
              <div className="flex items-center gap-3">
                <Select value={respawnFilterServer} onValueChange={setRespawnFilterServer}>
                  <SelectTrigger className="w-[180px]" data-testid="select-filter-server">
                    <SelectValue placeholder={t('common.allServers')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('common.allServers')}</SelectItem>
                    {servers.map(s => (
                      <SelectItem key={s.id} value={s.id}>{s.name} ({s.region})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

              <Dialog open={isAddRespawnOpen} onOpenChange={setIsAddRespawnOpen}>
                <DialogTrigger asChild>
                  <Button onClick={openAddRespawnDialog} data-testid="button-add-respawn"><Plus className="h-4 w-4 mr-2" /> {t('admin.respawns.addRespawn')}</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{t('admin.respawns.addNewRespawn')}</DialogTitle>
                    <DialogDescription>{t('admin.respawns.createHuntingArea')}</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label>{t('admin.respawns.respawnName')}</Label>
                      <Input placeholder={t('admin.respawns.respawnNamePlaceholder')} value={newRespawnName} onChange={(e) => setNewRespawnName(e.target.value)} data-testid="input-respawn-name" />
                    </div>
                    <div className="space-y-2">
                      <Label>{t('common.server')}</Label>
                      <Select value={newRespawnServer} onValueChange={setNewRespawnServer}>
                        <SelectTrigger data-testid="select-respawn-server">
                          <SelectValue placeholder={t('schedule.selectServer')} />
                        </SelectTrigger>
                        <SelectContent>
                          {servers.map(s => (
                            <SelectItem key={s.id} value={s.id}>{s.name} ({s.region})</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-2">
                        <Label>{t('difficulty.medium')}</Label>
                        <Select value={newRespawnDifficulty} onValueChange={setNewRespawnDifficulty}>
                          <SelectTrigger data-testid="select-respawn-difficulty">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">{t('difficulty.easy')}</SelectItem>
                            <SelectItem value="2">{t('difficulty.medium')}</SelectItem>
                            <SelectItem value="3">{t('difficulty.hard')}</SelectItem>
                            <SelectItem value="4">{t('difficulty.nightmare')}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>{t('admin.respawns.maxPlayers')}</Label>
                        <Input type="number" min="1" max="10" value={newRespawnMaxPlayers} onChange={(e) => setNewRespawnMaxPlayers(e.target.value)} data-testid="input-respawn-max-players" />
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleAddRespawn} data-testid="button-confirm-add-respawn">{t('admin.respawns.createRespawn')}</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Dialog open={isEditRespawnOpen} onOpenChange={setIsEditRespawnOpen}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{t('admin.respawns.editRespawn')}</DialogTitle>
                    <DialogDescription>{t('admin.respawns.updateDetails')}</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label>{t('admin.respawns.respawnName')}</Label>
                      <Input placeholder={t('admin.respawns.respawnNamePlaceholder')} value={newRespawnName} onChange={(e) => setNewRespawnName(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>{t('common.server')}</Label>
                      <Select value={newRespawnServer} onValueChange={setNewRespawnServer}>
                        <SelectTrigger>
                          <SelectValue placeholder={t('schedule.selectServer')} />
                        </SelectTrigger>
                        <SelectContent>
                          {servers.map(s => (
                            <SelectItem key={s.id} value={s.id}>{s.name} ({s.region})</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-2">
                        <Label>{t('difficulty.medium')}</Label>
                        <Select value={newRespawnDifficulty} onValueChange={setNewRespawnDifficulty}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">{t('difficulty.easy')}</SelectItem>
                            <SelectItem value="2">{t('difficulty.medium')}</SelectItem>
                            <SelectItem value="3">{t('difficulty.hard')}</SelectItem>
                            <SelectItem value="4">{t('difficulty.nightmare')}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>{t('admin.respawns.maxPlayers')}</Label>
                        <Input type="number" min="1" max="10" value={newRespawnMaxPlayers} onChange={(e) => setNewRespawnMaxPlayers(e.target.value)} />
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleUpdateRespawn}>{t('admin.respawns.saveChanges')}</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                 {filteredRespawns.map(r => {
                   const server = servers.find(s => s.id === r.serverId);
                   return (
                   <div key={r.id} className="flex items-center justify-between p-3 border border-border/40 rounded bg-muted/10" data-testid={`respawn-item-${r.id}`}>
                     <div>
                       <p className="font-medium">{r.name}</p>
                       <p className="text-xs text-muted-foreground">
                         <span className="text-primary">{server?.name || t('common.unknown')}</span> • {t('common.max')} {t('common.members')}: {r.maxPlayers} • {getTranslatedDifficulty(r.difficultyId)}
                       </p>
                     </div>
                     <div className="flex gap-2">
                       <Button size="sm" variant="ghost" onClick={() => openEditRespawnDialog(r)} data-testid={`button-edit-respawn-${r.id}`}>{t('common.edit')}</Button>
                       <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleDeleteRespawn(r.id)} data-testid={`button-delete-respawn-${r.id}`}><Trash2 className="h-4 w-4"/></Button>
                     </div>
                   </div>
                   );
                 })}
              </div>
            </CardContent>
           </Card>
        </TabsContent>

        <TabsContent value="servers">
          <Card className="bg-card/30 border-border/50">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>{t('admin.servers.title')}</CardTitle>
                <CardDescription>{t('admin.servers.description')}</CardDescription>
              </div>
              
              <Dialog open={isAddServerOpen} onOpenChange={setIsAddServerOpen}>
                <DialogTrigger asChild>
                  <Button onClick={openAddServerDialog} data-testid="button-add-server">
                    <Plus className="h-4 w-4 mr-2" /> {t('admin.servers.addServer')}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{t('admin.servers.addNewServer')}</DialogTitle>
                    <DialogDescription>{t('admin.servers.createServer')}</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label>{t('admin.servers.serverName')}</Label>
                      <Input 
                        placeholder={t('admin.servers.serverNamePlaceholder')} 
                        value={newServerName} 
                        onChange={(e) => setNewServerName(e.target.value)} 
                        data-testid="input-server-name" 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t('admin.servers.region')}</Label>
                      <Input 
                        placeholder={t('admin.servers.regionPlaceholder')} 
                        value={newServerRegion} 
                        onChange={(e) => setNewServerRegion(e.target.value)} 
                        data-testid="input-server-region" 
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleAddServer} data-testid="button-confirm-add-server">
                      {t('admin.servers.createServerBtn')}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Dialog open={isEditServerOpen} onOpenChange={setIsEditServerOpen}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{t('admin.servers.editServer')}</DialogTitle>
                    <DialogDescription>{t('admin.servers.updateDetails')}</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label>{t('admin.servers.serverName')}</Label>
                      <Input 
                        placeholder={t('admin.servers.serverNamePlaceholder')} 
                        value={newServerName} 
                        onChange={(e) => setNewServerName(e.target.value)} 
                        data-testid="input-edit-server-name" 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t('admin.servers.region')}</Label>
                      <Input 
                        placeholder={t('admin.servers.regionPlaceholder')} 
                        value={newServerRegion} 
                        onChange={(e) => setNewServerRegion(e.target.value)} 
                        data-testid="input-edit-server-region" 
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleUpdateServer} data-testid="button-confirm-edit-server">
                      {t('admin.servers.saveChanges')}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {servers.length === 0 && (
                  <p className="text-muted-foreground text-center py-10">{t('admin.servers.noServers')}</p>
                )}
                {servers.map(server => (
                  <div 
                    key={server.id} 
                    className="flex items-center justify-between p-4 border border-border/40 rounded-lg bg-muted/10" 
                    data-testid={`server-item-${server.id}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                        {server.name[0]}
                      </div>
                      <div>
                        <p className="font-bold">{server.name}</p>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">{server.region}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => openEditServerDialog(server)} 
                        data-testid={`button-edit-server-${server.id}`}
                      >
                        <Edit className="h-4 w-4 mr-1" /> {t('common.edit')}
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="text-destructive" 
                        onClick={() => handleDeleteServer(server.id)} 
                        data-testid={`button-delete-server-${server.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </Layout>
  );
}
