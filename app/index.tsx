import { Redirect } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';

export default function Index() {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  if (!user) {
    return <Redirect href="/(auth)" />;
  }

  if (profile?.role === 'tenant') {
    return <Redirect href="/(tenant)" />;
  }

  return <Redirect href="/(landlord)/(dashboard)" />;
}
