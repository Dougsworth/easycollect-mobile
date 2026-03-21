import { useState } from 'react';
import { View, Text, TextInput, Pressable, type TextInputProps } from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import { cn } from '@/lib/utils';
import { s, ms } from '@/lib/responsive';

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
        <Text style={{ fontSize: ms(13) }} className="mb-1.5 font-semibold text-foreground">{label}</Text>
      )}
      <View className="relative">
        <TextInput
          style={{ height: s(46), fontSize: ms(15), paddingHorizontal: s(16) }}
          className={cn(
            'rounded-xl border text-foreground',
            error
              ? 'border-destructive bg-destructive-muted/30'
              : focused
                ? 'border-primary bg-white'
                : 'border-border bg-secondary',
            secureTextEntry && 'pr-12',
            className,
          )}
          placeholderTextColor="#94a3b8"
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
              <EyeOff size={s(18)} color="#94a3b8" />
            ) : (
              <Eye size={s(18)} color="#94a3b8" />
            )}
          </Pressable>
        )}
      </View>
      {error && (
        <Text style={{ fontSize: ms(13) }} className="mt-1 text-destructive">{error}</Text>
      )}
    </View>
  );
}
