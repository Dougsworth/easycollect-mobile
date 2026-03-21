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
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Check, X, Eye, EyeOff } from 'lucide-react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { useAuth } from '@/contexts/AuthContext';
import { ProgressBar } from '@/components/ui';
import { getPasswordStrength } from '@/shared/schemas/auth';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

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
  const insets = useSafeAreaInsets();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  const coinLetterOpacity = useRef(new Animated.Value(1)).current;
  const coinIconOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();

    const animate = () => {
      Animated.parallel([
        Animated.timing(coinLetterOpacity, { toValue: 0, duration: 500, useNativeDriver: true }),
        Animated.timing(coinIconOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
      ]).start(() => {
        setTimeout(() => {
          Animated.parallel([
            Animated.timing(coinLetterOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
            Animated.timing(coinIconOpacity, { toValue: 0, duration: 500, useNativeDriver: true }),
          ]).start();
        }, 2000);
      });
    };
    const interval = setInterval(animate, 6000);
    return () => clearInterval(interval);
  }, []);

  const isSmallScreen = SCREEN_HEIGHT < 700;
  const coinFontSize = isSmallScreen ? 22 : 26;
  const coinSize = coinFontSize * 0.78;

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
              We sent a verification link to{'\n'}
              <Text style={{ fontWeight: '700', color: '#ffffff' }}>{email}</Text>
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

                {/* Logo + Header */}
                <View style={styles.headerContainer}>
                  <View style={styles.brandRow}>
                    <Text style={[styles.brandText, { fontSize: coinFontSize }]}>EasyC</Text>
                    <View style={{ width: coinSize, height: coinFontSize, justifyContent: 'center', alignItems: 'center' }}>
                      <Animated.Text style={[styles.brandText, { fontSize: coinFontSize, opacity: coinLetterOpacity, position: 'absolute' }]}>
                        o
                      </Animated.Text>
                      <Animated.View style={{ opacity: coinIconOpacity, position: 'absolute' }}>
                        <Svg width={coinSize} height={coinSize} viewBox="0 0 100 100" fill="none">
                          <Circle cx="50" cy="50" r="44" stroke="#ffffff" strokeWidth="6" />
                          <Path
                            d="M50 24v4m0 44v4M39 57c0 5 4.9 9 11 9s11-4 11-9-4.9-7.5-11-7.5S39 45 39 40s4.9-9 11-9 11 4 11 9"
                            stroke="#ffffff"
                            strokeWidth="6"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </Svg>
                      </Animated.View>
                    </View>
                    <Text style={[styles.brandText, { fontSize: coinFontSize }]}>llect</Text>
                  </View>
                  <Text style={styles.heading}>Create your <Text style={styles.headingAccent}>account</Text></Text>
                  <Text style={styles.subheading}>Start managing your properties today</Text>
                </View>

                {error ? (
                  <View style={styles.errorBox}>
                    <Text style={styles.errorText}>{error}</Text>
                  </View>
                ) : null}

                {/* Name Row */}
                <View style={styles.nameRow}>
                  <View style={styles.nameField}>
                    <Text style={styles.inputLabel}>First Name</Text>
                    <View style={styles.inputBox}>
                      <TextInput
                        style={styles.textInput}
                        placeholder="John"
                        placeholderTextColor="rgba(255,255,255,0.35)"
                        value={firstName}
                        onChangeText={setFirstName}
                      />
                    </View>
                  </View>
                  <View style={styles.nameField}>
                    <Text style={styles.inputLabel}>Last Name</Text>
                    <View style={styles.inputBox}>
                      <TextInput
                        style={styles.textInput}
                        placeholder="Doe"
                        placeholderTextColor="rgba(255,255,255,0.35)"
                        value={lastName}
                        onChangeText={setLastName}
                      />
                    </View>
                  </View>
                </View>

                {/* Email */}
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
                      autoComplete="email"
                    />
                  </View>
                </View>

                {/* Password */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.inputLabel}>Password</Text>
                  <View style={styles.inputBox}>
                    <TextInput
                      style={[styles.textInput, { paddingRight: 48 }]}
                      placeholder="Create a strong password"
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
                      <Text style={styles.strengthLabel}>Password strength</Text>
                      <Text style={[
                        styles.strengthValue,
                        { color: strength.score <= 2 ? '#fca5a5' : strength.score <= 3 ? '#fcd34d' : '#6ee7b7' },
                      ]}>
                        {strength.label}
                      </Text>
                    </View>
                    <ProgressBar progress={(strength.score / 5) * 100} color={strengthColors[strength.score as keyof typeof strengthColors]} />
                    <View style={styles.checksContainer}>
                      <PasswordCheck label="At least 8 characters" met={strength.checks.minLength} />
                      <PasswordCheck label="Uppercase letter" met={strength.checks.hasUppercase} />
                      <PasswordCheck label="Lowercase letter" met={strength.checks.hasLowercase} />
                      <PasswordCheck label="Number" met={strength.checks.hasNumber} />
                      <PasswordCheck label="Special character (!@#$...)" met={strength.checks.hasSpecial} />
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
                      placeholder="Re-enter your password"
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

                {/* Create Account Button */}
                <TouchableOpacity
                  onPress={handleSignup}
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
                    <Text style={{ color: '#0f172a', fontSize: 18, fontWeight: '800' }}>Create Account</Text>
                  )}
                </TouchableOpacity>

                <View style={[styles.footerRow, { paddingBottom: insets.bottom + 16 }]}>
                  <Text style={styles.footerText}>Already have an account? </Text>
                  <Link href="/(auth)/login" asChild>
                    <Pressable>
                      <Text style={styles.footerLink}>Sign in</Text>
                    </Pressable>
                  </Link>
                </View>
              </Animated.View>
            </ScrollView>
          </KeyboardAvoidingView>
        </LinearGradient>
      </ImageBackground>
    </View>
  );
}

function PasswordCheck({ label, met }: { label: string; met: boolean }) {
  return (
    <View style={checkStyles.row}>
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
    alignItems: 'center',
    marginBottom: 28,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  brandText: {
    color: '#ffffff',
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  heading: {
    fontSize: 26,
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
  nameRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 18,
  },
  nameField: {
    flex: 1,
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
  primaryButton: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#60a5fa',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  primaryButtonText: {
    color: '#0f172a',
    fontSize: 18,
    fontWeight: '700',
  },
  buttonPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.98 }],
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
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 28,
  },
  footerText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 14,
  },
  footerLink: {
    color: '#60a5fa',
    fontSize: 14,
    fontWeight: '700',
  },
});
