import { Pressable, Text, ActivityIndicator, type ViewStyle } from 'react-native';
import * as Haptics from 'expo-haptics';
import { cn } from '@/lib/utils';
import { s, ms } from '@/lib/responsive';

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
  outline: 'border border-border bg-white',
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

const shadowStyles: Record<string, ViewStyle> = {
  default: {
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  destructive: {
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
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

  const heights = { sm: s(36), default: s(46), lg: s(52) };
  const paddings = { sm: s(12), default: s(20), lg: s(30) };

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled || loading}
      style={({ pressed }: { pressed: boolean }) => ({
        opacity: disabled || loading ? 0.5 : pressed ? 0.85 : 1,
        transform: [{ scale: pressed && !disabled ? 0.97 : 1 }],
        height: heights[size],
        paddingHorizontal: paddings[size],
        ...(shadowStyles[variant] ?? {}),
      })}
      className={cn(
        'flex-row items-center justify-center rounded-xl',
        variantStyles[variant],
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
        <Text style={{ fontSize: ms(15) }} className={cn('font-semibold', variantTextStyles[variant])}>{children}</Text>
      ) : (
        children
      )}
    </Pressable>
  );
}
