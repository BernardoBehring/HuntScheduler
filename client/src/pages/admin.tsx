import { Layout } from "@/components/layout";
import { useStore, Respawn } from "@/lib/mockData";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Check, X, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTranslation } from "react-i18next";

export default function Admin() {
  const { requests, users, updateRequestStatus, addPoints, servers, respawns, periods, addPeriod, togglePeriod, addRespawn, updateRespawn, deleteRespawn, getStatusName, getDifficultyName, getRoleName } = useStore();
  const [activeTab, setActiveTab] = useState("requests");
  const { t } = useTranslation();

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
          <TabsTrigger value="users" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary" data-testid="tab-users">{t('admin.tabs.users')}</TabsTrigger>
        </TabsList>

        <TabsContent value="requests" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="bg-card/30 border-border/50 h-[600px] flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {t('admin.requests.pendingApproval')}
                  <Badge variant="secondary">{pendingRequests.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 p-0 overflow-hidden">
                <ScrollArea className="h-full p-6 pt-0">
                  <div className="space-y-4">
                    {pendingRequests.length === 0 && <p className="text-muted-foreground text-center py-10">{t('admin.requests.noPending')}</p>}
                    {pendingRequests.map(req => (
                      <div key={req.id} className="p-4 rounded-lg border border-border/50 bg-card/50 space-y-3 hover:border-primary/30 transition-all" data-testid={`pending-request-${req.id}`}>
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-bold text-primary">User #{req.userId}</p>
                            <p className="text-sm text-muted-foreground">
                              {respawns.find(r => r.id === req.respawnId)?.name}
                            </p>
                          </div>
                          <div className="text-right">
                            <Badge variant="outline" className="mb-1">
                              {periods.find(p => p.id === req.periodId)?.name || t('common.unknown')}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="text-xs bg-muted/30 p-2 rounded text-muted-foreground">
                          Party: {req.partyMembers.length > 0 ? req.partyMembers.join(", ") : t('common.solo')}
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
                    ))}
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
                    {processedRequests.map(req => {
                      const statusName = getTranslatedStatus(req.statusId);
                      return (
                        <div key={req.id} className="p-3 rounded border border-border/30 flex justify-between items-center">
                          <div>
                            <p className="text-sm font-medium">Request #{req.id.slice(0,4)}</p>
                            <p className="text-xs text-muted-foreground">{statusName}</p>
                          </div>
                          <Badge variant={req.statusId === '2' ? 'default' : 'destructive'}>
                            {statusName}
                          </Badge>
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
                     {periods.map(p => (
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
          <Card className="bg-card/30 border-border/50">
            <CardHeader>
              <CardTitle>{t('admin.users.title')}</CardTitle>
              <CardDescription>{t('admin.users.description')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {users.map(user => (
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
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                 {respawns.map(r => (
                   <div key={r.id} className="flex items-center justify-between p-3 border border-border/40 rounded bg-muted/10" data-testid={`respawn-item-${r.id}`}>
                     <div>
                       <p className="font-medium">{r.name}</p>
                       <p className="text-xs text-muted-foreground">{t('common.max')} {t('common.members')}: {r.maxPlayers} • {getTranslatedDifficulty(r.difficultyId)}</p>
                     </div>
                     <div className="flex gap-2">
                       <Button size="sm" variant="ghost" onClick={() => openEditRespawnDialog(r)} data-testid={`button-edit-respawn-${r.id}`}>{t('common.edit')}</Button>
                       <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleDeleteRespawn(r.id)} data-testid={`button-delete-respawn-${r.id}`}><Trash2 className="h-4 w-4"/></Button>
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
