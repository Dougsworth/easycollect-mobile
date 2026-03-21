import { Image } from 'react-native';
import { s } from '@/lib/responsive';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const dimensions = {
  sm: 28,
  md: 44,
  lg: 64,
  xl: 100,
};

export function BrandLogo({ size = 'md' }: BrandLogoProps) {
  const d = s(dimensions[size]);
  return (
    <Image
      source={require('@/assets/logo.png')}
      style={{ width: d, height: d }}
      resizeMode="contain"
    />
  );
}
