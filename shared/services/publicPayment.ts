import { supabase } from '@/lib/supabase';
import * as Crypto from 'expo-crypto';
import type { PublicInvoiceData } from '@/shared/types/app.types';

export async function getInvoiceByToken(token: string): Promise<PublicInvoiceData | null> {
  const { data, error } = await supabase.rpc('get_invoice_by_token', { p_token: token });

  if (error) throw error;
  return data as PublicInvoiceData | null;
}

// RN adaptation: accepts { uri, name, type } from expo-image-picker instead of File
export async function uploadProofImagePublic(image: { uri: string; name: string; type: string }): Promise<string> {
  const ext = image.name.split('.').pop();
  const path = `public/${Crypto.randomUUID()}.${ext}`;

  const response = await fetch(image.uri);
  const blob = await response.blob();

  const { error } = await supabase.storage
    .from('payment-proofs')
    .upload(path, blob, { contentType: image.type });

  if (error) throw error;

  const { data } = supabase.storage
    .from('payment-proofs')
    .getPublicUrl(path);

  return data.publicUrl;
}

export async function submitProofByToken(token: string, imageUrl: string) {
  const { data, error } = await supabase.rpc('submit_proof_by_token', {
    p_token: token,
    p_image_url: imageUrl,
  });

  if (error) throw error;
  return data;
}
