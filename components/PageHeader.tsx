import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { cn } from '@/lib/utils';
import { s, ms } from '@/lib/responsive';

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
    <View
      className={cn('flex-row items-center justify-between', className)}
      style={{ paddingHorizontal: s(20), paddingBottom: s(14), paddingTop: s(8) }}
    >
      <View className="flex-row items-center flex-1">
        {showBack && (
          <Pressable
            onPress={() => router.back()}
            className="rounded-full items-center justify-center"
            style={({ pressed }: { pressed: boolean }) => ({
              opacity: pressed ? 0.7 : 1,
              marginRight: s(12),
              height: s(36),
              width: s(36),
              backgroundColor: '#f1f5f9',
            })}
          >
            <ArrowLeft size={s(18)} color="#0f172a" />
          </Pressable>
        )}
        <View className="flex-1">
          <Text style={{ fontSize: ms(22), letterSpacing: -0.5 }} className="font-bold text-foreground">{title}</Text>
          {subtitle && <Text style={{ fontSize: ms(13), marginTop: 2 }} className="text-muted-foreground">{subtitle}</Text>}
        </View>
      </View>
      {right && <View>{right}</View>}
    </View>
  );
}
