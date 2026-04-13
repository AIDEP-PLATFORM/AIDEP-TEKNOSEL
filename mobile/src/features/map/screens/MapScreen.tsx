import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, ActivityIndicator, Platform, TextInput,
  Modal, Linking, LayoutChangeEvent,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from '../../../shared/components/Icon';
import TopBar from '../../../shared/components/TopBar';
import { useMap } from '../hooks/useMap';
import { useLocation } from '../../../shared/hooks/useLocation';
import { useAuthStore } from '../../../core/stores/auth.store';
import { useMapStore } from '../../../core/stores/map.store';
import { showToast } from '../../../shared/components/Toast';
import type { DamageReport, MapFilter, Route } from '../types';

const TURKEY_CENTER = { lat: 38.9, lng: 35.5, zoom: 6 };

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

// Statik temel HTML — hiçbir veri içermez.
// Tüm güncellemeler injectJavaScript ile yapılır.
const BASE_HTML = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no"/>
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body, #map { width: 100%; height: 100%; }
    .custom-pin {
      width: 24px; height: 24px; border-radius: 50%;
      border: 3px solid #fff; box-shadow: 0 2px 8px rgba(0,0,0,0.35);
    }
    .leaflet-popup-content-wrapper { border-radius: 14px; box-shadow: 0 4px 20px rgba(0,0,0,0.18); }
    .popup-header { padding: 8px 12px; border-radius: 10px 10px 0 0; font-weight: 700; font-size: 13px; color: #fff; }
    .popup-body { padding: 10px 12px; font-size: 12px; color: #1E293B; }
    .popup-row { margin-bottom: 4px; }
    .popup-desc { color: #475569; margin-top: 4px; line-height: 1.4; }
    .popup-date { color: #94A3B8; font-size: 11px; margin-top: 6px; }
  </style>
</head>
<body>
<div id="map"></div>
<script>
  var map = L.map('map', { zoomControl: true }).setView([${TURKEY_CENTER.lat}, ${TURKEY_CENTER.lng}], ${TURKEY_CENTER.zoom});
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '\\u00a9 OpenStreetMap', maxZoom: 19,
  }).addTo(map);

  var markerLayer = L.layerGroup().addTo(map);
  var routeShadowLayer = null;
  var routeLayer = null;
  var routeStartMarker = null;
  var routeEndMarker = null;
  var userMarker = null;

  // ── Hasar pinlerini çiz ──────────────────────────────────────────────────────
  window.drawMarkers = function(markers) {
    markerLayer.clearLayers();
    markers.forEach(function(r) {
      var color = r.severity >= 7 ? '#DC2626' : r.severity >= 4 ? '#D97706' : '#059669';
      if (!r.severity) color = '#64748B';
      var icon = L.divIcon({
        className: '',
        html: '<div class="custom-pin" style="background:' + color + '"></div>',
        iconSize: [24, 24], iconAnchor: [12, 12],
      });
      var date = new Date(r.created_at).toLocaleDateString('tr-TR');
      var popup =
        '<div class="popup-header" style="background:' + color + '">' + (r.damage_class || 'Hasar Raporu') + '</div>' +
        '<div class="popup-body">' +
        (r.severity ? '<div class="popup-row">\\u015eiddet: <b style="color:' + color + '">' + r.severity + '/10</b></div>' : '') +
        '<div class="popup-row">Durum: ' + r.status + '</div>' +
        (r.description ? '<div class="popup-desc">' + r.description + '</div>' : '') +
        '<div class="popup-date">' + date + '</div></div>';
      L.marker([r.lat, r.lng], { icon: icon })
        .addTo(markerLayer)
        .bindPopup(popup, { maxWidth: 220 })
        .on('click', function() {
          window.ReactNativeWebView && window.ReactNativeWebView.postMessage(
            JSON.stringify({ type: 'markerClick', id: r.id })
          );
        });
    });
  };

  // ── Rotayı çiz ──────────────────────────────────────────────────────────────
  window.drawRoute = function(coords) {
    // Önce eskiyi temizle
    if (routeShadowLayer) { map.removeLayer(routeShadowLayer); routeShadowLayer = null; }
    if (routeLayer)       { map.removeLayer(routeLayer);       routeLayer = null; }
    if (routeStartMarker) { map.removeLayer(routeStartMarker); routeStartMarker = null; }
    if (routeEndMarker)   { map.removeLayer(routeEndMarker);   routeEndMarker = null; }

    if (!coords || coords.length < 2) return;

    routeShadowLayer = L.polyline(coords, {
      color: 'rgba(0,0,0,0.15)', weight: 8, lineJoin: 'round'
    }).addTo(map);

    routeLayer = L.polyline(coords, {
      color: '#7C3AED', weight: 5, lineJoin: 'round'
    }).addTo(map);

    routeStartMarker = L.circleMarker(coords[0], {
      radius: 9, color: '#fff', fillColor: '#059669', fillOpacity: 1, weight: 2.5
    }).addTo(map).bindPopup('<b>Ba\\u015flang\\u0131\\u00e7</b>');

    routeEndMarker = L.circleMarker(coords[coords.length - 1], {
      radius: 9, color: '#fff', fillColor: '#DC2626', fillOpacity: 1, weight: 2.5
    }).addTo(map).bindPopup('<b>Hedef</b>');

    map.fitBounds(routeLayer.getBounds(), { padding: [50, 50] });
  };

  // ── Rotayı temizle ──────────────────────────────────────────────────────────
  window.clearRoute = function() {
    if (routeShadowLayer) { map.removeLayer(routeShadowLayer); routeShadowLayer = null; }
    if (routeLayer)       { map.removeLayer(routeLayer);       routeLayer = null; }
    if (routeStartMarker) { map.removeLayer(routeStartMarker); routeStartMarker = null; }
    if (routeEndMarker)   { map.removeLayer(routeEndMarker);   routeEndMarker = null; }
  };

  // ── Kullanıcı konumunu güncelle ─────────────────────────────────────────────
  window.updateUserMarker = function(lat, lng) {
    if (userMarker) { map.removeLayer(userMarker); }
    userMarker = L.circleMarker([lat, lng], {
      radius: 8, color: '#fff', fillColor: '#1976D2', fillOpacity: 0.95, weight: 3
    }).addTo(map).bindPopup('<b>Konumunuz</b>');
  };

  window.goToUser = function(lat, lng) { map.setView([lat, lng], 15); };

  // Hazır sinyali gönder
  window.ReactNativeWebView && window.ReactNativeWebView.postMessage(
    JSON.stringify({ type: 'mapReady' })
  );
</script>
</body>
</html>`;

export default function MapScreen() {
  const { user } = useAuthStore();
  const role = user?.role ?? 'citizen';
  const gradient = roleGradients[role] ?? roleGradients.citizen;
  const insets = useSafeAreaInsets();

  const { damageReports, activeRoute, loading, error, fetchDamageReports, calculateRoute, clearRoute } = useMap();
  const { pendingRouteModal, clearRouteModalTrigger } = useMapStore();
  const { location } = useLocation();

  const [activeFilters, setActiveFilters] = useState<MapFilter[]>(['hasar']);
  const [selectedReport, setSelectedReport] = useState<DamageReport | null>(null);
  const [routeModalVisible, setRouteModalVisible] = useState(false);
  const [routeLoading, setRouteLoading] = useState(false);
  const [startLat, setStartLat] = useState('');
  const [startLng, setStartLng] = useState('');
  const [endLat, setEndLat] = useState('');
  const [endLng, setEndLng] = useState('');
  const [destCoords, setDestCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [headerHeight, setHeaderHeight] = useState(0);
  // WebView Leaflet yüklenip hazır mı?
  const [mapReady, setMapReady] = useState(false);

  const webviewRef = useRef<WebView>(null);

  // ── Inject yardımcıları ─────────────────────────────────────────────────────
  const inject = useCallback((js: string) => {
    webviewRef.current?.injectJavaScript(js + '; true;');
  }, []);

  // ── Hasar pinleri: sadece "hasar" filtresi aktifse çiz ─────────────────────
  useEffect(() => {
    if (!mapReady) return;
    if (activeFilters.includes('hasar')) {
      const data = JSON.stringify(
        damageReports
          .filter(r => r.lat != null && r.lng != null)
          .map(r => ({
            id: r.id, lat: r.lat, lng: r.lng,
            severity: r.severity,
            damage_class: r.damage_class ?? 'Hasar Raporu',
            status: r.status,
            description: r.description ?? '',
            created_at: r.created_at,
          }))
      );
      inject(`drawMarkers(${data})`);
    } else {
      inject('drawMarkers([])');
    }
  }, [mapReady, damageReports, activeFilters]);

  // ── Rota: "guzergah" filtresi aktif ve rota varsa çiz ──────────────────────
  useEffect(() => {
    if (!mapReady) return;
    if (activeRoute && activeFilters.includes('guzergah')) {
      const coords = JSON.stringify(activeRoute.coordinates.map(c => [c.lat, c.lng]));
      inject(`drawRoute(${coords})`);
    } else {
      inject('clearRoute()');
    }
  }, [mapReady, activeRoute, activeFilters]);

  // ── Kullanıcı konumu ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!mapReady || !location) return;
    inject(`updateUserMarker(${location.latitude}, ${location.longitude})`);
  }, [mapReady, location]);

  // ── ReportScreen'den gelen otomatik rota modal tetikleyici ──────────────────
  useEffect(() => {
    if (pendingRouteModal) {
      clearRouteModalTrigger();
      setRouteModalVisible(true);
    }
  }, [pendingRouteModal]);

  const toggleFilter = (key: MapFilter) => {
    setActiveFilters(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const goToMyLocation = () => {
    if (!location) return;
    inject(`goToUser(${location.latitude}, ${location.longitude})`);
  };

  const openRouteModal = () => {
    if (location) {
      setStartLat(String(location.latitude.toFixed(6)));
      setStartLng(String(location.longitude.toFixed(6)));
    }
    setRouteModalVisible(true);
  };

  const handleCalculateRoute = async () => {
    const sLat = parseFloat(startLat);
    const sLng = parseFloat(startLng);
    const eLat = parseFloat(endLat);
    const eLng = parseFloat(endLng);

    if (isNaN(sLat) || isNaN(sLng) || isNaN(eLat) || isNaN(eLng)) {
      showToast('Lütfen geçerli koordinatlar girin.', 'error');
      return;
    }

    setRouteLoading(true);
    try {
      const route = await calculateRoute({ start_lat: sLat, start_lng: sLng, end_lat: eLat, end_lng: eLng });
      setDestCoords({ lat: eLat, lng: eLng });
      setRouteModalVisible(false);
      // Güzergah filtresini aç — useEffect rota inject'ini tetikler
      setActiveFilters(prev => prev.includes('guzergah') ? prev : [...prev, 'guzergah']);
      showToast('Güzergah hesaplandı.', 'success');
      // Rota hemen inject et (filter state güncellemesini beklemeden)
      if (route?.coordinates?.length > 1) {
        const coords = JSON.stringify(route.coordinates.map((c: { lat: number; lng: number }) => [c.lat, c.lng]));
        inject(`drawRoute(${coords})`);
      }
    } catch (e: any) {
      showToast(e?.response?.data?.detail ?? 'Rota hesaplanamadı.', 'error');
    } finally {
      setRouteLoading(false);
    }
  };

  const handleClearRoute = () => {
    clearRoute();
    setDestCoords(null);
    inject('clearRoute()');
    setActiveFilters(prev => prev.filter(k => k !== 'guzergah'));
  };

  const openNativeMaps = useCallback(async () => {
    if (!destCoords) return;
    const { lat, lng } = destCoords;
    const googleUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
    const appleUrl  = `maps://?daddr=${lat},${lng}&dirflg=d`;

    if (Platform.OS === 'ios') {
      const canApple = await Linking.canOpenURL(appleUrl);
      if (canApple) { Linking.openURL(appleUrl); return; }
    }
    Linking.openURL(googleUrl);
  }, [destCoords]);

  const onWebViewMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'mapReady') {
        setMapReady(true);
      } else if (data.type === 'markerClick') {
        const report = damageReports.find(r => r.id === data.id);
        if (report) setSelectedReport(report);
      }
    } catch {}
  };

  const onHeaderLayout = (e: LayoutChangeEvent) => {
    setHeaderHeight(e.nativeEvent.layout.height);
  };

  const bottomOffset = insets.bottom + 90;
  const filterBarTop = headerHeight > 0 ? headerHeight - 14 : insets.top + 120;

  return (
    <View style={styles.container}>
      {/* Harita — statik HTML, güncellemeler inject ile */}
      <WebView
        ref={webviewRef}
        style={StyleSheet.absoluteFillObject}
        source={{ html: BASE_HTML }}
        originWhitelist={['*']}
        onMessage={onWebViewMessage}
        javaScriptEnabled
        domStorageEnabled
        scrollEnabled={false}
        bounces={false}
      />

      {/* Yükleniyor overlay */}
      {!mapReady && (
        <View style={styles.mapLoading}>
          <ActivityIndicator color="#1976D2" size="large" />
          <Text style={styles.mapLoadingText}>Harita yükleniyor…</Text>
        </View>
      )}

      {/* Üst gradient başlık */}
      <LinearGradient
        colors={[gradient[0] + 'F0', gradient[1] + 'CC', 'transparent']}
        locations={[0, 0.7, 1]}
        style={styles.header}
        pointerEvents="box-none"
        onLayout={onHeaderLayout}
      >
        <TopBar tint="light" />
        <View style={styles.headerContent}>
          <View style={styles.headerIcon}>
            <Icon name="mapPin" size={20} color="#fff" strokeWidth={2.5} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>Deprem Haritası</Text>
            <Text style={styles.headerSub}>
              {loading ? 'Yükleniyor…' : error ? 'Bağlantı hatası' : `${damageReports.length} hasar raporu`}
            </Text>
          </View>
          {loading && <ActivityIndicator color="#fff" size="small" />}
        </View>
      </LinearGradient>

      {/* Filtre çubuğu */}
      <View style={[styles.filterBar, { top: filterBarTop }]} pointerEvents="box-none">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {FILTERS.map(f => {
            const active = activeFilters.includes(f.key);
            return (
              <TouchableOpacity
                key={f.key} activeOpacity={0.8}
                onPress={() => f.key === 'guzergah' ? openRouteModal() : toggleFilter(f.key)}
                style={[styles.filterChip, active
                  ? { backgroundColor: f.color, borderColor: f.color }
                  : { backgroundColor: 'rgba(255,255,255,0.92)', borderColor: '#E2E8F0' }]}
              >
                <Icon name={f.icon} size={13} color={active ? '#fff' : f.color} strokeWidth={2.5} />
                <Text style={[styles.filterText, { color: active ? '#fff' : f.color }]}>{f.label}</Text>
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

      {/* Sağ araç çubuğu */}
      <View style={[styles.toolBar, { bottom: bottomOffset + 16 }]}>
        <TouchableOpacity activeOpacity={0.8} onPress={goToMyLocation} style={styles.toolBtn}>
          <Icon name="mapPin" size={18} color="#1976D2" strokeWidth={2.5} />
        </TouchableOpacity>
        <TouchableOpacity activeOpacity={0.8} onPress={fetchDamageReports} style={styles.toolBtn} disabled={loading}>
          {loading
            ? <ActivityIndicator color="#1976D2" size="small" />
            : <Icon name="alertTriangle" size={18} color="#1976D2" strokeWidth={2.5} />}
        </TouchableOpacity>
        {activeRoute && (
          <TouchableOpacity activeOpacity={0.8} onPress={handleClearRoute} style={[styles.toolBtn, { borderColor: '#DC2626' }]}>
            <Icon name="close" size={18} color="#DC2626" strokeWidth={2.5} />
          </TouchableOpacity>
        )}
      </View>

      {/* Alt bilgi kartı */}
      <View style={[styles.bottomCard, { bottom: bottomOffset + 8 }]}>
        <View style={styles.summaryRow}>
          <View style={styles.summaryChip}>
            <View style={[styles.dot, { backgroundColor: '#EF4444' }]} />
            <Text style={styles.summaryVal}>{damageReports.length}</Text>
            <Text style={styles.summaryLbl}>Hasar</Text>
          </View>
          {activeRoute && (
            <View style={styles.summaryChip}>
              <View style={[styles.dot, { backgroundColor: '#7C3AED' }]} />
              <Text style={[styles.summaryVal, { color: '#7C3AED' }]}>
                {activeRoute.distance_meters
                  ? `${(activeRoute.distance_meters / 1000).toFixed(1)} km`
                  : 'Aktif'}
              </Text>
              <Text style={styles.summaryLbl}>Güzergah</Text>
            </View>
          )}
          <View style={styles.summaryChip}>
            <View style={[styles.dot, { backgroundColor: location ? '#059669' : '#94A3B8' }]} />
            <Text style={[styles.summaryVal, { color: location ? '#059669' : '#94A3B8' }]}>
              {location ? 'Aktif' : 'Yok'}
            </Text>
            <Text style={styles.summaryLbl}>Konum</Text>
          </View>
          {error && (
            <TouchableOpacity onPress={fetchDamageReports} style={styles.retryBtn}>
              <Icon name="alertTriangle" size={12} color="#DC2626" strokeWidth={2} />
              <Text style={styles.retryText}>Tekrar Dene</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Seçili rapor detayı */}
        {selectedReport && (
          <View style={styles.panelBody}>
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
              <Text style={styles.reportDesc} numberOfLines={2}>{selectedReport.description}</Text>
            )}
            <View style={styles.reportActions}>
              {selectedReport.lat && selectedReport.lng && (
                <TouchableOpacity
                  style={styles.reportRouteBtn}
                  onPress={() => {
                    if (location) {
                      setStartLat(String(location.latitude.toFixed(6)));
                      setStartLng(String(location.longitude.toFixed(6)));
                    }
                    setEndLat(String(selectedReport.lat!.toFixed(6)));
                    setEndLng(String(selectedReport.lng!.toFixed(6)));
                    setSelectedReport(null);
                    setRouteModalVisible(true);
                  }}
                >
                  <Icon name="mapPin" size={13} color="#7C3AED" strokeWidth={2.5} />
                  <Text style={styles.reportRouteBtnText}>Buraya Rota Hesapla</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={() => setSelectedReport(null)} style={styles.closeDetailBtn}>
                <Text style={styles.closeDetailText}>Kapat</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Aktif rota — navigasyon çubuğu */}
        {activeRoute && !selectedReport && (
          <View style={styles.routeNavBar}>
            <View style={styles.routeNavInfoRow}>
              <Icon name="mapPin" size={14} color="#7C3AED" strokeWidth={2.5} />
              <Text style={styles.routeNavDist}>
                {activeRoute.distance_meters
                  ? `${(activeRoute.distance_meters / 1000).toFixed(1)} km`
                  : '—'}
              </Text>
              {activeRoute.duration_seconds != null && (
                <Text style={styles.routeNavDur}>
                  · {Math.round(activeRoute.duration_seconds / 60)} dk
                </Text>
              )}
              {activeRoute.risk_score != null && (
                <View style={[
                  styles.riskBadge,
                  { backgroundColor: activeRoute.risk_score > 50 ? '#FEE2E2' : '#ECFDF5' },
                ]}>
                  <Text style={[
                    styles.riskText,
                    { color: activeRoute.risk_score > 50 ? '#DC2626' : '#059669' },
                  ]}>
                    Risk: {activeRoute.risk_score.toFixed(0)}%
                  </Text>
                </View>
              )}
            </View>
            <TouchableOpacity onPress={openNativeMaps} activeOpacity={0.85} style={styles.navStartBtn}>
              <LinearGradient
                colors={['#7C3AED', '#9F67F5']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={styles.navStartGrad}
              >
                <Icon name="mapPin" size={14} color="#fff" strokeWidth={2.5} />
                <Text style={styles.navStartText}>Navigasyona Başla</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Rota Hesaplama Modal */}
      <Modal visible={routeModalVisible} transparent animationType="slide" onRequestClose={() => setRouteModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <View style={styles.modalIconWrap}>
                <Icon name="mapPin" size={18} color="#7C3AED" strokeWidth={2.5} />
              </View>
              <Text style={styles.modalTitle}>Güzergah Hesapla</Text>
              <TouchableOpacity onPress={() => setRouteModalVisible(false)} style={styles.modalCloseBtn}>
                <Icon name="close" size={18} color="#94A3B8" strokeWidth={2.5} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalLabel}>Başlangıç Koordinatı</Text>
            <View style={styles.coordRow}>
              <TextInput
                style={styles.coordInput} placeholder="Enlem (lat)"
                placeholderTextColor="#94A3B8" keyboardType="numeric"
                value={startLat} onChangeText={setStartLat}
              />
              <TextInput
                style={styles.coordInput} placeholder="Boylam (lng)"
                placeholderTextColor="#94A3B8" keyboardType="numeric"
                value={startLng} onChangeText={setStartLng}
              />
            </View>

            {location && (
              <TouchableOpacity
                style={styles.useMyLocBtn}
                onPress={() => {
                  setStartLat(String(location.latitude.toFixed(6)));
                  setStartLng(String(location.longitude.toFixed(6)));
                }}
              >
                <Icon name="mapPin" size={13} color="#1976D2" strokeWidth={2.5} />
                <Text style={styles.useMyLocText}>Mevcut konumumu kullan</Text>
              </TouchableOpacity>
            )}

            <Text style={styles.modalLabel}>Hedef Koordinatı</Text>
            <View style={styles.coordRow}>
              <TextInput
                style={styles.coordInput} placeholder="Enlem (lat)"
                placeholderTextColor="#94A3B8" keyboardType="numeric"
                value={endLat} onChangeText={setEndLat}
              />
              <TextInput
                style={styles.coordInput} placeholder="Boylam (lng)"
                placeholderTextColor="#94A3B8" keyboardType="numeric"
                value={endLng} onChangeText={setEndLng}
              />
            </View>

            <TouchableOpacity
              style={[styles.calcBtn, routeLoading && { opacity: 0.7 }]}
              onPress={handleCalculateRoute}
              disabled={routeLoading}
              activeOpacity={0.85}
            >
              {routeLoading
                ? <ActivityIndicator color="#fff" size="small" />
                : <>
                    <Icon name="mapPin" size={16} color="#fff" strokeWidth={2.5} />
                    <Text style={styles.calcBtnText}>Güzergahı Hesapla</Text>
                  </>
              }
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E8EAF0' },

  mapLoading: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#E8EAF0',
    alignItems: 'center', justifyContent: 'center', gap: 12, zIndex: 5,
  },
  mapLoadingText: { fontSize: 14, color: '#64748B', fontWeight: '600' },

  header: { position: 'absolute', top: 0, left: 0, right: 0, paddingBottom: 28, zIndex: 10 },
  headerContent: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingTop: 4, paddingBottom: 8 },
  headerIcon: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)',
  },
  headerTitle: { fontSize: 20, fontWeight: '900', color: '#fff' },
  headerSub:   { fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 1 },

  filterBar: { position: 'absolute', left: 0, right: 0, zIndex: 10 },
  filterScroll: { paddingHorizontal: 16, gap: 8, paddingVertical: 4 },
  filterChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 9,
    borderRadius: 22, borderWidth: 1.5,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12, shadowRadius: 4, elevation: 4,
  },
  filterText: { fontSize: 13, fontWeight: '700' },
  filterBadge: { borderRadius: 10, paddingHorizontal: 6, paddingVertical: 1 },
  filterBadgeText: { fontSize: 10, fontWeight: '800', color: '#fff' },

  toolBar: { position: 'absolute', right: 16, gap: 10, zIndex: 10 },
  toolBtn: {
    width: 44, height: 44, borderRadius: 14,
    backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12, shadowRadius: 6, elevation: 6,
    borderWidth: 1, borderColor: '#E2E8F0',
  },

  bottomCard: {
    position: 'absolute', left: 16, right: 16,
    backgroundColor: '#fff', borderRadius: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12, shadowRadius: 16, elevation: 12,
    borderWidth: 1, borderColor: '#F1F5F9', zIndex: 10, overflow: 'hidden',
  },
  summaryRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  summaryChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: '#F8FAFC', borderRadius: 10,
    paddingHorizontal: 10, paddingVertical: 6,
    borderWidth: 1, borderColor: '#E2E8F0',
  },
  dot:        { width: 7, height: 7, borderRadius: 4 },
  summaryVal: { fontSize: 13, fontWeight: '800', color: '#1E293B' },
  summaryLbl: { fontSize: 10, color: '#64748B', fontWeight: '600' },

  retryBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    marginLeft: 'auto', backgroundColor: '#FEE2E2', borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 5,
  },
  retryText: { fontSize: 11, fontWeight: '700', color: '#DC2626' },

  panelBody: { borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingHorizontal: 16, paddingVertical: 14, gap: 6 },
  reportDetailRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  reportDetailLabel: { fontSize: 12, color: '#64748B', fontWeight: '600', width: 60 },
  reportDetailVal:   { fontSize: 12, color: '#1E293B', fontWeight: '700' },
  reportDesc: { fontSize: 12, color: '#475569', lineHeight: 17, backgroundColor: '#F8FAFC', borderRadius: 8, padding: 8, marginTop: 4 },
  reportActions: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  reportRouteBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#F5F3FF', borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 7,
    borderWidth: 1, borderColor: '#DDD6FE',
  },
  reportRouteBtnText: { fontSize: 12, fontWeight: '700', color: '#7C3AED' },
  closeDetailBtn: { backgroundColor: '#F1F5F9', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 7 },
  closeDetailText: { fontSize: 11, fontWeight: '700', color: '#64748B' },

  routeNavBar: {
    borderTopWidth: 1, borderTopColor: '#F1F5F9',
    paddingHorizontal: 14, paddingVertical: 12, gap: 10,
  },
  routeNavInfoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  routeNavDist: { fontSize: 15, fontWeight: '900', color: '#1E293B' },
  routeNavDur:  { fontSize: 13, color: '#64748B', fontWeight: '600' },
  riskBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  riskText:  { fontSize: 11, fontWeight: '700' },
  navStartBtn: { borderRadius: 14, overflow: 'hidden' },
  navStartGrad: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingVertical: 13, paddingHorizontal: 20,
  },
  navStartText: { fontSize: 14, fontWeight: '800', color: '#fff' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalCard: {
    backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: 24, paddingBottom: 36,
    shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.12, shadowRadius: 16, elevation: 20,
  },
  modalHandle: { width: 40, height: 5, borderRadius: 3, backgroundColor: '#E2E8F0', alignSelf: 'center', marginBottom: 16 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20 },
  modalIconWrap: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: '#F5F3FF', alignItems: 'center', justifyContent: 'center',
  },
  modalTitle:    { fontSize: 17, fontWeight: '800', color: '#1E293B', flex: 1 },
  modalCloseBtn: { padding: 4 },
  modalLabel:    { fontSize: 12, fontWeight: '700', color: '#64748B', marginBottom: 8, marginTop: 4 },
  coordRow:      { flexDirection: 'row', gap: 10, marginBottom: 8 },
  coordInput: {
    flex: 1, height: 44, borderRadius: 12,
    backgroundColor: '#F8FAFC', borderWidth: 1.5, borderColor: '#E2E8F0',
    paddingHorizontal: 12, fontSize: 14, color: '#1E293B',
  },
  useMyLocBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    marginBottom: 16, alignSelf: 'flex-start',
    backgroundColor: '#EFF6FF', borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 5,
  },
  useMyLocText: { fontSize: 12, fontWeight: '600', color: '#1976D2' },
  calcBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    marginTop: 20, height: 52, borderRadius: 16, backgroundColor: '#7C3AED',
    shadowColor: '#7C3AED', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 8, elevation: 6,
  },
  calcBtnText: { fontSize: 15, fontWeight: '800', color: '#fff' },
});
