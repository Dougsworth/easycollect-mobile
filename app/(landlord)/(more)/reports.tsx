import { useState, useEffect } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { getPnLReport } from '@/shared/services/reports';
import { Card, CardTitle, StatCard, Skeleton } from '@/components/ui';
import { PageHeader } from '@/components/PageHeader';
import { ProgressBar } from '@/components/ui';
import type { PnLData } from '@/shared/types/app.types';

export default function ReportsScreen() {
  const { user } = useAuth();
  const [data, setData] = useState<PnLData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const now = new Date();
    const startDate = `${now.getFullYear()}-01-01`;
    const endDate = `${now.getFullYear()}-12-31`;
    getPnLReport(user.id, startDate, endDate)
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  const fmt = (n: number) => `J$${n.toLocaleString()}`;

  return (
    <SafeAreaView className="flex-1 bg-background-secondary">
      <PageHeader title="Reports" showBack subtitle={`${new Date().getFullYear()} Overview`} />
      <ScrollView className="flex-1 px-5" contentContainerClassName="pb-8">
        {loading ? (
          <View className="gap-3">
            {[1,2,3].map(i => <Skeleton key={i} className="h-24 w-full" />)}
          </View>
        ) : data ? (
          <>
            <View className="flex-row gap-3 mb-4">
              <StatCard title="Expected" value={fmt(data.totalExpected)} color="primary" className="flex-1" />
              <StatCard title="Collected" value={fmt(data.totalCollected)} color="success" className="flex-1" />
            </View>
            <View className="flex-row gap-3 mb-5">
              <StatCard title="Outstanding" value={fmt(data.totalOutstanding)} color="warning" className="flex-1" />
              <StatCard title="Collection Rate" value={`${data.collectionRate.toFixed(1)}%`} color={data.collectionRate >= 80 ? 'success' : 'warning'} className="flex-1" />
            </View>

            {/* Monthly Breakdown */}
            <Card className="mb-4">
              <CardTitle className="mb-4">Monthly Breakdown</CardTitle>
              {data.byMonth.map((m, idx) => (
                <View key={m.month} className={`mb-4 ${idx < data.byMonth.length - 1 ? '' : 'mb-0'}`}>
                  <View className="flex-row justify-between mb-1.5">
                    <Text className="text-sm font-medium text-foreground">{m.monthLabel}</Text>
                    <Text className="text-xs font-medium text-muted-foreground">{fmt(m.collected)} / {fmt(m.expected)}</Text>
                  </View>
                  <ProgressBar
                    progress={m.expected > 0 ? (m.collected / m.expected) * 100 : 0}
                    color={m.expected > 0 && m.collected / m.expected >= 0.8 ? 'success' : 'warning'}
                  />
                </View>
              ))}
            </Card>

            {/* By Property */}
            <Card>
              <CardTitle className="mb-4">By Property</CardTitle>
              {data.byProperty.map((p, idx) => (
                <View key={p.property_id} className={`mb-4 ${idx < data.byProperty.length - 1 ? '' : 'mb-0'}`}>
                  <View className="flex-row justify-between mb-1.5">
                    <Text className="text-sm font-medium text-foreground">{p.property_name}</Text>
                    <Text className="text-xs font-medium text-muted-foreground">{fmt(p.collected)} / {fmt(p.expected)}</Text>
                  </View>
                  <ProgressBar
                    progress={p.expected > 0 ? (p.collected / p.expected) * 100 : 0}
                    color="primary"
                  />
                </View>
              ))}
            </Card>
          </>
        ) : (
          <Text className="text-muted-foreground text-center mt-8">No data available</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
