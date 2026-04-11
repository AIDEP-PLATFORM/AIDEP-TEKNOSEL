import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '../../../core/stores/auth.store';
import colors from '../../../shared/theme/colors';
import Icon from '../../../shared/components/Icon';
import AnimatedPress from '../../../shared/components/AnimatedPress';

const menuItems = [
  { icon: 'user'          as const, label: 'Profil Bilgilerim', sub: 'Ad, telefon, adres',      color: '#1976D2', bg: '#EBF8FF' },
  { icon: 'lock'          as const, label: 'Şifre Değiştir',    sub: 'Hesap güvenliği',          color: '#6B46C1', bg: '#FAF5FF' },
  { icon: 'alertTriangle' as const, label: 'Bildirim Ayarları', sub: 'Uyarı tercihleri',         color: '#DD6B20', bg: '#FFFAF0' },
  { icon: 'info'          as const, label: 'Hakkında',          sub: 'Sürüm ve lisans bilgisi',  color: '#2F855A', bg: '#F0FFF4' },
];

const stats = [
  { label: 'Rapor', value: '0' },
  { label: 'Görev', value: '0' },
  { label: 'Rozet', value: '0' },
];

export default function ProfileScreen() {
  const { session, logout } = useAuthStore();
  const email = session?.user?.email ?? '';
  const fullName = session?.user?.user_metadata?.full_name ?? '';
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

  const handleLogout = () => {
    Alert.alert('Çıkış Yap', 'Hesabınızdan çıkmak istediğinizden emin misiniz?', [
      { text: 'İptal', style: 'cancel' },
      { text: 'Çıkış Yap', style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>

        {/* Hero */}
        <LinearGradient
          colors={['#1976D2', '#42A5F5', '#64B5F6']}
          locations={[0, 0.6, 1]}
          style={styles.hero}
        >
          <View style={[styles.decor, { width: 220, height: 220, top: -60, right: -60 }]} />
          <View style={[styles.decor, { width: 120, height: 120, bottom: 10, left: -40 }]} />

          {/* Avatar */}
          <Animated.View style={{
            opacity: avatarAnim,
            transform: [
              { scale: avatarAnim },
              { translateY: avatarAnim.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) },
            ],
          }}>
            <View style={styles.avatarOuter}>
              <LinearGradient
                colors={['rgba(255,255,255,0.35)', 'rgba(255,255,255,0.15)']}
                style={styles.avatarInner}
              >
                <Text style={styles.avatarText}>{initials}</Text>
              </LinearGradient>
            </View>
          </Animated.View>

          <Text style={styles.nameText}>{fullName || 'Kullanıcı'}</Text>
          <Text style={styles.emailText}>{email}</Text>

          <View style={styles.badgeRow}>
            <View style={styles.roleBadge}>
              <View style={styles.badgeDot} />
              <Text style={styles.roleText}>Normal Kullanıcı</Text>
            </View>
          </View>

          {/* İstatistikler */}
          <Animated.View style={[styles.statsRow, {
            opacity: statsAnim,
            transform: [{ translateY: statsAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }],
          }]}>
            {stats.map((s, i) => (
              <View key={i} style={styles.statItem}>
                <Text style={styles.statValue}>{s.value}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </View>
            ))}
          </Animated.View>
        </LinearGradient>

        {/* Menü */}
        <Animated.View style={[styles.section, {
          opacity: menuAnim,
          transform: [{ translateY: menuAnim.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }],
        }]}>
          <Text style={styles.sectionLabel}>HESAP</Text>
          <View style={styles.menuCard}>
            {menuItems.map((item, i) => (
              <AnimatedPress
                key={i}
                scale={0.97}
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
            <LinearGradient
              colors={['#E53E3E', '#FC8181']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={styles.logoutBtn}
            >
              <Icon name="close" size={18} color="#fff" strokeWidth={2.5} />
              <Text style={styles.logoutText}>Çıkış Yap</Text>
            </LinearGradient>
          </AnimatedPress>
        </View>

        <Text style={styles.version}>AIDEP v1.0.0</Text>
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F4F8' },
  decor: {
    position: 'absolute', borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.07)',
  },
  hero: {
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 30,
    paddingHorizontal: 24,
    overflow: 'hidden',
  },
  avatarOuter: {
    width: 90, height: 90, borderRadius: 45,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2, shadowRadius: 12, elevation: 10,
    borderWidth: 2.5, borderColor: 'rgba(255,255,255,0.4)',
  },
  avatarInner: {
    width: 82, height: 82, borderRadius: 41,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: 30, fontWeight: '900', color: '#fff' },
  nameText: { fontSize: 20, fontWeight: '800', color: '#fff', marginBottom: 4, letterSpacing: -0.3 },
  emailText: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginBottom: 12 },
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
  statValue: { fontSize: 22, fontWeight: '900', color: '#fff' },
  statLabel: { fontSize: 11, fontWeight: '700', color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  section: { paddingHorizontal: 16, marginTop: 20 },
  sectionLabel: {
    fontSize: 11, fontWeight: '800', color: colors.textSecondary,
    letterSpacing: 1, marginBottom: 10, textTransform: 'uppercase',
    paddingHorizontal: 4,
  },
  menuCard: {
    backgroundColor: '#fff', borderRadius: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 10, elevation: 3,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 15, gap: 14,
  },
  menuItemBorder: { borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  menuIconWrap: {
    width: 42, height: 42, borderRadius: 13,
    alignItems: 'center', justifyContent: 'center',
  },
  menuText: { flex: 1 },
  menuLabel: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  menuSub: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 10, paddingVertical: 15, borderRadius: 18,
    shadowColor: '#E53E3E', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3, shadowRadius: 10, elevation: 6,
  },
  logoutText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  version: {
    textAlign: 'center', color: colors.textMuted,
    fontSize: 12, marginTop: 20, fontWeight: '500',
  },
});
