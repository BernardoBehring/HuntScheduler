import { AdminLayout } from "@/components/admin-layout";
import { useStore, Server } from "@/lib/mockData";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Edit } from "lucide-react";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useTranslation } from "react-i18next";

export default function AdminServers() {
  const { servers, addServer, updateServer, deleteServer } = useStore();
  const { t } = useTranslation();
  
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [serverName, setServerName] = useState("");
  const [serverRegion, setServerRegion] = useState("");

  const openAddDialog = () => {
    setServerName("");
    setServerRegion("");
    setIsAddOpen(true);
  };

  const openEditDialog = (server: Server) => {
    setEditingId(server.id);
    setServerName(server.name);
    setServerRegion(server.region);
    setIsEditOpen(true);
  };

  const handleAdd = async () => {
    if (!serverName || !serverRegion) return;
    try {
      await addServer({
        name: serverName,
        region: serverRegion,
      });
      toast({ title: t('admin.servers.serverAdded'), description: t('admin.servers.serverAddedDesc') });
      setIsAddOpen(false);
    } catch (error) {
      toast({ title: t('errors.saveFailed'), variant: 'destructive' });
    }
  };

  const handleUpdate = async () => {
    if (!editingId || !serverName || !serverRegion) return;
    try {
      await updateServer(editingId, {
        name: serverName,
        region: serverRegion,
      });
      toast({ title: t('admin.servers.serverUpdated'), description: t('admin.servers.serverUpdatedDesc') });
      setIsEditOpen(false);
      setEditingId(null);
    } catch (error) {
      toast({ title: t('errors.saveFailed'), variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
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
    <AdminLayout title={t('admin.tabs.servers')} description={t('admin.servers.description')}>
      <Card className="bg-card/30 border-border/50">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base">{t('admin.servers.title')}</CardTitle>
            <CardDescription>{t('admin.servers.description')}</CardDescription>
          </div>
          
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button onClick={openAddDialog} size="sm" data-testid="button-add-server">
                <Plus className="h-4 w-4 mr-1" /> {t('admin.servers.addServer')}
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
                    value={serverName} 
                    onChange={(e) => setServerName(e.target.value)} 
                    data-testid="input-server-name" 
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('admin.servers.region')}</Label>
                  <Input 
                    placeholder={t('admin.servers.regionPlaceholder')} 
                    value={serverRegion} 
                    onChange={(e) => setServerRegion(e.target.value)} 
                    data-testid="input-server-region" 
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleAdd} data-testid="button-confirm-add-server">
                  {t('admin.servers.createServerBtn')}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
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
                    value={serverName} 
                    onChange={(e) => setServerName(e.target.value)} 
                    data-testid="input-edit-server-name" 
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('admin.servers.region')}</Label>
                  <Input 
                    placeholder={t('admin.servers.regionPlaceholder')} 
                    value={serverRegion} 
                    onChange={(e) => setServerRegion(e.target.value)} 
                    data-testid="input-edit-server-region" 
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleUpdate} data-testid="button-confirm-edit-server">
                  {t('admin.servers.saveChanges')}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {servers.length === 0 && (
              <p className="text-muted-foreground text-center py-10">{t('admin.servers.noServers')}</p>
            )}
            {servers.map(server => (
              <div 
                key={server.id} 
                className="flex items-center justify-between p-3 border border-border/40 rounded-lg bg-muted/10" 
                data-testid={`server-item-${server.id}`}
              >
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                    {server.name[0]}
                  </div>
                  <div>
                    <p className="font-bold text-sm">{server.name}</p>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">{server.region}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => openEditDialog(server)} 
                    data-testid={`button-edit-server-${server.id}`}
                  >
                    <Edit className="h-4 w-4 mr-1" /> {t('common.edit')}
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="text-destructive" 
                    onClick={() => handleDelete(server.id)} 
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
    </AdminLayout>
  );
}
