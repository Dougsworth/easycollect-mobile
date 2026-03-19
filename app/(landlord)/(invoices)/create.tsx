import { useState, useEffect } from 'react';
import { View, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { createInvoice } from '@/shared/services/invoices';
import { getTenants } from '@/shared/services/tenants';
import { Button, Input, Select } from '@/components/ui';
import { PageHeader } from '@/components/PageHeader';
import type { TenantWithDetails } from '@/shared/types/app.types';

export default function CreateInvoiceScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [tenants, setTenants] = useState<TenantWithDetails[]>([]);
  const [form, setForm] = useState({
    tenant_id: '',
    amount: '',
    due_date: '',
    description: '',
  });

  useEffect(() => {
    if (user) {
      getTenants(user.id).then(t => setTenants(t.filter(x => x.status === 'active'))).catch(console.error);
    }
  }, [user]);

  const tenantOptions = tenants.map(t => ({
    label: `${t.first_name} ${t.last_name}${t.unit_name ? ` (${t.unit_name})` : ''}`,
    value: t.id,
  }));

  const handleSubmit = async () => {
    if (!user) return;
    if (!form.tenant_id || !form.amount || !form.due_date) {
      Alert.alert('Error', 'Please fill in tenant, amount, and due date.');
      return;
    }
    setLoading(true);
    try {
      await createInvoice(user.id, {
        tenant_id: form.tenant_id,
        amount: Number(form.amount),
        due_date: form.due_date,
        description: form.description || undefined,
      });
      router.back();
    } catch (err: any) {
      Alert.alert('Error', err.message ?? 'Failed to create invoice.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <PageHeader title="Create Invoice" showBack />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        <ScrollView className="flex-1 px-6" keyboardShouldPersistTaps="handled">
          <Select label="Tenant" placeholder="Select tenant..." options={tenantOptions} value={form.tenant_id} onValueChange={v => setForm(f => ({ ...f, tenant_id: v }))} />
          <Input label="Amount (J$)" placeholder="0.00" value={form.amount} onChangeText={v => setForm(f => ({ ...f, amount: v }))} keyboardType="decimal-pad" />
          <Input label="Due Date" placeholder="YYYY-MM-DD" value={form.due_date} onChangeText={v => setForm(f => ({ ...f, due_date: v }))} />
          <Input label="Description (optional)" placeholder="Rent for March 2026..." value={form.description} onChangeText={v => setForm(f => ({ ...f, description: v }))} multiline />
          <Button onPress={handleSubmit} loading={loading} className="mt-4">Create Invoice</Button>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
