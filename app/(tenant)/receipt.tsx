import { View, Text, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import * as Sharing from 'expo-sharing';
import * as Print from 'expo-print';
import { Share2, FileCheck } from 'lucide-react-native';
import { Button, Card } from '@/components/ui';
import { PageHeader } from '@/components/PageHeader';

export default function ReceiptScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const handleShare = async () => {
    try {
      const { uri } = await Print.printToFileAsync({
        html: `<h1>Payment Receipt</h1><p>Receipt ID: ${id}</p>`,
      });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri);
      }
    } catch {
      Alert.alert('Error', 'Failed to share receipt.');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background-secondary">
      <PageHeader title="Receipt" showBack />
      <ScrollView className="flex-1 px-5" contentContainerClassName="pb-8">
        <Card className="mb-4">
          <View className="items-center py-4">
            <View className="h-14 w-14 rounded-2xl bg-success-muted items-center justify-center mb-4">
              <FileCheck size={28} color="#16a34a" />
            </View>
            <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Receipt ID</Text>
            <Text className="text-base font-bold text-foreground mt-1">{id}</Text>
          </View>
        </Card>
        <Button variant="outline" onPress={handleShare} size="lg">
          <View className="flex-row items-center gap-2">
            <Share2 size={18} color="#0f172a" />
            <Text className="font-semibold text-foreground">Share Receipt</Text>
          </View>
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}
