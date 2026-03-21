import { useState } from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Plus, Building2 } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { createProperty, createUnit } from '@/shared/services/properties';
import { Button, Input } from '@/components/ui';
import { PageHeader } from '@/components/PageHeader';

export default function AddPropertyScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [units, setUnits] = useState([{ name: '', rent: '' }]);

  const addUnitRow = () => setUnits([...units, { name: '', rent: '' }]);

  const updateUnit = (index: number, field: 'name' | 'rent', value: string) => {
    const copy = [...units];
    copy[index][field] = value;
    setUnits(copy);
  };

  const handleSubmit = async () => {
    if (!user || !name) {
      Alert.alert('Error', 'Property name is required.');
      return;
    }
    setLoading(true);
    try {
      const prop = await createProperty(user.id, name.trim(), address.trim());
      for (const u of units) {
        if (u.name && u.rent && Number(u.rent) > 0) {
          await createUnit((prop as any).id, u.name.trim(), Number(u.rent));
        }
      }
      router.back();
    } catch (err: any) {
      Alert.alert('Error', err.message ?? 'Failed to create property.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background-secondary">
      <PageHeader title="Add Property" showBack />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        <ScrollView className="flex-1 px-5" keyboardShouldPersistTaps="handled" contentContainerClassName="pb-8">
          <View
            className="bg-white rounded-2xl p-5 mb-2"
            style={{
              shadowColor: '#0f172a',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.06,
              shadowRadius: 12,
              elevation: 3,
            }}
          >
            <View className="flex-row items-center mb-5">
              <View className="h-10 w-10 rounded-xl bg-primary-muted items-center justify-center mr-3">
                <Building2 size={20} color="#3b82f6" />
              </View>
              <View>
                <Text className="text-base font-bold text-foreground">Property Details</Text>
                <Text className="text-xs text-muted-foreground mt-0.5">Add property name and units</Text>
              </View>
            </View>

            <Input label="Property Name" placeholder="e.g. Sunrise Apartments" value={name} onChangeText={setName} />
            <Input label="Address (optional)" placeholder="123 Main St" value={address} onChangeText={setAddress} />

            <Text className="text-base font-bold text-foreground mb-3 mt-2">Units</Text>
            {units.map((u, i) => (
              <View key={i} className="flex-row gap-3 mb-2">
                <View className="flex-1">
                  <Input placeholder="Unit name" value={u.name} onChangeText={v => updateUnit(i, 'name', v)} />
                </View>
                <View className="flex-1">
                  <Input placeholder="Rent (J$)" value={u.rent} onChangeText={v => updateUnit(i, 'rent', v)} keyboardType="decimal-pad" />
                </View>
              </View>
            ))}
            <Button variant="outline" size="sm" onPress={addUnitRow} className="mb-6">
              <View className="flex-row items-center gap-1">
                <Plus size={16} color="#111827" />
                <Text className="text-sm font-semibold text-foreground">Add Unit</Text>
              </View>
            </Button>

            <Button onPress={handleSubmit} loading={loading} size="lg">Create Property</Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
