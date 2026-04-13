import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, Image, ActivityIndicator, Modal,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import colors from '../../../shared/theme/colors';
import Icon from '../../../shared/components/Icon';
import AnimatedPress from '../../../shared/components/AnimatedPress';
import TopBar from '../../../shared/components/TopBar';
import FloatingBubbles from '../../../shared/components/FloatingBubbles';
import { useAuthStore } from '../../../core/stores/auth.store';
import { useMapStore } from '../../../core/stores/map.store';
import api from '../../../core/api/axiosInstance';
import { showToast } from '../../../shared/components/Toast';

// Yolun geçilemez olduğunu belirten sınıflar
const ROAD_BLOCKED_CLASSES = new Set([
  'yol_yikilmis', 'yol_gecilemez', 'yol_cok_hasarli',
]);

const reportTypes = [
  { key: 'yikilanbina',  label: 'Yıkılan Bina',     color: '#DC2626', bg: '#FEF2F2', icon: 'shield'        as const, desc: 'Kısmi veya tam çökmüş yapı' },
  { key: 'hasarlibina',  label: 'Hasarlı Bina',      color: '#EA580C', bg: '#FFF7ED', icon: 'alertTriangle' as const, desc: 'Oturulmaz ya da riskli bina' },
  { key: 'enkaz',        label: 'Enkaz / Göçük',     color: '#B45309', bg: '#FFFBEB', icon: 'alertTriangle' as const, desc: 'Altında insan olabilecek alan' },
  { key: 'kapaliyol',    label: 'Kapanan Yol',        color: '#7C3AED', bg: '#F5F3FF', icon: 'mapPin'        as const, desc: 'Enkaz veya çatlakla kapanmış' },
  { key: 'altyapi',      label: 'Altyapı Hasarı',    color: '#0369A1', bg: '#F0F9FF', icon: 'info'          as const, desc: 'Su, elektrik, doğalgaz, köprü' },
  { key: 'diger',        label: 'Diğer',              color: '#475569', bg: '#F8FAFC', icon: 'mapPin'        as const, desc: 'Yukarıdaki kategorilere uymayan' },
];

// severity 1-5 → görsel seviye
const getSeverityLevel = (severity: number | null) => {
  if (!severity || severity <= 0) return null;
  if (severity <= 2) return { label: 'Hafif Hasar',  color: '#38A169', bg: '#F0FFF4', bar: severity / 5 };
  if (severity <= 3) return { label: 'Orta Hasar',   color: '#D69E2E', bg: '#FFFFF0', bar: severity / 5 };
  return               { label: 'Ağır Hasar',   color: '#E53E3E', bg: '#FFF5F5', bar: severity / 5 };
};

const damageClassLabels: Record<string, string> = {
  bina_yikilmis:    'Yıkılmış Bina',
  bina_cok_riskli:  'Çok Riskli Bina',
  bina_riskli:      'Riskli Bina',
  bina_saglam:      'Sağlam Bina',
  yol_yikilmis:     'Yıkılmış Yol',
  yol_gecilemez:    'Geçilemez Yol',
  yol_cok_hasarli:  'Çok Hasarlı Yol',
  yol_orta_hasarli: 'Orta Hasarlı Yol',
  yol_az_hasarli:   'Az Hasarlı Yol',
  yol_gecilebilir:  'Geçilebilir Yol',
  yol_saglam:       'Sağlam Yol',
  pending:          'Analiz Bekleniyor',
};

const roleGradients: Record<string, [string, string, string]> = {
  citizen:   ['#1565C0', '#1976D2', '#2196F3'],
  volunteer: ['#1B5E20', '#2E7D32', '#43A047'],
  admin:     ['#4A148C', '#7B1FA2', '#AB47BC'],
};

const roleCardBg: Record<string, string> = {
  citizen:   '#EFF6FF',
  volunteer: '#F0FDF4',
  admin:     '#F5F3FF',
};

export default function ReportScreen() {
  const { user } = useAuthStore();
  const { triggerRouteModal } = useMapStore();
  const navigation = useNavigation<any>();
  const role = user?.role ?? 'citizen';
  const gradient = roleGradients[role] ?? roleGradients.citizen;

  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [focusedField, setFocusedField] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [aiResult, setAiResult] = useState<{ damage_class: string | null; severity: number | null; status: string } | null>(null);
  const [routeSuggestVisible, setRouteSuggestVisible] = useState(false);

  const requestLocation = async (): Promise<{ lat: number; lon: number } | null> => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      showToast('Konum izni verilmedi. Lütfen ayarlardan izin verin.', 'warning');
      return null;
    }
    showToast('GPS koordinatları alınıyor...', 'location');
    const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
    const coords = { lat: loc.coords.latitude, lon: loc.coords.longitude };
    setLocation(coords);
    showToast(`Konum alındı: ${coords.lat.toFixed(4)}, ${coords.lon.toFixed(4)}`, 'success');
    return coords;
  };

  const pickPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') { showToast('Galeri iznine ihtiyaç var.', 'warning'); return; }
    // Galeri açılmadan önce konum al
    if (!location) {
      showToast('GPS koordinatları alınıyor...', 'location');
      const locPerm = await Location.requestForegroundPermissionsAsync();
      if (locPerm.status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        setLocation({ lat: loc.coords.latitude, lon: loc.coords.longitude });
        showToast(`Konum alındı: ${loc.coords.latitude.toFixed(4)}, ${loc.coords.longitude.toFixed(4)}`, 'success');
      }
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true, quality: 0.7,
    });
    if (!result.canceled) {
      const uris = result.assets.map(a => a.uri);
      setPhotos(prev => [...prev, ...uris].slice(0, 5));
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') { showToast('Kamera iznine ihtiyaç var.', 'warning'); return; }
    // Kamera açılmadan önce konum al
    if (!location) {
      showToast('GPS koordinatları alınıyor...', 'location');
      const locPerm = await Location.requestForegroundPermissionsAsync();
      if (locPerm.status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
        setLocation({ lat: loc.coords.latitude, lon: loc.coords.longitude });
        showToast(`Konum alındı: ${loc.coords.latitude.toFixed(4)}, ${loc.coords.longitude.toFixed(4)}`, 'success');
      }
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.7 });
    if (!result.canceled) {
      setPhotos(prev => [...prev, result.assets[0].uri].slice(0, 5));
    }
  };

  const handleSubmit = async () => {
    if (!selectedType)      { showToast('Lütfen hasar türü seçiniz.', 'error'); return; }
    if (!description.trim()){ showToast('Lütfen açıklama giriniz.', 'error'); return; }
    if (photos.length === 0){ showToast('Lütfen en az 1 fotoğraf ekleyiniz.', 'error'); return; }

    // Konum yoksa al
    let loc = location;
    if (!loc) {
      loc = await requestLocation();
      if (!loc) return;
    }

    setSubmitting(true);
    setAiResult(null);

    try {
      const formData = new FormData();
      formData.append('lat', String(loc.lat));
      formData.append('lng', String(loc.lon));
      formData.append('description', description);
      formData.append('photo', {
        uri: photos[0],
        type: 'image/jpeg',
        name: 'photo.jpg',
      } as any);

      const response = await api.post('/damage', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 40000, // AI analiz için 40 saniye
      });

      const data = response.data;
      setAiResult({
        damage_class: data.damage_class,
        severity: data.severity,
        status: data.status,
      });

      const msg = data.status === 'verified'
        ? `Rapor gönderildi! Tespit: ${damageClassLabels[data.damage_class] ?? data.damage_class}`
        : 'Raporunuz alındı. AI analizi devam ediyor...';
      showToast(msg, 'success');
      setSelectedType(null);
      setDescription('');
      setPhotos([]);
      setLocation(null);

      // Yol geçilemez ise güzergah öner
      if (data.damage_class && ROAD_BLOCKED_CLASSES.has(data.damage_class)) {
        setRouteSuggestVisible(true);
      }
    } catch (err: any) {
      const msg = err?.response?.data?.detail ?? 'Rapor gönderilemedi. Lütfen tekrar deneyin.';
      showToast(typeof msg === 'string' ? msg : 'Rapor gönderilemedi.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const selected = reportTypes.find(t => t.key === selectedType);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[gradient[0], gradient[1], gradient[2], roleCardBg[role] ?? '#EEF2FF']}
        locations={[0, 0.2, 0.4, 1]}
        style={StyleSheet.absoluteFillObject}
      />
      <FloatingBubbles />

      {/* Hero */}
      <View style={styles.heroSection}>
        <TopBar tint="light" />
        <View style={styles.heroRow}>
          <View style={styles.heroIconWrap}>
            <Icon name="alertTriangle" size={24} color="#fff" strokeWidth={2.5} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.heroTitle}>Hasar Raporla</Text>
            <Text style={styles.heroSub}>Sahadan anlık hasar bildirimi yapın</Text>
          </View>
        </View>
      </View>

      {/* Form kart */}
      <View style={styles.card}>
        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}>

          {/* ─ Hasar türü ─ */}
          <View style={styles.sectionHeader}>
            <LinearGradient colors={['#E53E3E', '#FC8181']} start={{x:0,y:0}} end={{x:1,y:0}} style={styles.sectionDot} />
            <Text style={styles.sectionLabel}>HASAR TÜRÜ</Text>
            {selectedType && (
              <View style={[styles.selTypeBadge, { backgroundColor: reportTypes.find(t=>t.key===selectedType)!.color }]}>
                <Text style={styles.selTypeBadgeText}>{reportTypes.find(t=>t.key===selectedType)!.label}</Text>
              </View>
            )}
          </View>
          <View style={styles.typeContainer}>
            <View style={styles.typeGrid}>
              {reportTypes.map(t => {
                const isSel = selectedType === t.key;
                return (
                  <AnimatedPress key={t.key} onPress={() => setSelectedType(t.key)}
                    scale={isSel ? 1.05 : 0.97}
                    style={[styles.typeChip,
                      isSel
                        ? { backgroundColor: t.color, borderColor: t.color }
                        : { backgroundColor: t.color + '18', borderColor: t.color + '44' }
                    ]}
                  >
                    <View style={[styles.typeChipDot, { backgroundColor: isSel ? 'rgba(255,255,255,0.7)' : t.color }]} />
                    <Text style={[styles.typeChipLabel, { color: isSel ? '#fff' : t.color }]} numberOfLines={1}>{t.label}</Text>
                    {isSel && <Icon name="checkCircle" size={13} color="rgba(255,255,255,0.9)" strokeWidth={2.5} />}
                  </AnimatedPress>
                );
              })}
            </View>
          </View>

          {/* ─ AI Analiz Sonucu ─ */}
          {aiResult !== null && (() => {
            const level = getSeverityLevel(aiResult.severity);
            const classLabel = aiResult.damage_class
              ? (damageClassLabels[aiResult.damage_class] ?? aiResult.damage_class)
              : 'Tespit Yok';
            const isAnalyzing = aiResult.status === 'analyzing';

            if (isAnalyzing) {
              return (
                <View style={[styles.aiCard, { borderColor: '#CBD5E0', backgroundColor: '#F7FAFC' }]}>
                  <View style={styles.aiHeader}>
                    <View style={[styles.aiIconWrap, { backgroundColor: '#718096' }]}>
                      <ActivityIndicator size="small" color="#fff" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.aiTitle}>AI Hasar Analizi</Text>
                      <Text style={[styles.aiLevel, { color: '#718096' }]}>Analiz Devam Ediyor...</Text>
                    </View>
                  </View>
                  <Text style={styles.aiNote}>YOLOv8 modeli fotoğrafı işliyor. Sonuç kısa sürede hazır olacak.</Text>
                </View>
              );
            }

            return (
              <View style={[styles.aiCard, {
                borderColor: (level?.color ?? '#718096') + '44',
                backgroundColor: level?.bg ?? '#F7FAFC',
              }]}>
                <View style={styles.aiHeader}>
                  <View style={[styles.aiIconWrap, { backgroundColor: level?.color ?? '#718096' }]}>
                    <Icon name="shield" size={16} color="#fff" strokeWidth={2} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.aiTitle}>AI Hasar Analizi • {classLabel}</Text>
                    <Text style={[styles.aiLevel, { color: level?.color ?? '#718096' }]}>
                      {level?.label ?? 'Hasar Tespit Edilmedi'}
                    </Text>
                  </View>
                  {level && (
                    <View style={[styles.aiBadge, { backgroundColor: level.color }]}>
                      <Text style={styles.aiBadgeText}>{Math.round(level.bar * 100)}%</Text>
                    </View>
                  )}
                </View>
                {level && (
                  <View style={styles.aiBarBg}>
                    <View style={[styles.aiBarFill, { width: `${level.bar * 100}%` as any, backgroundColor: level.color }]} />
                  </View>
                )}
                <Text style={styles.aiNote}>YOLOv8 modeli ile analiz tamamlandı. Manuel kontrol önerilir.</Text>
              </View>
            );
          })()}

          {/* ─ Açıklama ─ */}
          <View style={styles.sectionHeader}>
            <LinearGradient colors={['#2B6CB0', '#63B3ED']} start={{x:0,y:0}} end={{x:1,y:0}} style={styles.sectionDot} />
            <Text style={styles.sectionLabel}>AÇIKLAMA</Text>
          </View>
          <View style={[styles.textAreaWrap, focusedField && styles.textAreaWrapFocused]}>
            <TextInput
              style={styles.textArea}
              placeholder="Hasar durumunu detaylıca anlatın...&#10;(konum, şiddet seviyesi, tehlike durumu, acil ihtiyaçlar vb.)"
              placeholderTextColor={colors.textMuted}
              value={description}
              onChangeText={setDescription}
              multiline numberOfLines={4} textAlignVertical="top"
              onFocus={() => setFocusedField(true)}
              onBlur={() => setFocusedField(false)}
            />
          </View>

          {/* ─ Fotoğraf ─ */}
          <View style={styles.sectionHeader}>
            <LinearGradient colors={['#6B46C1', '#B794F4']} start={{x:0,y:0}} end={{x:1,y:0}} style={styles.sectionDot} />
            <Text style={styles.sectionLabel}>FOTOĞRAF</Text>
            <View style={styles.photoBadge}>
              <Text style={styles.photoBadgeText}>{photos.length}/5</Text>
            </View>
          </View>
          <Text style={styles.photoHint}>📸 AI analizi için en az 1 fotoğraf eklemeniz önerilir</Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photoScroll}>
            <TouchableOpacity style={styles.photoActionBtn} onPress={takePhoto}>
              <LinearGradient colors={['#1565C0', '#42A5F5']} style={styles.photoActionGrad}>
                <Icon name="camera" size={26} color="#fff" strokeWidth={2} />
              </LinearGradient>
              <Text style={styles.photoActionLabel}>Kamera</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.photoActionBtn} onPress={pickPhoto}>
              <LinearGradient colors={['#6B46C1', '#805AD5']} style={styles.photoActionGrad}>
                <Icon name="image" size={26} color="#fff" strokeWidth={2} />
              </LinearGradient>
              <Text style={styles.photoActionLabel}>Galeri</Text>
            </TouchableOpacity>
            {photos.map((uri, i) => (
              <View key={i} style={styles.photoThumb}>
                <Image source={{ uri }} style={styles.photoImg} />
                <TouchableOpacity style={styles.photoRemove} onPress={() => setPhotos(prev => prev.filter((_, j) => j !== i))}>
                  <Icon name="close" size={10} color="#fff" strokeWidth={3} />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>

          {/* ─ Gönder ─ */}
          <TouchableOpacity onPress={handleSubmit} activeOpacity={0.85} style={styles.submitWrap} disabled={submitting}>
            <LinearGradient
              colors={selected ? [selected.color, selected.color + 'BB'] : [gradient[0], gradient[2]]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={[styles.submitBtn, submitting && { opacity: 0.75 }]}
            >
              {submitting
                ? <ActivityIndicator color="#fff" size="small" />
                : <Icon name="checkCircle" size={22} color="#fff" strokeWidth={2.5} />
              }
              <Text style={styles.submitText}>
                {submitting ? 'AI Analiz Ediliyor...' : 'Raporu Gönder'}
              </Text>
              {!submitting && (
                <View style={styles.submitArrow}>
                  <Icon name="chevronRight" size={20} color="#fff" strokeWidth={3} />
                </View>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {/* ─ İstatistik kartları ─ */}
          <View style={styles.statsSection}>
            <Text style={styles.statsSectionLabel}>GÜNCEL VERİLER</Text>
            <View style={styles.infoRow}>
              <LinearGradient colors={['#C53030', '#E53E3E']} style={styles.infoCard}>
                <Icon name="shield" size={22} color="#fff" strokeWidth={2} />
                <Text style={styles.infoCardNum}>1.2K</Text>
                <Text style={styles.infoCardLabel}>Toplam Rapor</Text>
              </LinearGradient>
              <LinearGradient colors={['#C05621', '#DD6B20']} style={styles.infoCard}>
                <Icon name="mapPin" size={22} color="#fff" strokeWidth={2} />
                <Text style={styles.infoCardNum}>48</Text>
                <Text style={styles.infoCardLabel}>Aktif Bölge</Text>
              </LinearGradient>
              <LinearGradient colors={['#2C5282', '#2B6CB0']} style={styles.infoCard}>
                <Icon name="users" size={22} color="#fff" strokeWidth={2} />
                <Text style={styles.infoCardNum}>320</Text>
                <Text style={styles.infoCardLabel}>Saha Ekibi</Text>
              </LinearGradient>
            </View>
          </View>

          <View style={{ height: 110 }} />
        </ScrollView>
      </View>

      {/* Yol Geçilemez — Güzergah Öner Modal */}
      <Modal visible={routeSuggestVisible} transparent animationType="fade" onRequestClose={() => setRouteSuggestVisible(false)}>
        <View style={styles.routeModalOverlay}>
          <View style={styles.routeModalCard}>
            <View style={styles.routeModalIcon}>
              <Text style={{ fontSize: 36 }}>🚧</Text>
            </View>
            <Text style={styles.routeModalTitle}>Yol Geçilemez!</Text>
            <Text style={styles.routeModalDesc}>
              AI analizi bu bölgedeki yolun geçilemez durumda olduğunu tespit etti.
              Alternatif güzergah hesaplamak ister misiniz?
            </Text>
            <TouchableOpacity
              style={styles.routeModalBtn}
              activeOpacity={0.85}
              onPress={() => {
                setRouteSuggestVisible(false);
                triggerRouteModal();
                navigation.navigate('Harita');
              }}
            >
              <Icon name="mapPin" size={16} color="#fff" strokeWidth={2.5} />
              <Text style={styles.routeModalBtnText}>Yeni Güzergah Hesapla</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.routeModalSkipBtn}
              onPress={() => setRouteSuggestVisible(false)}
            >
              <Text style={styles.routeModalSkipText}>Şimdi değil</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  heroSection: { paddingBottom: 20 },
  heroRow: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    paddingHorizontal: 20, paddingTop: 10,
  },
  heroIconWrap: {
    width: 50, height: 50, borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.3)',
  },
  heroTitle: { fontSize: 22, fontWeight: '900', color: '#fff', letterSpacing: -0.3 },
  heroSub: { fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 3, fontWeight: '500' },
  locBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.3)',
    paddingHorizontal: 10, paddingVertical: 7, borderRadius: 20,
  },
  locBadgeActive: { backgroundColor: 'rgba(72,187,120,0.35)', borderColor: 'rgba(72,187,120,0.6)' },
  locText: { fontSize: 11, color: '#fff', fontWeight: '700' },

  card: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scrollContent: { paddingHorizontal: 18, paddingTop: 20 },

  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12, marginTop: 6 },
  sectionDot: { width: 4, height: 18, borderRadius: 2 },
  sectionLabel: { fontSize: 12, fontWeight: '900', color: '#4A5568', letterSpacing: 1.2 },
  photoBadge: {
    marginLeft: 'auto' as any,
    backgroundColor: '#E2E8F0', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20,
  },
  photoBadgeText: { fontSize: 12, fontWeight: '800', color: '#4A5568' },

  typeContainer: {
    backgroundColor: 'rgba(255,255,255,0.13)',
    borderRadius: 20, padding: 12, marginBottom: 20,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)',
  },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  typeChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 12, paddingVertical: 9,
    borderRadius: 22, borderWidth: 1.5,
  },
  typeChipDot: { width: 7, height: 7, borderRadius: 4 },
  typeChipLabel: { fontSize: 13, fontWeight: '700' },
  selTypeBadge: {
    marginLeft: 'auto' as any,
    paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20,
  },
  selTypeBadgeText: { fontSize: 11, fontWeight: '800', color: '#fff' },
  selDot: { width: 10, height: 10, borderRadius: 5 },

  // AI Analiz
  aiCard: {
    borderWidth: 1.5, borderRadius: 18, padding: 16, marginBottom: 20,
  },
  aiHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  aiIconWrap: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  aiTitle: { fontSize: 11, fontWeight: '700', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 },
  aiLevel: { fontSize: 17, fontWeight: '900', marginTop: 2 },
  aiBadge: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
  aiBadgeText: { fontSize: 14, fontWeight: '900', color: '#fff' },
  aiBarBg: { height: 8, backgroundColor: '#E2E8F0', borderRadius: 4, marginBottom: 10 },
  aiBarFill: { height: 8, borderRadius: 4 },
  aiNote: { fontSize: 12, color: colors.textMuted, lineHeight: 17 },

  textAreaWrap: {
    borderWidth: 1.5, borderColor: '#C7D2FE', borderRadius: 16,
    backgroundColor: '#F0F4FF', marginBottom: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 1,
  },
  textAreaWrapFocused: { borderColor: '#4299E1', backgroundColor: '#fff' },
  textArea: { padding: 16, fontSize: 15, color: colors.textPrimary, minHeight: 110, lineHeight: 23 },

  photoHint: { fontSize: 13, color: colors.textMuted, marginBottom: 14 },
  photoScroll: { marginBottom: 24 },
  photoActionBtn: { alignItems: 'center', marginRight: 14, width: 78 },
  photoActionGrad: {
    width: 78, height: 78, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center', marginBottom: 7,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 5,
  },
  photoActionLabel: { fontSize: 13, color: colors.textSecondary, fontWeight: '700' },
  photoThumb: {
    width: 78, height: 78, borderRadius: 22, marginRight: 14, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.12, shadowRadius: 6, elevation: 4,
  },
  photoImg: { width: '100%', height: '100%' },
  photoRemove: {
    position: 'absolute', top: 6, right: 6, width: 22, height: 22, borderRadius: 11,
    backgroundColor: 'rgba(0,0,0,0.65)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.8)',
  },

  submitWrap: { marginTop: 4, marginBottom: 6 },
  submitBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingLeft: 24, paddingRight: 16, paddingVertical: 18, borderRadius: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.25, shadowRadius: 14, elevation: 10,
  },
  submitText: { flex: 1, color: '#fff', fontSize: 18, fontWeight: '900', marginLeft: 12 },
  submitArrow: {
    width: 40, height: 40, borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },

  statsSection: { marginTop: 8 },
  statsSectionLabel: { fontSize: 11, fontWeight: '900', color: '#4A5568', letterSpacing: 1.2, marginBottom: 12 },
  infoRow: { flexDirection: 'row', gap: 10 },
  infoCard: {
    flex: 1, borderRadius: 18, padding: 16, alignItems: 'center', gap: 6,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 4,
  },
  infoCardNum: { fontSize: 22, fontWeight: '900', color: '#fff' },
  infoCardLabel: { fontSize: 11, fontWeight: '700', color: 'rgba(255,255,255,0.9)', textAlign: 'center' },

  // Güzergah öneri modal
  routeModalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center', justifyContent: 'center', padding: 24,
  },
  routeModalCard: {
    backgroundColor: '#fff', borderRadius: 24, padding: 28,
    alignItems: 'center', width: '100%',
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 24, elevation: 20,
  },
  routeModalIcon: {
    width: 72, height: 72, borderRadius: 20,
    backgroundColor: '#FFF7ED', alignItems: 'center', justifyContent: 'center',
    marginBottom: 16,
  },
  routeModalTitle: { fontSize: 20, fontWeight: '900', color: '#1E293B', marginBottom: 10 },
  routeModalDesc: {
    fontSize: 14, color: '#475569', textAlign: 'center', lineHeight: 21, marginBottom: 24,
  },
  routeModalBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#7C3AED', borderRadius: 14,
    paddingVertical: 14, paddingHorizontal: 24, width: '100%', justifyContent: 'center',
    shadowColor: '#7C3AED', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 8, elevation: 6,
  },
  routeModalBtnText: { fontSize: 15, fontWeight: '800', color: '#fff' },
  routeModalSkipBtn: { marginTop: 12, padding: 8 },
  routeModalSkipText: { fontSize: 14, color: '#94A3B8', fontWeight: '600' },
});
