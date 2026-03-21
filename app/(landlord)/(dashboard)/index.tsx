import { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, RefreshControl, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DollarSign, TrendingUp, AlertTriangle, Users, Send, ChevronRight } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { getDashboardStats, getRecentPayments, getOverdueTenants } from '@/shared/services/dashboard';
import { sendReminder } from '@/shared/services/reminders';
import { StatCard, Card, CardTitle, Skeleton } from '@/components/ui';
import { AvatarInitial } from '@/components/ui';
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
      Alert.alert('Error', 'Failed to load dashboard. Pull down to refresh.');
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
        contentContainerClassName="px-5 pb-6"
      >
        {/* Stat Cards */}
        {loading ? (
          <View className="flex-row flex-wrap gap-3 mb-5">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="flex-1 min-w-[45%] h-24" />)}
          </View>
        ) : stats ? (
          <View className="flex-row flex-wrap gap-3 mb-5">
            <StatCard
              title="Expected"
              value={fmt(stats.expected)}
              icon={<DollarSign size={16} color="#3b82f6" />}
              color="primary"
              className="flex-1 min-w-[45%]"
            />
            <StatCard
              title="Collected"
              value={fmt(stats.collected)}
              icon={<TrendingUp size={16} color="#16a34a" />}
              color="success"
              className="flex-1 min-w-[45%]"
            />
            <StatCard
              title="Outstanding"
              value={fmt(stats.outstanding)}
              icon={<AlertTriangle size={16} color="#f59e0b" />}
              color="warning"
              className="flex-1 min-w-[45%]"
            />
            <StatCard
              title="Tenants"
              value={String(stats.tenantCount)}
              subtitle={`${stats.overdue} overdue`}
              icon={<Users size={16} color="#ef4444" />}
              color="destructive"
              className="flex-1 min-w-[45%]"
            />
          </View>
        ) : null}

        {/* Collection Progress */}
        {stats && stats.expected > 0 && (
          <Card className="mb-4">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-sm font-semibold text-foreground">Collection Rate</Text>
              <Text className="text-sm font-bold text-primary">
                {Math.round((stats.collected / stats.expected) * 100)}%
              </Text>
            </View>
            <View className="h-2 rounded-full bg-secondary overflow-hidden">
              <View
                className="h-full rounded-full bg-primary"
                style={{ width: `${Math.min(100, Math.round((stats.collected / stats.expected) * 100))}%` }}
              />
            </View>
          </Card>
        )}

        {/* Recent Payments */}
        <Card className="mb-4">
          <View className="flex-row items-center justify-between mb-4">
            <CardTitle>Recent Payments</CardTitle>
            <ChevronRight size={18} color="#94a3b8" />
          </View>
          {recentPayments.length === 0 ? (
            <Text className="text-sm text-muted-foreground py-2">No payments yet</Text>
          ) : (
            recentPayments.map((p, idx) => (
              <View
                key={p.id}
                className="flex-row items-center py-3"
                style={idx < recentPayments.length - 1 ? { borderBottomWidth: 1, borderBottomColor: '#f1f5f9' } : undefined}
              >
                <AvatarInitial name={`${p.tenant_first_name} ${p.tenant_last_name}`} size="sm" />
                <View className="flex-1 ml-3">
                  <Text className="text-sm font-semibold text-foreground">
                    {p.tenant_first_name} {p.tenant_last_name}
                  </Text>
                  <Text className="text-xs text-muted-foreground mt-0.5">{formatDate(p.payment_date)}</Text>
                </View>
                <Text className="text-sm font-bold text-success">{fmt(p.amount)}</Text>
              </View>
            ))
          )}
        </Card>

        {/* Overdue Tenants */}
        <Card>
          <View className="flex-row items-center justify-between mb-4">
            <CardTitle>Overdue Tenants</CardTitle>
            {overdueTenants.length > 0 && (
              <View style={{ backgroundColor: '#0f172a', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 3 }}>
                <Text className="text-xs font-bold" style={{ color: '#ffffff' }}>{overdueTenants.length}</Text>
              </View>
            )}
          </View>
          {overdueTenants.length === 0 ? (
            <Text className="text-sm text-muted-foreground py-2">No overdue tenants</Text>
          ) : (
            overdueTenants.map((t, idx) => (
              <View
                key={t.id}
                className="flex-row items-center py-3"
                style={idx < overdueTenants.length - 1 ? { borderBottomWidth: 1, borderBottomColor: '#f1f5f9' } : undefined}
              >
                <AvatarInitial name={t.name} size="sm" />
                <View className="flex-1 ml-3">
                  <Text className="text-sm font-semibold text-foreground">{t.name}</Text>
                  <Text className="text-xs text-muted-foreground mt-0.5">
                    {fmt(t.amount)} — {t.daysOverdue} days overdue
                  </Text>
                </View>
                <Pressable
                  onPress={() => handleSendReminder(t.tenant_id, t.invoice_id)}
                  disabled={sendingReminder === t.tenant_id}
                  style={({ pressed }) => ({
                    opacity: pressed ? 0.7 : 1,
                    height: 36,
                    width: 36,
                    borderRadius: 18,
                    backgroundColor: '#eff6ff',
                    alignItems: 'center',
                    justifyContent: 'center',
                  })}
                >
                  <Send size={14} color={sendingReminder === t.tenant_id ? '#94a3b8' : '#3b82f6'} />
                </Pressable>
              </View>
            ))
          )}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
