import { useStore, SchedulePeriod } from "@/lib/mockData";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { CalendarIcon, Clock, Users, Sword, Plus, AlertCircle, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

export function HuntSchedule() {
  const { servers, respawns, slots, requests, addRequest, currentUser, periods, getDifficultyName } = useStore();
  const [selectedServer, setSelectedServer] = useState(servers[0]?.id);
  const [searchQuery, setSearchQuery] = useState("");
  const { t } = useTranslation();
  
  const activePeriod = periods.find(p => p.isActive) || periods[0];
  const [selectedPeriodId, setSelectedPeriodId] = useState<string>(activePeriod?.id);

  const currentPeriod = periods.find(p => p.id === selectedPeriodId);
  
  const activeRespawns = respawns.filter(r => 
    r.serverId === selectedServer && 
    r.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeSlots = slots.filter(s => s.serverId === selectedServer);
  
  const getRequestForSlot = (respawnId: string, slotId: string) => {
    if (!currentPeriod) return undefined;
    return requests.find(r => 
      r.respawnId === respawnId && 
      r.slotId === slotId && 
      r.periodId === currentPeriod.id &&
      r.statusId !== '3'
    );
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

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col gap-4 bg-card/50 p-4 rounded-lg border border-border/50 backdrop-blur-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Select value={selectedServer} onValueChange={setSelectedServer}>
            <SelectTrigger className="w-full border-primary/20 bg-background/50" data-testid="select-server">
              <SelectValue placeholder={t('schedule.selectServer')} />
            </SelectTrigger>
            <SelectContent>
              {servers.map(s => (
                <SelectItem key={s.id} value={s.id} data-testid={`server-option-${s.id}`}>{s.name} ({s.region})</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedPeriodId} onValueChange={setSelectedPeriodId}>
             <SelectTrigger className="w-full border-primary/20 bg-background/50" data-testid="select-period">
               <SelectValue placeholder={t('schedule.selectPeriod')} />
             </SelectTrigger>
             <SelectContent>
               {periods.map(p => (
                 <SelectItem key={p.id} value={p.id} data-testid={`period-option-${p.id}`}>
                   {p.name} ({format(new Date(p.startDate), "MMM d")} - {format(new Date(p.endDate), "MMM d")})
                 </SelectItem>
               ))}
             </SelectContent>
          </Select>

          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('schedule.searchRespawn')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 w-full bg-background/50 border-primary/20"
              data-testid="input-search-respawn"
            />
          </div>

          {currentPeriod && (
             <Badge variant="outline" className="border-primary/30 text-primary bg-primary/5 hidden lg:flex items-center justify-center">
               <CalendarIcon className="w-3 h-3 mr-2 flex-shrink-0" />
               <span className="truncate">{format(new Date(currentPeriod.startDate), "MMM d")} — {format(new Date(currentPeriod.endDate), "MMM d")}</span>
             </Badge>
          )}
        </div>
      </div>

      {/* Schedule Grid */}
      <div className="rounded-md border border-border/40 overflow-hidden bg-card/30 shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-muted/30 border-b border-border/40">
              <tr>
                <th className="px-6 py-4 font-display font-bold tracking-wider text-primary">{t('schedule.respawnArea')}</th>
                {activeSlots.map(slot => (
                  <th key={slot.id} className="px-6 py-4 text-center min-w-[180px]">
                    <div className="flex items-center justify-center gap-2">
                      <Clock className="h-3 w-3" />
                      {slot.startTime} - {slot.endTime}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/20">
              {activeRespawns.map(respawn => (
                <tr key={respawn.id} className="hover:bg-muted/10 transition-colors" data-testid={`respawn-row-${respawn.id}`}>
                  <td className="px-6 py-4 font-medium">
                    <div className="flex flex-col gap-1">
                      <span className="text-foreground font-semibold">{respawn.name}</span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Users className="h-3 w-3" /> {t('common.max')} {respawn.maxPlayers}
                        <span className="mx-1">•</span>
                        <span className={cn(
                          "px-1.5 py-0.5 rounded text-[10px] border",
                          respawn.difficultyId === '1' ? "border-green-500/30 text-green-400 bg-green-500/10" :
                          respawn.difficultyId === '2' ? "border-yellow-500/30 text-yellow-400 bg-yellow-500/10" :
                          respawn.difficultyId === '3' ? "border-orange-500/30 text-orange-400 bg-orange-500/10" :
                          "border-red-500/30 text-red-400 bg-red-500/10"
                        )}>{getTranslatedDifficulty(respawn.difficultyId)}</span>
                      </span>
                    </div>
                  </td>
                  {activeSlots.map(slot => {
                    const request = getRequestForSlot(respawn.id, slot.id);
                    return (
                      <td key={slot.id} className="px-4 py-3 text-center">
                        {request ? (
                          <div className={cn(
                            "p-3 rounded-md border flex flex-col gap-1 text-xs items-center shadow-sm",
                            request.statusId === '2' 
                              ? "bg-green-500/10 border-green-500/30 text-green-300" 
                              : "bg-primary/10 border-primary/30 text-primary"
                          )}>
                            <span className="font-bold">{request.statusId === '2' ? t('status.booked') : t('status.pending').toUpperCase()}</span>
                            <span className="opacity-70">{t('common.user')} #{request.userId}</span>
                          </div>
                        ) : (
                          currentPeriod ? (
                            <RequestDialog 
                              server={selectedServer!} 
                              respawn={respawn} 
                              slot={slot} 
                              period={currentPeriod}
                            />
                          ) : <span className="text-muted-foreground text-xs">{t('schedule.noActivePeriod')}</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function RequestDialog({ server, respawn, slot, period }: { server: string, respawn: any, slot: any, period: SchedulePeriod }) {
  const { addRequest, currentUser } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const [party, setParty] = useState(['', '', '', '']);
  const { t } = useTranslation();

  const handleSubmit = () => {
    const filteredParty = party.filter(p => p.trim() !== '');
    addRequest({
      userId: currentUser!.id,
      serverId: server,
      respawnId: respawn.id,
      slotId: slot.id,
      periodId: period.id,
      partyMembers: filteredParty.map((name, idx) => ({
        id: `temp-${idx}`,
        requestId: '',
        characterId: '',
        character: { id: '', name, serverId: server, level: 0, isMain: false },
        roleInParty: 'member'
      }))
    });
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full h-full min-h-[45px] border-dashed border-primary/30 hover:border-primary hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all group"
          data-testid={`button-request-${respawn.id}-${slot.id}`}
        >
          <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider group-hover:scale-105 transition-transform">
            <Plus className="h-3 w-3" />
            {t('schedule.request')}
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-display text-primary">{t('schedule.requestHunt')}</DialogTitle>
          <DialogDescription>
            {respawn.name} • {slot.startTime} - {slot.endTime}
            <br/>
            <span className="text-xs text-primary mt-1 block font-semibold">
              {t('common.period')}: {period.name} ({format(new Date(period.startDate), "MMM d")} - {format(new Date(period.endDate), "MMM d")})
            </span>
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="bg-muted/20 p-3 rounded-md border border-border/50 flex items-start gap-2">
             <AlertCircle className="h-4 w-4 text-primary mt-0.5" />
             <p className="text-xs text-muted-foreground">
               {t('schedule.requestWarning')}
             </p>
          </div>

          <div className="space-y-2">
            <Label>{t('schedule.partyLeader')}</Label>
            <Input value={currentUser?.username} disabled className="bg-muted/50" />
          </div>
          <div className="space-y-2">
            <Label>{t('schedule.partyMembersOptional')}</Label>
            {party.map((member, i) => (
              <Input 
                key={i} 
                placeholder={t('schedule.memberPlaceholder', { number: i + 1 })}
                value={member}
                onChange={(e) => {
                  const newParty = [...party];
                  newParty[i] = e.target.value;
                  setParty(newParty);
                }}
                data-testid={`input-party-member-${i}`}
              />
            ))}
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleSubmit} className="bg-primary text-primary-foreground hover:bg-primary/90" data-testid="button-confirm-request">
            {t('schedule.confirmRequest')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
