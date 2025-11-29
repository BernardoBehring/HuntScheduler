import { Layout } from "@/components/layout";
import { useStore } from "@/lib/mockData";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trophy, Clock, AlertCircle, Swords, Upload, FileText, CheckCircle, XCircle } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, PointClaim } from "@/lib/api";

export default function Dashboard() {
  const { currentUser, requests, respawns, slots, periods, getStatusName } = useStore();
  const [isClaimOpen, setIsClaimOpen] = useState(false);
  const [claimPoints, setClaimPoints] = useState('');
  const [claimNote, setClaimNote] = useState('');
  const [claimScreenshotUrl, setClaimScreenshotUrl] = useState('');
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  
  const myRequests = requests
    .filter(r => r.userId === currentUser?.id)
    .sort((a, b) => b.createdAt - a.createdAt);

  const userId = currentUser?.id ? (typeof currentUser.id === 'string' ? parseInt(currentUser.id) : currentUser.id) : undefined;
  
  const { data: myClaims = [], isLoading: claimsLoading } = useQuery({
    queryKey: ['pointClaims', 'user', userId],
    queryFn: () => userId ? api.pointClaims.getByUser(userId) : Promise.resolve([]),
    enabled: !!userId,
  });

  const createClaimMutation = useMutation({
    mutationFn: (data: { userId: number; pointsRequested: number; note?: string; screenshotUrl?: string }) => 
      api.pointClaims.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pointClaims'] });
      setIsClaimOpen(false);
      setClaimPoints('');
      setClaimNote('');
      setClaimScreenshotUrl('');
      toast({
        title: t('dashboard.claimSubmitted'),
        description: t('dashboard.claimDescription'),
      });
    },
    onError: (error: Error) => {
      toast({
        title: t('common.error'),
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const getRespawnName = (id: string) => respawns.find(r => r.id === id)?.name || t('common.unknown');
  const getSlotTime = (id: string) => {
    const s = slots.find(sl => sl.id === id);
    return s ? `${s.startTime} - ${s.endTime}` : t('common.unknown');
  };
  const getPeriodName = (id: string) => periods.find(p => p.id === id)?.name || t('common.unknown');

  const getTranslatedStatus = (statusId: string) => {
    const statusMap: Record<string, string> = {
      '1': 'pending',
      '2': 'approved', 
      '3': 'rejected',
      '4': 'cancelled'
    };
    return t(`status.${statusMap[statusId] || 'pending'}`);
  };

  const getClaimStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-500/20 text-green-400 hover:bg-green-500/30 border-green-500/20';
      case 'rejected':
        return 'bg-destructive/20 text-destructive hover:bg-destructive/30 border-destructive/20';
      default:
        return 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 border-yellow-500/20';
    }
  };

  const handleClaimPoints = () => {
    if (!userId) return;
    const points = parseInt(claimPoints);
    if (isNaN(points) || points <= 0) {
      toast({
        title: t('common.error'),
        description: t('dashboard.invalidPoints'),
        variant: 'destructive',
      });
      return;
    }
    createClaimMutation.mutate({
      userId: userId,
      pointsRequested: points,
      note: claimNote || undefined,
      screenshotUrl: claimScreenshotUrl || undefined,
    });
  };

  const sortedClaims = [...myClaims].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <Layout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-primary">{t('dashboard.title')}</h1>
          <p className="text-muted-foreground">{t('dashboard.welcome')}, {currentUser?.username}</p>
        </div>
        
        <Dialog open={isClaimOpen} onOpenChange={setIsClaimOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90" data-testid="button-claim-points">
              <Upload className="h-4 w-4" />
              {t('dashboard.claimPoints')}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('dashboard.claimGuildPoints')}</DialogTitle>
              <DialogDescription>{t('dashboard.uploadScreenshot')}</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="points">{t('dashboard.pointsRequested')}</Label>
                <Input 
                  id="points" 
                  type="number" 
                  min="1"
                  value={claimPoints}
                  onChange={(e) => setClaimPoints(e.target.value)}
                  placeholder="e.g. 50"
                  data-testid="input-claim-points"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="screenshot">{t('dashboard.screenshotUrl')}</Label>
                <Input 
                  id="screenshot" 
                  value={claimScreenshotUrl}
                  onChange={(e) => setClaimScreenshotUrl(e.target.value)}
                  placeholder="https://imgur.com/..."
                  data-testid="input-claim-screenshot"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="note">{t('dashboard.noteOptional')}</Label>
                <Textarea 
                  id="note" 
                  value={claimNote}
                  onChange={(e) => setClaimNote(e.target.value)}
                  placeholder="e.g. Guild War Event - First Place"
                  data-testid="input-claim-note"
                />
              </div>
            </div>
            <DialogFooter>
              <Button 
                onClick={handleClaimPoints} 
                disabled={createClaimMutation.isPending}
                data-testid="button-submit-claim"
              >
                {createClaimMutation.isPending ? t('common.loading') : t('dashboard.submitClaim')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Stats Card */}
        <Card className="bg-gradient-to-br from-card to-card/50 border-primary/20 shadow-lg shadow-primary/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t('dashboard.guildPoints')}</CardTitle>
            <Trophy className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-display font-bold text-primary" data-testid="text-user-points">{currentUser?.points}</div>
            <p className="text-xs text-muted-foreground mt-1">{t('dashboard.fromLastWeek')}</p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t('dashboard.activeRequests')}</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-pending-count">
              {myRequests.filter(r => r.statusId === '1').length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">{t('dashboard.pendingApproval')}</p>
          </CardContent>
        </Card>

         <Card className="bg-card/50 border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t('dashboard.upcomingHunts')}</CardTitle>
            <Swords className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-approved-count">
              {myRequests.filter(r => r.statusId === '2').length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">{t('dashboard.approvedSessions')}</p>
          </CardContent>
        </Card>
      </div>

      {/* My History Tabs */}
      <Card className="col-span-full bg-card/30 backdrop-blur-md border-border/50">
        <Tabs defaultValue="requests" className="w-full">
          <CardHeader>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <CardTitle className="font-display text-xl">{t('dashboard.myHistory')}</CardTitle>
                <CardDescription>{t('dashboard.trackStatus')}</CardDescription>
              </div>
              <TabsList className="bg-card/50">
                <TabsTrigger value="requests" data-testid="tab-requests">
                  <Swords className="h-4 w-4 mr-2" />
                  {t('dashboard.huntRequests')}
                </TabsTrigger>
                <TabsTrigger value="claims" data-testid="tab-claims">
                  <Trophy className="h-4 w-4 mr-2" />
                  {t('dashboard.pointClaims')}
                </TabsTrigger>
              </TabsList>
            </div>
          </CardHeader>
          <CardContent>
            <TabsContent value="requests" className="mt-0">
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-4">
                  {myRequests.length === 0 && (
                    <div className="text-center py-10 text-muted-foreground">
                      <p>{t('dashboard.noRequests')}</p>
                      <Link href="/schedule">
                        <Button variant="link" className="text-primary" data-testid="link-go-to-schedule">{t('dashboard.goToSchedule')}</Button>
                      </Link>
                    </div>
                  )}
                  {myRequests.map(req => {
                    const statusName = getTranslatedStatus(req.statusId);
                    return (
                      <div key={req.id} className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 rounded-lg border border-border/40 bg-card/40 hover:bg-card/60 transition-colors gap-4" data-testid={`request-item-${req.id}`}>
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
                              {req.partyMembers.length + 1} {t('common.members')}
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
            </TabsContent>
            
            <TabsContent value="claims" className="mt-0">
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-4">
                  {claimsLoading && (
                    <div className="text-center py-10 text-muted-foreground">
                      <p>{t('common.loading')}</p>
                    </div>
                  )}
                  {!claimsLoading && sortedClaims.length === 0 && (
                    <div className="text-center py-10 text-muted-foreground">
                      <p>{t('dashboard.noClaims')}</p>
                      <Button variant="link" className="text-primary" onClick={() => setIsClaimOpen(true)} data-testid="link-submit-claim">
                        {t('dashboard.submitFirstClaim')}
                      </Button>
                    </div>
                  )}
                  {sortedClaims.map(claim => (
                    <div key={claim.id} className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 rounded-lg border border-border/40 bg-card/40 hover:bg-card/60 transition-colors gap-4" data-testid={`claim-item-${claim.id}`}>
                      <div className="space-y-1 flex-1">
                        <h4 className="font-semibold text-foreground flex items-center gap-2">
                          <Trophy className="h-4 w-4 text-primary" />
                          {claim.pointsRequested} {t('common.points')}
                        </h4>
                        <div className="text-sm text-muted-foreground flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(claim.createdAt).toLocaleDateString()}
                          </span>
                          {claim.note && (
                            <span className="flex items-center gap-1">
                              <FileText className="h-3 w-3" />
                              {claim.note}
                            </span>
                          )}
                        </div>
                        {claim.adminResponse && (
                          <p className={`text-xs flex items-center gap-1 mt-1 ${claim.status === 'rejected' ? 'text-destructive' : 'text-green-400'}`}>
                            {claim.status === 'approved' ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                            {claim.adminResponse}
                          </p>
                        )}
                      </div>
                      
                      <Badge className={getClaimStatusBadge(claim.status)}>
                        {t(`status.${claim.status}`).toUpperCase()}
                      </Badge>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>
    </Layout>
  );
}
