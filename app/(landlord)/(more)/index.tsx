import { View, Text, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Building2, BarChart3, Settings, Bell, ClipboardList, CalendarDays, LogOut, ChevronRight } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { PageHeader } from '@/components/PageHeader';
import { AvatarInitial } from '@/components/ui';

const menuItems = [
  { label: 'Properties', icon: Building2, route: '/(landlord)/(more)/properties', color: '#3b82f6' },
  { label: 'Reports', icon: BarChart3, route: '/(landlord)/(more)/reports', color: '#10b981' },
  { label: 'Settings', icon: Settings, route: '/(landlord)/(more)/settings', color: '#64748b' },
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
      <ScrollView className="flex-1 px-5" contentContainerClassName="pb-8">
        {/* Profile Card */}
        {profile && (
          <Pressable
            onPress={() => router.push('/(landlord)/(more)/settings' as any)}
            className="bg-white rounded-2xl p-5 mb-5 flex-row items-center"
            style={{
              borderWidth: 1,
              borderColor: 'rgba(226,232,240,0.6)',
              shadowColor: '#0f172a',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.04,
              shadowRadius: 8,
              elevation: 2,
            }}
          >
            <AvatarInitial name={`${profile.first_name} ${profile.last_name}`} size="lg" />
            <View className="flex-1 ml-4">
              <Text className="text-lg font-bold text-foreground tracking-tight">{profile.first_name} {profile.last_name}</Text>
              <Text className="text-sm text-muted-foreground mt-0.5">{profile.email}</Text>
            </View>
            <ChevronRight size={20} color="#94a3b8" />
          </Pressable>
        )}

        {/* Menu Items */}
        <View
          className="bg-white rounded-2xl mb-5 overflow-hidden"
          style={{
            borderWidth: 1,
            borderColor: 'rgba(226,232,240,0.6)',
            shadowColor: '#0f172a',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.04,
            shadowRadius: 8,
            elevation: 2,
          }}
        >
          {menuItems.map((item, idx) => (
            <Pressable
              key={item.label}
              onPress={() => router.push(item.route as any)}
              className="flex-row items-center px-5 py-4"
              style={({ pressed }) => ({
                backgroundColor: pressed ? '#f8fafc' : '#fff',
                borderBottomWidth: idx < menuItems.length - 1 ? 1 : 0,
                borderBottomColor: '#f1f5f9',
              })}
            >
              <View
                className="h-10 w-10 rounded-xl items-center justify-center"
                style={{ backgroundColor: item.color + '12' }}
              >
                <item.icon size={20} color={item.color} />
              </View>
              <Text className="flex-1 ml-3 text-base font-medium text-foreground">{item.label}</Text>
              <ChevronRight size={18} color="#cbd5e1" />
            </Pressable>
          ))}
        </View>

        {/* Sign Out */}
        <Pressable
          onPress={signOut}
          className="flex-row items-center justify-center bg-white rounded-2xl p-4 gap-2"
          style={({ pressed }: { pressed: boolean }) => ({
            opacity: pressed ? 0.8 : 1,
            borderWidth: 1,
            borderColor: 'rgba(226,232,240,0.6)',
            shadowColor: '#0f172a',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.03,
            shadowRadius: 6,
            elevation: 1,
          })}
        >
          <LogOut size={18} color="#ef4444" />
          <Text className="text-base font-semibold text-destructive">Sign Out</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
