import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import colors from '../../../shared/theme/colors';
import Icon from '../../../shared/components/Icon';

const ForgotPasswordScreen = () => {
  const [email, setEmail] = useState('');
  const [focused, setFocused] = useState(false);
  const navigation = useNavigation();

  const handleReset = () => {
    if (!email) { Alert.alert('Hata', 'Lütfen e-posta adresinizi giriniz.'); return; }
    if (!email.includes('@')) { Alert.alert('Hata', 'Geçerli bir e-posta adresi giriniz.'); return; }
    Alert.alert('Başarılı', 'Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.', [
      { text: 'Tamam', onPress: () => navigation.goBack() },
    ]);
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      {/* Background */}
      <LinearGradient
        colors={['#0D47A1', '#1565C0', '#1976D2', '#42A5F5']}
        locations={[0, 0.35, 0.7, 1]}
        style={StyleSheet.absoluteFillObject}
      />
      <View style={[styles.decor, { width: 280, height: 280, top: -70, right: -100, backgroundColor: 'rgba(255,255,255,0.06)' }]} />
      <View style={[styles.decor, { width: 140, height: 140, top: 100, left: -60, backgroundColor: 'rgba(255,255,255,0.04)' }]} />
      <View style={[styles.decor, { width: 80, height: 80, top: 200, right: 40, backgroundColor: 'rgba(229,62,62,0.08)' }]} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <View style={styles.backIconWrap}>
            <Icon name="chevronLeft" size={20} color="#fff" />
          </View>
          <Text style={styles.backText}>Geri Dön</Text>
        </TouchableOpacity>

        <View style={styles.headerContent}>
          <View style={styles.headerIconWrap}>
            <Icon name="lock" size={26} color="#fff" />
          </View>
          <View style={styles.badgeRow}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Şifre Sıfırlama</Text>
            </View>
          </View>
          <Text style={styles.headerTitle}>Şifremi Unuttum</Text>
          <Text style={styles.headerSub}>E-posta adresinize sıfırlama bağlantısı gönderelim.</Text>
        </View>
      </View>

      {/* Form card */}
      <View style={styles.formCard}>
        <View style={styles.pullHandle} />

        <View style={styles.inputContainer}>
          <Text style={styles.label}>E-POSTA ADRESİ</Text>
          <View style={[styles.inputWrapper, focused && styles.inputWrapperFocused]}>
            <View style={[styles.inputIconBg, focused && styles.inputIconBgFocused]}>
              <Icon name="mail" size={16} color={focused ? '#fff' : colors.info} />
            </View>
            <TextInput
              style={styles.input}
              placeholder="ornek@email.com"
              placeholderTextColor={colors.textMuted}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
            />
          </View>
        </View>

        <View style={styles.infoBox}>
          <Icon name="info" size={16} color={colors.info} />
          <Text style={styles.infoText}>
            Kayıtlı e-posta adresinize şifre sıfırlama bağlantısı gönderilecektir.
          </Text>
        </View>

        <TouchableOpacity onPress={handleReset} activeOpacity={0.85}>
          <LinearGradient
            colors={['#0D47A1', '#1565C0', '#42A5F5']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.submitButton}
          >
            <Text style={styles.submitText}>Bağlantı Gönder</Text>
            <View style={styles.submitArrow}>
              <Icon name="chevronRight" size={18} color="#fff" />
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  decor: { position: 'absolute', borderRadius: 999 },
  header: { paddingBottom: 20 },
  backButton: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 18, paddingTop: 52, paddingBottom: 12, gap: 6,
  },
  backIconWrap: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center', justifyContent: 'center',
  },
  backText: { color: 'rgba(255,255,255,0.85)', fontSize: 15, fontWeight: '600' },
  headerContent: { paddingHorizontal: 22 },
  headerIconWrap: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#fff', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 8,
  },
  badgeRow: { flexDirection: 'row', marginBottom: 10 },
  badge: {
    backgroundColor: 'rgba(255,255,255,0.22)',
    paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20,
  },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '800' },
  headerTitle: { fontSize: 28, fontWeight: '800', color: '#fff', marginBottom: 4 },
  headerSub: { fontSize: 13, color: 'rgba(255,255,255,0.7)' },
  formCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderTopLeftRadius: 30, borderTopRightRadius: 30,
    paddingHorizontal: 22, paddingTop: 14,
    elevation: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.12, shadowRadius: 16,
  },
  pullHandle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: colors.border, alignSelf: 'center', marginBottom: 24,
  },
  inputContainer: { marginBottom: 16 },
  label: { fontSize: 11, fontWeight: '800', color: colors.textSecondary, marginBottom: 7, letterSpacing: 0.8 },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1.5, borderColor: colors.border,
    borderRadius: 12, overflow: 'hidden',
    backgroundColor: colors.surface,
  },
  inputWrapperFocused: { borderColor: colors.info, backgroundColor: '#fff' },
  inputIconBg: {
    width: 42, height: 46,
    backgroundColor: '#EBF4FF',
    alignItems: 'center', justifyContent: 'center',
  },
  inputIconBgFocused: { backgroundColor: colors.info },
  input: { flex: 1, paddingHorizontal: 12, paddingVertical: 12, fontSize: 14, color: colors.textPrimary },
  infoBox: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    backgroundColor: '#EBF4FF', borderRadius: 10, padding: 12, marginBottom: 24,
  },
  infoText: { flex: 1, fontSize: 13, color: colors.info, lineHeight: 19 },
  submitButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 15, borderRadius: 12,
    elevation: 6, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8,
  },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '800', letterSpacing: 0.5 },
  submitArrow: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center', marginLeft: 10,
  },
});

export default ForgotPasswordScreen;
