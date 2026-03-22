import { View, Text, StyleSheet } from 'react-native';
import { cn } from '@/lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className }: CardProps) {
  return (
    <View className={cn(className)} style={st.card}>
      {children}
    </View>
  );
}

export function CardHeader({ children, className }: CardProps) {
  return <View className={cn(className)} style={{ marginBottom: 12 }}>{children}</View>;
}

export function CardTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return <Text className={cn(className)} style={st.title}>{children}</Text>;
}

export function CardContent({ children, className }: CardProps) {
  return <View className={cn(className)}>{children}</View>;
}

const st = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0f172a',
  },
});
