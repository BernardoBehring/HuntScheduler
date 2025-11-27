import { useStore } from "@/lib/mockData";
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
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Clock, Users, Sword, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export function HuntSchedule() {
  const { servers, respawns, slots, requests, addRequest, currentUser } = useStore();
  const [selectedServer, setSelectedServer] = useState(servers[0]?.id);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  // Filter data
  const activeRespawns = respawns.filter(r => r.serverId === selectedServer);
  const dateStr = format(selectedDate, "yyyy-MM-dd");
  
  const getRequestForSlot = (respawnId: string, slotId: string) => {
    return requests.find(r => 
      r.respawnId === respawnId && 
      r.slotId === slotId && 
      r.date === dateStr &&
      r.status !== 'rejected'
    );
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between bg-card/50 p-4 rounded-lg border border-border/50 backdrop-blur-sm">
        <div className="flex gap-4 items-center">
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

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className={cn(
                "w-[240px] justify-start text-left font-normal border-primary/20 bg-background/50",
                !selectedDate && "text-muted-foreground"
              )}>
                <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
                {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                initialFocus
                className="bg-card border border-border"
              />
            </PopoverContent>
          </Popover>
        </div>
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
                          <RequestDialog 
                            server={selectedServer!} 
                            respawn={respawn} 
                            slot={slot} 
                            date={dateStr}
                          />
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

function RequestDialog({ server, respawn, slot, date }: { server: string, respawn: any, slot: any, date: string }) {
  const { addRequest, currentUser } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const [party, setParty] = useState(['', '', '', '']);

  const handleSubmit = () => {
    addRequest({
      userId: currentUser!.id,
      serverId: server,
      respawnId: respawn.id,
      slotId: slot.id,
      date: date,
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
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
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
            Submit Request
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
