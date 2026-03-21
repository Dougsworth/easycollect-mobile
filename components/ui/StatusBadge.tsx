import { View, Text } from 'react-native';
import { cn } from '@/lib/utils';
import { s, ms } from '@/lib/responsive';

interface StatusBadgeProps {
  status: 'paid' | 'pending' | 'overdue' | 'active' | 'inactive' | 'approved' | 'rejected' | 'completed' | 'failed';
  className?: string;
}

const statusConfig: Record<string, { bg: string; textColor: string; dot: string; label: string }> = {
  paid: { bg: '#f0fdf4', textColor: '#16a34a', dot: '#16a34a', label: 'Paid' },
  pending: { bg: '#eff6ff', textColor: '#2563eb', dot: '#3b82f6', label: 'Pending' },
  overdue: { bg: '#0f172a', textColor: '#ffffff', dot: '#ffffff', label: 'Overdue' },
  active: { bg: '#f0fdf4', textColor: '#16a34a', dot: '#16a34a', label: 'Active' },
  inactive: { bg: '#f1f5f9', textColor: '#64748b', dot: '#94a3b8', label: 'Inactive' },
  approved: { bg: '#f0fdf4', textColor: '#16a34a', dot: '#16a34a', label: 'Approved' },
  rejected: { bg: '#fef2f2', textColor: '#dc2626', dot: '#ef4444', label: 'Rejected' },
  completed: { bg: '#f0fdf4', textColor: '#16a34a', dot: '#16a34a', label: 'Completed' },
  failed: { bg: '#fef2f2', textColor: '#dc2626', dot: '#ef4444', label: 'Failed' },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status] ?? statusConfig.pending;
  return (
    <View
      className={cn('rounded-full self-start flex-row items-center', className)}
      style={{ paddingHorizontal: s(10), paddingVertical: s(4), gap: s(6), backgroundColor: config.bg }}
    >
      <View style={{ width: s(6), height: s(6), borderRadius: s(3), backgroundColor: config.dot }} />
      <Text style={{ fontSize: ms(11), color: config.textColor }} className="font-semibold">{config.label}</Text>
    </View>
  );
}
