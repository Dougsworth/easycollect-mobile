import { useState } from 'react';
import { View, Text, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '@/lib/supabase';
import { Button, Input } from '@/components/ui';
import { PageHeader } from '@/components/PageHeader';
import { getPasswordStrength } from '@/shared/schemas/auth';
import { ProgressBar } from '@/components/ui';
import { Check, X } from 'lucide-react-native';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const strength = getPasswordStrength(password);

  const handleUpdate = async () => {
    setError('');
    if (strength.score < 5) {
      setError('Please meet all password requirements.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      router.replace('/(auth)/login');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <PageHeader title="New Password" showBack />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        <ScrollView className="flex-1 px-6" keyboardShouldPersistTaps="handled">
          {error ? (
            <View className="bg-destructive-muted rounded-xl p-3 mb-4">
              <Text className="text-destructive text-sm">{error}</Text>
            </View>
          ) : null}

          <Input
            label="New Password"
            placeholder="Enter new password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          {password.length > 0 && (
            <View className="mb-4 -mt-2">
              <ProgressBar progress={(strength.score / 5) * 100} color={strength.score <= 2 ? 'destructive' : strength.score <= 3 ? 'warning' : 'success'} />
              <View className="mt-2 gap-1">
                {Object.entries({
                  'At least 8 characters': strength.checks.minLength,
                  'Uppercase letter': strength.checks.hasUppercase,
                  'Lowercase letter': strength.checks.hasLowercase,
                  'Number': strength.checks.hasNumber,
                  'Special character': strength.checks.hasSpecial,
                }).map(([label, met]) => (
                  <View key={label} className="flex-row items-center gap-2">
                    {met ? <Check size={14} color="#10b981" /> : <X size={14} color="#9ca3af" />}
                    <Text className={`text-xs ${met ? 'text-success' : 'text-muted-foreground'}`}>{label}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          <Input
            label="Confirm Password"
            placeholder="Re-enter password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            error={confirmPassword && password !== confirmPassword ? 'Passwords do not match' : undefined}
          />

          <Button onPress={handleUpdate} loading={loading} className="mt-2">
            Update Password
          </Button>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
