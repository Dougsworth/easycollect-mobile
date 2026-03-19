import { View, Text } from 'react-native';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon?: React.ReactNode;
  color?: 'primary' | 'success' | 'warning' | 'destructive';
  className?: string;
}

const colorStyles = {
  primary: 'bg-primary-muted',
  success: 'bg-success-muted',
  warning: 'bg-warning-muted',
  destructive: 'bg-destructive-muted',
};

const iconColorStyles = {
  primary: 'bg-primary',
  success: 'bg-success',
  warning: 'bg-warning',
  destructive: 'bg-destructive',
};

export function StatCard({ title, value, subtitle, icon, color = 'primary', className }: StatCardProps) {
  return (
    <View className={cn('rounded-2xl border border-border bg-card p-4', className)}>
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-sm text-muted-foreground">{title}</Text>
        {icon && (
          <View className={cn('h-8 w-8 rounded-full items-center justify-center', iconColorStyles[color])}>
            {icon}
          </View>
        )}
      </View>
      <Text className="text-2xl font-bold text-foreground">{value}</Text>
      {subtitle && (
        <Text className="text-xs text-muted-foreground mt-1">{subtitle}</Text>
      )}
    </View>
  );
}
