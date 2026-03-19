import { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, RefreshControl, FlatList, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DollarSign, TrendingUp, AlertTriangle, Users, Send } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { getDashboardStats, getRecentPayments, getOverdueTenants } from '@/shared/services/dashboard';
import { sendReminder } from '@/shared/services/reminders';
import { StatCard, Card, CardTitle, Skeleton } from '@/components/ui';
import { AvatarInitial } from '@/components/ui';
import { StatusBadge } from '@/components/ui';
import { PageHeader } from '@/components/PageHeader';
import { NotificationBell } from '@/components/NotificationBell';
import { formatDate } from '@/shared/utils';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import type { DashboardStats, PaymentWithDetails } from '@/shared/types/app.types';

export default function DashboardScreen() {
  const { user, profile } = useAuth();
  usePushNotifications(user?.id);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentPayments, setRecentPayments] = useState<PaymentWithDetails[]>([]);
  const [overdueTenants, setOverdueTenants] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sendingReminder, setSendingReminder] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!user) return;
    try {
      const [s, p, o] = await Promise.all([
        getDashboardStats(user.id),
        getRecentPayments(user.id, 5),
        getOverdueTenants(user.id),
      ]);
      setStats(s);
      setRecentPayments(p);
      setOverdueTenants(o);
    } catch (err) {
      console.error('Dashboard load error:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { loadData(); }, [loadData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleSendReminder = async (tenantId: string, invoiceId: string) => {
    setSendingReminder(tenantId);
    try {
      await sendReminder(tenantId, invoiceId);
      Alert.alert('Sent', 'Payment reminder sent successfully.');
    } catch {
      Alert.alert('Error', 'Failed to send reminder.');
    }
    setSendingReminder(null);
  };

  const fmt = (n: number) => `J$${n.toLocaleString()}`;

  return (
    <SafeAreaView className="flex-1 bg-background-secondary">
      <PageHeader
        title={`Hi, ${profile?.first_name ?? 'there'}`}
        subtitle={new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        right={<NotificationBell />}
      />
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3b82f6" />}
        className="flex-1"
        contentContainerClassName="px-4 pb-6"
      >
        {/* Stat Cards — no arrow icons per Denedra's feedback */}
        {loading ? (
          <View className="flex-row flex-wrap gap-3 mb-4">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="flex-1 min-w-[45%] h-24" />)}
          </View>
        ) : stats ? (
          <View className="flex-row flex-wrap gap-3 mb-4">
            <StatCard
              title="Expected"
              value={fmt(stats.expected)}
              icon={<DollarSign size={16} color="#fff" />}
              color="primary"
              className="flex-1 min-w-[45%]"
            />
            <StatCard
              title="Collected"
              value={fmt(stats.collected)}
              icon={<TrendingUp size={16} color="#fff" />}
              color="success"
              className="flex-1 min-w-[45%]"
            />
            <StatCard
              title="Outstanding"
              value={fmt(stats.outstanding)}
              icon={<AlertTriangle size={16} color="#fff" />}
              color="warning"
              className="flex-1 min-w-[45%]"
            />
            <StatCard
              title="Tenants"
              value={String(stats.tenantCount)}
              subtitle={`${stats.overdue} overdue`}
              icon={<Users size={16} color="#fff" />}
              color="destructive"
              className="flex-1 min-w-[45%]"
            />
          </View>
        ) : null}

        {/* Recent Payments */}
        <Card className="mb-4">
          <CardTitle className="mb-3">Recent Payments</CardTitle>
          {recentPayments.length === 0 ? (
            <Text className="text-sm text-muted-foreground">No payments yet</Text>
          ) : (
            recentPayments.map((p) => (
              <View key={p.id} className="flex-row items-center py-2.5 border-b border-border/50 last:border-0">
                <AvatarInitial name={`${p.tenant_first_name} ${p.tenant_last_name}`} size="sm" />
                <View className="flex-1 ml-3">
                  <Text className="text-sm font-medium text-foreground">
                    {p.tenant_first_name} {p.tenant_last_name}
                  </Text>
                  <Text className="text-xs text-muted-foreground">{formatDate(p.payment_date)}</Text>
                </View>
                <Text className="text-sm font-semibold text-success">{fmt(p.amount)}</Text>
              </View>
            ))
          )}
        </Card>

        {/* Overdue Tenants */}
        <Card>
          <CardTitle className="mb-3">Overdue Tenants</CardTitle>
          {overdueTenants.length === 0 ? (
            <Text className="text-sm text-muted-foreground">No overdue tenants</Text>
          ) : (
            overdueTenants.map((t) => (
              <View key={t.id} className="flex-row items-center py-2.5 border-b border-border/50 last:border-0">
                <AvatarInitial name={t.name} size="sm" />
                <View className="flex-1 ml-3">
                  <Text className="text-sm font-medium text-foreground">{t.name}</Text>
                  <Text className="text-xs text-muted-foreground">
                    {fmt(t.amount)} — {t.daysOverdue} days overdue
                  </Text>
                </View>
                <Pressable
                  onPress={() => handleSendReminder(t.tenant_id, t.invoice_id)}
                  disabled={sendingReminder === t.tenant_id}
                  className="p-2"
                >
                  <Send size={16} color={sendingReminder === t.tenant_id ? '#9ca3af' : '#3b82f6'} />
                </Pressable>
              </View>
            ))
          )}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
