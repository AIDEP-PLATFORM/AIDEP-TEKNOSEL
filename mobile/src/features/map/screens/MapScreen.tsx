import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Animated,
  Platform,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from '../../../shared/components/Icon';
import TopBar from '../../../shared/components/TopBar';
import DamageMarker from '../components/DamageMarker';
import RouteOverlay from '../components/RouteOverlay';
import { useMap } from '../hooks/useMap';
import { useLocation } from '../../../shared/hooks/useLocation';
import { useAuthStore } from '../../../core/stores/auth.store';
import type { DamageReport, MapFilter } from '../types';

// Türkiye merkezi
const TURKEY_REGION = {
  latitude: 38.9,
  longitude: 35.5,
  latitudeDelta: 9.0,
  longitudeDelta: 9.0,
};

const roleGradients: Record<string, [string, string]> = {
  citizen:   ['#1565C0', '#1976D2'],
  volunteer: ['#1B5E20', '#2E7D32'],
  admin:     ['#4A148C', '#7B1FA2'],
};

const FILTERS: { key: MapFilter; label: string; color: string; icon: 'alertTriangle' | 'users' | 'mapPin' | 'shield' }[] = [
  { key: 'hasar',    label: 'Hasar',    color: '#EF4444', icon: 'alertTriangle' },
  { key: 'ekip',     label: 'Ekip',     color: '#1976D2', icon: 'users'         },
  { key: 'toplanma', label: 'Toplanma', color: '#059669', icon: 'mapPin'        },
  { key: 'guzergah', label: 'Güzergah', color: '#7C3AED', icon: 'shield'        },
];

export default function MapScreen() {
  const { user } = useAuthStore();
  const role = user?.role ?? 'citizen';
  const gradient = roleGradients[role] ?? roleGradients.citizen;
  const insets = useSafeAreaInsets();

  const { damageReports, activeRoute, loading, error, fetchDamageReports } = useMap();
  const { location } = useLocation();

  const [activeFilters, setActiveFilters] = useState<MapFilter[]>(['hasar']);
  const [selectedReport, setSelectedReport] = useState<DamageReport | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const panelAnim = useRef(new Animated.Value(0)).current;
  const mapRef = useRef<MapView>(null);

  const toggleFilter = (key: MapFilter) => {
    setActiveFilters((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
  };

  const togglePanel = () => {
    const toValue = panelOpen ? 0 : 1;
    setPanelOpen(!panelOpen);
    Animated.spring(panelAnim, { toValue, useNativeDriver: true, speed: 18, bounciness: 4 }).start();
  };

  const goToMyLocation = () => {
    if (!location || !mapRef.current) return;
    mapRef.current.animateToRegion(
      { latitude: location.latitude, longitude: location.longitude, latitudeDelta: 0.05, longitudeDelta: 0.05 },
      500,
    );
  };

  const visibleReports = activeFilters.includes('hasar') ? damageReports : [];

  // Alt panel yüksekliği: tab bar + içerik
  const bottomOffset = insets.bottom + 90;

  return (
    <View style={styles.container}>
      {/* ── Harita ──────────────────────────────────────────────────────── */}
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFillObject}
        initialRegion={TURKEY_REGION}
        showsUserLocation={true}
        showsMyLocationButton={false}
        showsCompass={false}
        mapPadding={{ top: 0, right: 0, bottom: bottomOffset, left: 0 }}
      >
        {/* Hasar pinleri */}
        {visibleReports.map((report) => (
          <DamageMarker
            key={report.id}
            report={report}
            onPress={setSelectedReport}
          />
        ))}

        {/* Güzergah */}
        {activeFilters.includes('guzergah') && activeRoute && (
          <RouteOverlay route={activeRoute} />
        )}

        {/* Kullanıcı konumu custom marker */}
        {location && (
          <Marker coordinate={location} anchor={{ x: 0.5, y: 0.5 }} tracksViewChanges={false}>
            <View style={styles.myLocationDot}>
              <View style={styles.myLocationInner} />
            </View>
          </Marker>
        )}
      </MapView>

      {/* ── Üst gradient başlık ──────────────────────────────────────────── */}
      <LinearGradient
        colors={[gradient[0] + 'F0', gradient[1] + 'CC', 'transparent']}
        locations={[0, 0.7, 1]}
        style={[styles.header, { paddingTop: insets.top }]}
        pointerEvents="box-none"
      >
        <TopBar tint="light" />
        <View style={styles.headerContent}>
          <View style={styles.headerIcon}>
            <Icon name="mapPin" size={20} color="#fff" strokeWidth={2.5} />
          </View>
          <View>
            <Text style={styles.headerTitle}>Deprem Haritası</Text>
            <Text style={styles.headerSub}>
              {loading
                ? 'Yükleniyor…'
                : error
                  ? 'Bağlantı hatası'
                  : `${damageReports.length} hasar raporu`}
            </Text>
          </View>
          {loading && (
            <ActivityIndicator color="#fff" size="small" style={{ marginLeft: 'auto' }} />
          )}
        </View>
      </LinearGradient>

      {/* ── Filtre çubuğu ────────────────────────────────────────────────── */}
      <View
        style={[styles.filterBar, { top: insets.top + (Platform.OS === 'ios' ? 110 : 100) }]}
        pointerEvents="box-none"
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {FILTERS.map((f) => {
            const active = activeFilters.includes(f.key);
            return (
              <TouchableOpacity
                key={f.key}
                activeOpacity={0.8}
                onPress={() => toggleFilter(f.key)}
                style={[
                  styles.filterChip,
                  active
                    ? { backgroundColor: f.color, borderColor: f.color }
                    : { backgroundColor: 'rgba(255,255,255,0.92)', borderColor: '#E2E8F0' },
                ]}
              >
                <Icon
                  name={f.icon}
                  size={13}
                  color={active ? '#fff' : f.color}
                  strokeWidth={2.5}
                />
                <Text style={[styles.filterText, { color: active ? '#fff' : f.color }]}>
                  {f.label}
                </Text>
                {f.key === 'hasar' && damageReports.length > 0 && (
                  <View style={[styles.filterBadge, { backgroundColor: active ? 'rgba(255,255,255,0.3)' : f.color }]}>
                    <Text style={styles.filterBadgeText}>{damageReports.length}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* ── Sağ araç çubuğu ──────────────────────────────────────────────── */}
      <View style={[styles.toolBar, { bottom: bottomOffset + 16 }]}>
        {/* Konumuma git */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={goToMyLocation}
          style={styles.toolBtn}
        >
          <Icon name="mapPin" size={18} color="#1976D2" strokeWidth={2.5} />
        </TouchableOpacity>

        {/* Yenile */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={fetchDamageReports}
          style={styles.toolBtn}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color="#1976D2" size="small" />
            : <Icon name="alertTriangle" size={18} color="#1976D2" strokeWidth={2.5} />}
        </TouchableOpacity>
      </View>

      {/* ── Alt bilgi paneli ─────────────────────────────────────────────── */}
      <View style={[styles.bottomCard, { bottom: bottomOffset + 8 }]}>
        {/* Özet satırı */}
        <TouchableOpacity activeOpacity={0.9} onPress={togglePanel} style={styles.summaryRow}>
          <View style={styles.summaryChip}>
            <View style={[styles.dot, { backgroundColor: '#EF4444' }]} />
            <Text style={styles.summaryVal}>{damageReports.length}</Text>
            <Text style={styles.summaryLbl}>Hasar</Text>
          </View>
          <View style={styles.summaryChip}>
            <View style={[styles.dot, { backgroundColor: '#059669' }]} />
            <Text style={styles.summaryVal}>{activeRoute ? '1' : '0'}</Text>
            <Text style={styles.summaryLbl}>Güzergah</Text>
          </View>
          <View style={styles.summaryChip}>
            <View style={[styles.dot, { backgroundColor: location ? '#059669' : '#94A3B8' }]} />
            <Text style={[styles.summaryVal, { color: location ? '#059669' : '#94A3B8' }]}>
              {location ? 'Aktif' : 'Yok'}
            </Text>
            <Text style={styles.summaryLbl}>Konum</Text>
          </View>
          <Animated.View
            style={{
              transform: [{
                rotate: panelAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] }),
              }],
              marginLeft: 'auto',
            }}
          >
            <Icon name="chevronDown" size={16} color="#64748B" strokeWidth={2.5} />
          </Animated.View>
        </TouchableOpacity>

        {/* Genişletilmiş panel: hata / seçili rapor detayı */}
        {panelOpen && (
          <View style={styles.panelBody}>
            {error ? (
              <View style={styles.errorRow}>
                <Icon name="alertTriangle" size={14} color="#EF4444" strokeWidth={2} />
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity onPress={fetchDamageReports} style={styles.retryBtn}>
                  <Text style={styles.retryText}>Tekrar Dene</Text>
                </TouchableOpacity>
              </View>
            ) : selectedReport ? (
              <View style={styles.reportDetail}>
                <View style={styles.reportDetailRow}>
                  <Text style={styles.reportDetailLabel}>Sınıf:</Text>
                  <Text style={styles.reportDetailVal}>{selectedReport.damage_class ?? '—'}</Text>
                </View>
                <View style={styles.reportDetailRow}>
                  <Text style={styles.reportDetailLabel}>Şiddet:</Text>
                  <Text style={[styles.reportDetailVal, { color: '#EF4444' }]}>
                    {selectedReport.severity != null ? `${selectedReport.severity}/10` : '—'}
                  </Text>
                </View>
                <View style={styles.reportDetailRow}>
                  <Text style={styles.reportDetailLabel}>Durum:</Text>
                  <Text style={styles.reportDetailVal}>{selectedReport.status}</Text>
                </View>
                {selectedReport.description && (
                  <Text style={styles.reportDesc} numberOfLines={3}>
                    {selectedReport.description}
                  </Text>
                )}
                <TouchableOpacity
                  onPress={() => setSelectedReport(null)}
                  style={styles.closeDetailBtn}
                >
                  <Text style={styles.closeDetailText}>Kapat</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <Text style={styles.panelHint}>
                Haritadaki bir pine tıklayarak detayları görebilirsiniz.
              </Text>
            )}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E8EAF0' },

  // Header
  header: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    paddingBottom: 24,
    zIndex: 10,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 4,
  },
  headerIcon: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)',
  },
  headerTitle: { fontSize: 20, fontWeight: '900', color: '#fff' },
  headerSub:   { fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 1 },

  // Filtreler
  filterBar: {
    position: 'absolute',
    left: 0, right: 0,
    zIndex: 10,
  },
  filterScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: 22, borderWidth: 1.5,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 4, elevation: 3,
  },
  filterText: { fontSize: 12, fontWeight: '700' },
  filterBadge: {
    borderRadius: 10, paddingHorizontal: 6, paddingVertical: 1,
  },
  filterBadgeText: { fontSize: 10, fontWeight: '800', color: '#fff' },

  // Araç çubuğu
  toolBar: {
    position: 'absolute', right: 16,
    gap: 10, zIndex: 10,
  },
  toolBtn: {
    width: 44, height: 44, borderRadius: 14,
    backgroundColor: '#fff',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12, shadowRadius: 6, elevation: 6,
    borderWidth: 1, borderColor: '#E2E8F0',
  },

  // Alt kart
  bottomCard: {
    position: 'absolute',
    left: 16, right: 16,
    backgroundColor: '#fff',
    borderRadius: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12, shadowRadius: 16, elevation: 12,
    borderWidth: 1, borderColor: '#F1F5F9',
    zIndex: 10,
  },
  summaryRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14,
    gap: 4,
  },
  summaryChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#F8FAFC', borderRadius: 10,
    paddingHorizontal: 10, paddingVertical: 6,
    marginRight: 6,
    borderWidth: 1, borderColor: '#E2E8F0',
  },
  dot:         { width: 7, height: 7, borderRadius: 4 },
  summaryVal:  { fontSize: 13, fontWeight: '800', color: '#1E293B' },
  summaryLbl:  { fontSize: 10, color: '#64748B', fontWeight: '600' },

  panelBody: {
    borderTopWidth: 1, borderTopColor: '#F1F5F9',
    paddingHorizontal: 16, paddingVertical: 14,
  },
  panelHint: {
    fontSize: 12, color: '#94A3B8', textAlign: 'center', lineHeight: 18,
  },

  errorRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
  },
  errorText: { flex: 1, fontSize: 12, color: '#EF4444', fontWeight: '500' },
  retryBtn:  {
    backgroundColor: '#FEE2E2', borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 5,
  },
  retryText: { fontSize: 11, fontWeight: '700', color: '#DC2626' },

  reportDetail: { gap: 6 },
  reportDetailRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  reportDetailLabel: { fontSize: 12, color: '#64748B', fontWeight: '600', width: 60 },
  reportDetailVal:   { fontSize: 12, color: '#1E293B', fontWeight: '700' },
  reportDesc: {
    fontSize: 12, color: '#475569', lineHeight: 17,
    backgroundColor: '#F8FAFC', borderRadius: 8,
    padding: 8, marginTop: 4,
  },
  closeDetailBtn: {
    alignSelf: 'flex-end', marginTop: 6,
    backgroundColor: '#F1F5F9', borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 5,
  },
  closeDetailText: { fontSize: 11, fontWeight: '700', color: '#64748B' },

  // Kullanıcı konum noktası
  myLocationDot: {
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: 'rgba(25,118,210,0.15)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: '#1976D2',
  },
  myLocationInner: {
    width: 9, height: 9, borderRadius: 5,
    backgroundColor: '#1976D2',
  },
});
