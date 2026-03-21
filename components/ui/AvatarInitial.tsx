import { View, Text } from 'react-native';
import { cn } from '@/lib/utils';
import { s, ms } from '@/lib/responsive';

interface AvatarInitialProps {
  name: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const dimensions = {
  sm: s(30),
  md: s(38),
  lg: s(46),
};

const fontSizes = {
  sm: ms(11),
  md: ms(13),
  lg: ms(15),
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

  const d = dimensions[size];

  return (
    <View
      className={cn('rounded-full items-center justify-center', getColor(name), className)}
      style={{ width: d, height: d }}
    >
      <Text style={{ fontSize: fontSizes[size] }} className="font-semibold text-white">{initials}</Text>
    </View>
  );
}
