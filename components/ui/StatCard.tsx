import { View, Text, StyleSheet } from 'react-native';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon?: React.ReactNode;
  color?: 'primary' | 'success' | 'warning' | 'destructive';
  className?: string;
}

const iconBg = {
  primary: '#eff6ff',
  success: '#ecfdf5',
  warning: '#fffbeb',
  destructive: '#fef2f2',
};

const valueColor = {
  primary: '#0f172a',
  success: '#059669',
  warning: '#b45309',
  destructive: '#0f172a',
};

export function StatCard({ title, value, subtitle, icon, color = 'primary', className }: StatCardProps) {
  return (
    <View className={cn(className)} style={st.card}>
      <View style={st.header}>
        <Text style={st.label}>{title}</Text>
        {icon && (
          <View style={[st.iconWrap, { backgroundColor: iconBg[color] }]}>
            {icon}
          </View>
        )}
      </View>
      <Text style={[st.value, { color: valueColor[color] }]}>{value}</Text>
      {subtitle && <Text style={st.sub}>{subtitle}</Text>}
    </View>
  );
}

const st = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    fontSize: 11,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    color: '#94a3b8',
  },
  iconWrap: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  sub: {
    fontSize: 11,
    fontWeight: '500',
    color: '#64748b',
    marginTop: 2,
  },
});
