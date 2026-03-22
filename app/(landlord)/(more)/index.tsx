import { View, Text, Pressable, ScrollView, StyleSheet, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Building2, BarChart3, Settings, Bell, ClipboardList, CalendarDays, LogOut, ChevronRight } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';

const menuItems = [
  { label: 'Properties', icon: Building2, route: '/(landlord)/(more)/properties', color: '#0f172a' },
  { label: 'Reports', icon: BarChart3, route: '/(landlord)/(more)/reports', color: '#0f172a' },
  { label: 'Calendar', icon: CalendarDays, route: '/(landlord)/(more)/calendar', color: '#0f172a' },
  { label: 'Notifications', icon: Bell, route: '/(landlord)/(more)/notifications', color: '#0f172a' },
  { label: 'Activity Log', icon: ClipboardList, route: '/(landlord)/(more)/activity-log', color: '#0f172a' },
  { label: 'Settings', icon: Settings, route: '/(landlord)/(more)/settings', color: '#0f172a' },
];

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
}

export default function MoreScreen() {
  const { signOut, profile } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: () => signOut() },
    ]);
  };

  return (
    <View style={[st.container, { paddingTop: insets.top }]}>
      <Text style={st.headerTitle}>More</Text>

      <ScrollView contentContainerStyle={[st.scroll, { paddingBottom: insets.bottom + 24 }]}>
        {/* Profile */}
        {profile && (
          <Pressable
            onPress={() => router.push('/(landlord)/(more)/settings' as any)}
            style={({ pressed }) => [st.profileRow, pressed && { opacity: 0.85 }]}
          >
            <View style={st.profileAvatar}>
              <Text style={st.profileInitials}>
                {getInitials(`${profile.first_name} ${profile.last_name}`)}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={st.profileName}>{profile.first_name} {profile.last_name}</Text>
              <Text style={st.profileEmail}>{profile.email}</Text>
            </View>
            <ChevronRight size={16} color="#cbd5e1" />
          </Pressable>
        )}

        <View style={st.divider} />

        {/* Menu items */}
        {menuItems.map((item) => (
          <Pressable
            key={item.label}
            onPress={() => router.push(item.route as any)}
            style={({ pressed }) => [st.menuRow, pressed && { backgroundColor: '#f8fafc' }]}
          >
            <item.icon size={20} color="#64748b" />
            <Text style={st.menuLabel}>{item.label}</Text>
            <ChevronRight size={16} color="#cbd5e1" />
          </Pressable>
        ))}

        <View style={st.divider} />

        {/* Sign Out */}
        <Pressable onPress={handleSignOut} style={st.signOutRow}>
          <LogOut size={20} color="#ef4444" />
          <Text style={st.signOutText}>Sign Out</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const st = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  headerTitle: {
    fontSize: 28, fontWeight: '700', color: '#0f172a', letterSpacing: -0.5,
    paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16,
  },
  scroll: { paddingHorizontal: 20 },

  // Profile
  profileRow: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 4,
  },
  profileAvatar: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: '#0f172a', alignItems: 'center', justifyContent: 'center', marginRight: 14,
  },
  profileInitials: { fontSize: 16, fontWeight: '700', color: '#ffffff' },
  profileName: { fontSize: 17, fontWeight: '600', color: '#0f172a' },
  profileEmail: { fontSize: 13, color: '#94a3b8', marginTop: 1 },

  divider: { height: 1, backgroundColor: '#f1f5f9', marginVertical: 16 },

  // Menu
  menuRow: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 14, gap: 14,
  },
  menuLabel: { flex: 1, fontSize: 16, fontWeight: '500', color: '#0f172a' },

  // Sign out
  signOutRow: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 14, gap: 14,
  },
  signOutText: { fontSize: 16, fontWeight: '500', color: '#ef4444' },
});
