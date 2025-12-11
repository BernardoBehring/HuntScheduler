import { AdminLayout } from "@/components/admin-layout";
import { useStore, Respawn } from "@/lib/mockData";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTranslation } from "react-i18next";

export default function AdminRespawns() {
  const { servers, respawns, addRespawn, updateRespawn, deleteRespawn } = useStore();
  const { t } = useTranslation();
  
  const [filterServer, setFilterServer] = useState<string>("all");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [respawnName, setRespawnName] = useState("");
  const [respawnServer, setRespawnServer] = useState(servers[0]?.id || "");
  const [respawnDifficulty, setRespawnDifficulty] = useState("2");
  const [respawnMinPlayers, setRespawnMinPlayers] = useState("1");
  const [respawnMaxPlayers, setRespawnMaxPlayers] = useState("4");

  const filteredRespawns = filterServer === "all" 
    ? respawns 
    : respawns.filter(r => r.serverId === filterServer);

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
    setRespawnServer(servers[0]?.id || "");
    setRespawnDifficulty("2");
    setRespawnMinPlayers("1");
    setRespawnMaxPlayers("4");
    setIsAddOpen(true);
  };

  const openEditDialog = (respawn: Respawn) => {
    setEditingId(respawn.id);
    setRespawnName(respawn.name);
    setRespawnServer(respawn.serverId);
    setRespawnDifficulty(respawn.difficultyId);
    setRespawnMinPlayers((respawn.minPlayers || 1).toString());
    setRespawnMaxPlayers(respawn.maxPlayers.toString());
    setIsEditOpen(true);
  };

  const handleAdd = () => {
    if (!respawnName || !respawnServer) return;
    addRespawn({
      name: respawnName,
      serverId: respawnServer,
      difficultyId: respawnDifficulty,
      minPlayers: parseInt(respawnMinPlayers) || 1,
      maxPlayers: parseInt(respawnMaxPlayers) || 4
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
      maxPlayers: parseInt(respawnMaxPlayers) || 4
    });
    toast({ title: t('admin.respawns.respawnUpdated'), description: t('admin.respawns.respawnUpdatedDesc') });
    setIsEditOpen(false);
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    if (confirm(t('admin.respawns.confirmDelete'))) {
      deleteRespawn(id);
      toast({ title: t('admin.respawns.respawnDeleted'), description: t('admin.respawns.respawnDeletedDesc') });
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
            <Select value={filterServer} onValueChange={setFilterServer}>
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

            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
              <DialogTrigger asChild>
                <Button onClick={openAddDialog} size="sm" data-testid="button-add-respawn">
                  <Plus className="h-4 w-4 mr-1" /> {t('admin.respawns.addRespawn')}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t('admin.respawns.addNewRespawn')}</DialogTitle>
                  <DialogDescription>{t('admin.respawns.createHuntingArea')}</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
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
                        {servers.map(s => (
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
                </div>
                <DialogFooter>
                  <Button onClick={handleAdd} data-testid="button-confirm-add-respawn">{t('admin.respawns.createRespawn')}</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t('admin.respawns.editRespawn')}</DialogTitle>
                  <DialogDescription>{t('admin.respawns.updateDetails')}</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
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
                        {servers.map(s => (
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
                </div>
                <DialogFooter>
                  <Button onClick={handleUpdate}>{t('admin.respawns.saveChanges')}</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {filteredRespawns.length === 0 && (
              <p className="text-muted-foreground text-center py-10">{t('common.noData')}</p>
            )}
            {filteredRespawns.map(r => {
              const server = servers.find(s => s.id === r.serverId);
              return (
                <div key={r.id} className="flex items-center justify-between p-3 border border-border/40 rounded bg-muted/10" data-testid={`respawn-item-${r.id}`}>
                  <div>
                    <p className="font-medium text-sm">{r.name}</p>
                    <p className="text-xs text-muted-foreground">
                      <span className="text-primary">{server?.name || t('common.unknown')}</span> • {t('common.players')}: {r.minPlayers || 1}-{r.maxPlayers} • {getTranslatedDifficulty(r.difficultyId)}
                    </p>
                  </div>
                  <div className="flex gap-2">
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
