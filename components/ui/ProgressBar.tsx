import { View, StyleSheet } from 'react-native';
import { cn } from '@/lib/utils';

interface ProgressBarProps {
  progress: number;
  color?: 'primary' | 'success' | 'warning' | 'destructive';
  className?: string;
}

const barColors = {
  primary: '#3b82f6',
  success: '#16a34a',
  warning: '#f59e0b',
  destructive: '#ef4444',
};

export function ProgressBar({ progress, color = 'primary', className }: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, progress));
  return (
    <View className={cn(className)} style={st.track}>
      <View style={[st.bar, { width: `${clamped}%`, backgroundColor: barColors[color] }]} />
    </View>
  );
}

const st = StyleSheet.create({
  track: { height: 6, borderRadius: 3, backgroundColor: '#f1f5f9', overflow: 'hidden' },
  bar: { height: '100%', borderRadius: 3 },
});
