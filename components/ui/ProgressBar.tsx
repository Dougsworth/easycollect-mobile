import { View } from 'react-native';
import { cn } from '@/lib/utils';
import { s } from '@/lib/responsive';

interface ProgressBarProps {
  progress: number; // 0-100
  color?: 'primary' | 'success' | 'warning' | 'destructive';
  className?: string;
}

const colorStyles = {
  primary: 'bg-primary',
  success: 'bg-success',
  warning: 'bg-warning',
  destructive: 'bg-destructive',
};

export function ProgressBar({ progress, color = 'primary', className }: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, progress));
  return (
    <View className={cn('rounded-full bg-muted overflow-hidden', className)} style={{ height: s(7) }}>
      <View
        className={cn('h-full rounded-full', colorStyles[color])}
        style={{ width: `${clamped}%` }}
      />
    </View>
  );
}
