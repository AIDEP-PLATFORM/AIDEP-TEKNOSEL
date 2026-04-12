import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from '../../../shared/components/Icon';
import TopBar from '../../../shared/components/TopBar';
import FloatingBubbles from '../../../shared/components/FloatingBubbles';
import { useAuthStore } from '../../../core/stores/auth.store';

const quickStats = [
  { icon: 'alertTriangle' as const, label: 'Aktif Bölge', value: '48', color: '#FCA5A5' },
  { icon: 'shield'        as const, label: 'Güvenli Alan', value: '12', color: '#6EE7B7' },
  { icon: 'users'         as const, label: 'Saha Ekibi',   value: '23', color: '#fff'   },
];

const mapLayers = [
  { icon: 'alertTriangle' as const, label: 'Hasar Noktaları',  desc: 'Kırmızı pin — yıkılan bina veya enkaz bölgesi',     color: '#EF4444', bg: 'rgba(255,241,242,0.92)', borderColor: '#FECACA', active: true  },
  { icon: 'users'         as const, label: 'Ekip Konumları',   desc: 'Mavi pin — aktif saha ekiplerinin anlık konumu',      color: '#1976D2', bg: 'rgba(239,246,255,0.92)', borderColor: '#BFDBFE', active: true  },
  { icon: 'mapPin'        as const, label: 'Toplanma Alanı',   desc: 'Yeşil pin — depremzedeler için güvenli toplanma noktaları', color: '#059669', bg: 'rgba(236,253,245,0.92)', borderColor: '#A7F3D0', active: false },
  { icon: 'shield'        as const, label: 'Güvenli Güzergah', desc: 'Mor pin — tahliye ve yardım için önerilen rotalar',   color: '#7C3AED', bg: 'rgba(245,243,255,0.92)', borderColor: '#DDD6FE', active: false },
];

const alertBanners = [
  { level: 'Kritik', text: 'Kahramanmaraş Merkez — 5.8 büyüklüğünde artçı sarsıntı', color: '#EF4444', bg: 'rgba(255,241,242,0.92)', border: '#FECACA' },
  { level: 'Dikkat', text: 'D400 karayolu kapandı — alternatif güzergah kullanın',     color: '#D97706', bg: 'rgba(255,251,235,0.92)', border: '#FDE68A' },
];

const roleGradients: Record<string, [string, string, string]> = {
  citizen:   ['#1565C0', '#1976D2', '#1E88E5'],
  volunteer: ['#1B5E20', '#2E7D32', '#43A047'],
  admin:     ['#4A148C', '#7B1FA2', '#AB47BC'],
};

const roleBgEnd: Record<string, string> = {
  citizen:   '#EFF6FF',
  volunteer: '#F0FDF4',
  admin:     '#F5F3FF',
};

export default function MapScreen() {
  const { user } = useAuthStore();
  const role = user?.role ?? 'citizen';
  const gradient = roleGradients[role] ?? roleGradients.citizen;
  const bgEnd = roleBgEnd[role] ?? roleBgEnd.citizen;

  const [activeFilters, setActiveFilters] = useState<string[]>(['hasar', 'ekip']);
  const [legendOpen, setLegendOpen] = useState(false);
  const legendAnim = useRef(new Animated.Value(0)).current;

  const toggleLegend = () => {
    const toValue = legendOpen ? 0 : 1;
    setLegendOpen(!legendOpen);
    Animated.spring(legendAnim, { toValue, useNativeDriver: true, speed: 18, bounciness: 4 }).start();
  };

  const filters = [
    { key: 'hasar',    label: 'Hasar',    color: '#EF4444' },
    { key: 'ekip',     label: 'Ekip',     color: '#1976D2' },
    { key: 'toplanma', label: 'Toplanma', color: '#059669' },
    { key: 'guzergah', label: 'Güzergah', color: '#7C3AED' },
  ];

  return (
    <View style={styles.container}>
      {/* Gradient tüm ekranı kaplar */}
      <LinearGradient
        colors={[gradient[0], gradient[1], gradient[2], bgEnd]}
        locations={[0, 0.2, 0.42, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Hero */}
      <View style={styles.hero}>
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
        <View style={styles.statsRow}>
          {quickStats.map((s, i) => (
            <View key={i} style={styles.statChip}>
              <Icon name={s.icon} size={13} color={s.color} strokeWidth={2.5} />
              <Text style={styles.statVal}>{s.value}</Text>
              <Text style={styles.statLbl}>{s.label}</Text>
            </View>
          ))}
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 110 }}>

        {/* Filtreler */}
        <View style={styles.filterBar}>
          {filters.map(f => {
            const isActive = activeFilters.includes(f.key);
            return (
              <TouchableOpacity
                key={f.key}
                activeOpacity={0.8}
                onPress={() => setActiveFilters(prev =>
                  prev.includes(f.key) ? prev.filter(k => k !== f.key) : [...prev, f.key]
                )}
                style={[
                  styles.filterChip,
                  isActive
                    ? { backgroundColor: f.color, borderColor: f.color }
                    : { backgroundColor: 'rgba(255,255,255,0.25)', borderColor: 'rgba(255,255,255,0.4)' },
                ]}
              >
                <View style={[styles.filterDot, { backgroundColor: isActive ? '#fff' : f.color }]} />
                <Text style={[styles.filterText, { color: '#fff' }]}>{f.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Harita placeholder */}
        <View style={styles.mapArea}>
          {[...Array(7)].map((_, i) => (
            <View key={`h${i}`} style={[styles.gridLine, styles.gridH, { top: `${i * 16}%` as any }]} />
          ))}
          {[...Array(5)].map((_, i) => (
            <View key={`v${i}`} style={[styles.gridLine, styles.gridV, { left: `${i * 25}%` as any }]} />
          ))}
          <View style={[styles.pin, styles.pinRed,   { top: '28%', left: '32%' }]} />
          <View style={[styles.pin, styles.pinRed,   { top: '48%', left: '58%' }]} />
          <View style={[styles.pin, styles.pinRed,   { top: '62%', left: '20%' }]} />
          <View style={[styles.pin, styles.pinBlue,  { top: '35%', left: '72%' }]} />
          <View style={[styles.pin, styles.pinBlue,  { top: '68%', left: '46%' }]} />
          <View style={[styles.pin, styles.pinGreen, { top: '75%', left: '68%' }]} />

          <View style={styles.mapCard}>
            <View style={styles.mapCardIcon}>
              <Icon name="mapPin" size={28} color="#1976D2" strokeWidth={1.5} />
            </View>
            <Text style={styles.mapCardTitle}>Harita Entegrasyonu</Text>
            <Text style={styles.mapCardSub}>OpenStreetMap ile gerçek zamanlı{'\n'}deprem haritası yakında aktif olacak</Text>
            <View style={styles.comingSoonBadge}>
              <View style={styles.comingSoonDot} />
              <Text style={styles.comingSoonText}>Geliştirme Aşamasında</Text>
            </View>
          </View>
        </View>

        {/* Aktif Uyarılar */}
        <View style={styles.section}>
          <View style={styles.sectionRow}>
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
          <TouchableOpacity activeOpacity={0.8} onPress={toggleLegend} style={styles.legendBtn}>
            <View style={styles.sectionRow}>
              <LinearGradient colors={['#1976D2', '#42A5F5']} style={styles.sectionDot} />
              <Text style={styles.sectionTitle}>HARİTA GÖSTERGESİ</Text>
            </View>
            <Animated.View style={{ transform: [{ rotate: legendAnim.interpolate({ inputRange: [0,1], outputRange: ['0deg','180deg'] }) }] }}>
              <Icon name="chevronDown" size={18} color="rgba(255,255,255,0.7)" strokeWidth={2.5} />
            </Animated.View>
          </TouchableOpacity>

          {legendOpen && (
            <View style={styles.layersGrid}>
              {mapLayers.map((layer, i) => (
                <View key={i} style={[styles.layerCard, { backgroundColor: layer.bg, borderColor: layer.borderColor }]}>
                  <View style={styles.layerCardTop}>
                    <View style={[styles.pinCircle, { backgroundColor: layer.color }]}>
                      <View style={styles.pinDot} />
                    </View>
                    <Text style={[styles.layerLabel, { color: layer.color }]}>{layer.label}</Text>
                    <View style={[styles.badge, { backgroundColor: layer.active ? layer.color : '#CBD5E1' }]}>
                      <Text style={styles.badgeText}>{layer.active ? 'Aktif' : 'Pasif'}</Text>
                    </View>
                  </View>
                  <View style={styles.layerCardBody}>
                    <View style={[styles.layerIconBox, { backgroundColor: layer.color + '20' }]}>
                      <Icon name={layer.icon} size={18} color={layer.color} strokeWidth={2} />
                    </View>
                    <Text style={styles.layerDesc}>{layer.desc}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  hero: { paddingBottom: 20, overflow: 'hidden' },
  heroRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, marginBottom: 16 },
  heroIconWrap: {
    width: 44, height: 44, borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)',
  },
  heroTitle: { fontSize: 22, fontWeight: '900', color: '#fff' },
  heroSub:   { fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 2 },

  statsRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 20 },
  statChip: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 12, paddingVertical: 9, paddingHorizontal: 10,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)',
  },
  statVal: { fontSize: 15, fontWeight: '900', color: '#fff' },
  statLbl: { fontSize: 10, color: 'rgba(255,255,255,0.75)', fontWeight: '700', flex: 1 },

  filterBar: {
    flexDirection: 'row', gap: 8,
    paddingHorizontal: 16, paddingVertical: 12,
  },
  filterChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 22,
    borderWidth: 1.5,
  },
  filterDot:  { width: 7, height: 7, borderRadius: 4 },
  filterText: { fontSize: 12, fontWeight: '700' },

  mapArea: {
    height: 230,
    backgroundColor: 'rgba(255,255,255,0.12)',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  gridLine: { position: 'absolute', backgroundColor: 'rgba(255,255,255,0.1)' },
  gridH: { left: 0, right: 0, height: 1 },
  gridV: { top: 0, bottom: 0, width: 1 },
  pin: {
    position: 'absolute', width: 14, height: 14, borderRadius: 7,
    borderWidth: 2.5, borderColor: '#fff',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 4,
  },
  pinRed:   { backgroundColor: '#EF4444' },
  pinBlue:  { backgroundColor: '#1976D2' },
  pinGreen: { backgroundColor: '#059669' },

  mapCard: {
    backgroundColor: 'rgba(255,255,255,0.93)',
    borderRadius: 20, padding: 20,
    alignItems: 'center', width: '72%',
    shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.15, shadowRadius: 16, elevation: 10,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.6)',
  },
  mapCardIcon: {
    width: 52, height: 52, borderRadius: 15,
    backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center', marginBottom: 10,
  },
  mapCardTitle: { fontSize: 15, fontWeight: '800', color: '#1E293B', marginBottom: 6 },
  mapCardSub:   { fontSize: 12, color: '#64748B', textAlign: 'center', lineHeight: 18, marginBottom: 12 },
  comingSoonBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#FFF7ED', borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 5,
    borderWidth: 1, borderColor: '#FED7AA',
  },
  comingSoonDot:  { width: 6, height: 6, borderRadius: 3, backgroundColor: '#F97316' },
  comingSoonText: { fontSize: 11, fontWeight: '700', color: '#C2410C' },

  section: { paddingHorizontal: 16, marginTop: 20 },
  sectionRow:  { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionDot:  { width: 4, height: 18, borderRadius: 2 },
  sectionTitle: { fontSize: 12, fontWeight: '800', color: 'rgba(255,255,255,0.85)', letterSpacing: 1 },

  alertCard: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    borderWidth: 1.5, borderRadius: 16, padding: 14, marginTop: 10,
  },
  alertLevel: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, flexShrink: 0 },
  alertLevelText: { fontSize: 11, fontWeight: '800', color: '#fff' },
  alertText: { flex: 1, fontSize: 13, fontWeight: '600', color: '#1E293B', lineHeight: 18 },

  legendBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 16, paddingHorizontal: 16, paddingVertical: 14,
    marginBottom: 10,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)',
  },
  layersGrid: { gap: 10 },
  layerCard: {
    borderWidth: 1.5, borderRadius: 18, padding: 14,
  },
  layerCardTop:  { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  pinCircle: {
    width: 20, height: 20, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: '#fff',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 2, elevation: 2,
  },
  pinDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#fff' },
  layerLabel: { flex: 1, fontSize: 15, fontWeight: '800' },
  badge: { borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3 },
  badgeText: { fontSize: 11, fontWeight: '800', color: '#fff' },
  layerCardBody: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  layerIconBox: {
    width: 36, height: 36, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  layerDesc: { flex: 1, fontSize: 13, color: '#475569', lineHeight: 18, fontWeight: '500' },
});
