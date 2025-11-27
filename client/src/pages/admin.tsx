import { Layout } from "@/components/layout";
import { useStore, Status } from "@/lib/mockData";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Check, X, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

export default function Admin() {
  const { requests, users, updateRequestStatus, addPoints, servers, respawns } = useStore();
  const [activeTab, setActiveTab] = useState("requests");

  // Derived data
  const pendingRequests = requests.filter(r => r.status === 'pending').sort((a, b) => b.createdAt - a.createdAt);
  const processedRequests = requests.filter(r => r.status !== 'pending').sort((a, b) => b.createdAt - a.createdAt);

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
          <TabsTrigger value="respawns" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">Respawns & Slots</TabsTrigger>
          <TabsTrigger value="users" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">Users & Points</TabsTrigger>
        </TabsList>

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
                          <Badge variant="outline">{req.date}</Badge>
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
              <Button><Plus className="h-4 w-4 mr-2" /> Add Respawn</Button>
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
                       <Button size="sm" variant="ghost">Edit</Button>
                       <Button size="sm" variant="ghost" className="text-destructive"><Trash2 className="h-4 w-4"/></Button>
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
