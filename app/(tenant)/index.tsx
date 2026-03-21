import { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, RefreshControl, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Upload, LogOut } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { StatusBadge, Card, CardTitle, Button } from '@/components/ui';
import { PageHeader } from '@/components/PageHeader';
import { EmptyState } from '@/components/EmptyState';
import { formatDate } from '@/shared/utils';
import type { Invoice } from '@/shared/types/app.types';

export default function TenantHomeScreen() {
  const { user, profile, signOut } = useAuth();
  const router = useRouter();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    if (!user) return;
    const { data: tenant } = await supabase
      .from('tenants')
      .select('id')
      .eq('profile_id', user.id)
      .single();

    if (tenant) {
      const { data } = await supabase
        .from('invoices')
        .select('*')
        .eq('tenant_id', tenant.id)
        .order('due_date', { ascending: false });
      setInvoices(data ?? []);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { loadData(); }, [loadData]);
  const onRefresh = async () => { setRefreshing(true); await loadData(); setRefreshing(false); };

  return (
    <SafeAreaView className="flex-1 bg-background-secondary">
      <PageHeader
        title={`Hi, ${profile?.first_name ?? 'there'}`}
        subtitle="Your invoices"
        right={
          <View className="flex-row gap-2">
            <Pressable
              onPress={() => router.push('/(tenant)/upload-receipt')}
              className="bg-white rounded-full h-10 w-10 items-center justify-center"
              style={{
                shadowColor: '#0f172a',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.04,
                shadowRadius: 6,
                elevation: 1,
                borderWidth: 1,
                borderColor: 'rgba(226,232,240,0.6)',
              }}
            >
              <Upload size={18} color="#3b82f6" />
            </Pressable>
            <Pressable
              onPress={signOut}
              className="bg-white rounded-full h-10 w-10 items-center justify-center"
              style={{
                shadowColor: '#0f172a',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.04,
                shadowRadius: 6,
                elevation: 1,
                borderWidth: 1,
                borderColor: 'rgba(226,232,240,0.6)',
              }}
            >
              <LogOut size={18} color="#64748b" />
            </Pressable>
          </View>
        }
      />
      {loading ? null : invoices.length === 0 ? (
        <EmptyState title="No invoices" description="Your landlord hasn't created any invoices yet" />
      ) : (
        <FlatList
          data={invoices}
          keyExtractor={i => i.id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3b82f6" />}
          contentContainerClassName="px-5 pb-4"
          renderItem={({ item }) => (
            <Card className="mb-3">
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-base font-semibold text-foreground">{item.invoice_number}</Text>
                <StatusBadge status={item.status} />
              </View>
              <Text className="text-3xl font-bold text-foreground tracking-tight">J${item.amount.toLocaleString()}</Text>
              <Text className="text-xs text-muted-foreground mt-1.5">Due {formatDate(item.due_date)}</Text>
              {item.description ? <Text className="text-sm text-muted-foreground mt-1">{item.description}</Text> : null}
              {item.status !== 'paid' && (
                <Button
                  size="lg"
                  className="mt-4"
                  onPress={() => router.push({ pathname: '/(tenant)/payment', params: { invoiceId: item.id, token: item.payment_token, amount: String(item.amount) } })}
                >
                  Pay Now
                </Button>
              )}
            </Card>
          )}
        />
      )}
    </SafeAreaView>
  );
}
