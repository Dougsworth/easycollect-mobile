import { View, Text } from 'react-native';
import { cn } from '@/lib/utils';
import { s, ms } from '@/lib/responsive';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className }: CardProps) {
  return (
    <View
      className={cn('bg-white rounded-2xl', className)}
      style={{
        padding: s(18),
        borderWidth: 1,
        borderColor: 'rgba(226,232,240,0.6)',
        shadowColor: '#0f172a',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 2,
      }}
    >
      {children}
    </View>
  );
}

export function CardHeader({ children, className }: CardProps) {
  return <View className={cn('mb-3', className)}>{children}</View>;
}

export function CardTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return <Text style={{ fontSize: ms(17) }} className={cn('font-bold text-foreground tracking-tight', className)}>{children}</Text>;
}

export function CardContent({ children, className }: CardProps) {
  return <View className={cn('', className)}>{children}</View>;
}
