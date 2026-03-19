import { Text } from 'react-native';
import { cn } from '@/lib/utils';

interface LabelProps {
  children: React.ReactNode;
  className?: string;
}

export function Label({ children, className }: LabelProps) {
  return (
    <Text className={cn('mb-1.5 text-sm font-medium text-foreground', className)}>
      {children}
    </Text>
  );
}
