import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  right?: React.ReactNode;
  className?: string;
}

export function PageHeader({ title, subtitle, showBack = false, right, className }: PageHeaderProps) {
  const router = useRouter();

  return (
    <View className={cn('flex-row items-center justify-between px-4 pb-3 pt-2', className)}>
      <View className="flex-row items-center flex-1">
        {showBack && (
          <Pressable onPress={() => router.back()} className="mr-3 p-1">
            <ArrowLeft size={24} color="#111827" />
          </Pressable>
        )}
        <View className="flex-1">
          <Text className="text-2xl font-bold text-foreground">{title}</Text>
          {subtitle && <Text className="text-sm text-muted-foreground mt-0.5">{subtitle}</Text>}
        </View>
      </View>
      {right && <View>{right}</View>}
    </View>
  );
}
