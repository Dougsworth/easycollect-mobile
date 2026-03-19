import { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, RefreshControl, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Plus, Trash2, Building2, Home } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { getProperties, deleteProperty, deleteUnit } from '@/shared/services/properties';
import { Card, CardTitle, Button, Skeleton } from '@/components/ui';
import { showConfirmDialog } from '@/components/ui';
import { PageHeader } from '@/components/PageHeader';
import { EmptyState } from '@/components/EmptyState';
import type { PropertyWithUnits } from '@/shared/types/app.types';

export default function PropertiesScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [properties, setProperties] = useState<PropertyWithUnits[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const loadData = useCallback(async () => {
    if (!user) return;
    try { setProperties(await getProperties(user.id)); }
    catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [user]);

  useEffect(() => { loadData(); }, [loadData]);
  const onRefresh = async () => { setRefreshing(true); await loadData(); setRefreshing(false); };

  const toggleExpand = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleDeleteProperty = (id: string, name: string) => {
    showConfirmDialog({
      title: 'Delete Property',
      message: `Delete "${name}" and all its units? Tenants will be unassigned.`,
      confirmText: 'Delete',
      destructive: true,
      onConfirm: async () => {
        try { await deleteProperty(id); loadData(); }
        catch { Alert.alert('Error', 'Failed to delete property.'); }
      },
    });
  };

  const handleDeleteUnit = (id: string, name: string) => {
    showConfirmDialog({
      title: 'Delete Unit',
      message: `Delete "${name}"? Any assigned tenant will be unassigned.`,
      confirmText: 'Delete',
      destructive: true,
      onConfirm: async () => {
        try { await deleteUnit(id); loadData(); }
        catch { Alert.alert('Error', 'Failed to delete unit.'); }
      },
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-background-secondary">
      <PageHeader
        title="Properties"
        showBack
        right={
          <Pressable onPress={() => router.push('/(landlord)/(more)/properties/add')} className="bg-primary rounded-full p-2">
            <Plus size={20} color="#fff" />
          </Pressable>
        }
      />
      <ScrollView className="flex-1 px-4" refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3b82f6" />}>
        {loading ? (
          <View className="gap-3">{[1,2,3].map(i => <Skeleton key={i} className="h-24 w-full" />)}</View>
        ) : properties.length === 0 ? (
          <EmptyState title="No properties" description="Add your first property" actionLabel="Add Property" onAction={() => router.push('/(landlord)/(more)/properties/add')} />
        ) : (
          properties.map(prop => (
            <Card key={prop.id} className="mb-3">
              <Pressable onPress={() => toggleExpand(prop.id)} className="flex-row items-center">
                <View className="h-10 w-10 rounded-full bg-primary-muted items-center justify-center mr-3">
                  <Building2 size={20} color="#3b82f6" />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-semibold text-foreground">{prop.name}</Text>
                  <Text className="text-xs text-muted-foreground">{prop.address || 'No address'} — {prop.units.length} unit(s)</Text>
                </View>
                <Pressable onPress={() => handleDeleteProperty(prop.id, prop.name)} className="p-2">
                  <Trash2 size={16} color="#ef4444" />
                </Pressable>
              </Pressable>

              {expanded.has(prop.id) && (
                <View className="mt-3 pl-2 border-l-2 border-border ml-5">
                  {prop.units.map(unit => (
                    <View key={unit.id} className="flex-row items-center py-2 ml-3">
                      <Home size={14} color="#6b7280" />
                      <View className="flex-1 ml-2">
                        <Text className="text-sm text-foreground">{unit.name}</Text>
                        <Text className="text-xs text-muted-foreground">J${unit.rent_amount.toLocaleString()}/mo</Text>
                      </View>
                      <Pressable onPress={() => handleDeleteUnit(unit.id, unit.name)} className="p-1">
                        <Trash2 size={14} color="#ef4444" />
                      </Pressable>
                    </View>
                  ))}
                  {prop.units.length === 0 && <Text className="text-xs text-muted-foreground ml-3 py-2">No units</Text>}
                </View>
              )}
            </Card>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
