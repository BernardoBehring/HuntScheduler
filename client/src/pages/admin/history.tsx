import { AdminLayout } from "@/components/admin-layout";
import { useStore } from "@/lib/mockData";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TrendingUp, TrendingDown, Clock } from "lucide-react";
import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTranslation } from "react-i18next";
import { api, PointTransaction } from "@/lib/api";

export default function AdminHistory() {
  const { users } = useStore();
  const { t } = useTranslation();
  
  const [transactions, setTransactions] = useState<PointTransaction[]>([]);
  const [filterUser, setFilterUser] = useState<string>("all");

  useEffect(() => {
    api.pointTransactions.getAll()
      .then(setTransactions)
      .catch(err => console.error('Failed to load point transactions:', err));
  }, []);

  const filteredTransactions = filterUser === "all"
    ? transactions
    : transactions.filter(pt => pt.userId.toString() === filterUser);

  const getUserName = (userId: number) => {
    const user = users.find(u => String(u.id) === String(userId));
    return user?.username || `User #${userId}`;
  };

  const getAdminName = (adminId: number) => {
    const admin = users.find(u => String(u.id) === String(adminId));
    return admin?.username || `Admin #${adminId}`;
  };

  return (
    <AdminLayout title={t('admin.tabs.pointsHistory')} description={t('admin.points.historyDescription')}>
      <Card className="bg-card/30 border-border/50">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base">{t('admin.points.historyTitle')}</CardTitle>
            <CardDescription>{t('admin.points.historyDescription')}</CardDescription>
          </div>
          <Select value={filterUser} onValueChange={setFilterUser}>
            <SelectTrigger className="w-[180px]" data-testid="select-filter-transactions-user">
              <SelectValue placeholder={t('admin.points.allUsers')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('admin.points.allUsers')}</SelectItem>
              {users.map(u => (
                <SelectItem key={u.id} value={u.id}>{u.username}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px] pr-4">
            <div className="space-y-2">
              {filteredTransactions.length === 0 && (
                <p className="text-muted-foreground text-center py-10">{t('admin.points.noTransactions')}</p>
              )}
              {filteredTransactions.map(tx => (
                <div key={tx.id} className="flex items-center justify-between p-3 border border-border/40 rounded bg-muted/10" data-testid={`transaction-item-${tx.id}`}>
                  <div className="flex items-center gap-3">
                    {tx.amount > 0 ? (
                      <div className="h-8 w-8 rounded-full bg-green-500/20 flex items-center justify-center">
                        <TrendingUp className="h-4 w-4 text-green-400" />
                      </div>
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-destructive/20 flex items-center justify-center">
                        <TrendingDown className="h-4 w-4 text-destructive" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-sm">{getUserName(tx.userId)}</p>
                      <p className="text-xs text-muted-foreground">{tx.reason}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Clock className="h-3 w-3" />
                        {new Date(tx.createdAt).toLocaleDateString()} • {t('admin.points.by')} {getAdminName(tx.adminId)}
                      </p>
                    </div>
                  </div>
                  <div className={`font-bold text-sm ${tx.amount > 0 ? 'text-green-400' : 'text-destructive'}`}>
                    {tx.amount > 0 ? '+' : ''}{tx.amount} {t('common.points')}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
