import { AdminLayout } from "@/components/admin-layout";
import { useStore, User } from "@/lib/mockData";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TrendingUp, TrendingDown } from "lucide-react";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useTranslation } from "react-i18next";
import { api } from "@/lib/api";

export default function AdminUsers() {
  const { users, servers, characters, getRoleName, currentUser, loadFromApi } = useStore();
  const { t } = useTranslation();
  
  const activeServers = servers.filter(s => s.isActive);
  const [filterServer, setFilterServer] = useState<string>("all");
  const [isPointsDialogOpen, setIsPointsDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [pointsAmount, setPointsAmount] = useState("");
  const [pointsReason, setPointsReason] = useState("");
  const [pointsOperation, setPointsOperation] = useState<"add" | "remove">("add");

  const filteredUsers = filterServer === "all"
    ? users
    : users.filter(u => characters.some(c => c.userId === u.id && c.serverId === filterServer));

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
      
      toast({ 
        title: t('admin.users.pointsUpdated'), 
        description: t('admin.users.pointsUpdatedDesc', { amount: Math.abs(finalAmount) })
      });
    } catch (error) {
      toast({ title: t('errors.saveFailed'), variant: 'destructive' });
    }
  };

  return (
    <AdminLayout title={t('admin.tabs.users')} description={t('admin.users.description')}>
      <div className="flex justify-end mb-4">
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
            {filteredUsers.map(user => (
              <div key={user.id} className="flex items-center justify-between p-3 border border-border/40 rounded-lg bg-card/40" data-testid={`user-item-${user.id}`}>
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
            ))}
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
