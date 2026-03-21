import { useState, useEffect } from 'react';
import { Pressable, View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { Bell } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { getUnreadCount } from '@/shared/services/notifications';
import { supabase } from '@/lib/supabase';
import { s, ms } from '@/lib/responsive';

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
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `landlord_id=eq.${user.id}`,
        },
        () => {
          getUnreadCount(user.id).then(setCount).catch(() => {});
        },
      )
      .subscribe();

    const interval = setInterval(() => {
      getUnreadCount(user.id).then(setCount).catch(() => {});
    }, 60000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [user]);

  const badgeSize = s(16);

  return (
    <Pressable onPress={() => router.push('/(landlord)/(more)/notifications')} className="relative" style={{ padding: s(8) }}>
      <Bell size={s(20)} color="#0f172a" />
      {count > 0 && (
        <View
          className="absolute bg-destructive rounded-full items-center justify-center"
          style={{
            top: s(2),
            right: s(2),
            minWidth: badgeSize,
            height: badgeSize,
            paddingHorizontal: s(3),
          }}
        >
          <Text style={{ fontSize: ms(8) }} className="font-bold text-white">{count > 99 ? '99+' : count}</Text>
        </View>
      )}
    </Pressable>
  );
}
