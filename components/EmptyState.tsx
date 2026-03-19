import { View, Text } from 'react-native';
import { Button } from '@/components/ui';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <View className="flex-1 items-center justify-center px-8 py-16">
      {icon && <View className="mb-4">{icon}</View>}
      <Text className="text-lg font-semibold text-foreground text-center">{title}</Text>
      {description && (
        <Text className="text-sm text-muted-foreground text-center mt-2">{description}</Text>
      )}
      {actionLabel && onAction && (
        <Button onPress={onAction} className="mt-5">{actionLabel}</Button>
      )}
    </View>
  );
}
