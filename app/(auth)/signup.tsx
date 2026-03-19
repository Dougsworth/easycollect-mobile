import { useState } from 'react';
import { View, Text, KeyboardAvoidingView, Platform, ScrollView, Pressable } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Check, X } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { Button, Input } from '@/components/ui';
import { PageHeader } from '@/components/PageHeader';
import { getPasswordStrength } from '@/shared/schemas/auth';
import { ProgressBar } from '@/components/ui';

const strengthColors = {
  0: 'destructive' as const,
  1: 'destructive' as const,
  2: 'warning' as const,
  3: 'warning' as const,
  4: 'success' as const,
  5: 'success' as const,
};

export default function SignupScreen() {
  const { signUp } = useAuth();
  const router = useRouter();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const strength = getPasswordStrength(password);

  const handleSignup = async () => {
    setError('');
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }
    if (strength.score < 5) {
      setError('Please meet all password requirements.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    const { error: authError } = await signUp(email.trim(), password, {
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      role: 'landlord',
    });
    setLoading(false);

    if (authError) {
      setError(authError);
    } else {
      setSuccess(true);
    }
  };

  if (success) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 items-center justify-center px-8">
          <View className="h-16 w-16 rounded-full bg-success-muted items-center justify-center mb-4">
            <Check size={32} color="#10b981" />
          </View>
          <Text className="text-2xl font-bold text-foreground text-center">Check your email</Text>
          <Text className="text-base text-muted-foreground text-center mt-2">
            We sent a verification link to {email}. Please verify your email to continue.
          </Text>
          <Button onPress={() => router.replace('/(auth)/login')} className="mt-8">
            Back to Sign In
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <PageHeader title="Create Account" showBack />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView className="flex-1 px-6" keyboardShouldPersistTaps="handled">
          <View className="mt-4">
            {error ? (
              <View className="bg-destructive-muted rounded-xl p-3 mb-4">
                <Text className="text-destructive text-sm">{error}</Text>
              </View>
            ) : null}

            <View className="flex-row gap-3">
              <View className="flex-1">
                <Input label="First Name" value={firstName} onChangeText={setFirstName} placeholder="John" />
              </View>
              <View className="flex-1">
                <Input label="Last Name" value={lastName} onChangeText={setLastName} placeholder="Doe" />
              </View>
            </View>

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
              placeholder="Create a strong password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            {password.length > 0 && (
              <View className="mb-4 -mt-2">
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-xs text-muted-foreground">Password strength</Text>
                  <Text className={`text-xs font-semibold ${
                    strength.score <= 2 ? 'text-destructive' : strength.score <= 3 ? 'text-warning' : 'text-success'
                  }`}>
                    {strength.label}
                  </Text>
                </View>
                <ProgressBar progress={(strength.score / 5) * 100} color={strengthColors[strength.score as keyof typeof strengthColors]} />
                <View className="mt-2 gap-1">
                  <PasswordCheck label="At least 8 characters" met={strength.checks.minLength} />
                  <PasswordCheck label="Uppercase letter" met={strength.checks.hasUppercase} />
                  <PasswordCheck label="Lowercase letter" met={strength.checks.hasLowercase} />
                  <PasswordCheck label="Number" met={strength.checks.hasNumber} />
                  <PasswordCheck label="Special character (!@#$...)" met={strength.checks.hasSpecial} />
                </View>
              </View>
            )}

            <Input
              label="Confirm Password"
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              error={confirmPassword && password !== confirmPassword ? 'Passwords do not match' : undefined}
            />

            <Button onPress={handleSignup} loading={loading} className="mt-2">
              Create Account
            </Button>

            <View className="flex-row items-center justify-center mt-6 mb-8">
              <Text className="text-sm text-muted-foreground">Already have an account? </Text>
              <Link href="/(auth)/login" asChild>
                <Pressable>
                  <Text className="text-sm font-semibold text-primary">Sign in</Text>
                </Pressable>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function PasswordCheck({ label, met }: { label: string; met: boolean }) {
  return (
    <View className="flex-row items-center gap-2">
      {met ? (
        <Check size={14} color="#10b981" />
      ) : (
        <X size={14} color="#9ca3af" />
      )}
      <Text className={`text-xs ${met ? 'text-success' : 'text-muted-foreground'}`}>{label}</Text>
    </View>
  );
}
