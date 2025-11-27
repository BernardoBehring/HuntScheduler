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

export function HuntSchedule() {
  const { servers, respawns, slots, requests, addRequest, currentUser, periods } = useStore();
  const [selectedServer, setSelectedServer] = useState(servers[0]?.id);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Find active period or select the first one
  const activePeriod = periods.find(p => p.isActive) || periods[0];
  const [selectedPeriodId, setSelectedPeriodId] = useState<string>(activePeriod?.id);

  const currentPeriod = periods.find(p => p.id === selectedPeriodId);
  
  // Filter data
  const activeRespawns = respawns.filter(r => 
    r.serverId === selectedServer && 
    r.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const getRequestForSlot = (respawnId: string, slotId: string) => {
    if (!currentPeriod) return undefined;
    return requests.find(r => 
      r.respawnId === respawnId && 
      r.slotId === slotId && 
      r.periodId === currentPeriod.id &&
      r.status !== 'rejected'
    );
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between bg-card/50 p-4 rounded-lg border border-border/50 backdrop-blur-sm">
        <div className="flex gap-4 items-center w-full md:w-auto">
          <Select value={selectedServer} onValueChange={setSelectedServer}>
            <SelectTrigger className="w-[200px] border-primary/20 bg-background/50">
              <SelectValue placeholder="Select Server" />
            </SelectTrigger>
            <SelectContent>
              {servers.map(s => (
                <SelectItem key={s.id} value={s.id}>{s.name} ({s.region})</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedPeriodId} onValueChange={setSelectedPeriodId}>
             <SelectTrigger className="w-[260px] border-primary/20 bg-background/50">
               <SelectValue placeholder="Select Period" />
             </SelectTrigger>
             <SelectContent>
               {periods.map(p => (
                 <SelectItem key={p.id} value={p.id}>
                   {p.name} ({format(new Date(p.startDate), "MMM d")} - {format(new Date(p.endDate), "MMM d")})
                 </SelectItem>
               ))}
             </SelectContent>
          </Select>
        </div>

        <div className="relative w-full md:w-auto">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search respawn..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 w-full md:w-[200px] bg-background/50 border-primary/20"
          />
        </div>

        {currentPeriod && (
           <Badge variant="outline" className="ml-auto border-primary/30 text-primary bg-primary/5 hidden lg:flex">
             <CalendarIcon className="w-3 h-3 mr-2" />
             {format(new Date(currentPeriod.startDate), "MMM d, yyyy")} — {format(new Date(currentPeriod.endDate), "MMM d, yyyy")}
           </Badge>
        )}
      </div>

      {/* Schedule Grid */}
      <div className="rounded-md border border-border/40 overflow-hidden bg-card/30 shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-muted/30 border-b border-border/40">
              <tr>
                <th className="px-6 py-4 font-display font-bold tracking-wider text-primary">Respawn Area</th>
                {slots.map(slot => (
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
                <tr key={respawn.id} className="hover:bg-muted/10 transition-colors">
                  <td className="px-6 py-4 font-medium">
                    <div className="flex flex-col gap-1">
                      <span className="text-foreground font-semibold">{respawn.name}</span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Users className="h-3 w-3" /> Max {respawn.maxPlayers}
                        <span className="mx-1">•</span>
                        <span className={cn(
                          "px-1.5 py-0.5 rounded text-[10px] border",
                          respawn.difficulty === 'easy' ? "border-green-500/30 text-green-400 bg-green-500/10" :
                          respawn.difficulty === 'medium' ? "border-yellow-500/30 text-yellow-400 bg-yellow-500/10" :
                          respawn.difficulty === 'hard' ? "border-orange-500/30 text-orange-400 bg-orange-500/10" :
                          "border-red-500/30 text-red-400 bg-red-500/10"
                        )}>{respawn.difficulty}</span>
                      </span>
                    </div>
                  </td>
                  {slots.map(slot => {
                    const request = getRequestForSlot(respawn.id, slot.id);
                    return (
                      <td key={slot.id} className="px-4 py-3 text-center">
                        {request ? (
                          <div className={cn(
                            "p-3 rounded-md border flex flex-col gap-1 text-xs items-center shadow-sm",
                            request.status === 'approved' 
                              ? "bg-green-500/10 border-green-500/30 text-green-300" 
                              : "bg-primary/10 border-primary/30 text-primary"
                          )}>
                            <span className="font-bold">{request.status === 'approved' ? 'BOOKED' : 'PENDING'}</span>
                            <span className="opacity-70">User #{request.userId}</span>
                          </div>
                        ) : (
                          currentPeriod ? (
                            <RequestDialog 
                              server={selectedServer!} 
                              respawn={respawn} 
                              slot={slot} 
                              period={currentPeriod}
                            />
                          ) : <span className="text-muted-foreground text-xs">No Active Period</span>
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

  const handleSubmit = () => {
    addRequest({
      userId: currentUser!.id,
      serverId: server,
      respawnId: respawn.id,
      slotId: slot.id,
      periodId: period.id,
      partyMembers: party.filter(p => p.trim() !== '')
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
        >
          <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider group-hover:scale-105 transition-transform">
            <Plus className="h-3 w-3" />
            Request
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-display text-primary">Request Hunt</DialogTitle>
          <DialogDescription>
            {respawn.name} • {slot.startTime} - {slot.endTime}
            <br/>
            <span className="text-xs text-primary mt-1 block font-semibold">
              Period: {period.name} ({format(new Date(period.startDate), "MMM d")} - {format(new Date(period.endDate), "MMM d")})
            </span>
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="bg-muted/20 p-3 rounded-md border border-border/50 flex items-start gap-2">
             <AlertCircle className="h-4 w-4 text-primary mt-0.5" />
             <p className="text-xs text-muted-foreground">
               You are requesting this slot for the entire duration of the selected period. Ensure your team can commit to this schedule.
             </p>
          </div>

          <div className="space-y-2">
            <Label>Party Leader</Label>
            <Input value={currentUser?.username} disabled className="bg-muted/50" />
          </div>
          <div className="space-y-2">
            <Label>Party Members (Optional)</Label>
            {party.map((member, i) => (
              <Input 
                key={i} 
                placeholder={`Member ${i + 1} Name`}
                value={member}
                onChange={(e) => {
                  const newParty = [...party];
                  newParty[i] = e.target.value;
                  setParty(newParty);
                }}
              />
            ))}
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleSubmit} className="bg-primary text-primary-foreground hover:bg-primary/90">
            Confirm Request
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
