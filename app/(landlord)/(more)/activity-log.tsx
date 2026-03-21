import { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Clock } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { getActivityLogs } from '@/shared/services/activityLog';
import { FilterTabs } from '@/components/FilterTabs';
import { PageHeader } from '@/components/PageHeader';
import { EmptyState } from '@/components/EmptyState';
import { Skeleton } from '@/components/ui';
import { formatDate } from '@/shared/utils';
import type { ActivityLog } from '@/shared/types/app.types';

const entityTypes = [
  { label: 'All', value: 'all' },
  { label: 'Tenant', value: 'tenant' },
  { label: 'Invoice', value: 'invoice' },
  { label: 'Payment', value: 'payment' },
  { label: 'Property', value: 'property' },
  { label: 'Proof', value: 'proof' },
];

export default function ActivityLogScreen() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all');

  const loadData = useCallback(async () => {
    if (!user) return;
    try {
      const filters = filter !== 'all' ? { entityType: filter } : undefined;
      setLogs(await getActivityLogs(user.id, filters));
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [user, filter]);

  useEffect(() => { loadData(); }, [loadData]);
  const onRefresh = async () => { setRefreshing(true); await loadData(); setRefreshing(false); };

  return (
    <SafeAreaView className="flex-1 bg-background-secondary">
      <PageHeader title="Activity Log" showBack />
      <FilterTabs tabs={entityTypes} activeTab={filter} onTabChange={setFilter} />
      {loading ? (
        <View className="px-5 gap-3">{[1,2,3,4,5].map(i => <Skeleton key={i} className="h-16 w-full" />)}</View>
      ) : logs.length === 0 ? (
        <EmptyState icon={<Clock size={40} color="#94a3b8" />} title="No activity" description="Actions will appear here" />
      ) : (
        <FlatList
          data={logs}
          keyExtractor={l => l.id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3b82f6" />}
          contentContainerClassName="px-5 pb-4"
          renderItem={({ item }) => (
            <View
              className="flex-row mb-3 p-4 bg-white rounded-2xl"
              style={{
                shadowColor: '#0f172a',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.04,
                shadowRadius: 6,
                elevation: 1,
              }}
            >
              <View className="h-9 w-9 rounded-xl bg-muted items-center justify-center mr-3">
                <Clock size={16} color="#64748b" />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-medium text-foreground">{item.description}</Text>
                <Text className="text-xs text-muted-foreground mt-1">{formatDate(item.created_at)}</Text>
              </View>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}
