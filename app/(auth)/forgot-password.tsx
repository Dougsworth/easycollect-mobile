import { useState } from 'react';
import { View, Text, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Check } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { Button, Input } from '@/components/ui';
import { PageHeader } from '@/components/PageHeader';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleReset = async () => {
    setError('');
    if (!email) {
      setError('Please enter your email.');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: 'easycollect://reset-password',
    });
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      setSent(true);
    }
  };

  if (sent) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 items-center justify-center px-8">
          <View className="h-16 w-16 rounded-full bg-success-muted items-center justify-center mb-4">
            <Check size={32} color="#10b981" />
          </View>
          <Text className="text-2xl font-bold text-foreground text-center">Check your email</Text>
          <Text className="text-base text-muted-foreground text-center mt-2">
            If an account exists for {email}, you'll receive a password reset link.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <PageHeader title="Reset Password" showBack />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        <ScrollView className="flex-1 px-6" keyboardShouldPersistTaps="handled">
          <Text className="text-muted-foreground mt-2 mb-6">
            Enter the email address associated with your account and we'll send you a link to reset your password.
          </Text>

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
          />

          <Button onPress={handleReset} loading={loading} className="mt-2">
            Send Reset Link
          </Button>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
