import { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, FlatList, Pressable, TextInput, RefreshControl, Alert } from 'react-native';
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
      Alert.alert('Error', 'Failed to load tenants. Pull down to refresh.');
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
      className="flex-row items-center mx-5 mb-3 p-4 bg-white rounded-2xl"
      style={({ pressed }: { pressed: boolean }) => ({
        opacity: pressed ? 0.9 : 1,
        transform: [{ scale: pressed ? 0.98 : 1 }],
        shadowColor: '#0f172a',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 2,
      })}
    >
      <AvatarInitial name={`${item.first_name} ${item.last_name}`} />
      <View className="flex-1 ml-3">
        <Text className="text-base font-semibold text-foreground">
          {item.first_name} {item.last_name}
        </Text>
        <Text className="text-xs text-muted-foreground mt-0.5">
          {item.property_name}{item.unit_name ? ` — ${item.unit_name}` : ''}
        </Text>
      </View>
      <View className="items-end">
        <Text className="text-sm font-bold text-foreground">J${item.rent_amount.toLocaleString()}</Text>
        <StatusBadge status={item.payment_status} className="mt-1" />
      </View>
    </Pressable>
  );

  return (
    <SafeAreaView className="flex-1 bg-background-secondary">
      <PageHeader
        title="Tenants"
        subtitle={`${tenants.length} total`}
        right={
          <Pressable
            onPress={() => router.push('/(landlord)/(tenants)/add')}
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
            placeholder="Search tenants..."
            value={search}
            onChangeText={setSearch}
            className="flex-1 ml-3 text-base text-foreground"
            placeholderTextColor="#94a3b8"
          />
        </View>
      </View>

      <FilterTabs tabs={tabs} activeTab={filter} onTabChange={setFilter} />

      {loading ? (
        <View className="px-5 gap-3">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-20 w-full" />)}
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
          contentContainerClassName="pb-4"
        />
      )}
    </SafeAreaView>
  );
}
