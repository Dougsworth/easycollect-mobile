import { useState } from 'react';
import { View, Text, TextInput, Pressable, type TextInputProps } from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import { cn } from '@/lib/utils';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerClassName?: string;
}

export function Input({ label, error, containerClassName, className, secureTextEntry, ...props }: InputProps) {
  const [focused, setFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View className={cn('mb-4', containerClassName)}>
      {label && (
        <Text className="mb-1.5 text-sm font-medium text-foreground">{label}</Text>
      )}
      <View className="relative">
        <TextInput
          className={cn(
            'h-12 rounded-xl border bg-white px-4 text-base text-foreground',
            error ? 'border-destructive' : focused ? 'border-primary' : 'border-border',
            secureTextEntry && 'pr-12',
            className,
          )}
          placeholderTextColor="#9ca3af"
          secureTextEntry={secureTextEntry && !showPassword}
          onFocus={(e) => { setFocused(true); props.onFocus?.(e); }}
          onBlur={(e) => { setFocused(false); props.onBlur?.(e); }}
          {...props}
        />
        {secureTextEntry && (
          <Pressable
            onPress={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-0 bottom-0 justify-center px-1"
            hitSlop={8}
          >
            {showPassword ? (
              <EyeOff size={20} color="#9ca3af" />
            ) : (
              <Eye size={20} color="#9ca3af" />
            )}
          </Pressable>
        )}
      </View>
      {error && (
        <Text className="mt-1 text-sm text-destructive">{error}</Text>
      )}
    </View>
  );
}
