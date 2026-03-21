import { View, Text } from 'react-native';
import { Button } from '@/components/ui';
import { s, ms } from '@/lib/responsive';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <View className="flex-1 items-center justify-center" style={{ paddingHorizontal: s(32), paddingVertical: s(60) }}>
      {icon && (
        <View
          className="rounded-full bg-muted items-center justify-center"
          style={{ height: s(64), width: s(64), marginBottom: s(18) }}
        >
          {icon}
        </View>
      )}
      <Text style={{ fontSize: ms(17) }} className="font-bold text-foreground text-center tracking-tight">{title}</Text>
      {description && (
        <Text style={{ fontSize: ms(13), marginTop: s(8), lineHeight: ms(19) }} className="text-muted-foreground text-center">{description}</Text>
      )}
      {actionLabel && onAction && (
        <Button onPress={onAction} className="mt-6" size="lg">{actionLabel}</Button>
      )}
    </View>
  );
}
