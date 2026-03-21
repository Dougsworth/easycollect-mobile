import { supabase } from '@/lib/supabase';
import { createNotification } from '@/shared/services/notifications';
import { logActivity } from '@/shared/services/activityLog';
import type { InvoiceWithTenant } from '@/shared/types/app.types';

export async function getInvoices(landlordId: string, limit = 200): Promise<InvoiceWithTenant[]> {
  const { data, error } = await supabase
    .from('invoices')
    .select(`
      id, invoice_number, amount, due_date, status, description, tenant_id, landlord_id, payment_token, created_at,
      tenant:tenants(first_name, last_name, unit:units(name, property:properties(name)))
    `)
    .eq('landlord_id', landlordId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;

  return ((data ?? []) as any[]).map((inv): InvoiceWithTenant => {
    const tenant = inv.tenant as any;
    return {
      ...inv,
      tenant_first_name: tenant?.first_name ?? '',
      tenant_last_name: tenant?.last_name ?? '',
      unit_name: tenant?.unit?.name ?? '',
      property_name: tenant?.unit?.property?.name ?? '',
    };
  });
}

export async function createInvoice(landlordId: string, invoice: {
  tenant_id: string;
  amount: number;
  due_date: string;
  issue_date?: string;
  description?: string;
}) {
  if (invoice.amount <= 0) {
    throw new Error('Invoice amount must be greater than zero.');
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(invoice.due_date)) {
    throw new Error('Due date must be in YYYY-MM-DD format.');
  }

  const { data, error } = await supabase
    .from('invoices')
    .insert({
      ...invoice,
      landlord_id: landlordId,
      invoice_number: 'TEMP',
    })
    .select()
    .single();

  if (error) throw error;

  const { data: tenant } = await supabase
    .from('tenants')
    .select('first_name, last_name')
    .eq('id', invoice.tenant_id)
    .single();
  const tenantName = tenant ? `${tenant.first_name} ${tenant.last_name}` : 'A tenant';
  createNotification(
    landlordId,
    'invoice_created',
    'Invoice Created',
    `Invoice for ${tenantName} — J$${invoice.amount.toLocaleString()} due ${invoice.due_date}`,
    (data as any).id,
  );
  logActivity(landlordId, 'invoice_created', 'invoice', `Created invoice for ${tenantName} — J$${invoice.amount.toLocaleString()}`, (data as any).id, { amount: invoice.amount, due_date: invoice.due_date });

  return data;
}

export async function getInvoicesForTenant(tenantId: string) {
  const { data, error } = await supabase
    .from('invoices')
    .select('id, invoice_number, amount, due_date, status, description')
    .eq('tenant_id', tenantId)
    .order('due_date', { ascending: false })
    .limit(50);

  if (error) throw error;
  return data ?? [];
}

export async function bulkCreateInvoices(landlordId: string, invoices: {
  tenant_id: string;
  amount: number;
  due_date: string;
  description?: string;
}[]): Promise<{ created: number; skipped: number }> {
  let created = 0;
  let skipped = 0;

  // Batch: fetch all existing invoices for these tenants in one query
  const tenantIds = [...new Set(invoices.map(i => i.tenant_id))];
  const dueDates = invoices.map(i => i.due_date);
  const minDate = dueDates.reduce((a, b) => a < b ? a : b);
  const maxDate = dueDates.reduce((a, b) => a > b ? a : b);

  const { data: existingInvoices } = await supabase
    .from('invoices')
    .select('tenant_id, due_date')
    .eq('landlord_id', landlordId)
    .in('tenant_id', tenantIds.length > 0 ? tenantIds : ['__none__'])
    .in('status', ['pending', 'overdue'])
    .gte('due_date', minDate.slice(0, 7) + '-01')
    .lte('due_date', maxDate);

  // Build a set of "tenantId:YYYY-MM" for quick lookup
  const existingSet = new Set(
    (existingInvoices ?? []).map((inv: any) => {
      const month = (inv.due_date as string).slice(0, 7);
      return `${inv.tenant_id}:${month}`;
    })
  );

  for (const invoice of invoices) {
    const month = invoice.due_date.slice(0, 7);
    const key = `${invoice.tenant_id}:${month}`;

    if (existingSet.has(key)) {
      skipped++;
      continue;
    }

    const { error } = await supabase
      .from('invoices')
      .insert({
        ...invoice,
        landlord_id: landlordId,
        invoice_number: 'TEMP',
      });

    if (error) {
      console.error('Failed to create invoice for tenant:', invoice.tenant_id, error);
      skipped++;
    } else {
      created++;
      existingSet.add(key); // prevent duplicate in same batch
    }
  }

  if (created > 0) {
    createNotification(
      landlordId,
      'invoice_created',
      'Invoices Created',
      `Bulk created ${created} invoice(s)${skipped > 0 ? `, ${skipped} skipped` : ''}`,
    );
    logActivity(landlordId, 'invoice_bulk_created', 'invoice', `Bulk created ${created} invoice(s), ${skipped} skipped`, undefined, { created, skipped });
  }

  return { created, skipped };
}

export async function updateInvoice(invoiceId: string, updates: {
  status?: 'paid' | 'pending' | 'overdue';
  amount?: number;
  due_date?: string;
  description?: string;
}) {
  const { data, error } = await supabase
    .from('invoices')
    .update(updates)
    .eq('id', invoiceId)
    .select()
    .single();

  if (error) throw error;

  logActivity((data as any).landlord_id, 'invoice_updated', 'invoice', `Updated invoice ${(data as any).invoice_number}`, invoiceId, updates);

  return data;
}
