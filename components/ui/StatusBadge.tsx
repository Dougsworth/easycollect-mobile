import { View, Text } from 'react-native';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: 'paid' | 'pending' | 'overdue' | 'active' | 'inactive' | 'approved' | 'rejected' | 'completed' | 'failed';
  className?: string;
}

const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
  paid: { bg: 'bg-success-muted', text: 'text-success', label: 'Paid' },
  pending: { bg: 'bg-warning-muted', text: 'text-warning', label: 'Pending' },
  overdue: { bg: 'bg-destructive-muted', text: 'text-destructive', label: 'Overdue' },
  active: { bg: 'bg-success-muted', text: 'text-success', label: 'Active' },
  inactive: { bg: 'bg-muted', text: 'text-muted-foreground', label: 'Inactive' },
  approved: { bg: 'bg-success-muted', text: 'text-success', label: 'Approved' },
  rejected: { bg: 'bg-destructive-muted', text: 'text-destructive', label: 'Rejected' },
  completed: { bg: 'bg-success-muted', text: 'text-success', label: 'Completed' },
  failed: { bg: 'bg-destructive-muted', text: 'text-destructive', label: 'Failed' },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status] ?? statusConfig.pending;
  return (
    <View className={cn('rounded-full px-2.5 py-1 self-start', config.bg, className)}>
      <Text className={cn('text-xs font-semibold', config.text)}>{config.label}</Text>
    </View>
  );
}
