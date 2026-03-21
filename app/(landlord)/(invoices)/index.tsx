import { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, FlatList, Pressable, TextInput, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Plus, Search, Download } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { getInvoices } from '@/shared/services/invoices';
import { StatusBadge, Skeleton } from '@/components/ui';
import { PageHeader } from '@/components/PageHeader';
import { FilterTabs } from '@/components/FilterTabs';
import { EmptyState } from '@/components/EmptyState';
import { formatDate, exportToCsv } from '@/shared/utils';
import type { InvoiceWithTenant } from '@/shared/types/app.types';

export default function InvoicesScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [invoices, setInvoices] = useState<InvoiceWithTenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const loadInvoices = useCallback(async () => {
    if (!user) return;
    try {
      setInvoices(await getInvoices(user.id));
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to load invoices. Pull down to refresh.');
    }
    finally { setLoading(false); }
  }, [user]);

  useEffect(() => { loadInvoices(); }, [loadInvoices]);

  const onRefresh = async () => { setRefreshing(true); await loadInvoices(); setRefreshing(false); };

  const filtered = useMemo(() => {
    let list = invoices;
    if (filter !== 'all') list = list.filter(i => i.status === filter);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(i =>
        i.invoice_number.toLowerCase().includes(q) ||
        `${i.tenant_first_name} ${i.tenant_last_name}`.toLowerCase().includes(q)
      );
    }
    return list;
  }, [invoices, filter, search]);

  const tabs = [
    { label: 'All', value: 'all', count: invoices.length },
    { label: 'Pending', value: 'pending', count: invoices.filter(i => i.status === 'pending').length },
    { label: 'Overdue', value: 'overdue', count: invoices.filter(i => i.status === 'overdue').length },
    { label: 'Paid', value: 'paid', count: invoices.filter(i => i.status === 'paid').length },
  ];

  const handleExport = async () => {
    try {
      await exportToCsv('invoices.csv', filtered as any[], [
        { key: 'invoice_number', header: 'Invoice #' },
        { key: 'tenant_first_name', header: 'Tenant' },
        { key: 'amount', header: 'Amount' },
        { key: 'due_date', header: 'Due Date' },
        { key: 'status', header: 'Status' },
      ]);
    } catch { Alert.alert('Error', 'Failed to export CSV.'); }
  };

  const renderInvoice = ({ item }: { item: InvoiceWithTenant }) => (
    <View
      className="mx-5 mb-3 p-4 bg-white rounded-2xl"
      style={{
        shadowColor: '#0f172a',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 2,
      }}
    >
      <View className="flex-row items-start justify-between">
        <View className="flex-1">
          <Text className="text-base font-semibold text-foreground">{item.invoice_number}</Text>
          <Text className="text-sm text-muted-foreground mt-0.5">
            {item.tenant_first_name} {item.tenant_last_name}
          </Text>
          <Text className="text-xs text-muted-foreground mt-0.5">
            {item.property_name} — Due {formatDate(item.due_date)}
          </Text>
        </View>
        <View className="items-end">
          <Text className="text-base font-bold text-foreground">J${item.amount.toLocaleString()}</Text>
          <StatusBadge status={item.status} className="mt-1.5" />
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-background-secondary">
      <PageHeader
        title="Invoices"
        subtitle={`${invoices.length} total`}
        right={
          <View className="flex-row gap-2">
            <Pressable
              onPress={handleExport}
              className="bg-white rounded-full h-10 w-10 items-center justify-center"
              style={{
                shadowColor: '#0f172a',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.06,
                shadowRadius: 4,
                elevation: 2,
              }}
            >
              <Download size={18} color="#64748b" />
            </Pressable>
            <Pressable
              onPress={() => router.push('/(landlord)/(invoices)/create')}
              className="bg-primary rounded-full h-10 w-10 items-center justify-center"
              style={{
                shadowColor: '#0f172a',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 6,
                elevation: 4,
              }}
            >
              <Plus size={20} color="#fff" />
            </Pressable>
          </View>
        }
      />

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
            placeholder="Search invoices..."
            value={search}
            onChangeText={setSearch}
            className="flex-1 ml-3 text-base text-foreground"
            placeholderTextColor="#94a3b8"
          />
        </View>
      </View>

      <FilterTabs tabs={tabs} activeTab={filter} onTabChange={setFilter} />

      {loading ? (
        <View className="px-5 gap-3">{[1,2,3,4].map(i => <Skeleton key={i} className="h-24 w-full" />)}</View>
      ) : filtered.length === 0 ? (
        <EmptyState title="No invoices found" description="Create your first invoice" actionLabel="Create Invoice" onAction={() => router.push('/(landlord)/(invoices)/create')} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={i => i.id}
          renderItem={renderInvoice}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3b82f6" />}
          contentContainerClassName="pb-4"
        />
      )}
    </SafeAreaView>
  );
}
