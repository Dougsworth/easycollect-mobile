import { useState } from 'react';
import { View, Text, ScrollView, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Camera, ImageIcon } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { uploadProofImage, submitPaymentProof } from '@/shared/services/paymentProofs';
import { Button, Card, CardTitle } from '@/components/ui';
import { PageHeader } from '@/components/PageHeader';

export default function TenantPaymentScreen() {
  const { invoiceId, token, amount } = useLocalSearchParams<{ invoiceId: string; token: string; amount: string }>();
  const { user } = useAuth();
  const router = useRouter();
  const [image, setImage] = useState<{ uri: string; name: string; type: string } | null>(null);
  const [uploading, setUploading] = useState(false);

  const pickImage = async (fromCamera: boolean) => {
    const result = fromCamera
      ? await ImagePicker.launchCameraAsync({ quality: 0.8 })
      : await ImagePicker.launchImageLibraryAsync({ quality: 0.8, mediaTypes: ['images'] });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      setImage({
        uri: asset.uri,
        name: asset.fileName ?? `proof_${Date.now()}.jpg`,
        type: asset.mimeType ?? 'image/jpeg',
      });
    }
  };

  const handleSubmit = async () => {
    if (!image || !user || !invoiceId) return;
    setUploading(true);
    try {
      const imageUrl = await uploadProofImage(image);

      // Find tenant record for this user
      const { data: tenant } = await supabase
        .from('tenants')
        .select('id, landlord_id')
        .eq('profile_id', user.id)
        .single();

      if (!tenant) throw new Error('Tenant record not found');

      await submitPaymentProof(invoiceId, tenant.id, tenant.landlord_id, imageUrl);
      Alert.alert('Submitted', 'Your payment proof has been submitted for review.');
      router.back();
    } catch (err: any) {
      Alert.alert('Error', err.message ?? 'Failed to submit proof.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <PageHeader title="Submit Payment" showBack />
      <ScrollView className="flex-1 px-6">
        <Card className="mb-4">
          <Text className="text-sm text-muted-foreground">Invoice Amount</Text>
          <Text className="text-3xl font-bold text-foreground">J${Number(amount).toLocaleString()}</Text>
        </Card>

        <CardTitle className="mb-3">Upload Payment Proof</CardTitle>
        <Text className="text-sm text-muted-foreground mb-4">
          Take a photo or upload an image of your bank receipt or payment slip.
        </Text>

        <View className="flex-row gap-3 mb-4">
          <Button variant="outline" onPress={() => pickImage(true)} className="flex-1">
            <View className="flex-row items-center gap-2">
              <Camera size={18} color="#111827" />
              <Text className="font-medium text-foreground">Camera</Text>
            </View>
          </Button>
          <Button variant="outline" onPress={() => pickImage(false)} className="flex-1">
            <View className="flex-row items-center gap-2">
              <ImageIcon size={18} color="#111827" />
              <Text className="font-medium text-foreground">Gallery</Text>
            </View>
          </Button>
        </View>

        {image && (
          <Image source={{ uri: image.uri }} className="w-full h-64 rounded-xl bg-muted mb-4" resizeMode="cover" />
        )}

        <Button onPress={handleSubmit} loading={uploading} disabled={!image}>
          Submit Proof
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}
