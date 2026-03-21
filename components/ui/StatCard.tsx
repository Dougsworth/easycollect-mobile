import { View, Text } from 'react-native';
import { cn } from '@/lib/utils';
import { s, ms } from '@/lib/responsive';

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon?: React.ReactNode;
  color?: 'primary' | 'success' | 'warning' | 'destructive';
  className?: string;
}

const cardStyles = {
  primary: { bg: '#ffffff', border: 'rgba(59,130,246,0.15)', iconBg: '#eff6ff', valueColor: '#2563eb' },
  success: { bg: '#ffffff', border: 'rgba(22,163,74,0.15)', iconBg: '#f0fdf4', valueColor: '#16a34a' },
  warning: { bg: '#ffffff', border: 'rgba(245,158,11,0.15)', iconBg: '#fffbeb', valueColor: '#b45309' },
  destructive: { bg: '#ffffff', border: 'rgba(239,68,68,0.15)', iconBg: '#fef2f2', valueColor: '#dc2626' },
};

export function StatCard({ title, value, subtitle, icon, color = 'primary', className }: StatCardProps) {
  const s_ = cardStyles[color];
  return (
    <View
      className={cn('rounded-2xl', className)}
      style={{
        padding: s(14),
        backgroundColor: s_.bg,
        borderWidth: 1,
        borderColor: s_.border,
        shadowColor: '#0f172a',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 2,
      }}
    >
      <View className="flex-row items-center justify-between" style={{ marginBottom: s(8) }}>
        <Text style={{ fontSize: ms(12), letterSpacing: 0.5 }} className="font-medium text-muted-foreground uppercase">{title}</Text>
        {icon && (
          <View
            className="rounded-xl items-center justify-center"
            style={{ height: s(32), width: s(32), backgroundColor: s_.iconBg }}
          >
            {icon}
          </View>
        )}
      </View>
      <Text style={{ fontSize: ms(22), color: s_.valueColor }} className="font-bold tracking-tight">{value}</Text>
      {subtitle && (
        <Text style={{ fontSize: ms(11), marginTop: s(4) }} className="text-muted-foreground">{subtitle}</Text>
      )}
    </View>
  );
}
