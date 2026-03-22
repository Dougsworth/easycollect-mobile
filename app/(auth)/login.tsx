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
import { ArrowLeft, Eye, EyeOff } from 'lucide-react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { useAuth } from '@/contexts/AuthContext';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function LoginScreen() {
  const { signIn, signInWithGoogle } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
  const coinFontSize = isSmallScreen ? 24 : 30;
  const coinSize = coinFontSize * 0.78;

  const handleLogin = async () => {
    setError('');
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    setLoading(true);
    try {
      const { error: authError } = await signIn(email.trim(), password);
      if (authError) {
        setError(authError);
      }
    } catch (err: any) {
      setError(err.message ?? 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
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
                  <Text style={styles.heading}>Welcome <Text style={styles.headingAccent}>back</Text></Text>
                  <Text style={styles.subheading}>Sign in to your account</Text>
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
                      autoComplete="email"
                    />
                  </View>
                </View>

                {/* Password Input */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.inputLabel}>Password</Text>
                  <View style={styles.inputBox}>
                    <TextInput
                      style={[styles.textInput, { paddingRight: 48 }]}
                      placeholder="Enter your password"
                      placeholderTextColor="rgba(255,255,255,0.35)"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!showPassword}
                      autoComplete="password"
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

                <Link href="/(auth)/forgot-password" asChild>
                  <Pressable style={styles.forgotPassword}>
                    <Text style={styles.forgotPasswordText}>Forgot password?</Text>
                  </Pressable>
                </Link>

                {/* Sign In Button */}
                <TouchableOpacity
                  onPress={handleLogin}
                  disabled={loading}
                  activeOpacity={0.85}
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: 16,
                    height: 58,
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: loading ? 0.6 : 1,
                  }}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#0f172a" />
                  ) : (
                    <Text style={{ color: '#0f172a', fontSize: 18, fontWeight: '800' }}>Sign In</Text>
                  )}
                </TouchableOpacity>

                {/* Divider */}
                <View style={styles.divider}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>or</Text>
                  <View style={styles.dividerLine} />
                </View>

                {/* Google Sign In */}
                <TouchableOpacity
                  onPress={async () => {
                    const { error: gError } = await signInWithGoogle();
                    if (gError) setError(gError);
                  }}
                  activeOpacity={0.85}
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.12)',
                    borderRadius: 16,
                    height: 58,
                    borderWidth: 2,
                    borderColor: 'rgba(255,255,255,0.5)',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text style={{ color: '#ffffff', fontSize: 17, fontWeight: '600' }}>Continue with Google</Text>
                </TouchableOpacity>

                <View style={[styles.footerRow, { paddingBottom: insets.bottom + 16 }]}>
                  <Text style={styles.footerText}>Don't have an account? </Text>
                  <Link href="/(auth)/signup" asChild>
                    <Pressable>
                      <Text style={styles.footerLink}>Sign up</Text>
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
    alignItems: 'center',
    marginBottom: 32,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  brandText: {
    color: '#ffffff',
    fontWeight: '800',
    letterSpacing: -0.5,
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
    fontSize: 16,
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
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 28,
    marginTop: -4,
  },
  forgotPasswordText: {
    color: '#60a5fa',
    fontSize: 14,
    fontWeight: '600',
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
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  dividerText: {
    marginHorizontal: 16,
    color: 'rgba(255,255,255,0.35)',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  outlineButton: {
    borderRadius: 14,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(96,165,250,0.35)',
    backgroundColor: 'rgba(96,165,250,0.08)',
  },
  outlineButtonPressed: {
    backgroundColor: 'rgba(96,165,250,0.15)',
  },
  outlineButtonText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '600',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 32,
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
