import { AdminLayout } from "@/components/admin-layout";
import { useStore, Respawn } from "@/lib/mockData";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Power, PowerOff, Search, Copy } from "lucide-react";
import { useState, useMemo } from "react";
import { AlertTriangle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";

export default function AdminRespawns() {
  const { servers, respawns, addRespawn, updateRespawn, deleteRespawn } = useStore();
  const { t } = useTranslation();
  
  const activeServers = servers.filter(s => s.isActive);
  
  const [filterServer, setFilterServer] = useState<string>("all");
  const [filterAvailability, setFilterAvailability] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isCopyOpen, setIsCopyOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [copySourceServer, setCopySourceServer] = useState<string>("");
  const [copyTargetServer, setCopyTargetServer] = useState<string>("");
  const [copyOverwrite, setCopyOverwrite] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  
  const [respawnName, setRespawnName] = useState("");
  const [respawnServer, setRespawnServer] = useState(activeServers[0]?.id || "");
  const [respawnDifficulty, setRespawnDifficulty] = useState("2");
  const [respawnMinPlayers, setRespawnMinPlayers] = useState("1");
  const [respawnMaxPlayers, setRespawnMaxPlayers] = useState("4");
  const [respawnTsCode, setRespawnTsCode] = useState("");
  const [respawnCity, setRespawnCity] = useState("");
  const [respawnIsAvailable, setRespawnIsAvailable] = useState(true);

  const filteredRespawns = useMemo(() => {
    let result = [...respawns];
    
    if (filterServer !== "all") {
      result = result.filter(r => String(r.serverId) === filterServer);
    }
    
    if (filterAvailability !== "all") {
      result = result.filter(r => 
        filterAvailability === "available" ? r.isAvailable : !r.isAvailable
      );
    }
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(r => 
        r.name.toLowerCase().includes(query) ||
        (r.tsCode && r.tsCode.toLowerCase().includes(query)) ||
        (r.city && r.city.toLowerCase().includes(query))
      );
    }
    
    result.sort((a, b) => {
      const aCode = a.tsCode || "";
      const bCode = b.tsCode || "";
      const aNum = parseInt(aCode.replace(/\D/g, '')) || 0;
      const bNum = parseInt(bCode.replace(/\D/g, '')) || 0;
      if (aNum !== bNum) return aNum - bNum;
      return aCode.localeCompare(bCode);
    });
    
    return result;
  }, [respawns, filterServer, filterAvailability, searchQuery]);

  const getTranslatedDifficulty = (difficultyId: string) => {
    const difficultyMap: Record<string, string> = {
      '1': 'easy',
      '2': 'medium', 
      '3': 'hard',
      '4': 'nightmare'
    };
    return t(`difficulty.${difficultyMap[difficultyId] || 'medium'}`);
  };

  const openAddDialog = () => {
    setRespawnName("");
    setRespawnServer(activeServers[0]?.id || "");
    setRespawnDifficulty("2");
    setRespawnMinPlayers("1");
    setRespawnMaxPlayers("4");
    setRespawnTsCode("");
    setRespawnCity("");
    setRespawnIsAvailable(true);
    setIsAddOpen(true);
  };

  const openEditDialog = (respawn: Respawn) => {
    setEditingId(respawn.id);
    setRespawnName(respawn.name);
    setRespawnServer(respawn.serverId);
    setRespawnDifficulty(respawn.difficultyId);
    setRespawnMinPlayers((respawn.minPlayers || 1).toString());
    setRespawnMaxPlayers(respawn.maxPlayers.toString());
    setRespawnTsCode(respawn.tsCode || "");
    setRespawnCity(respawn.city || "");
    setRespawnIsAvailable(respawn.isAvailable ?? true);
    setIsEditOpen(true);
  };

  const handleAdd = () => {
    if (!respawnName || !respawnServer) return;
    addRespawn({
      name: respawnName,
      serverId: respawnServer,
      difficultyId: respawnDifficulty,
      minPlayers: parseInt(respawnMinPlayers) || 1,
      maxPlayers: parseInt(respawnMaxPlayers) || 4,
      tsCode: respawnTsCode || undefined,
      city: respawnCity || undefined,
      isAvailable: respawnIsAvailable
    });
    toast({ title: t('admin.respawns.respawnAdded'), description: t('admin.respawns.respawnAddedDesc') });
    setIsAddOpen(false);
  };

  const handleUpdate = () => {
    if (!editingId || !respawnName || !respawnServer) return;
    updateRespawn(editingId, {
      name: respawnName,
      serverId: respawnServer,
      difficultyId: respawnDifficulty,
      minPlayers: parseInt(respawnMinPlayers) || 1,
      maxPlayers: parseInt(respawnMaxPlayers) || 4,
      tsCode: respawnTsCode || undefined,
      city: respawnCity || undefined,
      isAvailable: respawnIsAvailable
    });
    toast({ title: t('admin.respawns.respawnUpdated'), description: t('admin.respawns.respawnUpdatedDesc') });
    setIsEditOpen(false);
    setEditingId(null);
  };

  const handleToggleAvailability = (respawn: Respawn) => {
    updateRespawn(respawn.id, {
      ...respawn,
      isAvailable: !respawn.isAvailable
    });
    toast({ 
      title: respawn.isAvailable ? t('admin.respawns.markedUnavailable') : t('admin.respawns.markedAvailable'),
      description: respawn.name
    });
  };

  const handleDelete = (id: string) => {
    if (confirm(t('admin.respawns.confirmDelete'))) {
      deleteRespawn(id);
      toast({ title: t('admin.respawns.respawnDeleted'), description: t('admin.respawns.respawnDeletedDesc') });
    }
  };

  const openCopyDialog = () => {
    setCopySourceServer(activeServers[0]?.id || "");
    setCopyTargetServer(activeServers[1]?.id || activeServers[0]?.id || "");
    setCopyOverwrite(false);
    setIsCopyOpen(true);
  };

  const handleCopyRespawns = async () => {
    if (!copySourceServer || !copyTargetServer) return;
    if (copySourceServer === copyTargetServer) {
      toast({ 
        title: t('common.error'), 
        description: t('admin.respawns.sameServerError'),
        variant: "destructive"
      });
      return;
    }

    setIsCopying(true);
    try {
      const response = await fetch('/api/respawns/copy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceServerId: parseInt(copySourceServer),
          targetServerId: parseInt(copyTargetServer),
          overwriteExisting: copyOverwrite
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to copy respawns');
      }

      const result = await response.json();
      toast({ 
        title: t('admin.respawns.copySuccess'), 
        description: t('admin.respawns.copySuccessDesc', { count: result.copiedCount })
      });
      setIsCopyOpen(false);
      window.location.reload();
    } catch (error: any) {
      toast({ 
        title: t('common.error'), 
        description: error.message || t('admin.respawns.copyError'),
        variant: "destructive"
      });
    } finally {
      setIsCopying(false);
    }
  };

  return (
    <AdminLayout title={t('admin.tabs.respawns')} description={t('admin.respawns.manageRespawns')}>
      <Card className="bg-card/30 border-border/50">
        <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-4">
          <div>
            <CardTitle className="text-base">{t('admin.respawns.serverConfig')}</CardTitle>
            <CardDescription>{t('admin.respawns.manageRespawns')}</CardDescription>
          </div>
          
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder={t('common.search')} 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
                className="pl-8 w-[200px]"
                data-testid="input-search-respawns"
              />
            </div>

            <Select value={filterServer} onValueChange={setFilterServer}>
              <SelectTrigger className="w-[180px]" data-testid="select-filter-server">
                <SelectValue placeholder={t('common.allServers')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('common.allServers')}</SelectItem>
                {activeServers.map(s => (
                  <SelectItem key={s.id} value={String(s.id)}>{s.name} ({s.region})</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterAvailability} onValueChange={setFilterAvailability}>
              <SelectTrigger className="w-[150px]" data-testid="select-filter-availability">
                <SelectValue placeholder={t('common.all')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('common.all')}</SelectItem>
                <SelectItem value="available">{t('admin.respawns.available')}</SelectItem>
                <SelectItem value="unavailable">{t('admin.respawns.unavailable')}</SelectItem>
              </SelectContent>
            </Select>

            <Dialog open={isCopyOpen} onOpenChange={setIsCopyOpen}>
              <DialogTrigger asChild>
                <Button onClick={openCopyDialog} size="sm" variant="outline" data-testid="button-copy-respawns">
                  <Copy className="h-4 w-4 mr-1" /> {t('admin.respawns.copyRespawns')}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>{t('admin.respawns.copyRespawns')}</DialogTitle>
                  <DialogDescription>{t('admin.respawns.copyRespawnsDesc')}</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label>{t('admin.respawns.copyFromServer')}</Label>
                    <Select value={copySourceServer} onValueChange={setCopySourceServer}>
                      <SelectTrigger data-testid="select-copy-source-server">
                        <SelectValue placeholder={t('schedule.selectServer')} />
                      </SelectTrigger>
                      <SelectContent>
                        {activeServers.map(s => (
                          <SelectItem key={s.id} value={s.id}>{s.name} ({s.region})</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>{t('admin.respawns.copyToServer')}</Label>
                    <Select value={copyTargetServer} onValueChange={setCopyTargetServer}>
                      <SelectTrigger data-testid="select-copy-target-server">
                        <SelectValue placeholder={t('schedule.selectServer')} />
                      </SelectTrigger>
                      <SelectContent>
                        {activeServers.map(s => (
                          <SelectItem key={s.id} value={s.id}>{s.name} ({s.region})</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>{t('admin.respawns.overwriteExisting')}</Label>
                      <p className="text-xs text-muted-foreground">{t('admin.respawns.overwriteWarning')}</p>
                    </div>
                    <Switch checked={copyOverwrite} onCheckedChange={setCopyOverwrite} data-testid="switch-copy-overwrite" />
                  </div>
                  {copyOverwrite && (
                    <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded text-sm text-destructive">
                      <AlertTriangle className="h-4 w-4 shrink-0" />
                      <span>{t('admin.respawns.overwriteConfirm')}</span>
                    </div>
                  )}
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCopyOpen(false)}>{t('common.cancel')}</Button>
                  <Button onClick={handleCopyRespawns} disabled={isCopying || copySourceServer === copyTargetServer} data-testid="button-confirm-copy">
                    {isCopying ? t('admin.respawns.copying') : t('admin.respawns.copyRespawns')}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
              <DialogTrigger asChild>
                <Button onClick={openAddDialog} size="sm" data-testid="button-add-respawn">
                  <Plus className="h-4 w-4 mr-1" /> {t('admin.respawns.addRespawn')}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>{t('admin.respawns.addNewRespawn')}</DialogTitle>
                  <DialogDescription>{t('admin.respawns.createHuntingArea')}</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{t('admin.respawns.tsCode')}</Label>
                      <Input placeholder="e.g. 50a" value={respawnTsCode} onChange={(e) => setRespawnTsCode(e.target.value)} data-testid="input-respawn-ts-code" />
                    </div>
                    <div className="space-y-2">
                      <Label>{t('admin.respawns.city')}</Label>
                      <Input placeholder="e.g. Issavi" value={respawnCity} onChange={(e) => setRespawnCity(e.target.value)} data-testid="input-respawn-city" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>{t('admin.respawns.respawnName')}</Label>
                    <Input placeholder={t('admin.respawns.respawnNamePlaceholder')} value={respawnName} onChange={(e) => setRespawnName(e.target.value)} data-testid="input-respawn-name" />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('common.server')}</Label>
                    <Select value={respawnServer} onValueChange={setRespawnServer}>
                      <SelectTrigger data-testid="select-respawn-server">
                        <SelectValue placeholder={t('schedule.selectServer')} />
                      </SelectTrigger>
                      <SelectContent>
                        {activeServers.map(s => (
                          <SelectItem key={s.id} value={s.id}>{s.name} ({s.region})</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>{t('common.difficulty')}</Label>
                    <Select value={respawnDifficulty} onValueChange={setRespawnDifficulty}>
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
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{t('admin.respawns.minPlayers')}</Label>
                      <Input type="number" min="1" max="10" value={respawnMinPlayers} onChange={(e) => setRespawnMinPlayers(e.target.value)} data-testid="input-respawn-min-players" />
                    </div>
                    <div className="space-y-2">
                      <Label>{t('admin.respawns.maxPlayers')}</Label>
                      <Input type="number" min="1" max="10" value={respawnMaxPlayers} onChange={(e) => setRespawnMaxPlayers(e.target.value)} data-testid="input-respawn-max-players" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>{t('admin.respawns.available')}</Label>
                    <Switch checked={respawnIsAvailable} onCheckedChange={setRespawnIsAvailable} data-testid="switch-respawn-available" />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleAdd} data-testid="button-confirm-add-respawn">{t('admin.respawns.createRespawn')}</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>{t('admin.respawns.editRespawn')}</DialogTitle>
                  <DialogDescription>{t('admin.respawns.updateDetails')}</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{t('admin.respawns.tsCode')}</Label>
                      <Input placeholder="e.g. 50a" value={respawnTsCode} onChange={(e) => setRespawnTsCode(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>{t('admin.respawns.city')}</Label>
                      <Input placeholder="e.g. Issavi" value={respawnCity} onChange={(e) => setRespawnCity(e.target.value)} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>{t('admin.respawns.respawnName')}</Label>
                    <Input placeholder={t('admin.respawns.respawnNamePlaceholder')} value={respawnName} onChange={(e) => setRespawnName(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('common.server')}</Label>
                    <Select value={respawnServer} onValueChange={setRespawnServer}>
                      <SelectTrigger>
                        <SelectValue placeholder={t('schedule.selectServer')} />
                      </SelectTrigger>
                      <SelectContent>
                        {activeServers.map(s => (
                          <SelectItem key={s.id} value={s.id}>{s.name} ({s.region})</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>{t('common.difficulty')}</Label>
                    <Select value={respawnDifficulty} onValueChange={setRespawnDifficulty}>
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
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{t('admin.respawns.minPlayers')}</Label>
                      <Input type="number" min="1" max="10" value={respawnMinPlayers} onChange={(e) => setRespawnMinPlayers(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>{t('admin.respawns.maxPlayers')}</Label>
                      <Input type="number" min="1" max="10" value={respawnMaxPlayers} onChange={(e) => setRespawnMaxPlayers(e.target.value)} />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>{t('admin.respawns.available')}</Label>
                    <Switch checked={respawnIsAvailable} onCheckedChange={setRespawnIsAvailable} />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleUpdate}>{t('admin.respawns.saveChanges')}</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground mb-3">
            {t('common.showing')} {filteredRespawns.length} {t('common.of')} {respawns.length} {t('admin.tabs.respawns').toLowerCase()}
          </div>
          <div className="grid gap-3">
            {filteredRespawns.length === 0 && (
              <p className="text-muted-foreground text-center py-10">{t('common.noData')}</p>
            )}
            {filteredRespawns.map(r => {
              const server = servers.find(s => s.id === r.serverId);
              return (
                <div 
                  key={r.id} 
                  className={`flex items-center justify-between p-3 border border-border/40 rounded ${r.isAvailable ? 'bg-muted/10' : 'bg-muted/30 opacity-60'}`} 
                  data-testid={`respawn-item-${r.id}`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      {r.tsCode && (
                        <Badge variant="outline" className="text-xs font-mono">{r.tsCode}</Badge>
                      )}
                      <p className="font-medium text-sm">{r.name}</p>
                      {!r.isAvailable && (
                        <Badge variant="secondary" className="text-xs">
                          <PowerOff className="h-3 w-3 mr-1" />
                          {t('admin.respawns.unavailable')}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {r.city && <span className="text-primary/80">{r.city} • </span>}
                      <span className="text-primary">{server?.name || t('common.unknown')}</span> • {t('common.players')}: {r.minPlayers || 1}-{r.maxPlayers} • {getTranslatedDifficulty(r.difficultyId)}
                    </p>
                  </div>
                  <div className="flex gap-2 items-center">
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => handleToggleAvailability(r)}
                      title={r.isAvailable ? t('admin.respawns.markUnavailable') : t('admin.respawns.markAvailable')}
                      data-testid={`button-toggle-respawn-${r.id}`}
                    >
                      {r.isAvailable ? <Power className="h-4 w-4 text-green-500" /> : <PowerOff className="h-4 w-4 text-muted-foreground" />}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => openEditDialog(r)} data-testid={`button-edit-respawn-${r.id}`}>{t('common.edit')}</Button>
                    <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleDelete(r.id)} data-testid={`button-delete-respawn-${r.id}`}><Trash2 className="h-4 w-4"/></Button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
