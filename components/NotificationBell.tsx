import { useState, useEffect } from 'react';
import { Pressable, View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { Bell } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { getUnreadCount } from '@/shared/services/notifications';

export function NotificationBell() {
  const { user } = useAuth();
  const router = useRouter();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    getUnreadCount(user.id).then(setCount).catch(console.error);

    const interval = setInterval(() => {
      getUnreadCount(user.id).then(setCount).catch(() => {});
    }, 30000);

    return () => clearInterval(interval);
  }, [user]);

  return (
    <Pressable onPress={() => router.push('/(landlord)/(more)/notifications')} className="relative p-2">
      <Bell size={22} color="#111827" />
      {count > 0 && (
        <View className="absolute -top-0.5 -right-0.5 bg-destructive rounded-full min-w-[18px] h-[18px] items-center justify-center px-1">
          <Text className="text-[10px] font-bold text-white">{count > 99 ? '99+' : count}</Text>
        </View>
      )}
    </Pressable>
  );
}
