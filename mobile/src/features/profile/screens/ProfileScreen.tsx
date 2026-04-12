import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView,
  Animated, Modal, Platform, StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { showToast } from '../../../shared/components/Toast';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../../../core/stores/auth.store';
import colors from '../../../shared/theme/colors';
import Icon from '../../../shared/components/Icon';
import AnimatedPress from '../../../shared/components/AnimatedPress';
import FloatingBubbles from '../../../shared/components/FloatingBubbles';

const STATUSBAR_HEIGHT = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) : 44;

const roleGradients: Record<string, [string, string, string]> = {
  citizen:   ['#1565C0', '#1976D2', '#42A5F5'],
  volunteer: ['#1B5E20', '#2E7D32', '#66BB6A'],
  admin:     ['#4A148C', '#7B1FA2', '#CE93D8'],
};

const roleBgEnd: Record<string, string> = {
  citizen:   '#EFF6FF',
  volunteer: '#F0FDF4',
  admin:     '#F5F3FF',
};

const menuItems = [
  { key: 'info',     icon: 'user'          as const, label: 'Profil Bilgilerim', sub: 'Ad, telefon, adres, TC',    color: '#1976D2', bg: '#EBF8FF' },
  { key: 'password', icon: 'lock'          as const, label: 'Şifre Değiştir',    sub: 'Hesap güvenliği',           color: '#6B46C1', bg: '#FAF5FF' },
  { key: 'notif',    icon: 'alertTriangle' as const, label: 'Bildirim Ayarları', sub: 'Uyarı tercihleri',          color: '#DD6B20', bg: '#FFFAF0' },
  { key: 'about',    icon: 'info'          as const, label: 'Hakkında',          sub: 'Sürüm ve lisans bilgisi',   color: '#2F855A', bg: '#F0FFF4' },
];

const stats = [
  { label: 'Rapor', value: '0' },
  { label: 'Görev', value: '0' },
  { label: 'Rozet', value: '0' },
];

export default function ProfileScreen() {
  const navigation = useNavigation<any>();
  const { user, logout } = useAuthStore();
  const [infoModal, setInfoModal] = useState(false);
  const gradient = roleGradients[user?.role ?? 'citizen'] ?? roleGradients.citizen;
  const bgEnd = roleBgEnd[user?.role ?? 'citizen'] ?? roleBgEnd.citizen;

  const email    = user?.email    ?? '';
  const fullName = user?.full_name ?? '';
  const phone    = user?.phone    ?? '';
  const city     = user?.city     ?? '';
  const tcNo     = user?.tc_no    ?? '';
  const roleLabel = user?.role === 'citizen' ? 'Vatandaş' : user?.role === 'volunteer' ? 'Gönüllü' : user?.role === 'admin' ? 'Yetkili' : 'Kullanıcı';

  const initials = fullName
    ? fullName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
    : email.slice(0, 2).toUpperCase();

  const avatarAnim = useRef(new Animated.Value(0)).current;
  const menuAnim   = useRef(new Animated.Value(0)).current;
  const statsAnim  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.spring(avatarAnim, { toValue: 1, useNativeDriver: true, speed: 14, bounciness: 10 }),
      Animated.parallel([
        Animated.timing(statsAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(menuAnim,  { toValue: 1, duration: 350, useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  const handleMenuPress = (key: string) => {
    if (key === 'info')     { setInfoModal(true); return; }
    if (key === 'password') { showToast('Şifre değiştirme özelliği yakında aktif olacak.', 'info'); return; }
    if (key === 'notif')    { showToast('Bildirim ayarları yakında aktif olacak.', 'info'); return; }
    if (key === 'about')    { showToast('AIDEP v1.0.0 — Acil Durum İşbirliği Platformu', 'info'); return; }
  };

  const handleLogout = () => {
    Alert.alert(
      'Çıkış Yap',
      'Hesabınızdan çıkmak istediğinizden emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        { text: 'Çıkış Yap', style: 'destructive', onPress: logout },
      ],
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[gradient[0], gradient[1], gradient[2], bgEnd]}
        locations={[0, 0.18, 0.38, 1]}
        style={StyleSheet.absoluteFillObject}
      />
      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>

        {/* Hero */}
        <View style={styles.hero}>
          <FloatingBubbles color="#fff" />
          <View style={[styles.decor, { width: 220, height: 220, top: -60, right: -60 }]} />
          <View style={[styles.decor, { width: 120, height: 120, bottom: 10, left: -40 }]} />

          {/* Geri Butonu */}
          <View style={[styles.heroTopRow, { paddingTop: STATUSBAR_HEIGHT }]}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
              <Icon name="chevronLeft" size={20} color="#fff" strokeWidth={2.5} />
            </TouchableOpacity>
            <Text style={styles.heroScreenTitle}>Profilim</Text>
            <View style={{ width: 36 }} />
          </View>

          {/* Avatar */}
          <Animated.View style={{
            opacity: avatarAnim,
            transform: [
              { scale: avatarAnim },
              { translateY: avatarAnim.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) },
            ],
            alignItems: 'center',
          }}>
            <View style={styles.avatarOuter}>
              <LinearGradient colors={['rgba(255,255,255,0.35)', 'rgba(255,255,255,0.15)']} style={styles.avatarInner}>
                <Text style={styles.avatarText}>{initials}</Text>
              </LinearGradient>
            </View>
          </Animated.View>

          <Text style={styles.nameText}>{fullName || 'Kullanıcı'}</Text>
          <Text style={styles.emailText}>{email}</Text>

          <View style={styles.badgeRow}>
            <View style={styles.roleBadge}>
              <View style={styles.badgeDot} />
              <Text style={styles.roleText}>{roleLabel}</Text>
            </View>
          </View>

          {/* İstatistikler */}
          <Animated.View style={[styles.statsRow, {
            opacity: statsAnim,
            transform: [{ translateY: statsAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }],
          }]}>
            {stats.map((s, i) => (
              <View key={i} style={[styles.statItem, i < stats.length - 1 && styles.statItemBorder]}>
                <Text style={styles.statValue}>{s.value}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </View>
            ))}
          </Animated.View>
        </View>

        {/* Menü */}
        <Animated.View style={[styles.section, {
          opacity: menuAnim,
          transform: [{ translateY: menuAnim.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }],
        }]}>
          <View style={styles.sectionLabelRow}>
            <LinearGradient colors={['#1976D2', '#42A5F5']} style={styles.sectionDot} />
            <Text style={styles.sectionLabel}>HESAP</Text>
          </View>
          <View style={styles.menuCard}>
            {menuItems.map((item, i) => (
              <AnimatedPress key={item.key} scale={0.97} onPress={() => handleMenuPress(item.key)}
                style={[styles.menuItem, i < menuItems.length - 1 && styles.menuItemBorder]}
              >
                <View style={[styles.menuIconWrap, { backgroundColor: item.bg }]}>
                  <Icon name={item.icon} size={18} color={item.color} strokeWidth={2} />
                </View>
                <View style={styles.menuText}>
                  <Text style={styles.menuLabel}>{item.label}</Text>
                  <Text style={styles.menuSub}>{item.sub}</Text>
                </View>
                <Icon name="chevronRight" size={16} color={colors.textMuted} />
              </AnimatedPress>
            ))}
          </View>
        </Animated.View>

        {/* Çıkış */}
        <View style={styles.section}>
          <AnimatedPress onPress={handleLogout} scale={0.96}>
            <LinearGradient colors={['#E53E3E', '#FC8181']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.logoutBtn}>
              <Icon name="close" size={18} color="#fff" strokeWidth={2.5} />
              <Text style={styles.logoutText}>Çıkış Yap</Text>
            </LinearGradient>
          </AnimatedPress>
        </View>

        <Text style={styles.version}>AIDEP v1.0.0</Text>
        <View style={{ height: 60 }} />
      </ScrollView>

      {/* Profil Bilgileri Modal */}
      <Modal visible={infoModal} animationType="slide" transparent onRequestClose={() => setInfoModal(false)}>
        <View style={modal.overlay}>
          <View style={modal.sheet}>
            {/* Handle */}
            <View style={modal.handle} />

            {/* Başlık */}
            <View style={modal.header}>
              <Text style={modal.title}>Profil Bilgilerim</Text>
              <TouchableOpacity onPress={() => setInfoModal(false)} style={modal.closeBtn} activeOpacity={0.7}>
                <Icon name="close" size={18} color={colors.textSecondary} strokeWidth={2.5} />
              </TouchableOpacity>
            </View>

            {/* Bilgiler */}
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={modal.content}>
              {[
                { label: 'Ad Soyad',       value: fullName || '—', icon: 'user'   as const, color: '#1976D2', bg: '#EBF8FF' },
                { label: 'E-posta',        value: email    || '—', icon: 'mail'   as const, color: '#6B46C1', bg: '#FAF5FF' },
                { label: 'Telefon',        value: phone    || '—', icon: 'phone'  as const, color: '#2F855A', bg: '#F0FFF4' },
                { label: 'TC Kimlik No',   value: tcNo ? tcNo.replace(/(\d{3})(\d{4})(\d{4})/, '$1 $2 $3') : '—', icon: 'lock' as const, color: '#DD6B20', bg: '#FFFAF0' },
                { label: 'Şehir / Adres', value: city    || '—', icon: 'mapPin' as const, color: '#E53E3E', bg: '#FFF5F5' },
                { label: 'Rol',            value: roleLabel,       icon: 'shield' as const, color: '#1565C0', bg: '#EBF8FF' },
              ].map((row, i) => (
                <View key={i} style={modal.row}>
                  <View style={[modal.rowIcon, { backgroundColor: row.bg }]}>
                    <Icon name={row.icon} size={16} color={row.color} strokeWidth={2} />
                  </View>
                  <View style={modal.rowText}>
                    <Text style={modal.rowLabel}>{row.label}</Text>
                    <Text style={modal.rowValue}>{row.value}</Text>
                  </View>
                </View>
              ))}

              <View style={modal.noteBadge}>
                <Icon name="info" size={14} color="#1976D2" strokeWidth={2} />
                <Text style={modal.noteText}>Bilgilerinizi güncellemek için destek ekibiyle iletişime geçin.</Text>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  sectionLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10, paddingHorizontal: 4 },
  sectionDot: { width: 4, height: 18, borderRadius: 2 },
  decor: { position: 'absolute', borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.07)' },
  hero: { alignItems: 'center', paddingBottom: 28, paddingHorizontal: 24, overflow: 'hidden', backgroundColor: 'transparent' },
  heroTopRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    width: '100%', paddingBottom: 20,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)',
  },
  heroScreenTitle: { fontSize: 17, fontWeight: '800', color: '#fff' },
  avatarOuter: {
    width: 90, height: 90, borderRadius: 45,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.2, shadowRadius: 12, elevation: 10,
    borderWidth: 2.5, borderColor: 'rgba(255,255,255,0.4)',
  },
  avatarInner: { width: 82, height: 82, borderRadius: 41, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 30, fontWeight: '900', color: '#fff' },
  nameText: { fontSize: 22, fontWeight: '900', color: '#fff', marginBottom: 4, letterSpacing: -0.3 },
  emailText: { fontSize: 14, color: 'rgba(255,255,255,0.85)', marginBottom: 12 },
  badgeRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  roleBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)',
    paddingHorizontal: 14, paddingVertical: 5, borderRadius: 20,
  },
  badgeDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#fff' },
  roleText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20, paddingVertical: 14, paddingHorizontal: 10,
    width: '100%', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
  },
  statItem: { flex: 1, alignItems: 'center' },
  statItemBorder: { borderRightWidth: 1, borderRightColor: 'rgba(255,255,255,0.2)' },
  statValue: { fontSize: 26, fontWeight: '900', color: '#fff' },
  statLabel: { fontSize: 12, fontWeight: '700', color: 'rgba(255,255,255,0.8)', marginTop: 3 },
  section: { paddingHorizontal: 16, marginTop: 20 },
  sectionLabel: {
    fontSize: 12, fontWeight: '800', color: 'rgba(255,255,255,0.85)',
    letterSpacing: 1, textTransform: 'uppercase',
  },
  menuCard: {
    backgroundColor: 'rgba(255,255,255,0.92)', borderRadius: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 10, elevation: 3,
    overflow: 'hidden',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.5)',
  },
  menuItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 17, gap: 14,
    backgroundColor: '#fff', marginBottom: 2, borderRadius: 16,
  },
  menuItemBorder: { borderBottomWidth: 0 },
  menuIconWrap: { width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  menuText: { flex: 1 },
  menuLabel: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  menuSub: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 10, paddingVertical: 15, borderRadius: 18,
    shadowColor: '#E53E3E', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 6,
  },
  logoutText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  version: { textAlign: 'center', color: 'rgba(255,255,255,0.5)', fontSize: 11, marginTop: 20, fontWeight: '500' },
});

const modal = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    maxHeight: '85%',
    shadowColor: '#000', shadowOffset: { width: 0, height: -6 }, shadowOpacity: 0.15, shadowRadius: 20, elevation: 20,
  },
  handle: {
    width: 40, height: 5, borderRadius: 3,
    backgroundColor: '#E2E8F0', alignSelf: 'center', marginTop: 12,
  },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 22, paddingVertical: 16,
    borderBottomWidth: 1, borderBottomColor: '#F1F5F9',
  },
  title: { fontSize: 18, fontWeight: '800', color: colors.textPrimary },
  closeBtn: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center',
  },
  content: { paddingHorizontal: 22, paddingTop: 8, paddingBottom: 40 },
  row: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: '#F8FAFC',
  },
  rowIcon: { width: 42, height: 42, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  rowText: { flex: 1 },
  rowLabel: { fontSize: 12, fontWeight: '700', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 },
  rowValue: { fontSize: 16, fontWeight: '600', color: colors.textPrimary, marginTop: 3 },
  noteBadge: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    backgroundColor: '#EBF8FF', borderRadius: 14, padding: 14, marginTop: 16,
  },
  noteText: { flex: 1, fontSize: 13, color: '#1976D2', lineHeight: 19 },
});
