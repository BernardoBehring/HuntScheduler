import { AdminLayout } from "@/components/admin-layout";
import { useStore } from "@/lib/mockData";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTranslation } from "react-i18next";

export default function AdminPeriods() {
  const { servers, periods, addPeriod, togglePeriod } = useStore();
  const { t } = useTranslation();
  
  const activeServers = servers.filter(s => s.isActive);
  
  const [filterServer, setFilterServer] = useState<string>("all");
  const [newPeriodName, setNewPeriodName] = useState("");
  const [newPeriodStart, setNewPeriodStart] = useState("");
  const [newPeriodEnd, setNewPeriodEnd] = useState("");
  const [newPeriodServer, setNewPeriodServer] = useState(activeServers[0]?.id || "");

  const filteredPeriods = filterServer === "all"
    ? periods
    : periods.filter(p => p.serverId === filterServer);

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

  return (
    <AdminLayout title={t('admin.tabs.periods')} description={t('admin.periods.defineSchedule')}>
      <div className="flex justify-end mb-4">
        <Select value={filterServer} onValueChange={setFilterServer}>
          <SelectTrigger className="w-[180px]" data-testid="select-filter-periods-server">
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

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="bg-card/30 border-border/50">
          <CardHeader>
            <CardTitle className="text-base">{t('admin.periods.createNew')}</CardTitle>
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
                  {activeServers.map(s => (
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
            <CardTitle className="text-base">{t('admin.periods.activePeriods')}</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[350px]">
              <div className="space-y-3">
                {filteredPeriods.length === 0 && (
                  <p className="text-muted-foreground text-center py-10">{t('common.noData')}</p>
                )}
                {filteredPeriods.map(p => (
                  <div key={p.id} className="flex items-center justify-between p-3 rounded border border-border/40 bg-muted/10" data-testid={`period-item-${p.id}`}>
                    <div>
                      <span className="font-medium text-sm flex items-center gap-2">
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
    </AdminLayout>
  );
}
