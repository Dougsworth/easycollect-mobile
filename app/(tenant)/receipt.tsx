import { View, Text, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import * as Sharing from 'expo-sharing';
import * as Print from 'expo-print';
import { Share2 } from 'lucide-react-native';
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
    <SafeAreaView className="flex-1 bg-white">
      <PageHeader title="Receipt" showBack />
      <ScrollView className="flex-1 px-6">
        <Card className="mb-4">
          <Text className="text-sm text-muted-foreground">Receipt ID</Text>
          <Text className="text-base font-semibold text-foreground mt-1">{id}</Text>
        </Card>
        <Button variant="outline" onPress={handleShare}>
          <View className="flex-row items-center gap-2">
            <Share2 size={18} color="#111827" />
            <Text className="font-medium text-foreground">Share Receipt</Text>
          </View>
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}
