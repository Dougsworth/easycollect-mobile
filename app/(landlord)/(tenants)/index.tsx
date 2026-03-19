import { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, FlatList, Pressable, TextInput, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Plus, Search } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { getTenants } from '@/shared/services/tenants';
import { AvatarInitial, StatusBadge, Skeleton } from '@/components/ui';
import { PageHeader } from '@/components/PageHeader';
import { FilterTabs } from '@/components/FilterTabs';
import { EmptyState } from '@/components/EmptyState';
import type { TenantWithDetails } from '@/shared/types/app.types';

export default function TenantsScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [tenants, setTenants] = useState<TenantWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const loadTenants = useCallback(async () => {
    if (!user) return;
    try {
      const data = await getTenants(user.id);
      setTenants(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { loadTenants(); }, [loadTenants]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTenants();
    setRefreshing(false);
  };

  const filtered = useMemo(() => {
    let list = tenants;
    if (filter !== 'all') {
      list = list.filter(t => t.status === filter || t.payment_status === filter);
    }
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(t =>
        `${t.first_name} ${t.last_name}`.toLowerCase().includes(q) ||
        t.property_name.toLowerCase().includes(q) ||
        t.unit_name.toLowerCase().includes(q)
      );
    }
    return list;
  }, [tenants, filter, search]);

  const tabs = [
    { label: 'All', value: 'all', count: tenants.length },
    { label: 'Active', value: 'active', count: tenants.filter(t => t.status === 'active').length },
    { label: 'Overdue', value: 'overdue', count: tenants.filter(t => t.payment_status === 'overdue').length },
    { label: 'Inactive', value: 'inactive', count: tenants.filter(t => t.status === 'inactive').length },
  ];

  const renderTenant = ({ item }: { item: TenantWithDetails }) => (
    <Pressable
      onPress={() => router.push(`/(landlord)/(tenants)/${item.id}`)}
      className="flex-row items-center px-4 py-3 bg-white border-b border-border/50"
    >
      <AvatarInitial name={`${item.first_name} ${item.last_name}`} />
      <View className="flex-1 ml-3">
        <Text className="text-base font-medium text-foreground">
          {item.first_name} {item.last_name}
        </Text>
        <Text className="text-xs text-muted-foreground">
          {item.property_name}{item.unit_name ? ` — ${item.unit_name}` : ''}
        </Text>
      </View>
      <View className="items-end">
        <Text className="text-sm font-semibold text-foreground">J${item.rent_amount.toLocaleString()}</Text>
        <StatusBadge status={item.payment_status} />
      </View>
    </Pressable>
  );

  return (
    <SafeAreaView className="flex-1 bg-background-secondary">
      <PageHeader
        title="Tenants"
        subtitle={`${tenants.length} total`}
        right={
          <Pressable onPress={() => router.push('/(landlord)/(tenants)/add')} className="bg-primary rounded-full p-2">
            <Plus size={20} color="#fff" />
          </Pressable>
        }
      />

      <View className="px-4 mb-3">
        <View className="flex-row items-center bg-white rounded-xl border border-border px-3 h-11">
          <Search size={18} color="#9ca3af" />
          <TextInput
            placeholder="Search tenants..."
            value={search}
            onChangeText={setSearch}
            className="flex-1 ml-2 text-base text-foreground"
            placeholderTextColor="#9ca3af"
          />
        </View>
      </View>

      <FilterTabs tabs={tabs} activeTab={filter} onTabChange={setFilter} />

      {loading ? (
        <View className="px-4 gap-3">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-16 w-full" />)}
        </View>
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No tenants found"
          description={search ? 'Try a different search' : 'Add your first tenant to get started'}
          actionLabel={!search ? 'Add Tenant' : undefined}
          onAction={!search ? () => router.push('/(landlord)/(tenants)/add') : undefined}
        />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={renderTenant}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3b82f6" />}
        />
      )}
    </SafeAreaView>
  );
}
