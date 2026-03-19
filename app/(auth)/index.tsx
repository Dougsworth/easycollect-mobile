import { View, Text } from 'react-native';
import { Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BrandLogo } from '@/components/BrandLogo';
import { Button } from '@/components/ui';

export default function LandingScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 items-center justify-center px-8">
        <BrandLogo size="lg" />
        <Text className="text-3xl font-bold text-foreground mt-6">EasyCollect</Text>
        <Text className="text-base text-muted-foreground text-center mt-2">
          Simplify rent collection for landlords and tenants in Jamaica
        </Text>
      </View>

      <View className="px-8 pb-8 gap-3">
        <Link href="/(auth)/login" asChild>
          <Button>Sign In</Button>
        </Link>
        <Link href="/(auth)/signup" asChild>
          <Button variant="outline">Create Account</Button>
        </Link>
      </View>
    </SafeAreaView>
  );
}
