import { Layout } from "@/components/layout";
import { useStore } from "@/lib/mockData";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trophy, Clock, AlertCircle, Swords, Upload } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

export default function Dashboard() {
  const { currentUser, requests, respawns, slots, periods, getStatusName } = useStore();
  const [isClaimOpen, setIsClaimOpen] = useState(false);
  
  const myRequests = requests
    .filter(r => r.userId === currentUser?.id)
    .sort((a, b) => b.createdAt - a.createdAt);

  const getRespawnName = (id: string) => respawns.find(r => r.id === id)?.name || 'Unknown';
  const getSlotTime = (id: string) => {
    const s = slots.find(sl => sl.id === id);
    return s ? `${s.startTime} - ${s.endTime}` : 'Unknown';
  };
  const getPeriodName = (id: string) => periods.find(p => p.id === id)?.name || 'Unknown Period';

  const handleClaimPoints = () => {
    setIsClaimOpen(false);
    toast({
      title: "Claim Submitted",
      description: "Your screenshot has been uploaded for admin review.",
    });
  };

  return (
    <Layout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-primary">Command Center</h1>
          <p className="text-muted-foreground">Welcome back, {currentUser?.username}</p>
        </div>
        
        <Dialog open={isClaimOpen} onOpenChange={setIsClaimOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
              <Upload className="h-4 w-4" />
              Claim Points
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Claim Guild Points</DialogTitle>
              <DialogDescription>Upload a screenshot of your hunt or event participation.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="screenshot">Screenshot Evidence</Label>
                <div className="border-2 border-dashed border-border/60 rounded-lg p-8 text-center hover:bg-muted/10 transition-colors cursor-pointer">
                  <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">Click to upload or drag and drop</p>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="note">Note (Optional)</Label>
                <Input id="note" placeholder="e.g. Guild War Event" />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleClaimPoints}>Submit Claim</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Stats Card */}
        <Card className="bg-gradient-to-br from-card to-card/50 border-primary/20 shadow-lg shadow-primary/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Guild Points</CardTitle>
            <Trophy className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-display font-bold text-primary">{currentUser?.points}</div>
            <p className="text-xs text-muted-foreground mt-1">+20 from last week</p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Requests</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {myRequests.filter(r => r.statusId === '1').length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Pending approval</p>
          </CardContent>
        </Card>

         <Card className="bg-card/50 border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Upcoming Hunts</CardTitle>
            <Swords className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {myRequests.filter(r => r.statusId === '2').length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Approved sessions</p>
          </CardContent>
        </Card>
      </div>

      {/* My Requests List */}
      <Card className="col-span-full bg-card/30 backdrop-blur-md border-border/50">
        <CardHeader>
          <CardTitle className="font-display text-xl">My Requests History</CardTitle>
          <CardDescription>Track the status of your hunt applications</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-4">
              {myRequests.length === 0 && (
                <div className="text-center py-10 text-muted-foreground">
                  <p>No requests found.</p>
                  <Link href="/schedule">
                    <Button variant="link" className="text-primary">Go to Schedule</Button>
                  </Link>
                </div>
              )}
              {myRequests.map(req => {
                const statusName = getStatusName(req.statusId);
                return (
                  <div key={req.id} className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 rounded-lg border border-border/40 bg-card/40 hover:bg-card/60 transition-colors gap-4">
                    <div className="space-y-1">
                      <h4 className="font-semibold text-foreground flex items-center gap-2">
                        {getRespawnName(req.respawnId)}
                        <Badge variant="outline" className="text-[10px] h-5 border-border/50 text-muted-foreground">
                          {getPeriodName(req.periodId)}
                        </Badge>
                      </h4>
                      <div className="text-sm text-muted-foreground flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {getSlotTime(req.slotId)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Swords className="h-3 w-3" />
                          {req.partyMembers.length + 1} Members
                        </span>
                      </div>
                      {req.statusId === '3' && req.rejectionReason && (
                        <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                          <AlertCircle className="h-3 w-3" />
                          {req.rejectionReason}
                        </p>
                      )}
                    </div>
                    
                    <Badge className={
                      req.statusId === '2' ? "bg-green-500/20 text-green-400 hover:bg-green-500/30 border-green-500/20" :
                      req.statusId === '3' ? "bg-destructive/20 text-destructive hover:bg-destructive/30 border-destructive/20" :
                      "bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 border-yellow-500/20"
                    }>
                      {statusName.toUpperCase()}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </Layout>
  );
}
