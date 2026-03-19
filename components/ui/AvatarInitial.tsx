import { View, Text } from 'react-native';
import { cn } from '@/lib/utils';

interface AvatarInitialProps {
  name: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeStyles = {
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
  lg: 'h-12 w-12',
};

const textSizeStyles = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
};

const colors = [
  'bg-primary', 'bg-success', 'bg-warning', 'bg-purple-500',
  'bg-pink-500', 'bg-indigo-500', 'bg-teal-500', 'bg-orange-500',
];

function getColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export function AvatarInitial({ name, size = 'md', className }: AvatarInitialProps) {
  const initials = name
    .split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <View className={cn('rounded-full items-center justify-center', sizeStyles[size], getColor(name), className)}>
      <Text className={cn('font-semibold text-white', textSizeStyles[size])}>{initials}</Text>
    </View>
  );
}
