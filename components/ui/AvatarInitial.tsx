import { View, Text } from 'react-native';
import { cn } from '@/lib/utils';

interface AvatarInitialProps {
  name: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const dims = { sm: 30, md: 36, lg: 44 };
const fonts = { sm: 11, md: 13, lg: 15 };

const palette = [
  { bg: '#eff6ff', text: '#3b82f6' },
  { bg: '#ecfdf5', text: '#10b981' },
  { bg: '#fef3c7', text: '#d97706' },
  { bg: '#fce7f3', text: '#ec4899' },
  { bg: '#ede9fe', text: '#7c3aed' },
  { bg: '#e0f2fe', text: '#0284c7' },
  { bg: '#fef2f2', text: '#ef4444' },
  { bg: '#f0fdf4', text: '#16a34a' },
];

function getColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return palette[Math.abs(hash) % palette.length];
}

export function AvatarInitial({ name, size = 'md', className }: AvatarInitialProps) {
  const initials = name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  const d = dims[size];
  const c = getColor(name);

  return (
    <View
      className={cn(className)}
      style={{ width: d, height: d, borderRadius: d / 2, backgroundColor: c.bg, alignItems: 'center', justifyContent: 'center' }}
    >
      <Text style={{ fontSize: fonts[size], fontWeight: '600', color: c.text }}>{initials}</Text>
    </View>
  );
}
