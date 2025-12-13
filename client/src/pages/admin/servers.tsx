import { AdminLayout } from "@/components/admin-layout";
import { useStore, Server } from "@/lib/mockData";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { RefreshCw, Globe, Shield, Edit, Users, Headphones } from "lucide-react";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function AdminServers() {
  const { servers, syncServers, setServerActive, updateServer, loadFromApi } = useStore();
  const { t } = useTranslation();
  
  const [isSyncing, setIsSyncing] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingServer, setEditingServer] = useState<Server | null>(null);
  const [editGuildName, setEditGuildName] = useState("");
  const [editTsName, setEditTsName] = useState("");
  const [editTsDescription, setEditTsDescription] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const openEditDialog = (server: Server) => {
    setEditingServer(server);
    setEditGuildName(server.guildName || "");
    setEditTsName(server.tsName || "");
    setEditTsDescription(server.tsDescription || "");
    setIsEditDialogOpen(true);
  };

  const handleEditSubmit = async () => {
    if (!editingServer) return;
    setIsSaving(true);
    try {
      await updateServer(editingServer.id, {
        guildName: editGuildName || undefined,
        tsName: editTsName || undefined,
        tsDescription: editTsDescription || undefined,
      });
      await loadFromApi();
      setIsEditDialogOpen(false);
      toast({ 
        title: t('admin.servers.serverUpdated'),
        description: editingServer.name 
      });
    } catch (error) {
      toast({ title: t('errors.saveFailed'), variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const result = await syncServers();
      toast({ 
        title: t('admin.servers.syncComplete'), 
        description: result.addedCount > 0 
          ? t('admin.servers.syncAddedServers', { count: result.addedCount })
          : t('admin.servers.syncNoNewServers')
      });
    } catch (error) {
      toast({ title: t('errors.syncFailed'), variant: 'destructive' });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleToggleActive = async (server: Server) => {
    setTogglingId(server.id);
    try {
      await setServerActive(server.id, !server.isActive);
      toast({ 
        title: server.isActive ? t('admin.servers.serverDeactivated') : t('admin.servers.serverActivated'),
        description: server.name 
      });
    } catch (error) {
      toast({ title: t('errors.saveFailed'), variant: 'destructive' });
    } finally {
      setTogglingId(null);
    }
  };

  const filteredServers = servers.filter(server => 
    server.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    server.region.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (server.pvpType && server.pvpType.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const sortedServers = [...filteredServers].sort((a, b) => {
    if (a.isActive !== b.isActive) return a.isActive ? -1 : 1;
    return a.name.localeCompare(b.name);
  });

  const activeCount = servers.filter(s => s.isActive).length;

  return (
    <AdminLayout title={t('admin.tabs.servers')} description={t('admin.servers.description')}>
      <Card className="bg-card/30 border-border/50">
        <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-4">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <Globe className="h-5 w-5" />
              {t('admin.servers.title')}
            </CardTitle>
            <CardDescription>
              {t('admin.servers.activeCount', { active: activeCount, total: servers.length })}
            </CardDescription>
          </div>
          
          <Button 
            onClick={handleSync} 
            disabled={isSyncing}
            size="sm" 
            data-testid="button-sync-servers"
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? t('admin.servers.syncing') : t('admin.servers.syncFromTibia')}
          </Button>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Input
              placeholder={t('admin.servers.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm"
              data-testid="input-search-servers"
            />
          </div>
          
          <div className="grid gap-3">
            {sortedServers.length === 0 && (
              <p className="text-muted-foreground text-center py-10">
                {servers.length === 0 
                  ? t('admin.servers.noServers') 
                  : t('admin.servers.noSearchResults')}
              </p>
            )}
            {sortedServers.map(server => (
              <div 
                key={server.id} 
                className={`flex items-center justify-between p-3 border rounded-lg transition-colors ${
                  server.isActive 
                    ? 'border-primary/50 bg-primary/5' 
                    : 'border-border/40 bg-muted/10 opacity-60'
                }`} 
                data-testid={`server-item-${server.id}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`h-9 w-9 rounded-full flex items-center justify-center font-bold text-sm ${
                    server.isActive 
                      ? 'bg-primary/20 text-primary' 
                      : 'bg-muted/20 text-muted-foreground'
                  }`}>
                    {server.name[0]}
                  </div>
                  <div>
                    <p className="font-bold text-sm flex items-center gap-2">
                      {server.name}
                      {server.isActive && (
                        <Badge variant="outline" className="text-xs bg-green-500/10 text-green-500 border-green-500/30">
                          {t('admin.servers.active')}
                        </Badge>
                      )}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="uppercase tracking-wider">{server.region}</span>
                      {server.pvpType && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Shield className="h-3 w-3" />
                            {server.pvpType}
                          </span>
                        </>
                      )}
                    </div>
                    {(server.guildName || server.tsName) && (
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                        {server.guildName && (
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {server.guildName}
                          </span>
                        )}
                        {server.tsName && (
                          <span className="flex items-center gap-1">
                            <Headphones className="h-3 w-3" />
                            {server.tsName}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditDialog(server)}
                    data-testid={`button-edit-server-${server.id}`}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Switch
                    checked={server.isActive}
                    onCheckedChange={() => handleToggleActive(server)}
                    disabled={togglingId === server.id}
                    data-testid={`switch-server-active-${server.id}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              {t('admin.servers.editServer')}
            </DialogTitle>
            <DialogDescription>
              {t('admin.servers.editServerDesc', { name: editingServer?.name })}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                {t('admin.servers.guildName')}
              </Label>
              <Input 
                value={editGuildName} 
                onChange={(e) => setEditGuildName(e.target.value)} 
                placeholder={t('admin.servers.guildNamePlaceholder')}
                data-testid="input-edit-guild-name" 
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Headphones className="h-4 w-4" />
                {t('admin.servers.tsName')}
              </Label>
              <Input 
                value={editTsName} 
                onChange={(e) => setEditTsName(e.target.value)} 
                placeholder={t('admin.servers.tsNamePlaceholder')}
                data-testid="input-edit-ts-name" 
              />
            </div>
            <div className="space-y-2">
              <Label>{t('admin.servers.tsDescription')}</Label>
              <Textarea 
                value={editTsDescription} 
                onChange={(e) => setEditTsDescription(e.target.value)} 
                placeholder={t('admin.servers.tsDescriptionPlaceholder')}
                rows={3}
                data-testid="input-edit-ts-description" 
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleEditSubmit} disabled={isSaving} data-testid="button-save-server">
              {isSaving ? t('common.saving') : t('common.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
