import { useState, useEffect } from 'react';
import { View, Text, ScrollView, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Camera, ImageIcon, Upload } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { uploadProofImage, submitPaymentProof } from '@/shared/services/paymentProofs';
import { Button, Card, CardTitle, Select } from '@/components/ui';
import { PageHeader } from '@/components/PageHeader';
import { formatDate } from '@/shared/utils';
import type { Invoice } from '@/shared/types/app.types';

export default function UploadOldReceiptScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState('');
  const [image, setImage] = useState<{ uri: string; name: string; type: string } | null>(null);
  const [uploading, setUploading] = useState(false);
  const [tenantInfo, setTenantInfo] = useState<{ id: string; landlord_id: string } | null>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: tenant } = await supabase
        .from('tenants')
        .select('id, landlord_id')
        .eq('profile_id', user.id)
        .single();

      if (tenant) {
        setTenantInfo(tenant);
        const { data } = await supabase
          .from('invoices')
          .select('*')
          .eq('tenant_id', tenant.id)
          .order('due_date', { ascending: false });
        setInvoices(data ?? []);
      }
    })();
  }, [user]);

  const invoiceOptions = invoices.map(inv => ({
    label: `${inv.invoice_number} — J$${inv.amount.toLocaleString()} (${formatDate(inv.due_date)})`,
    value: inv.id,
  }));

  const pickImage = async (fromCamera: boolean) => {
    const result = fromCamera
      ? await ImagePicker.launchCameraAsync({ quality: 0.8 })
      : await ImagePicker.launchImageLibraryAsync({ quality: 0.8, mediaTypes: ['images'] });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      setImage({
        uri: asset.uri,
        name: asset.fileName ?? `receipt_${Date.now()}.jpg`,
        type: asset.mimeType ?? 'image/jpeg',
      });
    }
  };

  const handleSubmit = async () => {
    if (!image || !selectedInvoice || !tenantInfo) {
      Alert.alert('Error', 'Please select an invoice and upload a receipt image.');
      return;
    }
    setUploading(true);
    try {
      const imageUrl = await uploadProofImage(image);
      await submitPaymentProof(selectedInvoice, tenantInfo.id, tenantInfo.landlord_id, imageUrl);
      Alert.alert('Submitted', 'Your old receipt has been submitted for review.');
      router.back();
    } catch (err: any) {
      Alert.alert('Error', err.message ?? 'Failed to submit receipt.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <PageHeader title="Upload Old Receipt" showBack />
      <ScrollView className="flex-1 px-6">
        <Text className="text-sm text-muted-foreground mb-4">
          Upload a receipt for a past payment. Select the invoice it belongs to and attach the receipt image.
        </Text>

        <Select
          label="Invoice"
          placeholder="Select an invoice..."
          options={invoiceOptions}
          value={selectedInvoice}
          onValueChange={setSelectedInvoice}
        />

        <CardTitle className="mb-3">Receipt Image</CardTitle>
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

        <Button onPress={handleSubmit} loading={uploading} disabled={!image || !selectedInvoice}>
          <View className="flex-row items-center gap-2">
            <Upload size={18} color="#fff" />
            <Text className="text-white font-semibold">Submit Receipt</Text>
          </View>
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}
