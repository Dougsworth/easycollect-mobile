import { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, FlatList, Pressable, TextInput, RefreshControl, Alert, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Plus, Search, Download, FileText, ChevronRight } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { getInvoices } from '@/shared/services/invoices';
import { formatDate, exportToCsv } from '@/shared/utils';
import type { InvoiceWithTenant } from '@/shared/types/app.types';

const STATUS: Record<string, { bg: string; text: string; dot: string; label: string }> = {
  paid: { bg: '#f0fdf4', text: '#16a34a', dot: '#16a34a', label: 'Paid' },
  pending: { bg: '#eff6ff', text: '#2563eb', dot: '#3b82f6', label: 'Pending' },
  overdue: { bg: '#0f172a', text: '#ffffff', dot: '#ffffff', label: 'Overdue' },
};

export default function InvoicesScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [invoices, setInvoices] = useState<InvoiceWithTenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const load = useCallback(async () => {
    if (!user) return;
    try { setInvoices(await getInvoices(user.id)); }
    catch { Alert.alert('Error', 'Failed to load invoices.'); }
    finally { setLoading(false); }
  }, [user]);

  useEffect(() => { load(); }, [load]);
  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const filtered = useMemo(() => {
    let list = invoices;
    if (filter !== 'all') list = list.filter(i => i.status === filter);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(i => i.invoice_number.toLowerCase().includes(q) ||
        `${i.tenant_first_name} ${i.tenant_last_name}`.toLowerCase().includes(q));
    }
    return list;
  }, [invoices, filter, search]);

  const filters = [
    { key: 'all', label: 'All' },
    { key: 'pending', label: 'Pending' },
    { key: 'overdue', label: 'Overdue' },
    { key: 'paid', label: 'Paid' },
  ];
  const getCount = (key: string) => key === 'all' ? invoices.length : invoices.filter(i => i.status === key).length;

  const handleExport = async () => {
    try {
      await exportToCsv('invoices.csv', filtered as any[], [
        { key: 'invoice_number', header: 'Invoice #' },
        { key: 'tenant_first_name', header: 'Tenant' },
        { key: 'amount', header: 'Amount' },
        { key: 'due_date', header: 'Due Date' },
        { key: 'status', header: 'Status' },
      ]);
    } catch { Alert.alert('Error', 'Failed to export.'); }
  };

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={s.header}>
        <View>
          <Text style={s.headerTitle}>Invoices</Text>
          <Text style={s.headerSub}>{invoices.length} total</Text>
        </View>
        <View style={s.headerActions}>
          <Pressable onPress={handleExport} style={({ pressed }) => [s.iconBtn, pressed && { opacity: 0.6 }]}>
            <Download size={18} color="#64748b" />
          </Pressable>
          <Pressable onPress={() => router.push('/(landlord)/(invoices)/create')}
            style={({ pressed }) => [s.addBtn, pressed && { opacity: 0.8 }]}>
            <Plus size={18} color="#fff" />
          </Pressable>
        </View>
      </View>

      {/* Search */}
      <View style={s.searchBar}>
        <Search size={16} color="#94a3b8" />
        <TextInput placeholder="Search invoices..." value={search} onChangeText={setSearch}
          style={s.searchInput} placeholderTextColor="#94a3b8" />
      </View>

      {/* Filters */}
      <View style={s.filterRow}>
        {filters.map(f => {
          const active = filter === f.key;
          return (
            <Pressable key={f.key} onPress={() => setFilter(f.key)}
              style={[s.filterPill, active && s.filterPillActive]}>
              <Text style={[s.filterText, active && s.filterTextActive]}>{f.label}</Text>
              <Text style={[s.filterCount, active && s.filterCountActive]}>{getCount(f.key)}</Text>
            </Pressable>
          );
        })}
      </View>

      {/* List */}
      {!loading && filtered.length === 0 ? (
        <View style={s.emptyWrap}>
          <View style={s.emptyIcon}><FileText size={28} color="#94a3b8" /></View>
          <Text style={s.emptyTitle}>No invoices yet</Text>
          <Text style={s.emptySub}>Create invoices to track and collect rent from your tenants</Text>
          <Pressable onPress={() => router.push('/(landlord)/(invoices)/create')}
            style={({ pressed }) => [s.emptyBtn, pressed && { opacity: 0.8 }]}>
            <Plus size={16} color="#fff" />
            <Text style={s.emptyBtnText}>Create Invoice</Text>
          </Pressable>

          <View style={s.tipWrap}>
            <Text style={s.tipTitle}>Tips</Text>
            <Text style={s.tipText}>
              You can create invoices for individual tenants or in bulk. Tenants will be notified and can submit payment proof directly through the app.
            </Text>
          </View>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={i => i.id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#94a3b8" />}
          contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}
          ItemSeparatorComponent={() => <View style={s.separator} />}
          renderItem={({ item }) => {
            const sc = STATUS[item.status] ?? STATUS.pending;
            return (
              <Pressable style={({ pressed }) => [s.invoiceRow, pressed && { backgroundColor: '#f8fafc' }]}>
                <View style={s.invoiceLeft}>
                  <Text style={s.invoiceNum}>{item.invoice_number}</Text>
                  <Text style={s.invoiceTenant}>{item.tenant_first_name} {item.tenant_last_name}</Text>
                  <Text style={s.invoiceMeta}>{item.property_name} · Due {formatDate(item.due_date)}</Text>
                </View>
                <View style={s.invoiceRight}>
                  <Text style={s.invoiceAmount}>J${item.amount.toLocaleString()}</Text>
                  <View style={[s.badge, { backgroundColor: sc.bg }]}>
                    <View style={[s.badgeDot, { backgroundColor: sc.dot }]} />
                    <Text style={[s.badgeText, { color: sc.text }]}>{sc.label}</Text>
                  </View>
                </View>
                <ChevronRight size={16} color="#cbd5e1" style={{ marginLeft: 4 }} />
              </Pressable>
            );
          }}
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16,
  },
  headerTitle: { fontSize: 28, fontWeight: '700', color: '#0f172a', letterSpacing: -0.5 },
  headerSub: { fontSize: 14, color: '#94a3b8', marginTop: 2 },
  headerActions: { flexDirection: 'row', gap: 8 },
  iconBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center',
  },
  addBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: '#0f172a', alignItems: 'center', justifyContent: 'center',
  },
  searchBar: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: 20, marginBottom: 16,
    backgroundColor: '#f8fafc', borderRadius: 12, paddingHorizontal: 14, height: 44,
  },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 15, color: '#0f172a' },
  filterRow: { flexDirection: 'row', paddingHorizontal: 20, marginBottom: 8, gap: 6 },
  filterPill: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: 8, gap: 5,
  },
  filterPillActive: { backgroundColor: '#0f172a' },
  filterText: { fontSize: 13, fontWeight: '500', color: '#64748b' },
  filterTextActive: { color: '#ffffff', fontWeight: '600' },
  filterCount: { fontSize: 11, fontWeight: '600', color: '#94a3b8' },
  filterCountActive: { color: 'rgba(255,255,255,0.5)' },
  separator: { height: 1, backgroundColor: '#f1f5f9', marginLeft: 20 },
  invoiceRow: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14,
  },
  invoiceLeft: { flex: 1 },
  invoiceNum: { fontSize: 15, fontWeight: '600', color: '#0f172a' },
  invoiceTenant: { fontSize: 13, color: '#64748b', marginTop: 2 },
  invoiceMeta: { fontSize: 12, color: '#94a3b8', marginTop: 1 },
  invoiceRight: { alignItems: 'flex-end', marginRight: 2 },
  invoiceAmount: { fontSize: 15, fontWeight: '700', color: '#0f172a', marginBottom: 4 },
  badge: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6, gap: 4,
  },
  badgeDot: { width: 5, height: 5, borderRadius: 3 },
  badgeText: { fontSize: 11, fontWeight: '600' },
  loadingWrap: { paddingHorizontal: 20, gap: 12, paddingTop: 8 },
  skeleton: { height: 64, borderRadius: 12, backgroundColor: '#f1f5f9' },
  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 },
  emptyIcon: {
    width: 64, height: 64, borderRadius: 20, backgroundColor: '#f1f5f9',
    alignItems: 'center', justifyContent: 'center', marginBottom: 20,
  },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: '#0f172a', marginBottom: 6 },
  emptySub: { fontSize: 14, color: '#94a3b8', textAlign: 'center', lineHeight: 20, marginBottom: 24 },
  emptyBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#0f172a', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 10,
  },
  emptyBtnText: { fontSize: 14, fontWeight: '600', color: '#ffffff' },

  // Tips
  tipWrap: {
    marginTop: 32, width: '100%', backgroundColor: '#f8fafc',
    borderRadius: 14, padding: 16,
  },
  tipTitle: {
    fontSize: 12, fontWeight: '600', textTransform: 'uppercase',
    letterSpacing: 0.8, color: '#94a3b8', marginBottom: 8,
  },
  tipText: { fontSize: 14, color: '#64748b', lineHeight: 20 },
});
