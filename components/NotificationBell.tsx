import { useState, useEffect } from 'react';
import { Pressable, View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Bell } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { getUnreadCount } from '@/shared/services/notifications';
import { supabase } from '@/lib/supabase';

export function NotificationBell() {
  const { user } = useAuth();
  const router = useRouter();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!user) return;

    getUnreadCount(user.id).then(setCount).catch(console.error);

    const channel = supabase
      .channel('notification-bell')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notifications', filter: `landlord_id=eq.${user.id}` },
        () => { getUnreadCount(user.id).then(setCount).catch(() => {}); },
      )
      .subscribe();

    const interval = setInterval(() => {
      getUnreadCount(user.id).then(setCount).catch(() => {});
    }, 60000);

    return () => { supabase.removeChannel(channel); clearInterval(interval); };
  }, [user]);

  return (
    <Pressable
      onPress={() => router.push('/(landlord)/(more)/notifications')}
      accessibilityRole="button"
      accessibilityLabel={count > 0 ? `${count} unread notifications` : 'Notifications'}
      style={st.btn}
    >
      <Bell size={20} color="#0f172a" />
      {count > 0 && (
        <View style={st.badge}>
          <Text style={st.badgeText}>{count > 99 ? '99+' : count}</Text>
        </View>
      )}
    </Pressable>
  );
}

const st = StyleSheet.create({
  btn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#ef4444',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: { fontSize: 9, fontWeight: '700', color: '#ffffff' },
});
