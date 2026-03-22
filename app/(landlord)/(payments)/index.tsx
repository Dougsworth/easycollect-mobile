import { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, FlatList, TextInput, RefreshControl, Pressable, ScrollView, Image, Alert, Modal, Dimensions, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Search, CheckCircle, XCircle, X, DollarSign, ImageIcon } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { getPayments } from '@/shared/services/payments';
import { getProofsForLandlord, approveProof, rejectProof } from '@/shared/services/paymentProofs';
import { formatDate } from '@/shared/utils';
import type { PaymentWithDetails, PaymentProofWithDetails } from '@/shared/types/app.types';

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
function initials(name: string) {
  return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
}

type Tab = 'payments' | 'proofs';

export default function PaymentsScreen() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [payments, setPayments] = useState<PaymentWithDetails[]>([]);
  const [proofs, setProofs] = useState<PaymentProofWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [zoomImage, setZoomImage] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>('payments');
  const [processing, setProcessing] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    try {
      const [p, pr] = await Promise.all([getPayments(user.id), getProofsForLandlord(user.id)]);
      setPayments(p); setProofs(pr);
    } catch { Alert.alert('Error', 'Failed to load payments.'); }
    finally { setLoading(false); }
  }, [user]);

  useEffect(() => { load(); }, [load]);
  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const pending = proofs.filter(p => p.status === 'pending');
  const filtered = useMemo(() => {
    if (!search) return payments;
    const q = search.toLowerCase();
    return payments.filter(p =>
      `${p.tenant_first_name} ${p.tenant_last_name}`.toLowerCase().includes(q) ||
      (p.invoice_number ?? '').toLowerCase().includes(q));
  }, [payments, search]);

  const handleApprove = async (proof: PaymentProofWithDetails) => {
    if (processing) return;
    setProcessing(proof.id);
    try {
      await approveProof(proof.id, proof.landlord_id, proof.invoice_id, proof.tenant_id, proof.invoice_amount);
      Alert.alert('Approved', 'Payment recorded.'); load();
    } catch (e: any) { Alert.alert('Error', e.message ?? 'Failed.'); }
    finally { setProcessing(null); }
  };

  const handleReject = async (proof: PaymentProofWithDetails) => {
    if (processing) return;
    setProcessing(proof.id);
    try { await rejectProof(proof.id, proof.landlord_id); load(); }
    catch (e: any) { Alert.alert('Error', e.message ?? 'Failed.'); }
    finally { setProcessing(null); }
  };

  return (
    <View style={[st.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={st.header}>
        <View>
          <Text style={st.headerTitle}>Payments</Text>
          <Text style={st.headerSub}>{payments.length} recorded</Text>
        </View>
      </View>

      {/* Tab switcher */}
      <View style={st.tabRow}>
        {(['payments', 'proofs'] as Tab[]).map(t => (
          <Pressable key={t} onPress={() => setTab(t)}
            style={[st.tabBtn, tab === t && st.tabBtnActive]}>
            <Text style={[st.tabBtnText, tab === t && st.tabBtnTextActive]}>
              {t === 'payments' ? 'Payments' : 'Proof Review'}
            </Text>
            {t === 'proofs' && pending.length > 0 && (
              <View style={st.tabBadge}><Text style={st.tabBadgeText}>{pending.length}</Text></View>
            )}
          </Pressable>
        ))}
      </View>

      {tab === 'payments' ? (
        <>
          <View style={st.searchBar}>
            <Search size={16} color="#94a3b8" />
            <TextInput placeholder="Search payments..." value={search} onChangeText={setSearch}
              style={st.searchInput} placeholderTextColor="#94a3b8" />
          </View>

          {!loading && filtered.length === 0 ? (
            <View style={st.emptyWrap}>
              <View style={st.emptyIcon}><DollarSign size={28} color="#94a3b8" /></View>
              <Text style={st.emptyTitle}>No payments yet</Text>
              <Text style={st.emptySub}>Payments will appear here once tenants submit proof or you record them manually</Text>
              <View style={st.tipWrap}>
                <Text style={st.tipTitle}>How it works</Text>
                <Text style={st.tipText}>
                  Create an invoice → Tenant uploads payment proof → You approve it here → Payment recorded automatically
                </Text>
              </View>
            </View>
          ) : (
            <FlatList
              data={filtered}
              keyExtractor={i => i.id}
              refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#94a3b8" />}
              contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}
              ItemSeparatorComponent={() => <View style={st.separator} />}
              renderItem={({ item }) => {
                const name = `${item.tenant_first_name} ${item.tenant_last_name}`;
                const ac = getAC(name);
                return (
                  <View style={st.paymentRow}>
                    <View style={[st.avatar, { backgroundColor: ac.bg }]}>
                      <Text style={[st.avatarText, { color: ac.text }]}>{initials(name)}</Text>
                    </View>
                    <View style={st.paymentInfo}>
                      <Text style={st.paymentName}>{name}</Text>
                      <Text style={st.paymentMeta}>{item.method} · {formatDate(item.payment_date)}</Text>
                    </View>
                    <Text style={st.paymentAmount}>+J${item.amount.toLocaleString()}</Text>
                  </View>
                );
              }}
            />
          )}
        </>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 24 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#94a3b8" />}>
          {pending.length === 0 ? (
            <View style={st.emptyWrap}>
              <View style={st.emptyIcon}><ImageIcon size={32} color="#94a3b8" /></View>
              <Text style={st.emptyTitle}>No proofs to review</Text>
              <Text style={st.emptySub}>Tenant submissions will appear here</Text>
            </View>
          ) : pending.map(proof => {
            const name = `${proof.tenant_first_name} ${proof.tenant_last_name}`;
            const ac = getAC(name);
            const busy = processing === proof.id;
            return (
              <View key={proof.id} style={st.proofCard}>
                <View style={st.proofHeader}>
                  <View style={[st.avatar, { backgroundColor: ac.bg }]}>
                    <Text style={[st.avatarText, { color: ac.text }]}>{initials(name)}</Text>
                  </View>
                  <View style={st.proofHeaderInfo}>
                    <Text style={st.proofName}>{name}</Text>
                    <Text style={st.proofMeta}>{proof.invoice_number} · J${proof.invoice_amount.toLocaleString()}</Text>
                  </View>
                </View>
                <Pressable onPress={() => setZoomImage(proof.image_url)} style={st.proofImageWrap}>
                  <Image source={{ uri: proof.image_url }} style={st.proofImage} resizeMode="cover" />
                </Pressable>
                <View style={st.proofActions}>
                  <Pressable onPress={() => handleApprove(proof)} disabled={!!processing}
                    style={({ pressed }) => [st.approveBtn, (pressed || busy) && { opacity: 0.6 }]}>
                    <CheckCircle size={16} color="#fff" />
                    <Text style={st.actionBtnText}>Approve</Text>
                  </Pressable>
                  <Pressable onPress={() => handleReject(proof)} disabled={!!processing}
                    style={({ pressed }) => [st.rejectBtn, (pressed || busy) && { opacity: 0.6 }]}>
                    <XCircle size={16} color="#ef4444" />
                    <Text style={st.rejectBtnText}>Reject</Text>
                  </Pressable>
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}

      {/* Zoom modal */}
      <Modal visible={!!zoomImage} transparent animationType="fade" onRequestClose={() => setZoomImage(null)}>
        <View style={st.zoomBg}>
          <Pressable onPress={() => setZoomImage(null)} style={st.zoomClose}>
            <X size={22} color="#fff" />
          </Pressable>
          {zoomImage && (
            <Image source={{ uri: zoomImage }}
              style={{ width: Dimensions.get('window').width, height: Dimensions.get('window').height * 0.8 }}
              resizeMode="contain" />
          )}
        </View>
      </Modal>
    </View>
  );
}

const st = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12,
  },
  headerTitle: { fontSize: 28, fontWeight: '700', color: '#0f172a', letterSpacing: -0.5 },
  headerSub: { fontSize: 14, color: '#94a3b8', marginTop: 2 },

  // Tabs
  tabRow: { flexDirection: 'row', marginHorizontal: 20, marginBottom: 16, backgroundColor: '#f1f5f9', borderRadius: 10, padding: 3 },
  tabBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 9, borderRadius: 8, gap: 6 },
  tabBtnActive: { backgroundColor: '#ffffff', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  tabBtnText: { fontSize: 14, fontWeight: '500', color: '#64748b' },
  tabBtnTextActive: { color: '#0f172a', fontWeight: '600' },
  tabBadge: { backgroundColor: '#ef4444', borderRadius: 8, paddingHorizontal: 5, paddingVertical: 1 },
  tabBadgeText: { fontSize: 10, fontWeight: '700', color: '#fff' },

  // Search
  searchBar: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: 20, marginBottom: 12,
    backgroundColor: '#f8fafc', borderRadius: 12, paddingHorizontal: 14, height: 44,
  },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 15, color: '#0f172a' },

  // Separator & loading
  separator: { height: 1, backgroundColor: '#f1f5f9', marginLeft: 72 },
  loadingWrap: { paddingHorizontal: 20, gap: 12, paddingTop: 8 },
  skeleton: { height: 64, borderRadius: 12, backgroundColor: '#f1f5f9' },

  // Payment row
  paymentRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14 },
  avatar: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 14, fontWeight: '700' },
  paymentInfo: { flex: 1, marginLeft: 12 },
  paymentName: { fontSize: 15, fontWeight: '600', color: '#0f172a' },
  paymentMeta: { fontSize: 12, color: '#94a3b8', marginTop: 2 },
  paymentAmount: { fontSize: 15, fontWeight: '700', color: '#059669' },

  // Proof card
  proofCard: { backgroundColor: '#f8fafc', borderRadius: 16, padding: 16, marginBottom: 12 },
  proofHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  proofHeaderInfo: { flex: 1, marginLeft: 12 },
  proofName: { fontSize: 15, fontWeight: '600', color: '#0f172a' },
  proofMeta: { fontSize: 12, color: '#94a3b8', marginTop: 2 },
  proofImageWrap: { borderRadius: 12, overflow: 'hidden', marginBottom: 12 },
  proofImage: { width: '100%', height: 200, backgroundColor: '#e2e8f0' },
  proofActions: { flexDirection: 'row', gap: 10 },
  approveBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    backgroundColor: '#0f172a', paddingVertical: 11, borderRadius: 10,
  },
  actionBtnText: { fontSize: 14, fontWeight: '600', color: '#ffffff' },
  rejectBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    backgroundColor: '#fef2f2', paddingVertical: 11, borderRadius: 10,
  },
  rejectBtnText: { fontSize: 14, fontWeight: '600', color: '#ef4444' },

  // Empty
  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40, paddingVertical: 60 },
  emptyIcon: {
    width: 64, height: 64, borderRadius: 20, backgroundColor: '#f1f5f9',
    alignItems: 'center', justifyContent: 'center', marginBottom: 20,
  },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: '#0f172a', marginBottom: 6 },
  emptySub: { fontSize: 14, color: '#94a3b8', textAlign: 'center', lineHeight: 20, marginBottom: 8 },
  tipWrap: {
    marginTop: 24, width: '100%', backgroundColor: '#f8fafc',
    borderRadius: 14, padding: 16,
  },
  tipTitle: {
    fontSize: 12, fontWeight: '600', textTransform: 'uppercase',
    letterSpacing: 0.8, color: '#94a3b8', marginBottom: 8,
  },
  tipText: { fontSize: 14, color: '#64748b', lineHeight: 20 },

  // Zoom
  zoomBg: { flex: 1, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center' },
  zoomClose: {
    position: 'absolute', top: 60, right: 20, zIndex: 10,
    width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
});
