import { View, Text, Switch as RNSwitch } from 'react-native';
import { cn } from '@/lib/utils';

interface SwitchProps {
  label?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  className?: string;
}

export function Switch({ label, value, onValueChange, className }: SwitchProps) {
  return (
    <View className={cn('flex-row items-center justify-between py-2', className)}>
      {label && <Text className="text-base text-foreground flex-1 mr-3">{label}</Text>}
      <RNSwitch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#e5e7eb', true: '#93c5fd' }}
        thumbColor={value ? '#3b82f6' : '#f4f3f4'}
      />
    </View>
  );
}
