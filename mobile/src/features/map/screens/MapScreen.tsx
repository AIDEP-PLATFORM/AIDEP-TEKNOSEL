import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from '../../../shared/components/Icon';
import TopBar from '../../../shared/components/TopBar';
import FloatingBubbles from '../../../shared/components/FloatingBubbles';
import { useAuthStore } from '../../../core/stores/auth.store';

const quickStats = [
  { icon: 'alertTriangle' as const, label: 'Aktif Bölge', value: '48', color: '#EF4444' },
  { icon: 'shield'        as const, label: 'Güvenli Alan', value: '12', color: '#10B981' },
  { icon: 'users'         as const, label: 'Saha Ekibi',   value: '23', color: '#fff'   },
];

const mapLayers = [
  {
    icon: 'alertTriangle' as const,
    label: 'Hasar Noktaları',
    desc: 'Kırmızı pin — yıkılan bina veya kapanan yol',
    color: '#EF4444',
    bg: '#FFF1F2',
    borderColor: '#FECACA',
    active: true,
  },
  {
    icon: 'users' as const,
    label: 'Ekip Konumları',
    desc: 'Mavi pin — aktif saha ekiplerinin anlık konumu',
    color: '#1976D2',
    bg: '#EFF6FF',
    borderColor: '#BFDBFE',
    active: true,
  },
  {
    icon: 'mapPin' as const,
    label: 'Toplanma Alanı',
    desc: 'Yeşil pin — belirlenen güvenli toplanma noktaları',
    color: '#059669',
    bg: '#ECFDF5',
    borderColor: '#A7F3D0',
    active: false,
  },
  {
    icon: 'shield' as const,
    label: 'Güvenli Güzergah',
    desc: 'Mor pin — tahliye için önerilen güvenli rotalar',
    color: '#7C3AED',
    bg: '#F5F3FF',
    borderColor: '#DDD6FE',
    active: false,
  },
];

const alertBanners = [
  { level: 'Kritik', text: 'Kadıköy İlçesi — Aktif artçı sarsıntı riski', color: '#EF4444', bg: '#FFF1F2', border: '#FECACA' },
  { level: 'Dikkat', text: 'Maltepe köprüsü kapalı — alternatif güzergah kullanın', color: '#D97706', bg: '#FFFBEB', border: '#FDE68A' },
];

const roleGradients: Record<string, [string, string, string]> = {
  citizen:   ['#1565C0', '#1976D2', '#1E88E5'],
  volunteer: ['#1B5E20', '#2E7D32', '#43A047'],
  admin:     ['#4A148C', '#7B1FA2', '#AB47BC'],
};

export default function MapScreen() {
  const { user } = useAuthStore();
  const role = user?.role ?? 'citizen';
  const gradient = roleGradients[role] ?? roleGradients.citizen;

  const [activeFilters, setActiveFilters] = useState<string[]>(['hasar', 'ekip']);
  const [legendOpen, setLegendOpen] = useState(false);
  const legendAnim = useRef(new Animated.Value(0)).current;

  const toggleLegend = () => {
    const toValue = legendOpen ? 0 : 1;
    setLegendOpen(!legendOpen);
    Animated.spring(legendAnim, { toValue, useNativeDriver: true, speed: 18, bounciness: 4 }).start();
  };

  const toggleFilter = (key: string) => {
    setActiveFilters(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const filters = [
    { key: 'hasar', label: 'Hasar', color: '#EF4444', bg: '#FFF1F2' },
    { key: 'ekip',  label: 'Ekip',  color: '#1976D2', bg: '#EFF6FF' },
    { key: 'toplanma', label: 'Toplanma', color: '#059669', bg: '#ECFDF5' },
    { key: 'guzergah', label: 'Güzergah', color: '#7C3AED', bg: '#F5F3FF' },
  ];

  return (
    <View style={styles.container}>
      {/* Gradient üst şerit */}
      <LinearGradient colors={gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.topStrip}>
        <FloatingBubbles color="#fff" />
        <TopBar tint="light" />

        <View style={styles.heroRow}>
          <View style={styles.heroIconWrap}>
            <Icon name="mapPin" size={22} color="#fff" strokeWidth={2.5} />
          </View>
          <View>
            <Text style={styles.heroTitle}>Deprem Haritası</Text>
            <Text style={styles.heroSub}>Gerçek zamanlı bölge izleme</Text>
          </View>
        </View>

        {/* Hızlı istatistikler */}
        <View style={styles.statsRow}>
          {quickStats.map((s, i) => (
            <View key={i} style={styles.statChip}>
              <Icon name={s.icon} size={14} color={s.color} strokeWidth={2.5} />
              <Text style={styles.statVal}>{s.value}</Text>
              <Text style={styles.statLbl}>{s.label}</Text>
            </View>
          ))}
        </View>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 110 }}>

        {/* Filtreler */}
        <View style={styles.filterBar}>
          {filters.map(f => {
            const isActive = activeFilters.includes(f.key);
            return (
              <TouchableOpacity
                key={f.key}
                activeOpacity={0.8}
                onPress={() => toggleFilter(f.key)}
                style={[
                  styles.filterChip,
                  isActive
                    ? { backgroundColor: f.color, borderColor: f.color }
                    : { backgroundColor: '#fff', borderColor: '#E2E8F0' },
                ]}
              >
                <View style={[styles.filterDot, { backgroundColor: isActive ? '#fff' : f.color }]} />
                <Text style={[styles.filterText, { color: isActive ? '#fff' : '#475569' }]}>
                  {f.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Harita placeholder */}
        <View style={styles.mapArea}>
          {[...Array(8)].map((_, i) => (
            <View key={`h${i}`} style={[styles.gridLine, styles.gridH, { top: `${i * 14}%` as any }]} />
          ))}
          {[...Array(6)].map((_, i) => (
            <View key={`v${i}`} style={[styles.gridLine, styles.gridV, { left: `${i * 20}%` as any }]} />
          ))}

          <View style={[styles.pin, styles.pinRed,   { top: '28%', left: '32%' }]} />
          <View style={[styles.pin, styles.pinRed,   { top: '42%', left: '58%' }]} />
          <View style={[styles.pin, styles.pinRed,   { top: '55%', left: '22%' }]} />
          <View style={[styles.pin, styles.pinBlue,  { top: '35%', left: '70%' }]} />
          <View style={[styles.pin, styles.pinBlue,  { top: '60%', left: '48%' }]} />
          <View style={[styles.pin, styles.pinGreen, { top: '70%', left: '65%' }]} />

          {/* Merkez kart */}
          <View style={styles.mapCard}>
            <View style={styles.mapCardIcon}>
              <Icon name="mapPin" size={26} color="#1976D2" strokeWidth={1.5} />
            </View>
            <Text style={styles.mapCardTitle}>Harita Entegrasyonu</Text>
            <Text style={styles.mapCardSub}>OpenStreetMap ile gerçek zamanlı{'\n'}deprem haritası yakında aktif olacak</Text>
            <View style={styles.comingSoonBadge}>
              <View style={styles.comingSoonDot} />
              <Text style={styles.comingSoonText}>Geliştirme Aşamasında</Text>
            </View>
          </View>
        </View>

        {/* Uyarı Bantları */}
        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <LinearGradient colors={['#EF4444', '#F97316']} style={styles.sectionDot} />
            <Text style={styles.sectionTitle}>AKTİF UYARILAR</Text>
          </View>
          {alertBanners.map((a, i) => (
            <View key={i} style={[styles.alertCard, { backgroundColor: a.bg, borderColor: a.border }]}>
              <View style={[styles.alertLevel, { backgroundColor: a.color }]}>
                <Text style={styles.alertLevelText}>{a.level}</Text>
              </View>
              <Text style={styles.alertText}>{a.text}</Text>
              <Icon name="alertTriangle" size={16} color={a.color} strokeWidth={2} />
            </View>
          ))}
        </View>

        {/* Katman Göstergesi */}
        <View style={styles.section}>
          <TouchableOpacity activeOpacity={0.8} onPress={toggleLegend} style={styles.legendToggleBtn}>
            <View style={styles.sectionTitleRow}>
              <LinearGradient colors={['#1976D2', '#42A5F5']} style={styles.sectionDot} />
              <Text style={styles.sectionTitle}>HARİTA GÖSTERGESİ</Text>
            </View>
            <Animated.View style={{
              transform: [{
                rotate: legendAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] }),
              }],
            }}>
              <Icon name="chevronDown" size={18} color="#64748B" strokeWidth={2.5} />
            </Animated.View>
          </TouchableOpacity>

          {legendOpen && (
            <View style={styles.layersGrid}>
              {mapLayers.map((layer, i) => (
                <View
                  key={i}
                  style={[
                    styles.layerCard,
                    { backgroundColor: layer.bg, borderColor: layer.borderColor },
                    !layer.active && styles.layerCardInactive,
                  ]}
                >
                  {/* Üst satır: pin + etiket + aktif badge */}
                  <View style={styles.layerCardTop}>
                    <View style={[styles.pinCircle, { backgroundColor: layer.color }]}>
                      <View style={styles.pinCircleDot} />
                    </View>
                    <Text style={[styles.layerCardLabel, { color: layer.color }]}>{layer.label}</Text>
                    {layer.active
                      ? <View style={[styles.activeBadge, { backgroundColor: layer.color }]}>
                          <Text style={styles.activeBadgeText}>Aktif</Text>
                        </View>
                      : <View style={styles.inactiveBadge}>
                          <Text style={styles.inactiveBadgeText}>Pasif</Text>
                        </View>
                    }
                  </View>

                  {/* İkon + açıklama */}
                  <View style={styles.layerCardBody}>
                    <View style={[styles.layerIconWrap, { backgroundColor: layer.active ? layer.color + '18' : '#F1F5F9' }]}>
                      <Icon name={layer.icon} size={20} color={layer.active ? layer.color : '#94A3B8'} strokeWidth={2} />
                    </View>
                    <Text style={[styles.layerCardDesc, !layer.active && { color: '#94A3B8' }]}>{layer.desc}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F5F9' },

  topStrip: { paddingBottom: 20, overflow: 'hidden' },
  heroRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16, paddingHorizontal: 20 },
  heroIconWrap: {
    width: 44, height: 44, borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)',
  },
  heroTitle: { fontSize: 22, fontWeight: '900', color: '#fff' },
  heroSub: { fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 2 },

  statsRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 20 },
  statChip: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 12, paddingVertical: 9, paddingHorizontal: 10,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)',
  },
  statVal: { fontSize: 16, fontWeight: '900', color: '#fff' },
  statLbl: { fontSize: 10, color: 'rgba(255,255,255,0.75)', fontWeight: '700', flex: 1 },

  /* MAP AREA */
  mapArea: {
    height: 220,
    backgroundColor: '#DBEAFE',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  gridLine: { position: 'absolute', backgroundColor: 'rgba(25,118,210,0.07)' },
  gridH: { left: 0, right: 0, height: 1 },
  gridV: { top: 0, bottom: 0, width: 1 },
  pin: {
    position: 'absolute',
    width: 14, height: 14, borderRadius: 7,
    borderWidth: 2.5, borderColor: '#fff',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2, shadowRadius: 4, elevation: 4,
  },
  pinRed:   { backgroundColor: '#EF4444' },
  pinBlue:  { backgroundColor: '#1976D2' },
  pinGreen: { backgroundColor: '#059669' },

  filterBar: {
    flexDirection: 'row', gap: 8,
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1, borderBottomColor: '#F1F5F9',
  },
  filterChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 22,
    borderWidth: 1.5,
  },
  filterDot: { width: 7, height: 7, borderRadius: 4 },
  filterText: { fontSize: 13, fontWeight: '700' },

  mapCard: {
    backgroundColor: '#fff',
    borderRadius: 22,
    padding: 22,
    alignItems: 'center',
    width: '72%',
    shadowColor: '#1976D2',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 12,
    borderWidth: 1,
    borderColor: 'rgba(25,118,210,0.08)',
  },
  mapCardIcon: {
    width: 56, height: 56, borderRadius: 16,
    backgroundColor: '#EFF6FF',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 12,
  },
  mapCardTitle: { fontSize: 16, fontWeight: '800', color: '#1E293B', marginBottom: 6 },
  mapCardSub: { fontSize: 13, color: '#64748B', textAlign: 'center', lineHeight: 19, marginBottom: 14 },
  comingSoonBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#FFF7ED',
    borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5,
    borderWidth: 1, borderColor: '#FED7AA',
  },
  comingSoonDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#F97316' },
  comingSoonText: { fontSize: 11, fontWeight: '700', color: '#C2410C' },

  /* SECTIONS */
  section: { paddingHorizontal: 16, marginTop: 20 },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionDot: { width: 4, height: 18, borderRadius: 2 },
  sectionTitle: { fontSize: 13, fontWeight: '800', color: '#64748B', letterSpacing: 1 },

  /* ALERT CARDS */
  alertCard: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    borderWidth: 1.5, borderRadius: 16,
    padding: 14, marginBottom: 8,
  },
  alertLevel: {
    borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4,
    flexShrink: 0,
  },
  alertLevelText: { fontSize: 11, fontWeight: '800', color: '#fff' },
  alertText: { flex: 1, fontSize: 13, fontWeight: '600', color: '#1E293B', lineHeight: 18 },

  /* LAYER CARDS */
  legendToggleBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#fff', borderRadius: 16,
    paddingHorizontal: 16, paddingVertical: 14,
    marginBottom: 10,
    borderWidth: 1, borderColor: '#E2E8F0',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
  },
  layersGrid: { gap: 10 },
  layerCard: {
    borderWidth: 1.5, borderRadius: 18,
    padding: 14,
  },
  layerCardInactive: { opacity: 0.65 },
  layerCardTop: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  pinCircle: {
    width: 20, height: 20, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: '#fff',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 2, elevation: 2,
  },
  pinCircleDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#fff' },
  layerCardLabel: { flex: 1, fontSize: 16, fontWeight: '800' },
  activeBadge: {
    borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3,
  },
  activeBadgeText: { fontSize: 11, fontWeight: '800', color: '#fff' },
  inactiveBadge: {
    borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3,
    backgroundColor: '#E2E8F0',
  },
  inactiveBadgeText: { fontSize: 11, fontWeight: '700', color: '#94A3B8' },
  layerCardBody: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  layerIconWrap: {
    width: 38, height: 38, borderRadius: 11,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  layerCardDesc: { flex: 1, fontSize: 13, color: '#475569', lineHeight: 18, fontWeight: '500' },
});
