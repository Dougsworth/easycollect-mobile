import { View, Text, Pressable, StyleSheet } from 'react-native';
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
    <View className={cn(className)} style={st.container}>
      <View style={st.left}>
        {showBack && (
          <Pressable
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            style={({ pressed }) => [st.backBtn, pressed && { opacity: 0.6 }]}
          >
            <ArrowLeft size={18} color="#0f172a" />
          </Pressable>
        )}
        <View style={{ flex: 1 }}>
          <Text style={st.title}>{title}</Text>
          {subtitle && <Text style={st.subtitle}>{subtitle}</Text>}
        </View>
      </View>
      {right && <View>{right}</View>}
    </View>
  );
}

const st = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 10,
    paddingTop: 6,
  },
  left: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  backBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  title: { fontSize: 20, fontWeight: '600', color: '#0f172a', letterSpacing: -0.3 },
  subtitle: { fontSize: 13, color: '#94a3b8', marginTop: 1 },
});
