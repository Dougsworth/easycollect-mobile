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
import { ArrowLeft, Check, Mail } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();
  }, []);

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
      <View style={styles.container}>
        <ImageBackground
          source={require('@/assets/building.png')}
          style={styles.background}
          resizeMode="cover"
        >
          <LinearGradient
            colors={['rgba(15,23,42,0.8)', 'rgba(15,23,42,0.95)']}
            style={styles.successGradient}
          >
            <View style={styles.successIcon}>
              <Check size={40} color="#10b981" />
            </View>
            <Text style={styles.successTitle}>Check your email</Text>
            <Text style={styles.successSubtext}>
              If an account exists for{'\n'}
              <Text style={{ fontWeight: '700', color: '#ffffff' }}>{email}</Text>
              {'\n'}you'll receive a password reset link.
            </Text>
            <TouchableOpacity
              onPress={() => router.replace('/(auth)/login')}
              activeOpacity={0.85}
              style={{
                backgroundColor: '#ffffff',
                borderRadius: 16,
                height: 58,
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: 32,
                width: '100%',
              }}
            >
              <Text style={{ color: '#0f172a', fontSize: 18, fontWeight: '800' }}>Back to Sign In</Text>
            </TouchableOpacity>
          </LinearGradient>
        </ImageBackground>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('@/assets/building.png')}
        style={styles.background}
        resizeMode="cover"
      >
        <LinearGradient
          colors={['rgba(15,23,42,0.7)', 'rgba(15,23,42,0.88)', 'rgba(15,23,42,0.97)']}
          locations={[0, 0.35, 0.65]}
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
                    <Mail size={28} color="#60a5fa" />
                  </View>
                  <Text style={styles.heading}>Reset <Text style={styles.headingAccent}>password</Text></Text>
                  <Text style={styles.subheading}>
                    Enter the email address associated with your account and we'll send you a link to reset your password.
                  </Text>
                </View>

                {error ? (
                  <View style={styles.errorBox}>
                    <Text style={styles.errorText}>{error}</Text>
                  </View>
                ) : null}

                {/* Email Input */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.inputLabel}>Email</Text>
                  <View style={styles.inputBox}>
                    <TextInput
                      style={styles.textInput}
                      placeholder="you@example.com"
                      placeholderTextColor="rgba(255,255,255,0.35)"
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  </View>
                </View>

                {/* Send Reset Link Button */}
                <TouchableOpacity
                  onPress={handleReset}
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
                    <Text style={{ color: '#0f172a', fontSize: 18, fontWeight: '800' }}>Send Reset Link</Text>
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
  successGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
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
    marginBottom: 32,
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
    marginTop: 8,
    lineHeight: 22,
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
  textInput: {
    height: 52,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#ffffff',
  },
  successIcon: {
    height: 80,
    width: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(16,185,129,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#ffffff',
    textAlign: 'center',
  },
  successSubtext: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 24,
  },
});
