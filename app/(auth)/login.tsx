import { useState } from 'react';
import { View, Text, KeyboardAvoidingView, Platform, ScrollView, Pressable } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { Button, Input } from '@/components/ui';
import { PageHeader } from '@/components/PageHeader';

export default function LoginScreen() {
  const { signIn, signInWithGoogle } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError('');
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    setLoading(true);
    const { error: authError } = await signIn(email.trim(), password);
    setLoading(false);
    if (authError) {
      setError(authError);
    }
    // Auth state change will trigger redirect in root index
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <PageHeader title="Sign In" showBack />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView className="flex-1 px-6" keyboardShouldPersistTaps="handled">
          <View className="mt-6">
            {error ? (
              <View className="bg-destructive-muted rounded-xl p-3 mb-4">
                <Text className="text-destructive text-sm">{error}</Text>
              </View>
            ) : null}

            <Input
              label="Email"
              placeholder="you@example.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
            <Input
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="password"
            />

            <Button onPress={handleLogin} loading={loading} className="mt-2">
              Sign In
            </Button>

            {/* Divider */}
            <View className="flex-row items-center my-5">
              <View className="flex-1 h-px bg-border" />
              <Text className="mx-3 text-xs text-muted-foreground uppercase">or</Text>
              <View className="flex-1 h-px bg-border" />
            </View>

            {/* Google Sign In */}
            <Pressable
              onPress={async () => {
                const { error: gError } = await signInWithGoogle();
                if (gError) setError(gError);
              }}
              className="h-12 flex-row items-center justify-center rounded-xl border border-border bg-white"
              style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
            >
              <Text className="text-base font-medium text-foreground">Continue with Google</Text>
            </Pressable>

            <Link href="/(auth)/forgot-password" asChild>
              <Pressable className="mt-4 items-center">
                <Text className="text-sm text-primary">Forgot password?</Text>
              </Pressable>
            </Link>

            <View className="flex-row items-center justify-center mt-6">
              <Text className="text-sm text-muted-foreground">Don't have an account? </Text>
              <Link href="/(auth)/signup" asChild>
                <Pressable>
                  <Text className="text-sm font-semibold text-primary">Sign up</Text>
                </Pressable>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
