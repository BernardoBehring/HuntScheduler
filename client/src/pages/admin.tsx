import { Layout } from "@/components/layout";
import { useStore, Status, Respawn } from "@/lib/mockData";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Check, X, Plus, Trash2, Calendar } from "lucide-react";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Admin() {
  const { requests, users, updateRequestStatus, addPoints, servers, respawns, periods, addPeriod, togglePeriod, addRespawn, updateRespawn, deleteRespawn } = useStore();
  const [activeTab, setActiveTab] = useState("requests");

  // Derived data
  const pendingRequests = requests.filter(r => r.status === 'pending').sort((a, b) => b.createdAt - a.createdAt);
  const processedRequests = requests.filter(r => r.status !== 'pending').sort((a, b) => b.createdAt - a.createdAt);

  // New Period State
  const [newPeriodName, setNewPeriodName] = useState("");
  const [newPeriodStart, setNewPeriodStart] = useState("");
  const [newPeriodEnd, setNewPeriodEnd] = useState("");

  // Respawn State
  const [isAddRespawnOpen, setIsAddRespawnOpen] = useState(false);
  const [isEditRespawnOpen, setIsEditRespawnOpen] = useState(false);
  const [editingRespawnId, setEditingRespawnId] = useState<string | null>(null);
  
  const [newRespawnName, setNewRespawnName] = useState("");
  const [newRespawnServer, setNewRespawnServer] = useState(servers[0]?.id || "");
  const [newRespawnDifficulty, setNewRespawnDifficulty] = useState<Respawn['difficulty']>("medium");
  const [newRespawnMaxPlayers, setNewRespawnMaxPlayers] = useState("4");

  const handleReview = (id: string, status: Status, reason?: string) => {
    updateRequestStatus(id, status, reason);
    toast({
      title: `Request ${status}`,
      description: `The hunt request has been ${status}.`,
      variant: status === 'approved' ? 'default' : 'destructive',
    });
  };

  const handleAddPoints = (userId: string, amount: number) => {
    addPoints(userId, amount);
    toast({ title: "Points Updated", description: `Added ${amount} points to user.` });
  };

  const handleCreatePeriod = () => {
    if (!newPeriodName || !newPeriodStart || !newPeriodEnd) return;
    addPeriod({
      name: newPeriodName,
      startDate: newPeriodStart,
      endDate: newPeriodEnd,
      isActive: true
    });
    toast({ title: "Period Created", description: "New hunt rotation period added." });
    setNewPeriodName("");
    setNewPeriodStart("");
    setNewPeriodEnd("");
  };

  const openAddRespawnDialog = () => {
    setNewRespawnName("");
    setNewRespawnServer(servers[0]?.id || "");
    setNewRespawnDifficulty("medium");
    setNewRespawnMaxPlayers("4");
    setIsAddRespawnOpen(true);
  };

  const openEditRespawnDialog = (respawn: Respawn) => {
    setEditingRespawnId(respawn.id);
    setNewRespawnName(respawn.name);
    setNewRespawnServer(respawn.serverId);
    setNewRespawnDifficulty(respawn.difficulty);
    setNewRespawnMaxPlayers(respawn.maxPlayers.toString());
    setIsEditRespawnOpen(true);
  };

  const handleAddRespawn = () => {
    if (!newRespawnName || !newRespawnServer) return;
    addRespawn({
      name: newRespawnName,
      serverId: newRespawnServer,
      difficulty: newRespawnDifficulty,
      maxPlayers: parseInt(newRespawnMaxPlayers) || 4
    });
    toast({ title: "Respawn Added", description: "New respawn area has been created." });
    setIsAddRespawnOpen(false);
  };

  const handleUpdateRespawn = () => {
    if (!editingRespawnId || !newRespawnName || !newRespawnServer) return;
    updateRespawn(editingRespawnId, {
      name: newRespawnName,
      serverId: newRespawnServer,
      difficulty: newRespawnDifficulty,
      maxPlayers: parseInt(newRespawnMaxPlayers) || 4
    });
    toast({ title: "Respawn Updated", description: "Respawn area details updated." });
    setIsEditRespawnOpen(false);
    setEditingRespawnId(null);
  };

  const handleDeleteRespawn = (id: string) => {
    if (confirm("Are you sure you want to delete this respawn?")) {
      deleteRespawn(id);
      toast({ title: "Respawn Deleted", description: "Respawn area has been removed." });
    }
  };

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-display font-bold text-primary">Admin Command</h1>
        <Badge variant="outline" className="border-primary/50 text-primary px-4 py-1">
          Admin Access Granted
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-card/50 border border-border/50 p-1">
          <TabsTrigger value="requests" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">Requests Review</TabsTrigger>
          <TabsTrigger value="periods" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">Periods & Rotations</TabsTrigger>
          <TabsTrigger value="respawns" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">Respawns & Slots</TabsTrigger>
          <TabsTrigger value="users" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">Users & Points</TabsTrigger>
        </TabsList>

        {/* ... (Requests, Periods, Users tabs content remain unchanged) ... */}
        <TabsContent value="requests" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Pending Column */}
            <Card className="bg-card/30 border-border/50 h-[600px] flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Pending Approval
                  <Badge variant="secondary">{pendingRequests.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 p-0 overflow-hidden">
                <ScrollArea className="h-full p-6 pt-0">
                  <div className="space-y-4">
                    {pendingRequests.length === 0 && <p className="text-muted-foreground text-center py-10">No pending requests.</p>}
                    {pendingRequests.map(req => (
                      <div key={req.id} className="p-4 rounded-lg border border-border/50 bg-card/50 space-y-3 hover:border-primary/30 transition-all">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-bold text-primary">User #{req.userId}</p>
                            <p className="text-sm text-muted-foreground">
                              {respawns.find(r => r.id === req.respawnId)?.name}
                            </p>
                          </div>
                          <div className="text-right">
                            <Badge variant="outline" className="mb-1">
                              {periods.find(p => p.id === req.periodId)?.name || 'Unknown Period'}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="text-xs bg-muted/30 p-2 rounded text-muted-foreground">
                          Party: {req.partyMembers.length > 0 ? req.partyMembers.join(", ") : "Solo"}
                        </div>

                        <div className="flex gap-2 pt-2">
                          <Button size="sm" className="flex-1 bg-green-600 hover:bg-green-700 text-white" onClick={() => handleReview(req.id, 'approved')}>
                            <Check className="h-4 w-4 mr-1" /> Approve
                          </Button>
                          <Button size="sm" variant="destructive" className="flex-1" onClick={() => handleReview(req.id, 'rejected', 'Admin declined')}>
                            <X className="h-4 w-4 mr-1" /> Reject
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* History Column */}
            <Card className="bg-card/30 border-border/50 h-[600px] flex flex-col">
              <CardHeader>
                <CardTitle>History Log</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 p-0 overflow-hidden">
                <ScrollArea className="h-full p-6 pt-0">
                  <div className="space-y-4 opacity-70">
                    {processedRequests.map(req => (
                      <div key={req.id} className="p-3 rounded border border-border/30 flex justify-between items-center">
                        <div>
                          <p className="text-sm font-medium">Request #{req.id.slice(0,4)}</p>
                          <p className="text-xs text-muted-foreground">{req.status}</p>
                        </div>
                        <Badge variant={req.status === 'approved' ? 'default' : 'destructive'}>
                          {req.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="periods">
          <div className="grid gap-6 md:grid-cols-2">
             <Card className="bg-card/30 border-border/50">
               <CardHeader>
                 <CardTitle>Create New Period</CardTitle>
                 <CardDescription>Define a new hunt rotation schedule</CardDescription>
               </CardHeader>
               <CardContent className="space-y-4">
                 <div className="space-y-2">
                   <Label>Period Name</Label>
                   <Input placeholder="e.g. Week 50 - Christmas Special" value={newPeriodName} onChange={(e) => setNewPeriodName(e.target.value)} />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                     <Label>Start Date</Label>
                     <Input type="date" value={newPeriodStart} onChange={(e) => setNewPeriodStart(e.target.value)} />
                   </div>
                   <div className="space-y-2">
                     <Label>End Date</Label>
                     <Input type="date" value={newPeriodEnd} onChange={(e) => setNewPeriodEnd(e.target.value)} />
                   </div>
                 </div>
                 <Button onClick={handleCreatePeriod} className="w-full mt-4">Create Period</Button>
               </CardContent>
             </Card>

             <Card className="bg-card/30 border-border/50">
               <CardHeader>
                 <CardTitle>Active Periods</CardTitle>
               </CardHeader>
               <CardContent>
                 <ScrollArea className="h-[300px]">
                   <div className="space-y-3">
                     {periods.map(p => (
                       <div key={p.id} className="flex items-center justify-between p-3 rounded border border-border/40 bg-muted/10">
                         <div>
                           <p className="font-medium flex items-center gap-2">
                             {p.name}
                             {p.isActive && <Badge className="text-[10px] bg-primary/20 text-primary hover:bg-primary/20">Active</Badge>}
                           </p>
                           <p className="text-xs text-muted-foreground">
                             {format(new Date(p.startDate), "MMM d")} - {format(new Date(p.endDate), "MMM d, yyyy")}
                           </p>
                         </div>
                         <Button size="sm" variant="ghost" onClick={() => togglePeriod(p.id)}>
                           {p.isActive ? "Deactivate" : "Activate"}
                         </Button>
                       </div>
                     ))}
                   </div>
                 </ScrollArea>
               </CardContent>
             </Card>
          </div>
        </TabsContent>

        <TabsContent value="users">
          <Card className="bg-card/30 border-border/50">
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>Manage guild points and roles</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {users.map(user => (
                  <div key={user.id} className="flex items-center justify-between p-4 border border-border/40 rounded-lg bg-card/40">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                        {user.username[0]}
                      </div>
                      <div>
                        <p className="font-bold">{user.username}</p>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">{user.role}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-right mr-4">
                        <p className="text-sm font-medium text-primary">{user.points} PTS</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => handleAddPoints(user.id, -10)}>-</Button>
                        <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => handleAddPoints(user.id, 10)}>+</Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="respawns">
           <Card className="bg-card/30 border-border/50">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Server Configuration</CardTitle>
                <CardDescription>Manage respawn areas and global settings</CardDescription>
              </div>
              
              <Dialog open={isAddRespawnOpen} onOpenChange={setIsAddRespawnOpen}>
                <DialogTrigger asChild>
                  <Button onClick={openAddRespawnDialog}><Plus className="h-4 w-4 mr-2" /> Add Respawn</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Respawn</DialogTitle>
                    <DialogDescription>Create a new hunting area for players to book.</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label>Respawn Name</Label>
                      <Input placeholder="e.g. Library - Ice" value={newRespawnName} onChange={(e) => setNewRespawnName(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Server</Label>
                      <Select value={newRespawnServer} onValueChange={setNewRespawnServer}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Server" />
                        </SelectTrigger>
                        <SelectContent>
                          {servers.map(s => (
                            <SelectItem key={s.id} value={s.id}>{s.name} ({s.region})</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-2">
                        <Label>Difficulty</Label>
                        <Select value={newRespawnDifficulty} onValueChange={(v) => setNewRespawnDifficulty(v as any)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="easy">Easy</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="hard">Hard</SelectItem>
                            <SelectItem value="nightmare">Nightmare</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Max Players</Label>
                        <Input type="number" min="1" max="10" value={newRespawnMaxPlayers} onChange={(e) => setNewRespawnMaxPlayers(e.target.value)} />
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleAddRespawn}>Create Respawn</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Dialog open={isEditRespawnOpen} onOpenChange={setIsEditRespawnOpen}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Edit Respawn</DialogTitle>
                    <DialogDescription>Update details for this hunting area.</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label>Respawn Name</Label>
                      <Input placeholder="e.g. Library - Ice" value={newRespawnName} onChange={(e) => setNewRespawnName(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Server</Label>
                      <Select value={newRespawnServer} onValueChange={setNewRespawnServer}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Server" />
                        </SelectTrigger>
                        <SelectContent>
                          {servers.map(s => (
                            <SelectItem key={s.id} value={s.id}>{s.name} ({s.region})</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-2">
                        <Label>Difficulty</Label>
                        <Select value={newRespawnDifficulty} onValueChange={(v) => setNewRespawnDifficulty(v as any)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="easy">Easy</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="hard">Hard</SelectItem>
                            <SelectItem value="nightmare">Nightmare</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Max Players</Label>
                        <Input type="number" min="1" max="10" value={newRespawnMaxPlayers} onChange={(e) => setNewRespawnMaxPlayers(e.target.value)} />
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleUpdateRespawn}>Save Changes</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                 {respawns.map(r => (
                   <div key={r.id} className="flex items-center justify-between p-3 border border-border/40 rounded bg-muted/10">
                     <div>
                       <p className="font-medium">{r.name}</p>
                       <p className="text-xs text-muted-foreground">Max Players: {r.maxPlayers} • Difficulty: {r.difficulty}</p>
                     </div>
                     <div className="flex gap-2">
                       <Button size="sm" variant="ghost" onClick={() => openEditRespawnDialog(r)}>Edit</Button>
                       <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleDeleteRespawn(r.id)}><Trash2 className="h-4 w-4"/></Button>
                     </div>
                   </div>
                 ))}
              </div>
            </CardContent>
           </Card>
        </TabsContent>
      </Tabs>
    </Layout>
  );
}
