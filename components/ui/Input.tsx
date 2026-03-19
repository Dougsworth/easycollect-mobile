import { View, Text, TextInput, type TextInputProps } from 'react-native';
import { cn } from '@/lib/utils';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerClassName?: string;
}

export function Input({ label, error, containerClassName, className, ...props }: InputProps) {
  return (
    <View className={cn('mb-4', containerClassName)}>
      {label && (
        <Text className="mb-1.5 text-sm font-medium text-foreground">{label}</Text>
      )}
      <TextInput
        className={cn(
          'h-12 rounded-xl border bg-white px-4 text-base text-foreground',
          error ? 'border-destructive' : 'border-border',
          className,
        )}
        placeholderTextColor="#9ca3af"
        {...props}
      />
      {error && (
        <Text className="mt-1 text-sm text-destructive">{error}</Text>
      )}
    </View>
  );
}
