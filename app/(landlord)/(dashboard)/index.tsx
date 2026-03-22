import { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, RefreshControl, Pressable, Alert, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Receipt, TrendingUp, Clock, AlertTriangle, Send, ChevronRight, Bell } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { getDashboardStats, getRecentPayments, getOverdueTenants } from '@/shared/services/dashboard';
import { sendReminder } from '@/shared/services/reminders';
import { NotificationBell } from '@/components/NotificationBell';
import { formatDate } from '@/shared/utils';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import type { DashboardStats, PaymentWithDetails } from '@/shared/types/app.types';

const AVATAR_COLORS = [
  { bg: '#dbeafe', text: '#2563eb' }, { bg: '#d1fae5', text: '#059669' },
  { bg: '#fef3c7', text: '#d97706' }, { bg: '#fce7f3', text: '#db2777' },
  { bg: '#ede9fe', text: '#7c3aed' }, { bg: '#e0f2fe', text: '#0284c7' },
];
function getAC(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}
function ini(name: string) { return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase(); }

function greet() {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
}

export default function DashboardScreen() {
  const { user, profile } = useAuth();
  const insets = useSafeAreaInsets();
  usePushNotifications(user?.id);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [payments, setPayments] = useState<PaymentWithDetails[]>([]);
  const [overdue, setOverdue] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    try {
      const [s, p, o] = await Promise.all([
        getDashboardStats(user.id), getRecentPayments(user.id, 5), getOverdueTenants(user.id),
      ]);
      setStats(s); setPayments(p); setOverdue(o);
    } catch { Alert.alert('Error', 'Failed to load dashboard.'); }
    finally { setLoading(false); }
  }, [user]);

  useEffect(() => { load(); }, [load]);
  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const remind = async (tid: string, iid: string) => {
    setSending(tid);
    try { await sendReminder(tid, iid); Alert.alert('Sent', 'Reminder sent.'); }
    catch { Alert.alert('Error', 'Failed.'); }
    setSending(null);
  };

  const fmt = (n: number) => `J$${n.toLocaleString()}`;
  const pct = stats?.expected ? Math.round((stats.collected / stats.expected) * 100) : 0;

  return (
    <View style={[st.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={st.header}>
        <View style={{ flex: 1 }}>
          <Text style={st.greeting}>{greet()}, {profile?.first_name ?? 'there'}</Text>
          <Text style={st.date}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </Text>
        </View>
        <NotificationBell />
      </View>

      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#94a3b8" />}
        contentContainerStyle={st.scroll}
      >
        {/* Stats */}
        {!loading && stats && (
          <>
            <View style={st.grid}>
              <StatBox label="Expected" value={fmt(stats.expected)} sub={`${stats.tenantCount} tenants`}
                icon={<Receipt size={14} color="#3b82f6" />} iconBg="#eff6ff" />
              <StatBox label="Collected" value={fmt(stats.collected)} sub={pct > 0 ? `${pct}%` : '—'}
                icon={<TrendingUp size={14} color="#10b981" />} iconBg="#ecfdf5" valueColor="#059669" />
              <StatBox label="Outstanding" value={fmt(stats.outstanding)} sub={stats.outstanding > 0 ? 'Awaiting' : 'Clear'}
                icon={<Clock size={14} color="#f59e0b" />} iconBg="#fffbeb" valueColor="#b45309" />
              <StatBox label="Overdue" value={String(stats.overdue)} sub={stats.overdue > 0 ? 'Need attention' : 'None'}
                icon={<AlertTriangle size={14} color="#ef4444" />} iconBg="#fef2f2"
                valueColor={stats.overdue > 0 ? '#ef4444' : '#0f172a'} />
            </View>

            {stats.expected > 0 && (
              <View style={st.progressRow}>
                <Text style={st.progressLabel}>Collection</Text>
                <View style={st.progressTrack}>
                  {Array.from({ length: 20 }).map((_, i) => (
                    <View key={i} style={[st.dot, i < Math.round(pct / 5) && st.dotFill]} />
                  ))}
                </View>
                <Text style={st.progressPct}>{pct}%</Text>
              </View>
            )}
          </>
        )}

        {/* Recent Payments */}
        <View style={st.section}>
          <View style={st.sectionHeader}>
            <Text style={st.sectionTitle}>Recent Payments</Text>
            <ChevronRight size={16} color="#cbd5e1" />
          </View>
          {payments.length === 0 ? (
            <Text style={st.emptyText}>No payments yet</Text>
          ) : payments.map((p, i) => {
            const name = `${p.tenant_first_name} ${p.tenant_last_name}`;
            const ac = getAC(name);
            return (
              <View key={p.id} style={[st.row, i < payments.length - 1 && st.rowBorder]}>
                <View style={[st.avatar, { backgroundColor: ac.bg }]}>
                  <Text style={[st.avatarText, { color: ac.text }]}>{ini(name)}</Text>
                </View>
                <View style={st.rowInfo}>
                  <Text style={st.rowName}>{name}</Text>
                  <Text style={st.rowMeta}>{formatDate(p.payment_date)}</Text>
                </View>
                <Text style={st.rowAmountGreen}>+{fmt(p.amount)}</Text>
              </View>
            );
          })}
        </View>

        {/* Overdue */}
        {overdue.length > 0 && (
          <View style={st.section}>
            <View style={st.sectionHeader}>
              <Text style={st.sectionTitle}>Overdue</Text>
              <View style={st.badge}><Text style={st.badgeText}>{overdue.length}</Text></View>
            </View>
            {overdue.map((t, i) => {
              const ac = getAC(t.name);
              return (
                <View key={t.id} style={[st.row, i < overdue.length - 1 && st.rowBorder]}>
                  <View style={[st.avatar, { backgroundColor: ac.bg }]}>
                    <Text style={[st.avatarText, { color: ac.text }]}>{ini(t.name)}</Text>
                  </View>
                  <View style={st.rowInfo}>
                    <Text style={st.rowName}>{t.name}</Text>
                    <Text style={st.rowMeta}>{fmt(t.amount)} · {t.daysOverdue}d</Text>
                  </View>
                  <Pressable onPress={() => remind(t.tenant_id, t.invoice_id)} disabled={sending === t.tenant_id}
                    style={({ pressed }) => [st.sendBtn, pressed && { opacity: 0.6 }]}>
                    <Send size={13} color={sending === t.tenant_id ? '#cbd5e1' : '#3b82f6'} />
                  </Pressable>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function StatBox({ label, value, sub, icon, iconBg, valueColor }: {
  label: string; value: string; sub: string; icon: React.ReactNode; iconBg: string; valueColor?: string;
}) {
  return (
    <View style={st.statCard}>
      <View style={st.statTop}>
        <Text style={st.statLabel}>{label}</Text>
        <View style={[st.statIcon, { backgroundColor: iconBg }]}>{icon}</View>
      </View>
      <Text style={[st.statValue, valueColor ? { color: valueColor } : undefined]}>{value}</Text>
      <Text style={st.statSub}>{sub}</Text>
    </View>
  );
}

const st = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16,
  },
  greeting: { fontSize: 22, fontWeight: '700', color: '#0f172a', letterSpacing: -0.3 },
  date: { fontSize: 14, color: '#94a3b8', marginTop: 2 },
  scroll: { paddingHorizontal: 20, paddingBottom: 24 },

  // Stats
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  statCard: {
    flexGrow: 1, minWidth: '46%' as any,
    backgroundColor: '#f8fafc', borderRadius: 14, padding: 14,
  },
  statTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  statLabel: { fontSize: 10, fontWeight: '500', textTransform: 'uppercase', letterSpacing: 1, color: '#94a3b8' },
  statIcon: { width: 26, height: 26, borderRadius: 7, alignItems: 'center', justifyContent: 'center' },
  statValue: { fontSize: 18, fontWeight: '700', color: '#0f172a', letterSpacing: -0.3 },
  statSub: { fontSize: 11, fontWeight: '500', color: '#94a3b8', marginTop: 2 },

  // Progress
  progressRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, gap: 8 },
  progressLabel: { fontSize: 10, fontWeight: '500', textTransform: 'uppercase', letterSpacing: 0.8, color: '#94a3b8' },
  progressTrack: { flexDirection: 'row', gap: 2, flex: 1 },
  dot: { flex: 1, height: 6, borderRadius: 3, backgroundColor: '#f1f5f9' },
  dotFill: { backgroundColor: '#3b82f6' },
  progressPct: { fontSize: 12, fontWeight: '700', color: '#2563eb', minWidth: 32, textAlign: 'right' },

  // Section
  section: { backgroundColor: '#f8fafc', borderRadius: 16, padding: 16, marginBottom: 12 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  sectionTitle: { fontSize: 15, fontWeight: '600', color: '#0f172a' },
  emptyText: { fontSize: 13, color: '#94a3b8', paddingVertical: 6 },

  // Rows
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: '#e2e8f0' + '40' },
  avatar: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 12, fontWeight: '700' },
  rowInfo: { flex: 1, marginLeft: 10 },
  rowName: { fontSize: 14, fontWeight: '600', color: '#0f172a' },
  rowMeta: { fontSize: 12, color: '#94a3b8', marginTop: 1 },
  rowAmountGreen: { fontSize: 14, fontWeight: '700', color: '#059669' },

  badge: { backgroundColor: '#fef2f2', borderRadius: 8, paddingHorizontal: 7, paddingVertical: 2 },
  badgeText: { fontSize: 11, fontWeight: '700', color: '#ef4444' },
  sendBtn: { width: 32, height: 32, borderRadius: 10, backgroundColor: '#eff6ff', alignItems: 'center', justifyContent: 'center' },
});
