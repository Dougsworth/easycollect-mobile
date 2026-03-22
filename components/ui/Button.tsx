import { Pressable, Text, ActivityIndicator, type ViewStyle } from 'react-native';
import * as Haptics from 'expo-haptics';

interface ButtonProps {
  onPress?: () => void;
  children: React.ReactNode;
  variant?: 'default' | 'destructive' | 'outline' | 'ghost' | 'secondary';
  size?: 'default' | 'sm' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  style?: ViewStyle;
}

const bg: Record<string, string> = {
  default: '#0f172a',
  destructive: '#dc2626',
  outline: '#ffffff',
  ghost: 'transparent',
  secondary: '#f1f5f9',
};

const fg: Record<string, string> = {
  default: '#ffffff',
  destructive: '#ffffff',
  outline: '#0f172a',
  ghost: '#0f172a',
  secondary: '#0f172a',
};

const heights = { sm: 34, default: 44, lg: 48 };

export function Button({
  onPress, children, variant = 'default', size = 'default',
  disabled = false, loading = false, style: extraStyle,
}: ButtonProps) {
  return (
    <Pressable
      onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onPress?.(); }}
      disabled={disabled || loading}
      accessibilityRole="button"
      style={({ pressed }) => ({
        backgroundColor: bg[variant],
        height: heights[size],
        borderRadius: 10,
        paddingHorizontal: 20,
        flexDirection: 'row' as const,
        alignItems: 'center' as const,
        justifyContent: 'center' as const,
        opacity: disabled || loading ? 0.5 : pressed ? 0.85 : 1,
        ...(variant === 'outline' ? { borderWidth: 1, borderColor: '#e2e8f0' } : {}),
        ...extraStyle,
      })}
    >
      {loading ? (
        <ActivityIndicator size="small" color={fg[variant]} />
      ) : typeof children === 'string' ? (
        <Text style={{ fontSize: 14, fontWeight: '500', color: fg[variant] }}>{children}</Text>
      ) : (
        children
      )}
    </Pressable>
  );
}
