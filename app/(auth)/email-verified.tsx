import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Check } from 'lucide-react-native';
import { Button } from '@/components/ui';

export default function EmailVerifiedScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 items-center justify-center px-8">
        <View className="h-20 w-20 rounded-full bg-success-muted items-center justify-center mb-6">
          <Check size={40} color="#10b981" />
        </View>
        <Text className="text-2xl font-bold text-foreground text-center">Email Verified!</Text>
        <Text className="text-base text-muted-foreground text-center mt-2">
          Your email has been verified successfully. You can now sign in to your account.
        </Text>
        <Button onPress={() => router.replace('/(auth)/login')} className="mt-8 w-full">
          Sign In
        </Button>
      </View>
    </SafeAreaView>
  );
}
