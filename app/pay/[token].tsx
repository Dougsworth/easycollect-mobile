import { useState, useEffect } from 'react';
import { View, Text, ScrollView, Image, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as WebBrowser from 'expo-web-browser';
import { Camera, ImageIcon, ExternalLink } from 'lucide-react-native';
import { getInvoiceByToken, uploadProofImagePublic, submitProofByToken } from '@/shared/services/publicPayment';
import { Button, Card, StatusBadge } from '@/components/ui';
import { PageHeader } from '@/components/PageHeader';
import { formatDate } from '@/shared/utils';
import type { PublicInvoiceData } from '@/shared/types/app.types';

export default function PublicPaymentScreen() {
  const { token } = useLocalSearchParams<{ token: string }>();
  const [invoice, setInvoice] = useState<PublicInvoiceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [image, setImage] = useState<{ uri: string; name: string; type: string } | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (token) {
      getInvoiceByToken(token).then(setInvoice).catch(console.error).finally(() => setLoading(false));
    }
  }, [token]);

  const pickImage = async (fromCamera: boolean) => {
    const result = fromCamera
      ? await ImagePicker.launchCameraAsync({ quality: 0.8 })
      : await ImagePicker.launchImageLibraryAsync({ quality: 0.8, mediaTypes: ['images'] });
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      setImage({ uri: asset.uri, name: asset.fileName ?? `proof_${Date.now()}.jpg`, type: asset.mimeType ?? 'image/jpeg' });
    }
  };

  const handleSubmitProof = async () => {
    if (!image || !token) return;
    setUploading(true);
    try {
      const imageUrl = await uploadProofImagePublic(image);
      await submitProofByToken(token, imageUrl);
      setSubmitted(true);
    } catch (err: any) {
      Alert.alert('Error', err.message ?? 'Failed to submit proof.');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return <SafeAreaView className="flex-1 bg-white items-center justify-center"><ActivityIndicator size="large" color="#3b82f6" /></SafeAreaView>;
  }

  if (!invoice) {
    return <SafeAreaView className="flex-1 bg-white items-center justify-center"><Text className="text-muted-foreground">Invoice not found or link expired.</Text></SafeAreaView>;
  }

  if (submitted) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center px-8">
        <Text className="text-2xl font-bold text-foreground text-center">Proof Submitted!</Text>
        <Text className="text-base text-muted-foreground text-center mt-2">Your landlord will review your payment proof.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <PageHeader title="Payment" />
      <ScrollView className="flex-1 px-6">
        <Card className="mb-4">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-sm text-muted-foreground">{invoice.invoice_number}</Text>
            <StatusBadge status={invoice.status} />
          </View>
          <Text className="text-3xl font-bold text-foreground">J${invoice.amount.toLocaleString()}</Text>
          <Text className="text-sm text-muted-foreground mt-1">Due {formatDate(invoice.due_date)}</Text>
          <Text className="text-sm text-foreground mt-2">To: {invoice.tenant_name}</Text>
        </Card>

        {invoice.bank_name && (
          <Card className="mb-4">
            <Text className="text-sm font-semibold text-foreground mb-2">Bank Transfer Details</Text>
            <Text className="text-sm text-muted-foreground">Bank: {invoice.bank_name}</Text>
            <Text className="text-sm text-muted-foreground">Account: {invoice.bank_account_name}</Text>
            <Text className="text-sm text-muted-foreground">Number: {invoice.bank_account_number}</Text>
            <Text className="text-sm text-muted-foreground">Branch: {invoice.bank_branch}</Text>
          </Card>
        )}

        {invoice.payment_link && (
          <Button variant="outline" className="mb-4" onPress={() => WebBrowser.openBrowserAsync(invoice.payment_link!)}>
            <View className="flex-row items-center gap-2">
              <ExternalLink size={18} color="#111827" />
              <Text className="font-medium text-foreground">Pay Online</Text>
            </View>
          </Button>
        )}

        <Text className="text-base font-semibold text-foreground mb-3">Upload Payment Proof</Text>
        <View className="flex-row gap-3 mb-4">
          <Button variant="outline" onPress={() => pickImage(true)} className="flex-1">
            <View className="flex-row items-center gap-2"><Camera size={18} color="#111827" /><Text className="font-medium text-foreground">Camera</Text></View>
          </Button>
          <Button variant="outline" onPress={() => pickImage(false)} className="flex-1">
            <View className="flex-row items-center gap-2"><ImageIcon size={18} color="#111827" /><Text className="font-medium text-foreground">Gallery</Text></View>
          </Button>
        </View>

        {image && <Image source={{ uri: image.uri }} className="w-full h-64 rounded-xl bg-muted mb-4" resizeMode="cover" />}

        <Button onPress={handleSubmitProof} loading={uploading} disabled={!image}>Submit Proof</Button>
      </ScrollView>
    </SafeAreaView>
  );
}
