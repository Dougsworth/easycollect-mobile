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
  const [processingProof, setProcessingProof] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!user) return;
    try {
      const [p, pr] = await Promise.all([getPayments(user.id), getProofsForLandlord(user.id)]);
      setPayments(p);
      setProofs(pr);
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to load payment data. Pull down to retry.');
    }
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
    if (processingProof) return; // prevent double-tap
    setProcessingProof(proof.id);
    try {
      await approveProof(proof.id, proof.landlord_id, proof.invoice_id, proof.tenant_id, proof.invoice_amount);
      Alert.alert('Approved', 'Payment proof approved and payment recorded.');
      loadData();
    } catch (err: any) {
      Alert.alert('Error', err.message ?? 'Failed to approve proof.');
    } finally {
      setProcessingProof(null);
    }
  };

  const handleReject = (proof: PaymentProofWithDetails) => {
    if (processingProof) return;
    Alert.prompt?.('Reject Proof', 'Add a note (optional):', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Reject', style: 'destructive', onPress: async (note?: string) => {
        setProcessingProof(proof.id);
        try {
          await rejectProof(proof.id, proof.landlord_id, note);
          loadData();
        } catch (err: any) {
          Alert.alert('Error', err.message ?? 'Failed to reject proof.');
        } finally {
          setProcessingProof(null);
        }
      }},
    ]) ?? (async () => {
      setProcessingProof(proof.id);
      try {
        await rejectProof(proof.id, proof.landlord_id);
        loadData();
      } catch (err: any) {
        Alert.alert('Error', err.message ?? 'Failed to reject proof.');
      } finally {
        setProcessingProof(null);
      }
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
          <View className="px-5 mb-3">
            <View
              className="flex-row items-center bg-white rounded-xl px-4 h-12"
              style={{
                shadowColor: '#0f172a',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.04,
                shadowRadius: 6,
                elevation: 2,
              }}
            >
              <Search size={18} color="#94a3b8" />
              <TextInput
                placeholder="Search payments..."
                value={search}
                onChangeText={setSearch}
                className="flex-1 ml-3 text-base text-foreground"
                placeholderTextColor="#94a3b8"
              />
            </View>
          </View>
          {loading ? (
            <View className="px-5 gap-3">{[1,2,3].map(i => <Skeleton key={i} className="h-20 w-full" />)}</View>
          ) : filteredPayments.length === 0 ? (
            <EmptyState title="No payments found" description="Payments will appear here when recorded" />
          ) : (
            <FlatList
              data={filteredPayments}
              keyExtractor={i => i.id}
              refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3b82f6" />}
              contentContainerClassName="pb-4"
              renderItem={({ item }) => (
                <View
                  className="flex-row items-center mx-5 mb-3 p-4 bg-white rounded-2xl"
                  style={{
                    shadowColor: '#0f172a',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.04,
                    shadowRadius: 8,
                    elevation: 2,
                  }}
                >
                  <AvatarInitial name={`${item.tenant_first_name} ${item.tenant_last_name}`} size="sm" />
                  <View className="flex-1 ml-3">
                    <Text className="text-sm font-semibold text-foreground">{item.tenant_first_name} {item.tenant_last_name}</Text>
                    <Text className="text-xs text-muted-foreground mt-0.5">{item.method} — {formatDate(item.payment_date)}</Text>
                  </View>
                  <Text className="text-sm font-bold text-success">J${item.amount.toLocaleString()}</Text>
                </View>
              )}
            />
          )}
        </>
      ) : (
        <ScrollView className="flex-1 px-5" refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3b82f6" />}>
          {pendingProofs.length === 0 ? (
            <EmptyState title="No proofs to review" description="Payment proofs submitted by tenants will appear here" />
          ) : (
            pendingProofs.map(proof => {
              const isProcessing = processingProof === proof.id;
              return (
                <Card key={proof.id} className="mb-3">
                  <View className="flex-row items-center mb-3">
                    <AvatarInitial name={`${proof.tenant_first_name} ${proof.tenant_last_name}`} size="sm" />
                    <View className="ml-3 flex-1">
                      <Text className="text-sm font-semibold text-foreground">{proof.tenant_first_name} {proof.tenant_last_name}</Text>
                      <Text className="text-xs text-muted-foreground mt-0.5">{proof.invoice_number} — J${proof.invoice_amount.toLocaleString()}</Text>
                    </View>
                  </View>
                  <Pressable onPress={() => setZoomImage(proof.image_url)} className="rounded-xl overflow-hidden mb-3">
                    <Image source={{ uri: proof.image_url }} className="w-full h-48 bg-muted" resizeMode="cover" />
                    <View className="absolute top-2 right-2 bg-black/40 rounded-full p-1.5">
                      <Search size={14} color="#fff" />
                    </View>
                  </Pressable>
                  <View className="flex-row gap-3">
                    <Button
                      variant="default"
                      size="sm"
                      onPress={() => handleApprove(proof)}
                      className="flex-1"
                      loading={isProcessing}
                      disabled={!!processingProof}
                    >
                      <View className="flex-row items-center gap-1.5">
                        <CheckCircle size={16} color="#fff" />
                        <Text className="text-white font-semibold text-sm">Approve</Text>
                      </View>
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onPress={() => handleReject(proof)}
                      className="flex-1"
                      disabled={!!processingProof}
                    >
                      <View className="flex-row items-center gap-1.5">
                        <XCircle size={16} color="#fff" />
                        <Text className="text-white font-semibold text-sm">Reject</Text>
                      </View>
                    </Button>
                  </View>
                </Card>
              );
            })
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
