import { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, FlatList, Pressable, TextInput, RefreshControl, Alert, StyleSheet, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Plus, Search, Users, ChevronRight } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { getTenants } from '@/shared/services/tenants';
import type { TenantWithDetails } from '@/shared/types/app.types';

const { width } = Dimensions.get('window');

const STATUS_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  paid: { bg: '#f0fdf4', text: '#16a34a', dot: '#16a34a' },
  pending: { bg: '#eff6ff', text: '#2563eb', dot: '#3b82f6' },
  overdue: { bg: '#0f172a', text: '#ffffff', dot: '#ffffff' },
  active: { bg: '#f0fdf4', text: '#16a34a', dot: '#16a34a' },
  inactive: { bg: '#f1f5f9', text: '#64748b', dot: '#94a3b8' },
};

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
}

const AVATAR_COLORS = [
  { bg: '#dbeafe', text: '#2563eb' },
  { bg: '#d1fae5', text: '#059669' },
  { bg: '#fef3c7', text: '#d97706' },
  { bg: '#fce7f3', text: '#db2777' },
  { bg: '#ede9fe', text: '#7c3aed' },
  { bg: '#e0f2fe', text: '#0284c7' },
];

function getAvatarColor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

export default function TenantsScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [tenants, setTenants] = useState<TenantWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const loadTenants = useCallback(async () => {
    if (!user) return;
    try { setTenants(await getTenants(user.id)); }
    catch { Alert.alert('Error', 'Failed to load tenants.'); }
    finally { setLoading(false); }
  }, [user]);

  useEffect(() => { loadTenants(); }, [loadTenants]);
  const onRefresh = async () => { setRefreshing(true); await loadTenants(); setRefreshing(false); };

  const filtered = useMemo(() => {
    let list = tenants;
    if (filter !== 'all') list = list.filter(t => t.status === filter || t.payment_status === filter);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(t => `${t.first_name} ${t.last_name}`.toLowerCase().includes(q) || t.property_name.toLowerCase().includes(q));
    }
    return list;
  }, [tenants, filter, search]);

  const filters = [
    { key: 'all', label: 'All' },
    { key: 'active', label: 'Active' },
    { key: 'overdue', label: 'Overdue' },
    { key: 'inactive', label: 'Inactive' },
  ];

  const getCount = (key: string) => {
    if (key === 'all') return tenants.length;
    return tenants.filter(t => t.status === key || t.payment_status === key).length;
  };

  const renderEmpty = () => (
    <View style={s.emptyWrap}>
      <View style={s.emptyIcon}>
        <Users size={28} color="#94a3b8" />
      </View>
      <Text style={s.emptyTitle}>No tenants yet</Text>
      <Text style={s.emptySub}>Get started by adding your tenants and linking them to your properties</Text>
      <Pressable
        onPress={() => router.push('/(landlord)/(tenants)/add')}
        style={({ pressed }) => [s.emptyBtn, pressed && { opacity: 0.8 }]}
      >
        <Plus size={16} color="#fff" />
        <Text style={s.emptyBtnText}>Add Tenant</Text>
      </Pressable>

      {/* Suggestions */}
      <View style={s.suggestWrap}>
        <Text style={s.suggestTitle}>Quick start</Text>
        <SuggestItem emoji="1" text="Add a property in More → Properties" />
        <SuggestItem emoji="2" text="Add tenants and assign them to units" />
        <SuggestItem emoji="3" text="Create invoices to start collecting rent" />
      </View>
    </View>
  );

  const renderTenant = ({ item }: { item: TenantWithDetails }) => {
    const name = `${item.first_name} ${item.last_name}`;
    const ac = getAvatarColor(name);
    const sc = STATUS_COLORS[item.payment_status] ?? STATUS_COLORS.pending;

    return (
      <Pressable
        onPress={() => router.push(`/(landlord)/(tenants)/${item.id}`)}
        style={({ pressed }) => [s.tenantRow, pressed && { backgroundColor: '#f8fafc' }]}
      >
        {/* Avatar */}
        <View style={[s.avatar, { backgroundColor: ac.bg }]}>
          <Text style={[s.avatarText, { color: ac.text }]}>{getInitials(name)}</Text>
        </View>

        {/* Info */}
        <View style={s.tenantInfo}>
          <Text style={s.tenantName} numberOfLines={1}>{name}</Text>
          <Text style={s.tenantProp} numberOfLines={1}>
            {item.property_name}{item.unit_name ? ` · ${item.unit_name}` : ''}
          </Text>
        </View>

        {/* Right side */}
        <View style={s.tenantRight}>
          <Text style={s.tenantAmount}>J${item.rent_amount.toLocaleString()}</Text>
          <View style={[s.statusBadge, { backgroundColor: sc.bg }]}>
            <View style={[s.statusDot, { backgroundColor: sc.dot }]} />
            <Text style={[s.statusText, { color: sc.text }]}>
              {item.payment_status.charAt(0).toUpperCase() + item.payment_status.slice(1)}
            </Text>
          </View>
        </View>

        <ChevronRight size={16} color="#cbd5e1" style={{ marginLeft: 4 }} />
      </Pressable>
    );
  };

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={s.header}>
        <View>
          <Text style={s.headerTitle}>Tenants</Text>
          <Text style={s.headerSub}>{tenants.length} total</Text>
        </View>
        <Pressable
          onPress={() => router.push('/(landlord)/(tenants)/add')}
          style={({ pressed }) => [s.addBtn, pressed && { opacity: 0.8 }]}
        >
          <Plus size={18} color="#fff" />
        </Pressable>
      </View>

      {/* Search */}
      <View style={s.searchBar}>
        <Search size={16} color="#94a3b8" />
        <TextInput
          placeholder="Search tenants..."
          value={search}
          onChangeText={setSearch}
          style={s.searchInput}
          placeholderTextColor="#94a3b8"
        />
      </View>

      {/* Filter pills */}
      <View style={s.filterRow}>
        {filters.map(f => {
          const active = filter === f.key;
          const count = getCount(f.key);
          return (
            <Pressable
              key={f.key}
              onPress={() => setFilter(f.key)}
              style={[s.filterPill, active && s.filterPillActive]}
            >
              <Text style={[s.filterText, active && s.filterTextActive]}>{f.label}</Text>
              <Text style={[s.filterCount, active && s.filterCountActive]}>{count}</Text>
            </Pressable>
          );
        })}
      </View>

      {/* List */}
      {!loading && filtered.length === 0 ? (
        renderEmpty()
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          renderItem={renderTenant}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#94a3b8" />}
          contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}
          ItemSeparatorComponent={() => <View style={s.separator} />}
          style={s.list}
        />
      )}
    </View>
  );
}

function SuggestItem({ emoji, text }: { emoji: string; text: string }) {
  return (
    <View style={s.suggestRow}>
      <View style={s.suggestNum}><Text style={s.suggestNumText}>{emoji}</Text></View>
      <Text style={s.suggestText}>{text}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16,
  },
  headerTitle: { fontSize: 28, fontWeight: '700', color: '#0f172a', letterSpacing: -0.5 },
  headerSub: { fontSize: 14, color: '#94a3b8', marginTop: 2 },
  addBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: '#0f172a', alignItems: 'center', justifyContent: 'center',
  },

  // Search
  searchBar: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: 20, marginBottom: 16,
    backgroundColor: '#f8fafc', borderRadius: 12,
    paddingHorizontal: 14, height: 44,
  },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 15, color: '#0f172a' },

  // Filters
  filterRow: {
    flexDirection: 'row', paddingHorizontal: 20, marginBottom: 8, gap: 6,
  },
  filterPill: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: 8, gap: 5,
  },
  filterPillActive: { backgroundColor: '#0f172a' },
  filterText: { fontSize: 13, fontWeight: '500', color: '#64748b' },
  filterTextActive: { color: '#ffffff', fontWeight: '600' },
  filterCount: { fontSize: 11, fontWeight: '600', color: '#94a3b8' },
  filterCountActive: { color: 'rgba(255,255,255,0.5)' },

  // List
  list: { flex: 1 },
  separator: { height: 1, backgroundColor: '#f1f5f9', marginLeft: 72 },

  // Tenant row
  tenantRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 14,
  },
  avatar: {
    width: 40, height: 40, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: 14, fontWeight: '700' },
  tenantInfo: { flex: 1, marginLeft: 12 },
  tenantName: { fontSize: 15, fontWeight: '600', color: '#0f172a' },
  tenantProp: { fontSize: 13, color: '#94a3b8', marginTop: 2 },
  tenantRight: { alignItems: 'flex-end', marginRight: 2 },
  tenantAmount: { fontSize: 15, fontWeight: '700', color: '#0f172a', marginBottom: 4 },

  // Status badge
  statusBadge: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6, gap: 4,
  },
  statusDot: { width: 5, height: 5, borderRadius: 3 },
  statusText: { fontSize: 11, fontWeight: '600' },

  // Loading
  loadingWrap: { paddingHorizontal: 20, gap: 12, paddingTop: 8 },
  skeleton: { height: 64, borderRadius: 12, backgroundColor: '#f1f5f9' },

  // Empty
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

  // Suggestions
  suggestWrap: {
    marginTop: 32, width: '100%', backgroundColor: '#f8fafc',
    borderRadius: 14, padding: 16,
  },
  suggestTitle: {
    fontSize: 12, fontWeight: '600', textTransform: 'uppercase',
    letterSpacing: 0.8, color: '#94a3b8', marginBottom: 14,
  },
  suggestRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  suggestNum: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: '#0f172a', alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  suggestNumText: { fontSize: 12, fontWeight: '700', color: '#ffffff' },
  suggestText: { fontSize: 14, color: '#64748b', flex: 1 },
});
