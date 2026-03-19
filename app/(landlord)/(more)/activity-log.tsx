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
        <View className="px-4 gap-3">{[1,2,3,4,5].map(i => <Skeleton key={i} className="h-14 w-full" />)}</View>
      ) : logs.length === 0 ? (
        <EmptyState icon={<Clock size={40} color="#9ca3af" />} title="No activity" description="Actions will appear here" />
      ) : (
        <FlatList
          data={logs}
          keyExtractor={l => l.id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3b82f6" />}
          renderItem={({ item }) => (
            <View className="flex-row px-4 py-3 bg-white border-b border-border/50">
              <View className="h-8 w-8 rounded-full bg-muted items-center justify-center mr-3 mt-0.5">
                <Clock size={14} color="#6b7280" />
              </View>
              <View className="flex-1">
                <Text className="text-sm text-foreground">{item.description}</Text>
                <Text className="text-xs text-muted-foreground mt-0.5">{formatDate(item.created_at)}</Text>
              </View>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}
