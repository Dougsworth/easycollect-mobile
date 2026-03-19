import { useState, useEffect } from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { addTenant } from '@/shared/services/tenants';
import { getProperties } from '@/shared/services/properties';
import { Button, Input, Select } from '@/components/ui';
import { PageHeader } from '@/components/PageHeader';
import type { PropertyWithUnits } from '@/shared/types/app.types';

export default function AddTenantScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [properties, setProperties] = useState<PropertyWithUnits[]>([]);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    unit_id: '',
  });

  useEffect(() => {
    if (user) {
      getProperties(user.id).then(setProperties).catch(console.error);
    }
  }, [user]);

  const unitOptions = properties.flatMap(p =>
    p.units.map(u => ({ label: `${p.name} — ${u.name}`, value: u.id }))
  );

  const handleSubmit = async () => {
    if (!user) return;
    if (!form.firstName || !form.lastName) {
      Alert.alert('Error', 'First and last name are required.');
      return;
    }
    setLoading(true);
    try {
      await addTenant(user.id, {
        first_name: form.firstName.trim(),
        last_name: form.lastName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        unit_id: form.unit_id || null,
        lease_start: null,
        lease_end: null,
      });
      router.back();
    } catch (err: any) {
      Alert.alert('Error', err.message ?? 'Failed to add tenant.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <PageHeader title="Add Tenant" showBack />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        <ScrollView className="flex-1 px-6" keyboardShouldPersistTaps="handled">
          <View className="flex-row gap-3">
            <View className="flex-1">
              <Input label="First Name" value={form.firstName} onChangeText={v => setForm(f => ({ ...f, firstName: v }))} placeholder="John" />
            </View>
            <View className="flex-1">
              <Input label="Last Name" value={form.lastName} onChangeText={v => setForm(f => ({ ...f, lastName: v }))} placeholder="Doe" />
            </View>
          </View>

          <Input label="Email" value={form.email} onChangeText={v => setForm(f => ({ ...f, email: v }))} placeholder="tenant@email.com" keyboardType="email-address" autoCapitalize="none" />
          <Input label="Phone" value={form.phone} onChangeText={v => setForm(f => ({ ...f, phone: v }))} placeholder="876-555-0123" keyboardType="phone-pad" />

          <Select
            label="Unit (optional)"
            placeholder="Select a unit..."
            options={unitOptions}
            value={form.unit_id}
            onValueChange={v => setForm(f => ({ ...f, unit_id: v }))}
          />

          <Button onPress={handleSubmit} loading={loading} className="mt-4">
            Add Tenant
          </Button>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
