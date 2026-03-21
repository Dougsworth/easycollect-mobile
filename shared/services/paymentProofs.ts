import { supabase } from '@/lib/supabase';
import * as Crypto from 'expo-crypto';
import { createPayment } from '@/shared/services/payments';
import { createNotification } from '@/shared/services/notifications';
import { logActivity } from '@/shared/services/activityLog';
import type { PaymentProofWithDetails } from '@/shared/types/app.types';

const MAX_PROOF_SIZE = 10 * 1024 * 1024; // 10 MB

// RN adaptation: accepts { uri, name, type } from expo-image-picker instead of File
export async function uploadProofImage(image: { uri: string; name: string; type: string }): Promise<string> {
  const ext = image.name.split('.').pop();
  const path = `${Crypto.randomUUID()}.${ext}`;

  const response = await fetch(image.uri);
  const blob = await response.blob();

  if (blob.size > MAX_PROOF_SIZE) {
    throw new Error('Image is too large. Please use an image under 10 MB.');
  }

  const { error } = await supabase.storage
    .from('payment-proofs')
    .upload(path, blob, { contentType: image.type });

  if (error) throw error;

  const { data } = supabase.storage
    .from('payment-proofs')
    .getPublicUrl(path);

  return data.publicUrl;
}

export async function submitPaymentProof(
  invoiceId: string,
  tenantId: string,
  landlordId: string,
  imageUrl: string,
) {
  const { data, error } = await supabase
    .from('payment_proofs')
    .insert({ invoice_id: invoiceId, tenant_id: tenantId, landlord_id: landlordId, image_url: imageUrl })
    .select()
    .single();

  if (error) throw error;

  const { data: tenant } = await supabase
    .from('tenants')
    .select('first_name, last_name')
    .eq('id', tenantId)
    .single();
  const tenantName = tenant ? `${tenant.first_name} ${tenant.last_name}` : 'A tenant';
  createNotification(
    landlordId,
    'proof_submitted',
    'Payment Proof Submitted',
    `${tenantName} submitted a payment proof for review`,
    (data as any).id,
  );
  logActivity(landlordId, 'proof_submitted', 'proof', `${tenantName} submitted a payment proof`, (data as any).id);

  return data;
}

export async function getProofsForLandlord(landlordId: string): Promise<PaymentProofWithDetails[]> {
  const { data, error } = await supabase
    .from('payment_proofs')
    .select(`
      *,
      tenant:tenants(first_name, last_name),
      invoice:invoices(invoice_number, amount)
    `)
    .eq('landlord_id', landlordId)
    .order('created_at', { ascending: false })
    .limit(200);

  if (error) throw error;

  return ((data ?? []) as any[]).map((p): PaymentProofWithDetails => {
    const tenant = p.tenant as any;
    const invoice = p.invoice as any;
    return {
      ...p,
      tenant_first_name: tenant?.first_name ?? '',
      tenant_last_name: tenant?.last_name ?? '',
      invoice_number: invoice?.invoice_number ?? '',
      invoice_amount: invoice?.amount ?? 0,
    };
  });
}

export async function getProofsForInvoice(invoiceId: string) {
  const { data, error } = await supabase
    .from('payment_proofs')
    .select('*')
    .eq('invoice_id', invoiceId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function approveProof(
  proofId: string,
  landlordId: string,
  invoiceId: string,
  tenantId: string,
  amount: number,
) {
  // Idempotency: only approve if status is currently 'pending'
  const { data: updated, error } = await supabase
    .from('payment_proofs')
    .update({ status: 'approved' })
    .eq('id', proofId)
    .eq('status', 'pending')
    .select('id')
    .single();

  if (error || !updated) {
    throw new Error('This proof has already been reviewed or no longer exists.');
  }

  // Re-verify the invoice amount from the database to prevent UI tampering
  const { data: invoice } = await supabase
    .from('invoices')
    .select('amount, status')
    .eq('id', invoiceId)
    .single();

  if (invoice?.status === 'paid') {
    throw new Error('This invoice has already been paid.');
  }

  const verifiedAmount = invoice?.amount ?? amount;

  const payment = await createPayment(landlordId, {
    tenant_id: tenantId,
    invoice_id: invoiceId,
    amount: verifiedAmount,
    method: 'bank_transfer',
    notes: 'Approved from payment proof',
  });

  createNotification(
    landlordId,
    'proof_approved',
    'Payment Proof Approved',
    `Payment proof approved — J$${verifiedAmount.toLocaleString()} recorded`,
    proofId,
  );
  logActivity(landlordId, 'proof_approved', 'proof', `Approved payment proof and created payment of J$${verifiedAmount.toLocaleString()}`, proofId, { amount: verifiedAmount, invoice_id: invoiceId });

  const paymentId = (payment as any).id;
  supabase.functions.invoke('send-receipt', {
    body: { payment_id: paymentId, tenant_id: tenantId, invoice_id: invoiceId },
  }).catch((err) => console.error('Receipt email failed:', err));

  return payment;
}

export async function rejectProof(proofId: string, landlordId: string, note?: string) {
  // Idempotency: only reject if status is currently 'pending'
  const { data: updated, error } = await supabase
    .from('payment_proofs')
    .update({ status: 'rejected', reviewer_note: note ?? '' })
    .eq('id', proofId)
    .eq('status', 'pending')
    .select('id')
    .single();

  if (error || !updated) {
    throw new Error('This proof has already been reviewed or no longer exists.');
  }

  createNotification(
    landlordId,
    'proof_rejected',
    'Payment Proof Rejected',
    `A payment proof was rejected${note ? `: ${note}` : ''}`,
    proofId,
  );
  logActivity(landlordId, 'proof_rejected', 'proof', `Rejected payment proof${note ? `: ${note}` : ''}`, proofId);
}
