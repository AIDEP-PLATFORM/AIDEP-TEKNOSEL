import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import colors from '../../../shared/theme/colors';
import Icon from '../../../shared/components/Icon';

const roleConfig: Record<string, {
  title: string;
  gradient: [string, string, string];
  iconName: 'mapPin' | 'shield';
  tag: string;
  desc: string;
}> = {
  stk: {
    title: 'STK Gönüllü',
    gradient: ['#1B5E20', '#2E7D32', '#43A047'],
    iconName: 'mapPin',
    tag: 'Gönüllü',
    desc: 'STK kurum bilgileri, gönüllü belgesi ve onay süreci burada yer alacak.',
  },
  yetkili: {
    title: 'Yetkili Kullanıcı',
    gradient: ['#4A148C', '#7B1FA2', '#AB47BC'],
    iconName: 'shield',
    tag: 'Kurum',
    desc: 'Yetkili kullanıcı kimlik doğrulama ve kurum bilgileri burada yer alacak.',
  },
};

const RegisterStep2Screen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const role: string = route.params?.role ?? 'stk';
  const cfg = roleConfig[role] ?? roleConfig.stk;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient colors={cfg.gradient} locations={[0, 0.5, 1]} style={StyleSheet.absoluteFillObject} />

      <View style={[styles.decor, { width: 260, height: 260, top: -70, right: -90, backgroundColor: 'rgba(255,255,255,0.06)' }]} />
      <View style={[styles.decor, { width: 130, height: 130, top: 80, left: -50, backgroundColor: 'rgba(255,255,255,0.04)' }]} />

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
          <View style={styles.tagRow}>
            <View style={styles.tag}>
              <Text style={styles.tagText}>{cfg.tag}</Text>
            </View>
            <View style={styles.stepBadge}>
              <Text style={styles.stepBadgeText}>Adım 2 / 2</Text>
            </View>
          </View>
          <Text style={styles.headerTitle}>Kurumsal Bilgiler</Text>
          <Text style={styles.headerSub}>{cfg.title}</Text>
        </View>
      </View>

      {/* Body */}
      <View style={styles.body}>
        <View style={styles.pullHandle} />

        <View style={styles.placeholderCard}>
          <LinearGradient
            colors={['rgba(255,255,255,0)', 'rgba(240,240,255,0.6)']}
            style={StyleSheet.absoluteFillObject}
          />
          <Text style={styles.placeholderIcon}>🔧</Text>
          <Text style={styles.placeholderTitle}>Yakında</Text>
          <Text style={styles.placeholderText}>{cfg.desc}</Text>
        </View>

        <TouchableOpacity onPress={() => navigation.navigate('Login')} activeOpacity={0.85}>
          <LinearGradient
            colors={cfg.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.backBtn}
          >
            <Text style={styles.backBtnText}>Giriş Ekranına Dön</Text>
            <View style={styles.btnArrow}>
              <Icon name="chevronRight" size={18} color="#fff" />
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  decor: { position: 'absolute', borderRadius: 999 },
  header: { paddingBottom: 20 },
  backButton: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 18, paddingTop: 10, paddingBottom: 12, gap: 6,
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
  tagRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  tag: {
    backgroundColor: 'rgba(255,255,255,0.22)',
    paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20,
  },
  tagText: { color: '#fff', fontSize: 11, fontWeight: '800' },
  stepBadge: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)',
    paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20,
  },
  stepBadgeText: { color: 'rgba(255,255,255,0.8)', fontSize: 11, fontWeight: '600' },
  headerTitle: { fontSize: 28, fontWeight: '800', color: '#fff', marginBottom: 4 },
  headerSub: { fontSize: 13, color: 'rgba(255,255,255,0.7)' },
  body: {
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
  placeholderCard: {
    borderRadius: 20, borderWidth: 1.5, borderColor: colors.border,
    padding: 32, alignItems: 'center', marginBottom: 28, overflow: 'hidden',
    backgroundColor: colors.surface,
  },
  placeholderIcon: { fontSize: 52, marginBottom: 14 },
  placeholderTitle: { fontSize: 22, fontWeight: '800', color: colors.textPrimary, marginBottom: 10 },
  placeholderText: { fontSize: 14, color: colors.textSecondary, textAlign: 'center', lineHeight: 22 },
  backBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 15, borderRadius: 12,
    elevation: 6, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8,
  },
  backBtnText: { color: '#fff', fontSize: 16, fontWeight: '800', letterSpacing: 0.5 },
  btnArrow: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center', marginLeft: 10,
  },
});

export default RegisterStep2Screen;
