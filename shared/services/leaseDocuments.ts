import { supabase } from '@/lib/supabase';
import * as Crypto from 'expo-crypto';
import type { LeaseDocument } from '@/shared/types/app.types';

const BUCKET = 'lease-documents';
const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

// RN adaptation: accepts { uri, name, type, size } from document/image picker
export async function uploadLeaseDocument(
  file: { uri: string; name: string; type: string; size: number },
  tenantId: string,
  landlordId: string,
  documentType: 'lease' | 'addendum' | 'other',
): Promise<LeaseDocument> {
  if (file.size > MAX_SIZE) {
    throw new Error('File size exceeds 10 MB limit.');
  }

  const ext = file.name.split('.').pop();
  const storagePath = `${landlordId}/${tenantId}/${Crypto.randomUUID()}.${ext}`;

  const response = await fetch(file.uri);
  const blob = await response.blob();

  const { error: uploadErr } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, blob, { contentType: file.type });

  if (uploadErr) throw uploadErr;

  const { data: urlData } = supabase.storage
    .from(BUCKET)
    .getPublicUrl(storagePath);

  const { data, error } = await supabase
    .from('lease_documents')
    .insert({
      tenant_id: tenantId,
      landlord_id: landlordId,
      file_name: file.name,
      file_type: file.type,
      file_size: file.size,
      file_url: urlData.publicUrl,
      storage_path: storagePath,
      document_type: documentType,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getDocumentsForTenant(tenantId: string): Promise<LeaseDocument[]> {
  const { data, error } = await supabase
    .from('lease_documents')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function deleteLeaseDocument(documentId: string, storagePath: string): Promise<void> {
  const { error: storageErr } = await supabase.storage
    .from(BUCKET)
    .remove([storagePath]);

  if (storageErr) console.error('Storage delete failed:', storageErr);

  const { error } = await supabase
    .from('lease_documents')
    .delete()
    .eq('id', documentId);

  if (error) throw error;
}
