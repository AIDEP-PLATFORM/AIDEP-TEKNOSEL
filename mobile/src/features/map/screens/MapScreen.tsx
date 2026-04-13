import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  ActivityIndicator, Platform, TextInput, Modal, Linking,
  LayoutChangeEvent, KeyboardAvoidingView, FlatList,
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
import type { DamageReport, MapFilter, Route, RouteAlternative } from '../types';

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

// ── Nominatim (OpenStreetMap) adres arama ─────────────────────────────────────
interface GeoResult {
  place_id: string;
  display_name: string;
  lat: string;
  lon: string;
}

async function searchNominatim(query: string): Promise<GeoResult[]> {
  try {
    const url =
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}` +
      `&format=json&limit=5&countrycodes=tr&accept-language=tr`;
    const res = await fetch(url, { headers: { 'User-Agent': 'AIDEP-Mobile/1.0' } });
    return await res.json();
  } catch {
    return [];
  }
}

// ── Statik Leaflet HTML ────────────────────────────────────────────────────────
const BASE_HTML = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no"/>
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    html, body, #map { width:100%; height:100%; }
    .custom-pin { width:24px; height:24px; border-radius:50%; border:3px solid #fff; box-shadow:0 2px 8px rgba(0,0,0,0.35); }
    .leaflet-popup-content-wrapper { border-radius:14px; box-shadow:0 4px 20px rgba(0,0,0,0.18); }
    .popup-header { padding:8px 12px; border-radius:10px 10px 0 0; font-weight:700; font-size:13px; color:#fff; }
    .popup-body { padding:10px 12px; font-size:12px; color:#1E293B; }
    .popup-row { margin-bottom:4px; }
    .popup-desc { color:#475569; margin-top:4px; line-height:1.4; }
    .popup-date { color:#94A3B8; font-size:11px; margin-top:6px; }
    body.pick-mode { cursor: crosshair !important; }
  </style>
</head>
<body>
<div id="map"></div>
<script>
  var map = L.map('map',{zoomControl:true}).setView([${TURKEY_CENTER.lat},${TURKEY_CENTER.lng}],${TURKEY_CENTER.zoom});
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
    attribution:'\\u00a9 OpenStreetMap', maxZoom:19
  }).addTo(map);

  var markerLayer = L.layerGroup().addTo(map);
  var routeShadowLayer=null, routeLayer=null, routeStartMarker=null, routeEndMarker=null;
  var altLayers=[];
  var userMarker=null, pickPin=null;
  var pickMode = false;

  // ─── Map click: haritadan nokta seçme ───────────────────────────────────────
  map.on('click', function(e) {
    if (!pickMode) return;
    pickMode = false;
    document.body.classList.remove('pick-mode');
    if (pickPin) { map.removeLayer(pickPin); }
    pickPin = L.circleMarker([e.latlng.lat, e.latlng.lng], {
      radius:10, color:'#7C3AED', fillColor:'#7C3AED', fillOpacity:0.7, weight:3
    }).addTo(map);
    window.ReactNativeWebView && window.ReactNativeWebView.postMessage(
      JSON.stringify({ type:'mapPick', lat:e.latlng.lat, lng:e.latlng.lng })
    );
  });

  window.enablePickMode = function() {
    pickMode = true;
    document.body.classList.add('pick-mode');
  };
  window.disablePickMode = function() {
    pickMode = false;
    document.body.classList.remove('pick-mode');
    if (pickPin) { map.removeLayer(pickPin); pickPin = null; }
  };

  // ─── Hasar pinleri ──────────────────────────────────────────────────────────
  window.drawMarkers = function(markers) {
    markerLayer.clearLayers();
    markers.forEach(function(r) {
      var color = r.severity>=7?'#DC2626':r.severity>=4?'#D97706':'#059669';
      if(!r.severity) color='#64748B';
      var icon = L.divIcon({
        className:'',
        html:'<div class="custom-pin" style="background:'+color+'"></div>',
        iconSize:[24,24], iconAnchor:[12,12]
      });
      var date = new Date(r.created_at).toLocaleDateString('tr-TR');
      var popup =
        '<div class="popup-header" style="background:'+color+'">'+(r.damage_class||'Hasar Raporu')+'</div>'+
        '<div class="popup-body">'+
        (r.severity?'<div class="popup-row">\\u015eiddet: <b style="color:'+color+'">'+r.severity+'/10</b></div>':'')+
        '<div class="popup-row">Durum: '+r.status+'</div>'+
        (r.description?'<div class="popup-desc">'+r.description+'</div>':'')+
        '<div class="popup-date">'+date+'</div></div>';
      L.marker([r.lat,r.lng],{icon:icon}).addTo(markerLayer)
        .bindPopup(popup,{maxWidth:220})
        .on('click',function(){
          if(pickMode) return;
          window.ReactNativeWebView && window.ReactNativeWebView.postMessage(
            JSON.stringify({type:'markerClick',id:r.id})
          );
        });
    });
  };

  // ─── Rota çiz ───────────────────────────────────────────────────────────────
  window.drawRoute = function(coords) {
    if(routeShadowLayer){map.removeLayer(routeShadowLayer);routeShadowLayer=null;}
    if(routeLayer){map.removeLayer(routeLayer);routeLayer=null;}
    if(routeStartMarker){map.removeLayer(routeStartMarker);routeStartMarker=null;}
    if(routeEndMarker){map.removeLayer(routeEndMarker);routeEndMarker=null;}
    if(!coords||coords.length<2) return;
    routeShadowLayer=L.polyline(coords,{color:'rgba(0,0,0,0.15)',weight:8,lineJoin:'round'}).addTo(map);
    routeLayer=L.polyline(coords,{color:'#7C3AED',weight:5,lineJoin:'round'}).addTo(map);
    routeStartMarker=L.circleMarker(coords[0],{radius:9,color:'#fff',fillColor:'#059669',fillOpacity:1,weight:2.5})
      .addTo(map).bindPopup('<b>Ba\\u015flang\\u0131\\u00e7</b>');
    routeEndMarker=L.circleMarker(coords[coords.length-1],{radius:9,color:'#fff',fillColor:'#DC2626',fillOpacity:1,weight:2.5})
      .addTo(map).bindPopup('<b>Hedef</b>');
    map.fitBounds(routeLayer.getBounds(),{padding:[50,50]});
  };

  window.clearRoute = function() {
    if(routeShadowLayer){map.removeLayer(routeShadowLayer);routeShadowLayer=null;}
    if(routeLayer){map.removeLayer(routeLayer);routeLayer=null;}
    if(routeStartMarker){map.removeLayer(routeStartMarker);routeStartMarker=null;}
    if(routeEndMarker){map.removeLayer(routeEndMarker);routeEndMarker=null;}
    altLayers.forEach(function(l){map.removeLayer(l);}); altLayers=[];
  };

  // Alternatif rotaları soluk çiz, seçili olanı parlak göster
  window.drawAlternatives = function(alts, selectedIdx) {
    altLayers.forEach(function(l){map.removeLayer(l);}); altLayers=[];
    if(routeShadowLayer){map.removeLayer(routeShadowLayer);routeShadowLayer=null;}
    if(routeLayer){map.removeLayer(routeLayer);routeLayer=null;}
    if(routeStartMarker){map.removeLayer(routeStartMarker);routeStartMarker=null;}
    if(routeEndMarker){map.removeLayer(routeEndMarker);routeEndMarker=null;}
    if(!alts||alts.length===0) return;
    // Önce soluk alternatifleri çiz
    alts.forEach(function(alt, i) {
      if(i===selectedIdx||!alt.coords||alt.coords.length<2) return;
      var s=L.polyline(alt.coords,{color:'rgba(100,116,139,0.2)',weight:7}).addTo(map);
      var l=L.polyline(alt.coords,{color:'#94A3B8',weight:4,dashArray:'8,5',opacity:0.55}).addTo(map);
      altLayers.push(s,l);
    });
    // Seçili rotayı öne çiz
    var sel=alts[selectedIdx];
    if(!sel||sel.coords.length<2) return;
    routeShadowLayer=L.polyline(sel.coords,{color:'rgba(0,0,0,0.15)',weight:8,lineJoin:'round'}).addTo(map);
    routeLayer=L.polyline(sel.coords,{color:'#7C3AED',weight:5,lineJoin:'round'}).addTo(map);
    routeStartMarker=L.circleMarker(sel.coords[0],{radius:9,color:'#fff',fillColor:'#059669',fillOpacity:1,weight:2.5})
      .addTo(map).bindPopup('<b>Ba\\u015flang\\u0131\\u00e7</b>');
    routeEndMarker=L.circleMarker(sel.coords[sel.coords.length-1],{radius:9,color:'#fff',fillColor:'#DC2626',fillOpacity:1,weight:2.5})
      .addTo(map).bindPopup('<b>Hedef</b>');
    if(alts.length===1||selectedIdx===0){
      map.fitBounds(routeLayer.getBounds(),{padding:[50,50]});
    }
  };

  window.updateUserMarker = function(lat,lng) {
    if(userMarker){map.removeLayer(userMarker);}
    userMarker=L.circleMarker([lat,lng],{radius:8,color:'#fff',fillColor:'#1976D2',fillOpacity:0.95,weight:3})
      .addTo(map).bindPopup('<b>Konumunuz</b>');
  };

  window.goToUser = function(lat,lng){ map.setView([lat,lng],15); };

  window.ReactNativeWebView && window.ReactNativeWebView.postMessage(
    JSON.stringify({type:'mapReady'})
  );
</script>
</body>
</html>`;

// ─── Tip tanımları ────────────────────────────────────────────────────────────
type PickField = 'start' | 'end' | null;

interface LocState {
  lat: string;
  lng: string;
  label: string;  // görünen ad (adres veya koordinat)
  query: string;  // arama kutusu metni
  results: GeoResult[];
  searching: boolean;
}

const emptyLoc = (): LocState => ({
  lat: '', lng: '', label: '', query: '', results: [], searching: false,
});

// ─── Component ────────────────────────────────────────────────────────────────
export default function MapScreen() {
  const { user }    = useAuthStore();
  const role        = user?.role ?? 'citizen';
  const gradient    = roleGradients[role] ?? roleGradients.citizen;
  const insets      = useSafeAreaInsets();

  const { damageReports, activeRoute, loading, error, fetchDamageReports, calculateRoute, clearRoute } = useMap();
  const { pendingRouteModal, clearRouteModalTrigger } = useMapStore();
  const { location } = useLocation();

  const [activeFilters, setActiveFilters] = useState<MapFilter[]>(['hasar']);
  const [selectedReport, setSelectedReport] = useState<DamageReport | null>(null);
  const [routeModalVisible, setRouteModalVisible] = useState(false);
  const [routeLoading, setRouteLoading]           = useState(false);
  const [destCoords, setDestCoords]               = useState<{ lat: number; lng: number } | null>(null);
  const [headerHeight, setHeaderHeight]           = useState(0);
  const [mapReady, setMapReady]                   = useState(false);
  const [pickingField, setPickingField]           = useState<PickField>(null);
  const [routeAlternatives, setRouteAlternatives] = useState<RouteAlternative[]>([]);
  const [selectedAltIdx, setSelectedAltIdx]       = useState(0);

  const [startLoc, setStartLoc] = useState<LocState>(emptyLoc);
  const [endLoc, setEndLoc]     = useState<LocState>(emptyLoc);

  const webviewRef    = useRef<WebView>(null);
  const startTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const endTimerRef   = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── inject yardımcısı ────────────────────────────────────────────────────────
  const inject = useCallback((js: string) => {
    webviewRef.current?.injectJavaScript(js + '; true;');
  }, []);

  // ── Hasar pinleri ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!mapReady) return;
    if (activeFilters.includes('hasar')) {
      const data = JSON.stringify(
        damageReports.filter(r => r.lat != null && r.lng != null).map(r => ({
          id: r.id, lat: r.lat, lng: r.lng, severity: r.severity,
          damage_class: r.damage_class ?? 'Hasar Raporu',
          status: r.status, description: r.description ?? '',
          created_at: r.created_at,
        }))
      );
      inject(`drawMarkers(${data})`);
    } else {
      inject('drawMarkers([])');
    }
  }, [mapReady, damageReports, activeFilters]);

  // ── Rota inject ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!mapReady) return;
    if (activeRoute && activeFilters.includes('guzergah')) {
      const alts = routeAlternatives.length > 0
        ? routeAlternatives
        : [{ index: 0, coordinates: activeRoute.coordinates, duration_seconds: activeRoute.duration_seconds ?? 0, distance_meters: activeRoute.distance_meters ?? 0, risk_score: activeRoute.risk_score ?? 0, is_best: true }];
      // [[lng, lat]] → [[lat, lng]] dönüşümü
      const payload = JSON.stringify(alts.map(a => ({
        ...a,
        coords: a.coordinates.map((c: number[]) => [c[1], c[0]]),
      })));
      inject(`drawAlternatives(${payload}, ${selectedAltIdx})`);
    } else {
      inject('clearRoute()');
    }
  }, [mapReady, activeRoute, activeFilters, routeAlternatives, selectedAltIdx]);

  // ── Kullanıcı konumu ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!mapReady || !location) return;
    inject(`updateUserMarker(${location.latitude}, ${location.longitude})`);
  }, [mapReady, location]);

  // ── ReportScreen'den rota modal tetikleyici ──────────────────────────────────
  useEffect(() => {
    if (pendingRouteModal) {
      clearRouteModalTrigger();
      openRouteModal();
    }
  }, [pendingRouteModal]);

  // ── Adres arama: debounce ─────────────────────────────────────────────────────
  useEffect(() => {
    if (startTimerRef.current) clearTimeout(startTimerRef.current);
    if (startLoc.query.length < 3) { setStartLoc(p => ({ ...p, results: [] })); return; }
    startTimerRef.current = setTimeout(async () => {
      setStartLoc(p => ({ ...p, searching: true }));
      const results = await searchNominatim(startLoc.query);
      setStartLoc(p => ({ ...p, results, searching: false }));
    }, 500);
    return () => { if (startTimerRef.current) clearTimeout(startTimerRef.current); };
  }, [startLoc.query]);

  useEffect(() => {
    if (endTimerRef.current) clearTimeout(endTimerRef.current);
    if (endLoc.query.length < 3) { setEndLoc(p => ({ ...p, results: [] })); return; }
    endTimerRef.current = setTimeout(async () => {
      setEndLoc(p => ({ ...p, searching: true }));
      const results = await searchNominatim(endLoc.query);
      setEndLoc(p => ({ ...p, results, searching: false }));
    }, 500);
    return () => { if (endTimerRef.current) clearTimeout(endTimerRef.current); };
  }, [endLoc.query]);

  // ── Helpers ──────────────────────────────────────────────────────────────────
  const toggleFilter = (key: MapFilter) => {
    setActiveFilters(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
  };

  const openRouteModal = () => {
    if (location) {
      setStartLoc({
        lat: String(location.latitude.toFixed(6)),
        lng: String(location.longitude.toFixed(6)),
        label: 'Mevcut Konumum',
        query: '', results: [], searching: false,
      });
    }
    setRouteModalVisible(true);
  };

  const selectGeoResult = (field: 'start' | 'end', r: GeoResult) => {
    const label = r.display_name.split(',').slice(0, 3).join(',').trim();
    const update: LocState = {
      lat: r.lat, lng: r.lon, label,
      query: '', results: [], searching: false,
    };
    if (field === 'start') setStartLoc(update);
    else setEndLoc(update);
  };

  const clearField = (field: 'start' | 'end') => {
    if (field === 'start') setStartLoc(emptyLoc());
    else setEndLoc(emptyLoc());
  };

  const startMapPick = (field: PickField) => {
    setRouteModalVisible(false);
    setPickingField(field);
    inject('enablePickMode()');
  };

  const cancelMapPick = () => {
    setPickingField(null);
    inject('disablePickMode()');
    setRouteModalVisible(true);
  };

  const handleCalculateRoute = async () => {
    const sLat = parseFloat(startLoc.lat);
    const sLng = parseFloat(startLoc.lng);
    const eLat = parseFloat(endLoc.lat);
    const eLng = parseFloat(endLoc.lng);

    if (isNaN(sLat) || isNaN(sLng) || isNaN(eLat) || isNaN(eLng)) {
      showToast('Lütfen başlangıç ve hedef noktalarını seçin.', 'error');
      return;
    }
    setRouteLoading(true);
    try {
      const route = await calculateRoute({ start_lat: sLat, start_lng: sLng, end_lat: eLat, end_lng: eLng });
      const alts: RouteAlternative[] = route?.alternatives ?? [];
      setRouteAlternatives(alts);
      setSelectedAltIdx(0);
      setDestCoords({ lat: eLat, lng: eLng });
      setRouteModalVisible(false);
      setActiveFilters(prev => prev.includes('guzergah') ? prev : [...prev, 'guzergah']);
      const altCount = alts.length > 1 ? ` (${alts.length} alternatif)` : '';
      showToast(`Güzergah hesaplandı${altCount}.`, 'success');
      // drawAlternatives useEffect tarafından tetiklenecek (activeRoute değişince)
    } catch (e: any) {
      showToast(e?.response?.data?.detail ?? 'Rota hesaplanamadı.', 'error');
    } finally {
      setRouteLoading(false);
    }
  };

  const handleClearRoute = () => {
    clearRoute();
    setDestCoords(null);
    setRouteAlternatives([]);
    setSelectedAltIdx(0);
    inject('clearRoute()');
    setActiveFilters(prev => prev.filter(k => k !== 'guzergah'));
  };

  const handleSelectAlternative = (idx: number) => {
    setSelectedAltIdx(idx);
    const alt = routeAlternatives[idx];
    if (alt?.coordinates?.length > 1) {
      const last = alt.coordinates[alt.coordinates.length - 1];
      // OSRM: [lng, lat] → destCoords: {lat, lng}
      setDestCoords({ lat: last[1], lng: last[0] });
    }
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
      } else if (data.type === 'mapPick') {
        const lat = parseFloat(data.lat.toFixed(6));
        const lng = parseFloat(data.lng.toFixed(6));
        const label = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
        const update: LocState = {
          lat: String(lat), lng: String(lng), label,
          query: '', results: [], searching: false,
        };
        if (pickingField === 'start') setStartLoc(update);
        else if (pickingField === 'end') setEndLoc(update);
        setPickingField(null);
        setRouteModalVisible(true);
      } else if (data.type === 'markerClick') {
        const report = damageReports.find(r => r.id === data.id);
        if (report) setSelectedReport(report);
      }
    } catch {}
  };

  const onHeaderLayout = (e: LayoutChangeEvent) => setHeaderHeight(e.nativeEvent.layout.height);

  const goToMyLocation = () => {
    if (!location) return;
    inject(`goToUser(${location.latitude}, ${location.longitude})`);
  };

  const bottomOffset  = insets.bottom + 90;
  const filterBarTop  = headerHeight > 0 ? headerHeight - 14 : insets.top + 120;
  const canCalculate  = startLoc.lat && startLoc.lng && endLoc.lat && endLoc.lng;

  return (
    <View style={styles.container}>
      <WebView
        ref={webviewRef}
        style={StyleSheet.absoluteFillObject}
        source={{ html: BASE_HTML }}
        originWhitelist={['*']}
        onMessage={onWebViewMessage}
        javaScriptEnabled domStorageEnabled
        scrollEnabled={false} bounces={false}
      />

      {!mapReady && (
        <View style={styles.mapLoading}>
          <ActivityIndicator color="#1976D2" size="large" />
          <Text style={styles.mapLoadingText}>Harita yükleniyor…</Text>
        </View>
      )}

      {/* Haritadan seçme banner */}
      {pickingField && (
        <View style={[styles.pickBanner, { top: insets.top + 8 }]}>
          <LinearGradient
            colors={['#7C3AED', '#9F67F5']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={styles.pickBannerGrad}
          >
            <Icon name="mapPin" size={16} color="#fff" strokeWidth={2.5} />
            <Text style={styles.pickBannerText}>
              {pickingField === 'start' ? 'Başlangıç' : 'Hedef'} noktasına dokunun
            </Text>
            <TouchableOpacity onPress={cancelMapPick} style={styles.pickCancelBtn}>
              <Icon name="close" size={16} color="rgba(255,255,255,0.8)" strokeWidth={2.5} />
            </TouchableOpacity>
          </LinearGradient>
        </View>
      )}

      {/* Üst gradient */}
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
                style={[styles.filterChip,
                  active
                    ? { backgroundColor: f.color, borderColor: f.color }
                    : { backgroundColor: 'rgba(255,255,255,0.92)', borderColor: '#E2E8F0' }
                ]}
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
                {activeRoute.distance_meters ? `${(activeRoute.distance_meters / 1000).toFixed(1)} km` : 'Aktif'}
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
            <View style={styles.reportActions}>
              {selectedReport.lat && selectedReport.lng && (
                <TouchableOpacity
                  style={styles.reportRouteBtn}
                  onPress={() => {
                    if (location) {
                      setStartLoc({
                        lat: String(location.latitude.toFixed(6)),
                        lng: String(location.longitude.toFixed(6)),
                        label: 'Mevcut Konumum', query: '', results: [], searching: false,
                      });
                    }
                    setEndLoc({
                      lat: String(selectedReport.lat!.toFixed(6)),
                      lng: String(selectedReport.lng!.toFixed(6)),
                      label: selectedReport.damage_class ?? 'Hasar Noktası',
                      query: '', results: [], searching: false,
                    });
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

        {activeRoute && !selectedReport && (
          <View style={styles.routeNavBar}>
            {/* Alternatif rota seçici */}
            {routeAlternatives.length > 1 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.altScroll} contentContainerStyle={styles.altScrollContent}>
                {routeAlternatives.map((alt, i) => {
                  const active = i === selectedAltIdx;
                  const riskOk = alt.risk_score <= 0.3;
                  const chipColor = active ? '#7C3AED' : '#E2E8F0';
                  const textColor = active ? '#fff' : '#475569';
                  return (
                    <TouchableOpacity
                      key={alt.index}
                      onPress={() => handleSelectAlternative(i)}
                      activeOpacity={0.8}
                      style={[styles.altChip, { backgroundColor: chipColor, borderColor: active ? '#7C3AED' : '#CBD5E1' }]}
                    >
                      <Text style={[styles.altChipLabel, { color: textColor }]}>
                        Rota {i + 1}{alt.is_best ? ' ★' : ''}
                      </Text>
                      <Text style={[styles.altChipSub, { color: active ? 'rgba(255,255,255,0.75)' : '#94A3B8' }]}>
                        {(alt.distance_meters / 1000).toFixed(1)} km · {Math.round(alt.duration_seconds / 60)} dk
                        {alt.risk_score > 0 ? ` · ⚠` : ` · ${riskOk ? '✓' : ''}`}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            )}
            {/* Seçili rota bilgisi */}
            {(() => {
              const cur = routeAlternatives.length > 0 ? routeAlternatives[selectedAltIdx] : null;
              const dist = cur ? cur.distance_meters : activeRoute.distance_meters;
              const dur  = cur ? cur.duration_seconds : activeRoute.duration_seconds;
              const risk = cur ? cur.risk_score : activeRoute.risk_score;
              return (
                <View style={styles.routeNavInfoRow}>
                  <Icon name="mapPin" size={14} color="#7C3AED" strokeWidth={2.5} />
                  <Text style={styles.routeNavDist}>{dist ? `${(dist / 1000).toFixed(1)} km` : '—'}</Text>
                  {dur != null && <Text style={styles.routeNavDur}>· {Math.round(dur / 60)} dk</Text>}
                  {risk != null && risk > 0 && (
                    <View style={[styles.riskBadge, { backgroundColor: risk > 0.5 ? '#FEE2E2' : '#ECFDF5' }]}>
                      <Text style={[styles.riskText, { color: risk > 0.5 ? '#DC2626' : '#059669' }]}>
                        {risk > 0.5 ? '⚠ Riskli' : '✓ Güvenli'}
                      </Text>
                    </View>
                  )}
                </View>
              );
            })()}
            <TouchableOpacity onPress={openNativeMaps} activeOpacity={0.85} style={styles.navStartBtn}>
              <LinearGradient colors={['#7C3AED', '#9F67F5']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.navStartGrad}>
                <Icon name="mapPin" size={14} color="#fff" strokeWidth={2.5} />
                <Text style={styles.navStartText}>Navigasyona Başla</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* ── Güzergah Modal ───────────────────────────────────────────────────── */}
      <Modal visible={routeModalVisible} transparent animationType="slide" onRequestClose={() => setRouteModalVisible(false)}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setRouteModalVisible(false)} />
          <View style={styles.modalCard}>
            <View style={styles.modalHandle} />

            {/* Başlık */}
            <View style={styles.modalHeader}>
              <View style={styles.modalIconWrap}>
                <Icon name="mapPin" size={18} color="#7C3AED" strokeWidth={2.5} />
              </View>
              <Text style={styles.modalTitle}>Güzergah Hesapla</Text>
              <TouchableOpacity onPress={() => setRouteModalVisible(false)} style={styles.modalCloseBtn}>
                <Icon name="close" size={18} color="#94A3B8" strokeWidth={2.5} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              {/* BAŞLANGIÇ */}
              <LocPicker
                label="Başlangıç Noktası"
                dotColor="#059669"
                loc={startLoc}
                onQueryChange={q => setStartLoc(p => ({ ...p, query: q, lat: '', lng: '', label: '' }))}
                onSelectResult={r => selectGeoResult('start', r)}
                onClear={() => clearField('start')}
                onMapPick={() => startMapPick('start')}
                onGPS={location ? () => {
                  setStartLoc({
                    lat: String(location.latitude.toFixed(6)),
                    lng: String(location.longitude.toFixed(6)),
                    label: 'Mevcut Konumum', query: '', results: [], searching: false,
                  });
                } : undefined}
              />

              {/* HEDEF */}
              <LocPicker
                label="Hedef Noktası"
                dotColor="#DC2626"
                loc={endLoc}
                onQueryChange={q => setEndLoc(p => ({ ...p, query: q, lat: '', lng: '', label: '' }))}
                onSelectResult={r => selectGeoResult('end', r)}
                onClear={() => clearField('end')}
                onMapPick={() => startMapPick('end')}
              />

              {/* Hesapla butonu */}
              <TouchableOpacity
                style={[styles.calcBtn, (!canCalculate || routeLoading) && { opacity: 0.6 }]}
                onPress={handleCalculateRoute}
                disabled={!canCalculate || routeLoading}
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
              <View style={{ height: 16 }} />
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

// ── LocPicker bileşeni ────────────────────────────────────────────────────────
interface LocPickerProps {
  label: string;
  dotColor: string;
  loc: LocState;
  onQueryChange: (q: string) => void;
  onSelectResult: (r: GeoResult) => void;
  onClear: () => void;
  onMapPick: () => void;
  onGPS?: () => void;
}

function LocPicker({ label, dotColor, loc, onQueryChange, onSelectResult, onClear, onMapPick, onGPS }: LocPickerProps) {
  const isSet = !!(loc.lat && loc.lng);

  return (
    <View style={lp.wrap}>
      {/* Başlık */}
      <View style={lp.header}>
        <View style={[lp.dot, { backgroundColor: dotColor }]} />
        <Text style={lp.label}>{label}</Text>
        {isSet && (
          <TouchableOpacity onPress={onClear} style={lp.clearBtn}>
            <Icon name="close" size={14} color="#94A3B8" strokeWidth={2.5} />
          </TouchableOpacity>
        )}
      </View>

      {/* Seçili konum göster */}
      {isSet ? (
        <View style={[lp.selectedBox, { borderColor: dotColor + '44' }]}>
          <View style={[lp.selectedDot, { backgroundColor: dotColor }]} />
          <Text style={lp.selectedText} numberOfLines={2}>{loc.label}</Text>
        </View>
      ) : (
        <>
          {/* Arama kutusu */}
          <View style={lp.searchRow}>
            <View style={lp.searchInputWrap}>
              <Icon name="mapPin" size={14} color="#94A3B8" strokeWidth={2} />
              <TextInput
                style={lp.searchInput}
                placeholder="Adres veya yer adı ara…"
                placeholderTextColor="#94A3B8"
                value={loc.query}
                onChangeText={onQueryChange}
                autoCorrect={false}
              />
              {loc.searching && <ActivityIndicator size="small" color="#94A3B8" />}
            </View>
          </View>

          {/* Arama sonuçları */}
          {loc.results.length > 0 && (
            <FlatList
              data={loc.results}
              keyExtractor={r => r.place_id}
              scrollEnabled={false}
              style={lp.resultsList}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={lp.resultItem}
                  onPress={() => onSelectResult(item)}
                  activeOpacity={0.7}
                >
                  <Icon name="mapPin" size={13} color="#64748B" strokeWidth={2} />
                  <Text style={lp.resultText} numberOfLines={2}>
                    {item.display_name}
                  </Text>
                </TouchableOpacity>
              )}
            />
          )}

          {/* Hızlı seçim butonları */}
          <View style={lp.quickRow}>
            {onGPS && (
              <TouchableOpacity onPress={onGPS} style={lp.quickBtn}>
                <Icon name="mapPin" size={13} color="#1976D2" strokeWidth={2.5} />
                <Text style={[lp.quickText, { color: '#1976D2' }]}>GPS Konumum</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={onMapPick} style={[lp.quickBtn, { borderColor: '#DDD6FE' }]}>
              <Icon name="mapPin" size={13} color="#7C3AED" strokeWidth={2.5} />
              <Text style={[lp.quickText, { color: '#7C3AED' }]}>Haritadan Seç</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}

// ── Stiller ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E8EAF0' },

  mapLoading: {
    ...StyleSheet.absoluteFillObject, backgroundColor: '#E8EAF0',
    alignItems: 'center', justifyContent: 'center', gap: 12, zIndex: 5,
  },
  mapLoadingText: { fontSize: 14, color: '#64748B', fontWeight: '600' },

  // Haritadan seçme banner
  pickBanner: { position: 'absolute', left: 16, right: 16, zIndex: 20 },
  pickBannerGrad: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 16, paddingVertical: 14, borderRadius: 18,
    shadowColor: '#7C3AED', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 10, elevation: 10,
  },
  pickBannerText: { flex: 1, color: '#fff', fontSize: 14, fontWeight: '700' },
  pickCancelBtn: { padding: 4 },

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
  filterText:      { fontSize: 13, fontWeight: '700' },
  filterBadge:     { borderRadius: 10, paddingHorizontal: 6, paddingVertical: 1 },
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

  routeNavBar: { borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingHorizontal: 14, paddingTop: 10, paddingBottom: 12, gap: 8 },
  routeNavInfoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  routeNavDist: { fontSize: 15, fontWeight: '900', color: '#1E293B' },

  altScroll: { marginHorizontal: -14 },
  altScrollContent: { paddingHorizontal: 14, gap: 8, paddingVertical: 2 },
  altChip: {
    borderRadius: 12, borderWidth: 1.5,
    paddingHorizontal: 12, paddingVertical: 7,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.07, shadowRadius: 3, elevation: 2,
  },
  altChipLabel: { fontSize: 12, fontWeight: '800' },
  altChipSub:   { fontSize: 10, fontWeight: '600', marginTop: 1 },
  routeNavDur:  { fontSize: 13, color: '#64748B', fontWeight: '600' },
  riskBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  riskText:  { fontSize: 11, fontWeight: '700' },
  navStartBtn: { borderRadius: 14, overflow: 'hidden' },
  navStartGrad: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingVertical: 13, paddingHorizontal: 20,
  },
  navStartText: { fontSize: 14, fontWeight: '800', color: '#fff' },

  // Modal
  modalOverlay: { flex: 1 },
  modalCard: {
    backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28,
    paddingHorizontal: 20, paddingBottom: Platform.OS === 'ios' ? 0 : 16,
    maxHeight: '88%',
    shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.12, shadowRadius: 16, elevation: 20,
  },
  modalHandle: { width: 40, height: 5, borderRadius: 3, backgroundColor: '#E2E8F0', alignSelf: 'center', marginTop: 12, marginBottom: 4 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F1F5F9', marginBottom: 4 },
  modalIconWrap: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#F5F3FF', alignItems: 'center', justifyContent: 'center' },
  modalTitle:    { fontSize: 17, fontWeight: '800', color: '#1E293B', flex: 1 },
  modalCloseBtn: { padding: 4 },

  calcBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    marginTop: 20, height: 54, borderRadius: 16, backgroundColor: '#7C3AED',
    shadowColor: '#7C3AED', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 8, elevation: 6,
  },
  calcBtnText: { fontSize: 15, fontWeight: '800', color: '#fff' },
});

const lp = StyleSheet.create({
  wrap: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  label: { flex: 1, fontSize: 13, fontWeight: '800', color: '#374151', textTransform: 'uppercase', letterSpacing: 0.5 },
  clearBtn: { padding: 4 },

  selectedBox: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#F8FAFC', borderRadius: 14, padding: 14,
    borderWidth: 1.5,
  },
  selectedDot: { width: 8, height: 8, borderRadius: 4, flexShrink: 0 },
  selectedText: { flex: 1, fontSize: 14, fontWeight: '600', color: '#1E293B' },

  searchRow: { marginBottom: 8 },
  searchInputWrap: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#F8FAFC', borderRadius: 14, borderWidth: 1.5, borderColor: '#E2E8F0',
    paddingHorizontal: 12, paddingVertical: 10,
  },
  searchInput: { flex: 1, fontSize: 14, color: '#1E293B', padding: 0 },

  resultsList: { maxHeight: 180, marginBottom: 8 },
  resultItem: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    paddingVertical: 10, paddingHorizontal: 4,
    borderBottomWidth: 1, borderBottomColor: '#F8FAFC',
  },
  resultText: { flex: 1, fontSize: 13, color: '#374151', lineHeight: 18 },

  quickRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  quickBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#F8FAFC', borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 8,
    borderWidth: 1.5, borderColor: '#E2E8F0',
  },
  quickText: { fontSize: 13, fontWeight: '700' },
});
