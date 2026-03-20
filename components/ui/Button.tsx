import { Pressable, Text, ActivityIndicator } from 'react-native';
import * as Haptics from 'expo-haptics';
import { cn } from '@/lib/utils';

interface ButtonProps {
  onPress?: () => void;
  children: React.ReactNode;
  variant?: 'default' | 'destructive' | 'outline' | 'ghost' | 'secondary';
  size?: 'default' | 'sm' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}

const variantStyles = {
  default: 'bg-primary',
  destructive: 'bg-destructive',
  outline: 'border border-border bg-transparent',
  ghost: 'bg-transparent',
  secondary: 'bg-secondary',
};

const variantTextStyles = {
  default: 'text-white',
  destructive: 'text-white',
  outline: 'text-foreground',
  ghost: 'text-foreground',
  secondary: 'text-foreground',
};

const sizeStyles = {
  default: 'h-12 px-5',
  sm: 'h-9 px-3',
  lg: 'h-14 px-8',
};

export function Button({
  onPress,
  children,
  variant = 'default',
  size = 'default',
  disabled = false,
  loading = false,
  className,
}: ButtonProps) {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.();
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled || loading}
      style={({ pressed }) => ({
        opacity: disabled || loading ? 0.5 : pressed ? 0.85 : 1,
        transform: [{ scale: pressed && !disabled ? 0.97 : 1 }],
      })}
      className={cn(
        'flex-row items-center justify-center rounded-xl',
        variantStyles[variant],
        sizeStyles[size],
        className,
      )}
      android_ripple={
        variant === 'default' || variant === 'destructive'
          ? { color: 'rgba(255,255,255,0.2)', borderless: false }
          : { color: 'rgba(0,0,0,0.08)', borderless: false }
      }
    >
      {loading ? (
        <ActivityIndicator size="small" color={variant === 'default' || variant === 'destructive' ? '#fff' : '#3b82f6'} />
      ) : typeof children === 'string' ? (
        <Text className={cn('text-base font-semibold', variantTextStyles[variant])}>{children}</Text>
      ) : (
        children
      )}
    </Pressable>
  );
}
