import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Modal,
  FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import colors from '../../../shared/theme/colors';
import Icon from '../../../shared/components/Icon';
import { useAuthStore } from '../../../core/stores/auth.store';
import { showToast } from '../../../shared/components/Toast';

const roleConfig: Record<string, {
  title: string;
  gradient: [string, string, string];
  iconName: 'user' | 'mapPin' | 'shield';
  tag: string;
}> = {
  normal:  { title: 'Normal Kullanıcı',      gradient: ['#1565C0', '#1976D2', '#42A5F5'], iconName: 'user',    tag: 'Vatandaş' },
  stk:     { title: 'STK Gönüllü Kullanıcı', gradient: ['#1B5E20', '#2E7D32', '#43A047'], iconName: 'mapPin',  tag: 'Gönüllü'  },
  yetkili: { title: 'Yetkili Kullanıcı',      gradient: ['#4A148C', '#7B1FA2', '#AB47BC'], iconName: 'shield',  tag: 'Kurum'    },
};

const countryCodes = [
  { code: '+90', name: 'Türkiye', length: 10 },
  { code: '+1',  name: 'USA',     length: 10 },
  { code: '+44', name: 'UK',      length: 10 },
  { code: '+49', name: 'Germany', length: 11 },
  { code: '+33', name: 'France',  length: 9 },
  { code: '+39', name: 'Italy',   length: 10 },
  { code: '+7',  name: 'Russia',  length: 10 },
];

const RegisterScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { register } = useAuthStore();
  const role: string = route.params?.role ?? 'normal';
  const cfg = roleConfig[role] ?? roleConfig.normal;

  const [form, setForm] = useState({
    adSoyad: '', telefon: '', email: '',
    tc: '', adres: '', sifre: '', sifreTekrar: '',
  });
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [showSifre, setShowSifre] = useState(false);
  const [showSifreTekrar, setShowSifreTekrar] = useState(false);
  const [countryCode, setCountryCode] = useState(countryCodes[0]);
  const [isCountryPickerVisible, setIsCountryPickerVisible] = useState(false);

  const update = (field: string, value: string) => {
    let finalValue = value;
    
    // TC No limiting: only numeric and max 11 chars
    if (field === 'tc') {
      finalValue = value.replace(/[^0-9]/g, '').slice(0, 11);
    }
    
    // Telefon limiting: only numeric and dynamic length
    if (field === 'telefon') {
      finalValue = value.replace(/[^0-9]/g, '').slice(0, countryCode.length);
    }

    setForm(prev => ({ ...prev, [field]: finalValue }));
  };

  const handleDevam = async () => {
    const { adSoyad, telefon, email, tc, adres, sifre, sifreTekrar } = form;

    if (!adSoyad || !telefon || !email || !tc || !adres || !sifre || !sifreTekrar) {
      showToast('Lütfen tüm alanları doldurunuz.', 'error'); return;
    }

    if (!email.includes('@')) {
      showToast('Geçerli bir e-posta adresi giriniz.', 'error'); return;
    }

    if (tc.length !== 11) {
      showToast('TC kimlik numarası 11 haneli olmalıdır.', 'error'); return;
    }

    if (telefon.length !== countryCode.length) {
      showToast(`${countryCode.name} için telefon numarası ${countryCode.length} haneli olmalıdır.`, 'error'); return;
    }

    if (/^(\d)\1+$/.test(telefon)) {
      showToast('Lütfen geçerli bir telefon numarası giriniz.', 'error'); return;
    }

    if (sifre.length < 8) {
      showToast('Şifre en az 8 karakter olmalıdır.', 'error'); return;
    }

    if (sifre !== sifreTekrar) {
      showToast('Şifreler birbiriyle eşleşmiyor. Lütfen kontrol ediniz.', 'error'); return;
    }

    const roleMap: Record<string, string> = { normal: 'citizen', stk: 'volunteer', yetkili: 'admin' };

    const err = await register(email.trim(), sifre, {
      full_name: adSoyad,
      phone: `${countryCode.code}${telefon}`,
      tc_no: tc,
      city: adres,
      role: roleMap[role] ?? 'citizen',
    });

    if (err) {
      showToast(err, 'error');
      return;
    }

    // 'normal' rolü için kayıt + giriş tek adımda tamamlandı; store güncellendi,
    // RootNavigator isLoggedIn: true görünce AppNavigator'a geçer.
    // stk/yetkili rolleri ek adım gerektirdiğinden store güncellenmeden Step2'ye gidilir.
    if (role !== 'normal') {
      navigation.navigate('RegisterStep2', { role, step1: form });
    }
  };

  const renderCountryPicker = () => (
    <Modal
      visible={isCountryPickerVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setIsCountryPickerVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Ülke Kodu Seçin</Text>
            <TouchableOpacity onPress={() => setIsCountryPickerVisible(false)}>
              <Icon name="close" size={20} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>
          <FlatList
            data={countryCodes}
            keyExtractor={(item) => item.code}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={styles.countryItem}
                onPress={() => {
                  setCountryCode(item);
                  setForm(prev => ({ ...prev, telefon: prev.telefon.slice(0, item.length) }));
                  setIsCountryPickerVisible(false);
                }}
              >
                <Text style={styles.countryName}>{item.name}</Text>
                <Text style={styles.countryCodeText}>{item.code}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </View>
    </Modal>
  );

  const fields = [
    { key: 'adSoyad', label: 'Ad Soyad',          placeholder: 'Ad Soyad',              icon: 'user'    as const, keyboard: 'default'       as const },
    { key: 'telefon', label: 'Telefon',            placeholder: '5xx xxx xx xx',         icon: 'phone'   as const, keyboard: 'phone-pad'     as const },
    { key: 'email',   label: 'E-posta',            placeholder: 'ornek@email.com',        icon: 'mail'    as const, keyboard: 'email-address' as const },
    { key: 'tc',      label: 'TC Kimlik No',       placeholder: '11 haneli TC kimlik no', icon: 'lock'    as const, keyboard: 'number-pad'    as const },
    { key: 'adres',   label: 'Adres Bilgileri',    placeholder: 'İl, İlçe, Mahalle...',   icon: 'mapPin'  as const, keyboard: 'default'       as const },
    { key: 'sifre',   label: 'Şifre',              placeholder: 'En az 8 karakter',       icon: 'lock'    as const, keyboard: 'default'       as const, secure: true },
    { key: 'sifreTekrar', label: 'Şifre Tekrar',  placeholder: 'Şifrenizi tekrar girin', icon: 'lock'    as const, keyboard: 'default'       as const, secure: true },
  ];

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      {/* Background gradient */}
      <LinearGradient colors={cfg.gradient} locations={[0, 0.5, 1]} style={StyleSheet.absoluteFillObject} />

      {/* Dekoratif daireler */}
      <View style={[styles.decor, { width: 280, height: 280, top: -80, right: -100, backgroundColor: 'rgba(255,255,255,0.06)' }]} />
      <View style={[styles.decor, { width: 140, height: 140, top: 60, left: -50,  backgroundColor: 'rgba(255,255,255,0.04)' }]} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <View style={styles.backIconWrap}>
            <Icon name="chevronLeft" size={20} color="#fff" />
          </View>
          <Text style={styles.backText}>Geri</Text>
        </TouchableOpacity>

        <View style={styles.headerContent}>
          <View style={styles.headerIconWrap}>
            <Icon name={cfg.iconName} size={26} color="#fff" />
          </View>
          <View style={styles.headerTagRow}>
            <View style={styles.headerTag}>
              <Text style={styles.headerTagText}>{cfg.tag}</Text>
            </View>
            {role !== 'normal' && (
              <View style={styles.stepBadge}>
                <Text style={styles.stepBadgeText}>Adım 1 / 2</Text>
              </View>
            )}
          </View>
          <Text style={styles.headerTitle}>Kayıt Ol</Text>
          <Text style={styles.headerSub}>
            {role === 'normal' ? 'Bilgilerinizi girerek hesabınızı oluşturun.' : 'Kişisel bilgilerinizi doldurun.'}
          </Text>
        </View>
      </View>

      {/* Form card */}
      <View style={styles.formCard}>
        <View style={styles.pullHandle} />
        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          {fields.map(f => {
            const isFocused = focusedField === f.key;
            const isPassword = f.key === 'sifre' || f.key === 'sifreTekrar';
            const isPhone = f.key === 'telefon';
            
            // Password matching logic for real-time feedback
            const isConfirmPass = f.key === 'sifreTekrar';
            const passwordsMatch = form.sifre && form.sifreTekrar ? form.sifre === form.sifreTekrar : null;
            
            return (
              <View key={f.key} style={styles.inputContainer}>
                <Text style={styles.label}>{f.label}</Text>
                <View style={[
                  styles.inputWrapper, 
                  isFocused && styles.inputWrapperFocused,
                  isConfirmPass && passwordsMatch === true && { borderColor: '#48BB78' },
                  isConfirmPass && passwordsMatch === false && { borderColor: '#F56565' }
                ]}>
                  {isPhone ? (
                    <TouchableOpacity 
                      style={styles.countrySelector} 
                      onPress={() => setIsCountryPickerVisible(true)}
                    >
                      <Text style={styles.countryCodeText}>{countryCode.code}</Text>
                      <Icon name="chevronRight" size={12} color={colors.textSecondary} />
                    </TouchableOpacity>
                  ) : (
                    <View style={[styles.inputIconBg, isFocused && { backgroundColor: cfg.gradient[1] }]}>
                      <Icon name={f.icon} size={15} color={isFocused ? '#fff' : colors.info} />
                    </View>
                  )}
                  
                  <TextInput
                    style={styles.input}
                    placeholder={f.placeholder}
                    placeholderTextColor={colors.textMuted}
                    value={(form as any)[f.key]}
                    onChangeText={val => update(f.key, val)}
                    keyboardType={f.keyboard}
                    autoCapitalize="none"
                    secureTextEntry={
                      f.key === 'sifre' ? !showSifre : 
                      f.key === 'sifreTekrar' ? !showSifreTekrar : false
                    }
                    onFocus={() => setFocusedField(f.key)}
                    onBlur={() => setFocusedField(null)}
                    maxLength={f.key === 'tc' ? 11 : f.key === 'telefon' ? countryCode.length : undefined}
                  />

                  <View style={styles.inputRightActions}>
                    {isConfirmPass && passwordsMatch !== null && (
                      <View style={styles.matchIcon}>
                        <Icon 
                          name={passwordsMatch ? 'checkCircle' : 'alertTriangle'} 
                          size={16} 
                          color={passwordsMatch ? '#48BB78' : '#F56565'} 
                        />
                      </View>
                    )}
                    
                    {isPassword && (
                      <TouchableOpacity 
                        style={styles.eyeBtn} 
                        onPress={() => f.key === 'sifre' ? setShowSifre(!showSifre) : setShowSifreTekrar(!showSifreTekrar)}
                      >
                        <Icon 
                          name={(f.key === 'sifre' ? showSifre : showSifreTekrar) ? 'eye' : 'eyeOff'} 
                          size={18} 
                          color={colors.textMuted} 
                        />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </View>
            );
          })}

          <TouchableOpacity onPress={handleDevam} activeOpacity={0.85} style={styles.submitWrapper}>
            <LinearGradient
              colors={cfg.gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.submitButton}
            >
              <Text style={styles.submitText}>
                {role === 'normal' ? 'Hesap Oluştur' : 'Devam Et'}
              </Text>
              <View style={styles.submitArrow}>
                <Icon name="chevronRight" size={18} color="#fff" />
              </View>
            </LinearGradient>
          </TouchableOpacity>

          <View style={{ height: 30 }} />
        </ScrollView>
      </View>
      {renderCountryPicker()}
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
  headerTagRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  headerTag: {
    backgroundColor: 'rgba(255,255,255,0.22)',
    paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20,
  },
  headerTagText: { color: '#fff', fontSize: 11, fontWeight: '800' },
  stepBadge: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)',
    paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20,
  },
  stepBadgeText: { color: 'rgba(255,255,255,0.8)', fontSize: 11, fontWeight: '600' },
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
    backgroundColor: colors.border, alignSelf: 'center', marginBottom: 18,
  },
  inputContainer: { marginBottom: 14 },
  label: { fontSize: 12, fontWeight: '700', color: colors.textSecondary, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
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
  input: { flex: 1, paddingHorizontal: 12, paddingVertical: 12, fontSize: 14, color: colors.textPrimary },
  submitWrapper: { marginTop: 8 },
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
  eyeBtn: {
    paddingHorizontal: 12,
    height: 46,
    justifyContent: 'center',
  },
  inputRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  matchIcon: {
    paddingLeft: 8,
  },
  countrySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EBF4FF',
    paddingHorizontal: 10,
    height: 46,
    gap: 4,
  },
  countryCodeText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.info,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth:1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  countryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  countryName: {
    fontSize: 16,
    color: colors.textPrimary,
  },
});

export default RegisterScreen;
