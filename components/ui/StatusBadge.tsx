import { View, Text, StyleSheet } from 'react-native';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: 'paid' | 'pending' | 'overdue' | 'active' | 'inactive' | 'approved' | 'rejected' | 'completed' | 'failed';
  className?: string;
}

const config: Record<string, { bg: string; text: string; dot: string; label: string }> = {
  paid: { bg: '#f0fdf4', text: '#16a34a', dot: '#16a34a', label: 'Paid' },
  pending: { bg: '#eff6ff', text: '#2563eb', dot: '#3b82f6', label: 'Pending' },
  overdue: { bg: '#0f172a', text: '#ffffff', dot: '#ffffff', label: 'Overdue' },
  active: { bg: '#f0fdf4', text: '#16a34a', dot: '#16a34a', label: 'Active' },
  inactive: { bg: '#f1f5f9', text: '#64748b', dot: '#94a3b8', label: 'Inactive' },
  approved: { bg: '#f0fdf4', text: '#16a34a', dot: '#16a34a', label: 'Approved' },
  rejected: { bg: '#fef2f2', text: '#dc2626', dot: '#ef4444', label: 'Rejected' },
  completed: { bg: '#f0fdf4', text: '#16a34a', dot: '#16a34a', label: 'Completed' },
  failed: { bg: '#fef2f2', text: '#dc2626', dot: '#ef4444', label: 'Failed' },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const c = config[status] ?? config.pending;
  return (
    <View
      className={cn(className)}
      style={[st.badge, { backgroundColor: c.bg }]}
    >
      <View style={[st.dot, { backgroundColor: c.dot }]} />
      <Text style={[st.text, { color: c.text }]}>{c.label}</Text>
    </View>
  );
}

const st = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 100,
    gap: 5,
  },
  dot: { width: 5, height: 5, borderRadius: 3 },
  text: { fontSize: 11, fontWeight: '600' },
});
