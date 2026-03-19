import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { PageHeader } from '@/components/PageHeader';
import { Card } from '@/components/ui';

export default function PublicReceiptScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <SafeAreaView className="flex-1 bg-white">
      <PageHeader title="Receipt" showBack />
      <View className="flex-1 px-6">
        <Card>
          <Text className="text-sm text-muted-foreground">Receipt ID</Text>
          <Text className="text-lg font-bold text-foreground mt-1">{id}</Text>
        </Card>
      </View>
    </SafeAreaView>
  );
}
