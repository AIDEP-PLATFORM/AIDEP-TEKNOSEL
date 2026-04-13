import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Image,
  Alert,
  ScrollView,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import colors from '../../../shared/theme/colors';
import Icon from '../../../shared/components/Icon';
import { useAuthStore } from '../../../core/stores/auth.store';

const { width, height } = Dimensions.get('window');

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const navigation = useNavigation<any>();
  const { login, loading } = useAuthStore();

  const handleLogin = async () => {
    setErrorMsg('');
    if (!email || !password) {
      setErrorMsg('E-posta ve şifre alanları boş bırakılamaz.');
      return;
    }
    if (!email.includes('@')) {
      setErrorMsg('Geçerli bir e-posta adresi giriniz.');
      return;
    }
    const err = await login(email.trim(), password);
    if (err) {
      setErrorMsg(err);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      {/* Full screen gradient background */}
      <LinearGradient
        colors={['#1976D2', '#42A5F5', '#64B5F6', '#90CAF9']}
        locations={[0, 0.35, 0.7, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Decorative background circles */}
      <View style={[styles.decorCircle, styles.decorCircle1]} />
      <View style={[styles.decorCircle, styles.decorCircle2]} />
      <View style={[styles.decorCircle, styles.decorCircle3]} />
      <View style={[styles.decorCircle, styles.decorCircle4]} />

      {/* Logo hero area */}
      <View style={styles.heroArea}>
        {/* Glow ring behind logo */}
        <View style={styles.logoGlowOuter}>
          <View style={styles.logoGlowInner}>
            <LinearGradient
              colors={['rgba(255,255,255,0.18)', 'rgba(255,255,255,0.06)']}
              style={styles.logoCircle}
            >
              <Image
                source={require('../../../../assets/logo.png')}
                style={styles.logo}
                resizeMode="contain"
              />
            </LinearGradient>
          </View>
        </View>

        <Text style={styles.appTitle}>AIDEP</Text>
        <View style={styles.titleUnderline} />
        <Text style={styles.appSubtitle}>Acil Durum İş Birliği Platformu</Text>

        {/* Emergency accent bar */}
        <View style={styles.accentBadge}>
          <View style={styles.accentDot} />
          <Text style={styles.accentBadgeText}>Acil Müdahale Sistemi</Text>
        </View>
      </View>

      {/* Floating white card at bottom */}
      <View style={styles.formCard}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}
        >
          {/* Card header */}
          <View style={styles.cardHeader}>
            <Text style={styles.title}>Hoş Geldiniz</Text>
            <Text style={styles.titleSub}>Hesabınıza giriş yapın</Text>
          </View>

          {/* Email input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>E-posta Adresi</Text>
            <View style={[styles.inputWrapper, emailFocused && styles.inputWrapperFocused]}>
              <View style={[styles.inputIconBg, emailFocused && styles.inputIconBgFocused]}>
                <Icon name="mail" size={16} color={emailFocused ? colors.white : colors.info} />
              </View>
              <TextInput
                style={styles.input}
                placeholder="ornek@email.com"
                placeholderTextColor={colors.textMuted}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
              />
            </View>
          </View>

          {/* Password input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Şifre</Text>
            <View style={[styles.inputWrapper, passwordFocused && styles.inputWrapperFocused]}>
              <View style={[styles.inputIconBg, passwordFocused && styles.inputIconBgFocused]}>
                <Icon name="lock" size={16} color={passwordFocused ? colors.white : colors.info} />
              </View>
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor={colors.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
              />
              <TouchableOpacity 
                style={styles.eyeBtn} 
                onPress={() => setShowPassword(!showPassword)}
                activeOpacity={0.6}
              >
                <Icon 
                  name={showPassword ? 'eye' : 'eyeOff'} 
                  size={18} 
                  color={passwordFocused ? colors.info : colors.textMuted} 
                />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={styles.forgotPassword}
            onPress={() => navigation.navigate('ForgotPassword')}
          >
            <Text style={styles.forgotPasswordText}>Şifremi Unuttum?</Text>
          </TouchableOpacity>

          {/* Hata mesajı */}
          {errorMsg ? (
            <View style={styles.errorBox}>
              <Icon name="alertTriangle" size={15} color={colors.emergency} />
              <Text style={styles.errorText}>{errorMsg}</Text>
            </View>
          ) : null}

          {/* Login button with gradient */}
          <TouchableOpacity onPress={handleLogin} activeOpacity={0.85} disabled={loading}>
            <LinearGradient
              colors={['#1565C0', '#1976D2', '#42A5F5']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.loginButton, loading && { opacity: 0.7 }]}
            >
              <Text style={styles.loginButtonText}>{loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}</Text>
              {!loading && (
                <View style={styles.loginButtonArrow}>
                  <Icon name="chevronRight" size={18} color={colors.white} />
                </View>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>veya</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Hesabınız yok mu? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('RoleSelect')}>
              <Text style={styles.linkText}>Hemen Kayıt Ol</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.navy,
  },
  heroArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 20,
    paddingBottom: 10,
  },
  logoGlowOuter: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    // Glow shadow
    shadowColor: '#4FC3F7',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 24,
    elevation: 16,
  },
  logoGlowInner: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoCircle: {
    width: 86,
    height: 86,
    borderRadius: 43,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 60,
    height: 60,
  },
  appTitle: {
    fontSize: 42,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 8,
    textShadowColor: 'rgba(79,195,247,0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },
  titleUnderline: {
    width: 48,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#4FC3F7',
    marginTop: 6,
    marginBottom: 10,
  },
  appSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.65)',
    letterSpacing: 0.5,
    marginBottom: 16,
  },
  accentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(229,62,62,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(229,62,62,0.4)',
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 6,
  },
  accentDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.emergency,
  },
  accentBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FC8181',
    letterSpacing: 0.5,
  },
  // Decorative circles
  decorCircle: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  decorCircle1: {
    width: 320,
    height: 320,
    top: -80,
    right: -100,
  },
  decorCircle2: {
    width: 200,
    height: 200,
    top: 60,
    left: -80,
    backgroundColor: 'rgba(229,62,62,0.06)',
  },
  decorCircle3: {
    width: 160,
    height: 160,
    bottom: 280,
    right: -50,
    backgroundColor: 'rgba(79,195,247,0.05)',
  },
  decorCircle4: {
    width: 80,
    height: 80,
    bottom: 320,
    left: 30,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  // Form card
  formCard: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 28,
    paddingTop: 8,
    maxHeight: height * 0.62,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 20,
  },
  scrollContent: {
    paddingTop: 8,
    paddingBottom: 32,
  },
  // Drag handle
  cardHeader: {
    marginBottom: 24,
    paddingTop: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  titleSub: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  // Inputs
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 14,
    backgroundColor: colors.surface,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  inputWrapperFocused: {
    borderColor: colors.info,
    shadowColor: colors.info,
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  inputIconBg: {
    width: 44,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EBF4FF',
  },
  inputIconBgFocused: {
    backgroundColor: colors.info,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 12,
    fontSize: 15,
    color: colors.textPrimary,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 20,
    marginTop: 2,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: '#FFF5F5',
    borderWidth: 1,
    borderColor: '#FED7D7',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  errorText: {
    flex: 1,
    color: colors.emergency,
    fontSize: 13,
    fontWeight: '500',
  },
  forgotPasswordText: {
    color: colors.info,
    fontWeight: '700',
    fontSize: 13,
  },
  // Login button
  loginButton: {
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    shadowColor: colors.navy,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  loginButtonArrow: {
    marginLeft: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Divider
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    fontSize: 13,
    color: colors.textMuted,
    fontWeight: '500',
  },
  // Footer
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    color: colors.textSecondary,
    fontSize: 15,
  },
  linkText: {
    color: colors.info,
    fontSize: 15,
    fontWeight: '800',
  },
  eyeBtn: {
    paddingHorizontal: 15,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default LoginScreen;
