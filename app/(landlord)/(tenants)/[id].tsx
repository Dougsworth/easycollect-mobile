import { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Phone, Mail, Home, Calendar, Trash2 } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { getTenants, deleteTenant } from '@/shared/services/tenants';
import { getInvoicesForTenant } from '@/shared/services/invoices';
import { getPaymentsForTenant } from '@/shared/services/payments';
import { AvatarInitial, StatusBadge, Card, CardTitle, Button } from '@/components/ui';
import { showConfirmDialog } from '@/components/ui';
import { PageHeader } from '@/components/PageHeader';
import { formatDate } from '@/shared/utils';
import type { TenantWithDetails, Invoice, Payment } from '@/shared/types/app.types';

export default function TenantDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const router = useRouter();
  const [tenant, setTenant] = useState<TenantWithDetails | null>(null);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!user || !id) return;
    try {
      const [tenants, invs, pays] = await Promise.all([
        getTenants(user.id),
        getInvoicesForTenant(id),
        getPaymentsForTenant(id),
      ]);
      setTenant(tenants.find(t => t.id === id) ?? null);
      setInvoices(invs);
      setPayments(pays);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user, id]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleDelete = () => {
    showConfirmDialog({
      title: 'Delete Tenant',
      message: `Are you sure you want to delete ${tenant?.first_name} ${tenant?.last_name}? This cannot be undone.`,
      confirmText: 'Delete',
      destructive: true,
      onConfirm: async () => {
        try {
          await deleteTenant(id!);
          router.back();
        } catch {
          Alert.alert('Error', 'Failed to delete tenant.');
        }
      },
    });
  };

  if (!tenant && !loading) {
    return (
      <SafeAreaView className="flex-1 bg-background-secondary items-center justify-center">
        <Text className="text-muted-foreground">Tenant not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background-secondary">
      <PageHeader title="Tenant Details" showBack />
      <ScrollView className="flex-1" contentContainerClassName="px-5 pb-6">
        {tenant && (
          <>
            {/* Profile Card */}
            <Card className="mb-4 items-center">
              <AvatarInitial name={`${tenant.first_name} ${tenant.last_name}`} size="lg" />
              <Text className="text-xl font-bold text-foreground mt-3 tracking-tight">
                {tenant.first_name} {tenant.last_name}
              </Text>
              <StatusBadge status={tenant.status} className="mt-2" />

              <View className="w-full mt-5 gap-3">
                {tenant.email ? (
                  <View className="flex-row items-center gap-3">
                    <View className="h-9 w-9 rounded-xl bg-primary-muted items-center justify-center">
                      <Mail size={16} color="#3b82f6" />
                    </View>
                    <Text className="text-sm text-foreground">{tenant.email}</Text>
                  </View>
                ) : null}
                {tenant.phone ? (
                  <View className="flex-row items-center gap-3">
                    <View className="h-9 w-9 rounded-xl bg-success-muted items-center justify-center">
                      <Phone size={16} color="#10b981" />
                    </View>
                    <Text className="text-sm text-foreground">{tenant.phone}</Text>
                  </View>
                ) : null}
                <View className="flex-row items-center gap-3">
                  <View className="h-9 w-9 rounded-xl bg-warning-muted items-center justify-center">
                    <Home size={16} color="#f59e0b" />
                  </View>
                  <Text className="text-sm text-foreground">
                    {tenant.property_name}{tenant.unit_name ? ` — ${tenant.unit_name}` : ' — Unassigned'}
                  </Text>
                </View>
                {tenant.lease_start && (
                  <View className="flex-row items-center gap-3">
                    <View className="h-9 w-9 rounded-xl bg-muted items-center justify-center">
                      <Calendar size={16} color="#64748b" />
                    </View>
                    <Text className="text-sm text-foreground">
                      {formatDate(tenant.lease_start)}{tenant.lease_end ? ` to ${formatDate(tenant.lease_end)}` : ''}
                    </Text>
                  </View>
                )}
              </View>
            </Card>

            {/* Invoices */}
            <Card className="mb-4">
              <View className="flex-row items-center justify-between mb-4">
                <CardTitle>Invoices</CardTitle>
                <View className="bg-muted rounded-full px-2.5 py-0.5">
                  <Text className="text-xs font-bold text-muted-foreground">{invoices.length}</Text>
                </View>
              </View>
              {invoices.slice(0, 5).map((inv, idx) => (
                <View key={inv.id} className={`flex-row items-center justify-between py-3 ${idx < Math.min(invoices.length, 5) - 1 ? 'border-b border-border/30' : ''}`}>
                  <View>
                    <Text className="text-sm font-semibold text-foreground">{inv.invoice_number}</Text>
                    <Text className="text-xs text-muted-foreground mt-0.5">Due {formatDate(inv.due_date)}</Text>
                  </View>
                  <View className="items-end">
                    <Text className="text-sm font-bold">J${inv.amount.toLocaleString()}</Text>
                    <StatusBadge status={inv.status} className="mt-1" />
                  </View>
                </View>
              ))}
              {invoices.length === 0 && <Text className="text-sm text-muted-foreground py-2">No invoices</Text>}
            </Card>

            {/* Payments */}
            <Card className="mb-4">
              <View className="flex-row items-center justify-between mb-4">
                <CardTitle>Payments</CardTitle>
                <View className="bg-muted rounded-full px-2.5 py-0.5">
                  <Text className="text-xs font-bold text-muted-foreground">{payments.length}</Text>
                </View>
              </View>
              {payments.slice(0, 5).map((p: any, idx: number) => (
                <View key={p.id} className={`flex-row items-center justify-between py-3 ${idx < Math.min(payments.length, 5) - 1 ? 'border-b border-border/30' : ''}`}>
                  <View>
                    <Text className="text-sm font-semibold text-foreground">{p.method}</Text>
                    <Text className="text-xs text-muted-foreground mt-0.5">{formatDate(p.payment_date)}</Text>
                  </View>
                  <Text className="text-sm font-bold text-success">J${p.amount.toLocaleString()}</Text>
                </View>
              ))}
              {payments.length === 0 && <Text className="text-sm text-muted-foreground py-2">No payments</Text>}
            </Card>

            {/* Delete */}
            <Button variant="destructive" onPress={handleDelete} size="lg">
              <View className="flex-row items-center gap-2">
                <Trash2 size={16} color="#fff" />
                <Text className="text-white font-semibold">Delete Tenant</Text>
              </View>
            </Button>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
