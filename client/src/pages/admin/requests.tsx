import { AdminLayout } from "@/components/admin-layout";
import { useStore } from "@/lib/mockData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Check, X } from "lucide-react";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTranslation } from "react-i18next";

export default function AdminRequests() {
  const { requests, users, updateRequestStatus, servers, respawns, periods, characters, slots } = useStore();
  const { t } = useTranslation();
  const [filterServer, setFilterServer] = useState<string>("all");

  const filteredPendingRequests = (filterServer === "all" 
    ? requests.filter(r => String(r.statusId) === '1')
    : requests.filter(r => String(r.statusId) === '1' && String(r.serverId) === filterServer)
  ).sort((a, b) => b.createdAt - a.createdAt);

  const filteredProcessedRequests = (filterServer === "all"
    ? requests.filter(r => String(r.statusId) !== '1')
    : requests.filter(r => String(r.statusId) !== '1' && String(r.serverId) === filterServer)
  ).sort((a, b) => b.createdAt - a.createdAt);

  const getCharacterName = (userId: string, serverId: string) => {
    const character = characters.find(c => c.userId === userId && c.serverId === serverId && c.isMain);
    if (character) return character.name;
    const anyCharacter = characters.find(c => c.userId === userId && c.serverId === serverId);
    if (anyCharacter) return anyCharacter.name;
    const user = users.find(u => u.id === userId);
    return user?.username || `User #${userId}`;
  };

  const getTranslatedStatus = (statusId: string) => {
    const statusMap: Record<string, string> = {
      '1': 'pending',
      '2': 'approved', 
      '3': 'rejected',
      '4': 'cancelled'
    };
    return t(`status.${statusMap[statusId] || 'pending'}`);
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

  return (
    <AdminLayout title={t('admin.tabs.requests')} description={t('admin.requests.pendingApproval')}>
      <div className="flex justify-end mb-4">
        <Select value={filterServer} onValueChange={setFilterServer}>
          <SelectTrigger className="w-[180px]" data-testid="select-filter-requests-server">
            <SelectValue placeholder={t('common.allServers')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('common.allServers')}</SelectItem>
            {servers.map(s => (
              <SelectItem key={s.id} value={String(s.id)}>{s.name} ({s.region})</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="bg-card/30 border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              {t('admin.requests.pendingApproval')}
              <Badge variant="secondary">{filteredPendingRequests.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-3">
                {filteredPendingRequests.length === 0 && (
                  <p className="text-muted-foreground text-center py-10">{t('admin.requests.noPending')}</p>
                )}
                {filteredPendingRequests.map(req => {
                  const serverName = servers.find(s => s.id === req.serverId)?.name || t('common.unknown');
                  return (
                    <div key={req.id} className="p-3 rounded-lg border border-border/50 bg-card/50 space-y-2 hover:border-primary/30 transition-all" data-testid={`pending-request-${req.id}`}>
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-bold text-primary text-sm">{getCharacterName(req.userId, req.serverId)}</p>
                          <p className="text-xs text-muted-foreground">
                            {respawns.find(r => r.id === req.respawnId)?.name}
                          </p>
                          <p className="text-xs text-primary/70">{serverName}</p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {periods.find(p => p.id === req.periodId)?.name || t('common.unknown')}
                        </Badge>
                      </div>
                      
                      <div className="text-xs bg-muted/30 p-2 rounded text-muted-foreground">
                        Party: {req.partyMembers.length > 0 ? req.partyMembers.map(pm => pm.character?.name || pm.characterId).join(", ") : t('common.solo')}
                      </div>

                      <div className="flex gap-2 pt-1">
                        <Button size="sm" className="flex-1 bg-green-600 hover:bg-green-700 text-white h-8" onClick={() => handleReview(req.id, '2')} data-testid={`button-approve-${req.id}`}>
                          <Check className="h-3 w-3 mr-1" /> {t('admin.requests.approve')}
                        </Button>
                        <Button size="sm" variant="destructive" className="flex-1 h-8" onClick={() => handleReview(req.id, '3', 'Admin declined')} data-testid={`button-reject-${req.id}`}>
                          <X className="h-3 w-3 mr-1" /> {t('admin.requests.reject')}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <Card className="bg-card/30 border-border/50">
          <CardHeader>
            <CardTitle className="text-base">{t('admin.requests.historyLog')}</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-2 opacity-70">
                {filteredProcessedRequests.map(req => {
                  const statusName = getTranslatedStatus(req.statusId);
                  const respawnName = respawns.find(r => r.id === req.respawnId)?.name || t('common.unknown');
                  const slotInfo = slots.find(s => s.id === req.slotId);
                  const periodName = periods.find(p => p.id === req.periodId)?.name || t('common.unknown');
                  const serverName = servers.find(s => s.id === req.serverId)?.name || t('common.unknown');
                  return (
                    <div key={req.id} className="p-2 rounded border border-border/30 space-y-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm font-medium text-primary">{getCharacterName(req.userId, req.serverId)}</p>
                          <p className="text-xs text-muted-foreground">{respawnName}</p>
                          <p className="text-xs text-primary/70">{serverName}</p>
                        </div>
                        <Badge variant={req.statusId === '2' ? 'default' : 'destructive'} className="text-xs">
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
    </AdminLayout>
  );
}
