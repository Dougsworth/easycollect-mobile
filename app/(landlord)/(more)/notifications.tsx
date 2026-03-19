import { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, Pressable, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bell, CheckCheck, Trash2 } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { getNotifications, markAsRead, markAllAsRead, deleteNotification, clearAllNotifications } from '@/shared/services/notifications';
import { Skeleton } from '@/components/ui';
import { PageHeader } from '@/components/PageHeader';
import { EmptyState } from '@/components/EmptyState';
import { showConfirmDialog } from '@/components/ui';
import { formatDate } from '@/shared/utils';
import type { Notification } from '@/shared/types/app.types';

export default function NotificationsScreen() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    if (!user) return;
    try { setNotifications(await getNotifications(user.id)); }
    catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [user]);

  useEffect(() => { loadData(); }, [loadData]);
  const onRefresh = async () => { setRefreshing(true); await loadData(); setRefreshing(false); };

  const handleMarkAllRead = async () => {
    if (!user) return;
    await markAllAsRead(user.id);
    loadData();
  };

  const handleClearAll = () => {
    showConfirmDialog({
      title: 'Clear All',
      message: 'Delete all notifications?',
      confirmText: 'Clear',
      destructive: true,
      onConfirm: async () => {
        if (!user) return;
        await clearAllNotifications(user.id);
        loadData();
      },
    });
  };

  const handleDelete = async (id: string) => {
    await deleteNotification(id);
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleTap = async (notif: Notification) => {
    if (!notif.is_read) {
      await markAsRead(notif.id);
      setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, is_read: true } : n));
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background-secondary">
      <PageHeader
        title="Notifications"
        showBack
        right={
          <View className="flex-row gap-2">
            <Pressable onPress={handleMarkAllRead} className="p-2"><CheckCheck size={20} color="#3b82f6" /></Pressable>
            <Pressable onPress={handleClearAll} className="p-2"><Trash2 size={20} color="#ef4444" /></Pressable>
          </View>
        }
      />
      {loading ? (
        <View className="px-4 gap-3">{[1,2,3,4].map(i => <Skeleton key={i} className="h-16 w-full" />)}</View>
      ) : notifications.length === 0 ? (
        <EmptyState icon={<Bell size={40} color="#9ca3af" />} title="No notifications" description="You're all caught up!" />
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={n => n.id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3b82f6" />}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => handleTap(item)}
              onLongPress={() => handleDelete(item.id)}
              className={`px-4 py-3 border-b border-border/50 ${item.is_read ? 'bg-white' : 'bg-primary-muted/30'}`}
            >
              <Text className="text-sm font-medium text-foreground">{item.title}</Text>
              <Text className="text-xs text-muted-foreground mt-0.5">{item.message}</Text>
              <Text className="text-xs text-muted-foreground mt-1">{formatDate(item.created_at)}</Text>
            </Pressable>
          )}
        />
      )}
    </SafeAreaView>
  );
}
