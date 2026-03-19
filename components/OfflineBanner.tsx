import { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { WifiOff } from 'lucide-react-native';

export function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOffline(!state.isConnected);
    });
    return () => unsubscribe();
  }, []);

  if (!isOffline) return null;

  return (
    <View className="bg-destructive flex-row items-center justify-center py-2 px-4 gap-2">
      <WifiOff size={14} color="#fff" />
      <Text className="text-white text-xs font-medium">No internet connection</Text>
    </View>
  );
}
