import { AdminLayout } from "@/components/admin-layout";
import { useStore } from "@/lib/mockData";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Check, X, Trophy, Clock, Eye, ExternalLink } from "lucide-react";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useTranslation } from "react-i18next";
import { api, PointClaim } from "@/lib/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export default function AdminClaims() {
  const { users, currentUser, loadFromApi } = useStore();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  
  const [filterStatus, setFilterStatus] = useState<string>("pending");
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState<PointClaim | null>(null);
  const [claimResponse, setClaimResponse] = useState("");

  const { data: pointClaims = [], isLoading } = useQuery({
    queryKey: ['pointClaims', 'all'],
    queryFn: () => api.pointClaims.getAll(),
  });

  const approveMutation = useMutation({
    mutationFn: ({ claimId, adminResponse }: { claimId: number; adminResponse: string }) => {
      const adminId = currentUser ? (typeof currentUser.id === 'string' ? parseInt(currentUser.id) : currentUser.id) : 1;
      return api.pointClaims.approve(claimId, { adminId, adminResponse });
    },
    onSuccess: async (claim) => {
      queryClient.invalidateQueries({ queryKey: ['pointClaims'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      await loadFromApi();
      setIsReviewOpen(false);
      setSelectedClaim(null);
      setClaimResponse("");
      toast({
        title: t('admin.claims.claimApproved'),
        description: t('admin.claims.pointsAwarded', { points: claim.pointsRequested }),
      });
    },
    onError: (error: Error) => {
      toast({ title: t('common.error'), description: error.message, variant: 'destructive' });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ claimId, adminResponse }: { claimId: number; adminResponse: string }) => {
      const adminId = currentUser ? (typeof currentUser.id === 'string' ? parseInt(currentUser.id) : currentUser.id) : 1;
      return api.pointClaims.reject(claimId, { adminId, adminResponse });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pointClaims'] });
      setIsReviewOpen(false);
      setSelectedClaim(null);
      setClaimResponse("");
      toast({ title: t('admin.claims.claimRejected'), description: t('admin.claims.claimRejectedDesc') });
    },
    onError: (error: Error) => {
      toast({ title: t('common.error'), description: error.message, variant: 'destructive' });
    },
  });

  const filteredClaims = filterStatus === "all"
    ? pointClaims
    : pointClaims.filter(c => c.status === filterStatus);

  const getUserName = (userId: number) => {
    const user = users.find(u => String(u.id) === String(userId));
    return user?.username || `User #${userId}`;
  };

  const openReview = (claim: PointClaim) => {
    setSelectedClaim(claim);
    setClaimResponse("");
    setIsReviewOpen(true);
  };

  const handleApprove = () => {
    if (!selectedClaim || !claimResponse.trim()) {
      toast({ title: t('admin.claims.responseRequired'), variant: 'destructive' });
      return;
    }
    approveMutation.mutate({ claimId: selectedClaim.id, adminResponse: claimResponse.trim() });
  };

  const handleReject = () => {
    if (!selectedClaim || !claimResponse.trim()) {
      toast({ title: t('admin.claims.responseRequired'), variant: 'destructive' });
      return;
    }
    rejectMutation.mutate({ claimId: selectedClaim.id, adminResponse: claimResponse.trim() });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-500/20 text-green-400 hover:bg-green-500/30 border-green-500/20';
      case 'rejected':
        return 'bg-destructive/20 text-destructive hover:bg-destructive/30 border-destructive/20';
      default:
        return 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 border-yellow-500/20';
    }
  };

  const pendingCount = pointClaims.filter(c => c.status === 'pending').length;

  return (
    <AdminLayout title={t('admin.tabs.claims')} description={t('admin.claims.description')}>
      <Card className="bg-card/30 border-border/50">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              {t('admin.claims.title')}
              {pendingCount > 0 && (
                <Badge variant="destructive">{pendingCount} {t('status.pending')}</Badge>
              )}
            </CardTitle>
            <CardDescription>{t('admin.claims.description')}</CardDescription>
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[150px]" data-testid="select-filter-claims-status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('admin.claims.allClaims')}</SelectItem>
              <SelectItem value="pending">{t('status.pending')}</SelectItem>
              <SelectItem value="approved">{t('status.approved')}</SelectItem>
              <SelectItem value="rejected">{t('status.rejected')}</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px] pr-4">
            <div className="space-y-3">
              {isLoading && (
                <p className="text-muted-foreground text-center py-10">{t('common.loading')}</p>
              )}
              {!isLoading && filteredClaims.length === 0 && (
                <p className="text-muted-foreground text-center py-10">{t('admin.claims.noClaims')}</p>
              )}
              {filteredClaims.map(claim => (
                <div key={claim.id} className="p-3 rounded-lg border border-border/50 bg-card/50 space-y-2" data-testid={`claim-item-${claim.id}`}>
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-primary/20 flex items-center justify-center">
                        <Trophy className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-bold text-sm text-primary">{getUserName(claim.userId)}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(claim.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary">{claim.pointsRequested} {t('common.points')}</p>
                      <Badge className={getStatusBadge(claim.status)}>
                        {t(`status.${claim.status}`)}
                      </Badge>
                    </div>
                  </div>
                  
                  {claim.note && (
                    <p className="text-xs text-muted-foreground bg-muted/30 p-2 rounded">{claim.note}</p>
                  )}
                  
                  {claim.screenshotUrl && (
                    <a 
                      href={claim.screenshotUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-xs text-primary flex items-center gap-1 hover:underline"
                    >
                      <ExternalLink className="h-3 w-3" />
                      {t('admin.claims.viewScreenshot')}
                    </a>
                  )}
                  
                  {claim.adminResponse && (
                    <p className={`text-xs p-2 rounded ${claim.status === 'rejected' ? 'bg-destructive/10 text-destructive' : 'bg-green-500/10 text-green-400'}`}>
                      <strong>{t('admin.claims.adminResponse')}:</strong> {claim.adminResponse}
                    </p>
                  )}

                  {claim.status === 'pending' && (
                    <Button size="sm" variant="outline" className="w-full mt-2" onClick={() => openReview(claim)} data-testid={`button-review-claim-${claim.id}`}>
                      <Eye className="h-3 w-3 mr-1" /> {t('admin.claims.review')}
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <Dialog open={isReviewOpen} onOpenChange={setIsReviewOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('admin.claims.reviewClaim')}</DialogTitle>
            <DialogDescription>
              {selectedClaim && `${getUserName(selectedClaim.userId)} - ${selectedClaim.pointsRequested} ${t('common.points')}`}
            </DialogDescription>
          </DialogHeader>
          
          {selectedClaim && (
            <div className="space-y-4 py-4">
              {selectedClaim.note && (
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">{t('admin.claims.userNote')}</Label>
                  <p className="text-sm bg-muted/30 p-2 rounded">{selectedClaim.note}</p>
                </div>
              )}
              
              {selectedClaim.screenshotUrl && (
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">{t('admin.claims.screenshot')}</Label>
                  <a 
                    href={selectedClaim.screenshotUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-sm text-primary flex items-center gap-1 hover:underline"
                  >
                    <ExternalLink className="h-4 w-4" />
                    {selectedClaim.screenshotUrl}
                  </a>
                </div>
              )}
              
              <div className="space-y-2">
                <Label>{t('admin.claims.yourResponse')} *</Label>
                <Textarea 
                  value={claimResponse} 
                  onChange={(e) => setClaimResponse(e.target.value)} 
                  placeholder={t('admin.claims.responsePlaceholder')}
                  data-testid="input-claim-response" 
                />
              </div>
            </div>
          )}
          
          <DialogFooter className="gap-2">
            <Button 
              variant="destructive" 
              onClick={handleReject} 
              disabled={rejectMutation.isPending}
              data-testid="button-reject-claim"
            >
              <X className="h-4 w-4 mr-1" /> {t('admin.requests.reject')}
            </Button>
            <Button 
              className="bg-green-600 hover:bg-green-700" 
              onClick={handleApprove} 
              disabled={approveMutation.isPending}
              data-testid="button-approve-claim"
            >
              <Check className="h-4 w-4 mr-1" /> {t('admin.requests.approve')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
