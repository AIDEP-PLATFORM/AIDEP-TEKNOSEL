import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from '../../../shared/components/Icon';
import colors from '../../../shared/theme/colors';

const infoCards = [
  {
    icon: 'users' as const,
    title: 'Ekip Üyeliği',
    desc: 'Bir STK veya yetkili kurum tarafından ekibinize davet edilmeniz gerekmektedir.',
    color: colors.info,
    bg: '#EBF8FF',
  },
  {
    icon: 'mapPin' as const,
    title: 'Saha Görevleri',
    desc: 'Ekibinize atanan aktif görevler ve saha operasyonları burada listelenecektir.',
    color: colors.success,
    bg: '#F0FFF4',
  },
  {
    icon: 'alertTriangle' as const,
    title: 'Acil Koordinasyon',
    desc: 'Afet anında ekip koordinasyonu ve anlık iletişim araçlarına buradan ulaşabilirsiniz.',
    color: '#DD6B20',
    bg: '#FFFAF0',
  },
];

export default function TasksScreen() {
  return (
    <View style={styles.container}>
      {/* Gradient arka plan */}
      <LinearGradient
        colors={['#42A5F5', '#1976D2', '#1A365D']}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Dekoratif daireler */}
      <View style={[styles.decor, { width: 320, height: 320, top: -120, right: -100 }]} />
      <View style={[styles.decor, { width: 180, height: 180, top: 60, left: -70, opacity: 0.04 }]} />

      {/* Üst başlık */}
      <View style={styles.heroSection}>
        <View style={styles.heroIconWrap}>
          <Icon name="users" size={32} color="#fff" strokeWidth={1.8} />
        </View>
        <Text style={styles.heroTitle}>Ekibim</Text>
        <Text style={styles.heroSub}>Ekip yönetimi ve görev koordinasyon merkezi</Text>
      </View>

      {/* Kart alanı */}
      <View style={styles.cardArea}>
        <View style={styles.pullHandle} />

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Ekip yok uyarısı */}
          <View style={styles.emptyBox}>
            <View style={styles.emptyIconWrap}>
              <Icon name="users" size={36} color={colors.textMuted} strokeWidth={1.5} />
            </View>
            <Text style={styles.emptyTitle}>Henüz Bir Ekibiniz Yok</Text>
            <Text style={styles.emptyDesc}>
              Herhangi bir STK veya yetkili kuruma üye olmadığınız için ekibiniz bulunmamaktadır.
              Bir kurum sizi ekibine davet ettiğinde burada görünecektir.
            </Text>
            <View style={styles.emptyBadge}>
              <View style={styles.emptyBadgeDot} />
              <Text style={styles.emptyBadgeText}>Normal Kullanıcı</Text>
            </View>
          </View>

          {/* Bilgi kartları */}
          <Text style={styles.sectionLabel}>EKİP ÖZELLİKLERİ</Text>
          {infoCards.map((card, i) => (
            <TouchableOpacity key={i} activeOpacity={0.85} style={styles.infoCard}>
              <View style={[styles.infoIconWrap, { backgroundColor: card.bg }]}>
                <Icon name={card.icon} size={22} color={card.color} strokeWidth={2} />
              </View>
              <View style={styles.infoText}>
                <Text style={styles.infoTitle}>{card.title}</Text>
                <Text style={styles.infoDesc}>{card.desc}</Text>
              </View>
              <Icon name="chevronRight" size={16} color={colors.textMuted} />
            </TouchableOpacity>
          ))}

          {/* Rapor et butonu */}
          <TouchableOpacity activeOpacity={0.85} style={styles.reportWrapper}>
            <LinearGradient
              colors={[colors.info, '#4299E1']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={styles.reportBtn}
            >
              <Icon name="alertTriangle" size={18} color="#fff" strokeWidth={2.5} />
              <Text style={styles.reportBtnText}>Durum Raporla</Text>
              <View style={styles.reportArrow}>
                <Icon name="chevronRight" size={16} color="#fff" />
              </View>
            </LinearGradient>
          </TouchableOpacity>

          <View style={{ height: 100 }} />
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  decor: {
    position: 'absolute', borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  heroSection: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 24,
    alignItems: 'flex-start',
  },
  heroIconWrap: {
    width: 60, height: 60, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)',
  },
  heroTitle: { fontSize: 30, fontWeight: '900', color: '#fff', letterSpacing: -0.5 },
  heroSub: { fontSize: 14, color: 'rgba(255,255,255,0.7)', marginTop: 6, fontWeight: '500' },
  cardArea: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1, shadowRadius: 20, elevation: 20,
  },
  pullHandle: {
    width: 45, height: 5, borderRadius: 3,
    backgroundColor: '#E2E8F0', alignSelf: 'center',
    marginTop: 14, marginBottom: 20,
  },
  scrollContent: { paddingHorizontal: 22 },
  emptyBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    marginBottom: 28,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
  },
  emptyIconWrap: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: '#EDF2F7',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18, fontWeight: '800', color: colors.textPrimary,
    marginBottom: 10, textAlign: 'center',
  },
  emptyDesc: {
    fontSize: 14, color: colors.textSecondary,
    textAlign: 'center', lineHeight: 21,
    marginBottom: 16,
  },
  emptyBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: colors.navy + '12',
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20,
  },
  emptyBadgeDot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: colors.navy,
  },
  emptyBadgeText: { fontSize: 12, fontWeight: '800', color: colors.navy },
  sectionLabel: {
    fontSize: 11, fontWeight: '800', color: colors.textSecondary,
    letterSpacing: 1, marginBottom: 14, textTransform: 'uppercase',
  },
  infoCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: '#fff',
    borderRadius: 16, padding: 16, marginBottom: 12,
    borderWidth: 1, borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04, shadowRadius: 6, elevation: 2,
  },
  infoIconWrap: {
    width: 46, height: 46, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
  },
  infoText: { flex: 1 },
  infoTitle: { fontSize: 14, fontWeight: '700', color: colors.textPrimary, marginBottom: 3 },
  infoDesc: { fontSize: 12, color: colors.textSecondary, lineHeight: 17 },
  reportWrapper: { marginTop: 6 },
  reportBtn: {
    flexDirection: 'row', alignItems: 'center',
    paddingLeft: 20, paddingRight: 14, paddingVertical: 15,
    borderRadius: 18, gap: 10,
    shadowColor: colors.info,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3, shadowRadius: 10, elevation: 6,
  },
  reportBtnText: { flex: 1, color: '#fff', fontSize: 15, fontWeight: '800' },
  reportArrow: {
    width: 32, height: 32, borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
});
