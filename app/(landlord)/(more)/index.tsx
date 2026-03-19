import { View, Text, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Building2, BarChart3, Settings, Bell, ClipboardList, CalendarDays, LogOut } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { PageHeader } from '@/components/PageHeader';

const menuItems = [
  { label: 'Properties', icon: Building2, route: '/(landlord)/(more)/properties', color: '#3b82f6' },
  { label: 'Reports', icon: BarChart3, route: '/(landlord)/(more)/reports', color: '#10b981' },
  { label: 'Settings', icon: Settings, route: '/(landlord)/(more)/settings', color: '#6b7280' },
  { label: 'Notifications', icon: Bell, route: '/(landlord)/(more)/notifications', color: '#f59e0b' },
  { label: 'Activity Log', icon: ClipboardList, route: '/(landlord)/(more)/activity-log', color: '#8b5cf6' },
  { label: 'Calendar', icon: CalendarDays, route: '/(landlord)/(more)/calendar', color: '#ec4899' },
];

export default function MoreScreen() {
  const { signOut, profile } = useAuth();
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-background-secondary">
      <PageHeader title="More" />
      <ScrollView className="flex-1 px-4">
        <View className="flex-row flex-wrap gap-3 mb-6">
          {menuItems.map((item) => (
            <Pressable
              key={item.label}
              onPress={() => router.push(item.route as any)}
              className="bg-white rounded-2xl border border-border p-4 items-center justify-center"
              style={{ width: '31%', aspectRatio: 1 }}
            >
              <View className="h-12 w-12 rounded-full items-center justify-center mb-2" style={{ backgroundColor: item.color + '20' }}>
                <item.icon size={24} color={item.color} />
              </View>
              <Text className="text-xs font-medium text-foreground text-center">{item.label}</Text>
            </Pressable>
          ))}
        </View>

        <Pressable
          onPress={signOut}
          className="flex-row items-center justify-center bg-white rounded-2xl border border-border p-4 gap-2"
        >
          <LogOut size={20} color="#ef4444" />
          <Text className="text-base font-medium text-destructive">Sign Out</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
