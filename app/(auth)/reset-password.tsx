import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Pressable,
  TouchableOpacity,
  Animated,
  ImageBackground,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Lock, Check, X, Eye, EyeOff } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { ProgressBar } from '@/components/ui';
import { getPasswordStrength } from '@/shared/schemas/auth';

const strengthColors = {
  0: 'destructive' as const,
  1: 'destructive' as const,
  2: 'warning' as const,
  3: 'warning' as const,
  4: 'success' as const,
  5: 'success' as const,
};

export default function ResetPasswordScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();
  }, []);

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
    <View style={styles.container}>
      <ImageBackground
        source={require('@/assets/building.png')}
        style={styles.background}
        resizeMode="cover"
      >
        <LinearGradient
          colors={['rgba(15,23,42,0.7)', 'rgba(15,23,42,0.88)', 'rgba(15,23,42,0.97)']}
          locations={[0, 0.3, 0.55]}
          style={styles.gradient}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.flex}
          >
            <ScrollView
              style={styles.flex}
              contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 10 }]}
              keyboardShouldPersistTaps="handled"
            >
              <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
                {/* Back button */}
                <Pressable
                  onPress={() => router.back()}
                  style={({ pressed }) => [styles.backButton, pressed && { opacity: 0.7 }]}
                >
                  <ArrowLeft size={20} color="#ffffff" />
                </Pressable>

                {/* Header */}
                <View style={styles.headerContainer}>
                  <View style={styles.iconBox}>
                    <Lock size={28} color="#60a5fa" />
                  </View>
                  <Text style={styles.heading}>New <Text style={styles.headingAccent}>password</Text></Text>
                  <Text style={styles.subheading}>Create a strong password for your account</Text>
                </View>

                {error ? (
                  <View style={styles.errorBox}>
                    <Text style={styles.errorText}>{error}</Text>
                  </View>
                ) : null}

                {/* New Password */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.inputLabel}>New Password</Text>
                  <View style={styles.inputBox}>
                    <TextInput
                      style={[styles.textInput, { paddingRight: 48 }]}
                      placeholder="Enter new password"
                      placeholderTextColor="rgba(255,255,255,0.35)"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!showPassword}
                    />
                    <Pressable
                      onPress={() => setShowPassword(!showPassword)}
                      style={styles.eyeButton}
                      hitSlop={8}
                    >
                      {showPassword ? (
                        <EyeOff size={18} color="rgba(255,255,255,0.5)" />
                      ) : (
                        <Eye size={18} color="rgba(255,255,255,0.5)" />
                      )}
                    </Pressable>
                  </View>
                </View>

                {/* Password Strength */}
                {password.length > 0 && (
                  <View style={styles.strengthCard}>
                    <View style={styles.strengthHeader}>
                      <Text style={styles.strengthLabel}>Strength</Text>
                      <Text style={[
                        styles.strengthValue,
                        { color: strength.score <= 2 ? '#fca5a5' : strength.score <= 3 ? '#fcd34d' : '#6ee7b7' },
                      ]}>
                        {strength.label}
                      </Text>
                    </View>
                    <ProgressBar progress={(strength.score / 5) * 100} color={strengthColors[strength.score as keyof typeof strengthColors]} />
                    <View style={styles.checksContainer}>
                      {Object.entries({
                        'At least 8 characters': strength.checks.minLength,
                        'Uppercase letter': strength.checks.hasUppercase,
                        'Lowercase letter': strength.checks.hasLowercase,
                        'Number': strength.checks.hasNumber,
                        'Special character': strength.checks.hasSpecial,
                      }).map(([label, met]) => (
                        <View key={label} style={checkStyles.row}>
                          {met ? (
                            <View style={[checkStyles.icon, { backgroundColor: '#10b981' }]}>
                              <Check size={12} color="#fff" />
                            </View>
                          ) : (
                            <View style={[checkStyles.icon, { backgroundColor: 'rgba(255,255,255,0.15)' }]}>
                              <X size={12} color="rgba(255,255,255,0.4)" />
                            </View>
                          )}
                          <Text style={[checkStyles.text, met && { color: 'rgba(255,255,255,0.9)', fontWeight: '500' }]}>
                            {label}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                {/* Confirm Password */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.inputLabel}>Confirm Password</Text>
                  <View style={[
                    styles.inputBox,
                    confirmPassword && password !== confirmPassword && styles.inputBoxError,
                  ]}>
                    <TextInput
                      style={[styles.textInput, { paddingRight: 48 }]}
                      placeholder="Re-enter password"
                      placeholderTextColor="rgba(255,255,255,0.35)"
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      secureTextEntry={!showConfirm}
                    />
                    <Pressable
                      onPress={() => setShowConfirm(!showConfirm)}
                      style={styles.eyeButton}
                      hitSlop={8}
                    >
                      {showConfirm ? (
                        <EyeOff size={18} color="rgba(255,255,255,0.5)" />
                      ) : (
                        <Eye size={18} color="rgba(255,255,255,0.5)" />
                      )}
                    </Pressable>
                  </View>
                  {confirmPassword && password !== confirmPassword ? (
                    <Text style={styles.fieldError}>Passwords do not match</Text>
                  ) : null}
                </View>

                {/* Update Password Button */}
                <TouchableOpacity
                  onPress={handleUpdate}
                  disabled={loading}
                  activeOpacity={0.85}
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: 16,
                    height: 58,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginTop: 8,
                    opacity: loading ? 0.6 : 1,
                  }}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#0f172a" />
                  ) : (
                    <Text style={{ color: '#0f172a', fontSize: 18, fontWeight: '800' }}>Update Password</Text>
                  )}
                </TouchableOpacity>
              </Animated.View>
            </ScrollView>
          </KeyboardAvoidingView>
        </LinearGradient>
      </ImageBackground>
    </View>
  );
}

const checkStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  icon: {
    height: 20,
    width: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 14,
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  gradient: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  backButton: {
    height: 40,
    width: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  headerContainer: {
    marginBottom: 28,
  },
  iconBox: {
    height: 56,
    width: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(96,165,250,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  heading: {
    fontSize: 28,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: -0.5,
  },
  headingAccent: {
    color: '#60a5fa',
  },
  subheading: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 6,
  },
  errorBox: {
    backgroundColor: 'rgba(239,68,68,0.15)',
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.3)',
  },
  errorText: {
    color: '#fca5a5',
    fontSize: 14,
    fontWeight: '500',
  },
  fieldGroup: {
    marginBottom: 18,
  },
  inputLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputBox: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(96,165,250,0.15)',
  },
  inputBoxError: {
    borderColor: 'rgba(239,68,68,0.5)',
  },
  textInput: {
    height: 52,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#ffffff',
  },
  eyeButton: {
    position: 'absolute',
    right: 14,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  fieldError: {
    color: '#fca5a5',
    fontSize: 13,
    marginTop: 6,
  },
  strengthCard: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 14,
    padding: 16,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  strengthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  strengthLabel: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  strengthValue: {
    fontSize: 12,
    fontWeight: '700',
  },
  checksContainer: {
    marginTop: 12,
    gap: 8,
  },
});
