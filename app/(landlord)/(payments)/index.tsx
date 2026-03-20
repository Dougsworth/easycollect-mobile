import { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, FlatList, TextInput, RefreshControl, Pressable, ScrollView, Image, Alert, Modal, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Search, CheckCircle, XCircle, X } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { getPayments } from '@/shared/services/payments';
import { getProofsForLandlord, approveProof, rejectProof } from '@/shared/services/paymentProofs';
import { AvatarInitial, StatusBadge, Card, CardTitle, Skeleton, Button } from '@/components/ui';
import { FilterTabs } from '@/components/FilterTabs';
import { PageHeader } from '@/components/PageHeader';
import { EmptyState } from '@/components/EmptyState';
import { formatDate } from '@/shared/utils';
import type { PaymentWithDetails, PaymentProofWithDetails } from '@/shared/types/app.types';

type Tab = 'payments' | 'proofs';

export default function PaymentsScreen() {
  const { user } = useAuth();
  const [payments, setPayments] = useState<PaymentWithDetails[]>([]);
  const [proofs, setProofs] = useState<PaymentProofWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [zoomImage, setZoomImage] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>('payments');

  const loadData = useCallback(async () => {
    if (!user) return;
    try {
      const [p, pr] = await Promise.all([getPayments(user.id), getProofsForLandlord(user.id)]);
      setPayments(p);
      setProofs(pr);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [user]);

  useEffect(() => { loadData(); }, [loadData]);
  const onRefresh = async () => { setRefreshing(true); await loadData(); setRefreshing(false); };

  const pendingProofs = proofs.filter(p => p.status === 'pending');

  const filteredPayments = useMemo(() => {
    if (!search) return payments;
    const q = search.toLowerCase();
    return payments.filter(p =>
      `${p.tenant_first_name} ${p.tenant_last_name}`.toLowerCase().includes(q) ||
      (p.invoice_number ?? '').toLowerCase().includes(q)
    );
  }, [payments, search]);

  const handleApprove = async (proof: PaymentProofWithDetails) => {
    try {
      await approveProof(proof.id, proof.landlord_id, proof.invoice_id, proof.tenant_id, proof.invoice_amount);
      Alert.alert('Approved', 'Payment proof approved and payment recorded.');
      loadData();
    } catch { Alert.alert('Error', 'Failed to approve proof.'); }
  };

  const handleReject = (proof: PaymentProofWithDetails) => {
    Alert.prompt?.('Reject Proof', 'Add a note (optional):', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Reject', style: 'destructive', onPress: async (note) => {
        try {
          await rejectProof(proof.id, proof.landlord_id, note);
          loadData();
        } catch { Alert.alert('Error', 'Failed to reject proof.'); }
      }},
    ]) ?? (async () => {
      try {
        await rejectProof(proof.id, proof.landlord_id);
        loadData();
      } catch { Alert.alert('Error', 'Failed to reject proof.'); }
    })();
  };

  const tabs = [
    { label: 'Payments', value: 'payments', count: payments.length },
    { label: 'Proof Review', value: 'proofs', count: pendingProofs.length },
  ];

  return (
    <SafeAreaView className="flex-1 bg-background-secondary">
      <PageHeader title="Payments" subtitle={`${payments.length} recorded`} />

      <FilterTabs tabs={tabs} activeTab={tab} onTabChange={v => setTab(v as Tab)} />

      {tab === 'payments' ? (
        <>
          <View className="px-4 mb-3">
            <View className="flex-row items-center bg-white rounded-xl border border-border px-3 h-11">
              <Search size={18} color="#9ca3af" />
              <TextInput placeholder="Search payments..." value={search} onChangeText={setSearch} className="flex-1 ml-2 text-base text-foreground" placeholderTextColor="#9ca3af" />
            </View>
          </View>
          {loading ? (
            <View className="px-4 gap-3">{[1,2,3].map(i => <Skeleton key={i} className="h-16 w-full" />)}</View>
          ) : filteredPayments.length === 0 ? (
            <EmptyState title="No payments found" description="Payments will appear here when recorded" />
          ) : (
            <FlatList
              data={filteredPayments}
              keyExtractor={i => i.id}
              refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3b82f6" />}
              renderItem={({ item }) => (
                <View className="flex-row items-center px-4 py-3 bg-white border-b border-border/50">
                  <AvatarInitial name={`${item.tenant_first_name} ${item.tenant_last_name}`} size="sm" />
                  <View className="flex-1 ml-3">
                    <Text className="text-sm font-medium text-foreground">{item.tenant_first_name} {item.tenant_last_name}</Text>
                    <Text className="text-xs text-muted-foreground">{item.method} — {formatDate(item.payment_date)}</Text>
                  </View>
                  <Text className="text-sm font-semibold text-success">J${item.amount.toLocaleString()}</Text>
                </View>
              )}
            />
          )}
        </>
      ) : (
        <ScrollView className="flex-1 px-4" refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3b82f6" />}>
          {pendingProofs.length === 0 ? (
            <EmptyState title="No proofs to review" description="Payment proofs submitted by tenants will appear here" />
          ) : (
            pendingProofs.map(proof => (
              <Card key={proof.id} className="mb-3">
                <View className="flex-row items-center mb-2">
                  <AvatarInitial name={`${proof.tenant_first_name} ${proof.tenant_last_name}`} size="sm" />
                  <View className="ml-2 flex-1">
                    <Text className="text-sm font-medium text-foreground">{proof.tenant_first_name} {proof.tenant_last_name}</Text>
                    <Text className="text-xs text-muted-foreground">{proof.invoice_number} — J${proof.invoice_amount.toLocaleString()}</Text>
                  </View>
                </View>
                <Pressable onPress={() => setZoomImage(proof.image_url)}>
                  <Image source={{ uri: proof.image_url }} className="w-full h-48 rounded-xl bg-muted mb-3" resizeMode="cover" />
                  <View className="absolute top-2 right-2 bg-black/50 rounded-full p-1.5">
                    <Search size={14} color="#fff" />
                  </View>
                </Pressable>
                <View className="flex-row gap-2">
                  <Button variant="default" size="sm" onPress={() => handleApprove(proof)} className="flex-1">
                    <View className="flex-row items-center gap-1">
                      <CheckCircle size={16} color="#fff" />
                      <Text className="text-white font-semibold text-sm">Approve</Text>
                    </View>
                  </Button>
                  <Button variant="destructive" size="sm" onPress={() => handleReject(proof)} className="flex-1">
                    <View className="flex-row items-center gap-1">
                      <XCircle size={16} color="#fff" />
                      <Text className="text-white font-semibold text-sm">Reject</Text>
                    </View>
                  </Button>
                </View>
              </Card>
            ))
          )}
        </ScrollView>
      )}
      {/* Image Zoom Modal */}
      <Modal visible={!!zoomImage} transparent animationType="fade" onRequestClose={() => setZoomImage(null)}>
        <View className="flex-1 bg-black">
          <Pressable onPress={() => setZoomImage(null)} className="absolute top-14 right-4 z-10 bg-white/20 rounded-full p-2">
            <X size={24} color="#fff" />
          </Pressable>
          {zoomImage && (
            <View className="flex-1 items-center justify-center">
              <Image
                source={{ uri: zoomImage }}
                style={{ width: Dimensions.get('window').width, height: Dimensions.get('window').height * 0.8 }}
                resizeMode="contain"
              />
            </View>
          )}
        </View>
      </Modal>
    </SafeAreaView>
  );
}
