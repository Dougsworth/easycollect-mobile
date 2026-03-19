import { View, Text } from 'react-native';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
}

const sizes = {
  sm: { container: 'h-8 w-8', text: 'text-sm' },
  md: { container: 'h-12 w-12', text: 'text-lg' },
  lg: { container: 'h-16 w-16', text: 'text-2xl' },
};

export function BrandLogo({ size = 'md' }: BrandLogoProps) {
  const s = sizes[size];
  return (
    <View className={`${s.container} rounded-2xl bg-primary items-center justify-center`}>
      <Text className={`${s.text} font-bold text-white`}>EC</Text>
    </View>
  );
}
