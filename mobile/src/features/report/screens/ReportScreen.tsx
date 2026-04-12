import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, Image, Alert, Animated,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { LinearGradient } from 'expo-linear-gradient';
import colors from '../../../shared/theme/colors';
import Icon from '../../../shared/components/Icon';
import AnimatedPress from '../../../shared/components/AnimatedPress';
import TopBar from '../../../shared/components/TopBar';
import FloatingBubbles from '../../../shared/components/FloatingBubbles';
import { useAuthStore } from '../../../core/stores/auth.store';

const reportTypes = [
  { key: 'yikilanbina', label: 'Yıkılan Bina', color: '#E53E3E', bg: '#FFF5F5', icon: 'shield'        as const, desc: 'Kısmi veya tam çöküş' },
  { key: 'kapaliyol',   label: 'Kapanan Yol',   color: '#DD6B20', bg: '#FFFAF0', icon: 'alertTriangle' as const, desc: 'Enkaz, heyelan vb.' },
  { key: 'diger',       label: 'Diğer Hasar',   color: '#2B6CB0', bg: '#EBF8FF', icon: 'mapPin'        as const, desc: 'Altyapı, yangın vb.' },
];

const aiLevels = [
  { label: 'Hafif Hasar',   color: '#38A169', bg: '#F0FFF4', bar: 0.25 },
  { label: 'Orta Hasar',    color: '#D69E2E', bg: '#FFFFF0', bar: 0.55 },
  { label: 'Ağır Hasar',    color: '#E53E3E', bg: '#FFF5F5', bar: 0.85 },
];

const roleGradients: Record<string, [string, string, string]> = {
  citizen:   ['#1565C0', '#1976D2', '#2196F3'],
  volunteer: ['#1B5E20', '#2E7D32', '#43A047'],
  admin:     ['#4A148C', '#7B1FA2', '#AB47BC'],
};

export default function ReportScreen() {
  const { user } = useAuthStore();
  const role = user?.role ?? 'citizen';
  const gradient = roleGradients[role] ?? roleGradients.citizen;

  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [focusedField, setFocusedField] = useState(false);
  const [aiResult, setAiResult] = useState<number | null>(null); // 0=hafif 1=orta 2=ağır

  const requestLocation = async (): Promise<boolean> => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Konum İzni', 'Raporunuza konum eklemek için konum izni gereklidir.');
      return false;
    }
    const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
    setLocation({ lat: loc.coords.latitude, lon: loc.coords.longitude });
    return true;
  };

  const pickPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') { Alert.alert('İzin Gerekli', 'Galeri iznine ihtiyaç var.'); return; }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true, quality: 0.7,
    });
    if (!result.canceled) {
      const uris = result.assets.map(a => a.uri);
      setPhotos(prev => [...prev, ...uris].slice(0, 5));
      // Simüle AI analiz
      setTimeout(() => setAiResult(Math.floor(Math.random() * 3)), 1500);
    }
  };

  const takePhoto = async () => {
    await requestLocation();
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') { Alert.alert('İzin Gerekli', 'Kamera iznine ihtiyaç var.'); return; }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.7 });
    if (!result.canceled) {
      setPhotos(prev => [...prev, result.assets[0].uri].slice(0, 5));
      setTimeout(() => setAiResult(Math.floor(Math.random() * 3)), 1500);
    }
  };

  const handleSubmit = () => {
    if (!selectedType) { Alert.alert('Hata', 'Lütfen hasar türü seçiniz.'); return; }
    if (!description.trim()) { Alert.alert('Hata', 'Lütfen açıklama giriniz.'); return; }
    Alert.alert('✓ Rapor Gönderildi', 'Raporunuz sisteme iletildi. AI analizi tamamlandığında bildirim alacaksınız.', [
      { text: 'Tamam', onPress: () => { setSelectedType(null); setDescription(''); setPhotos([]); setAiResult(null); setLocation(null); } }
    ]);
  };

  const selected = reportTypes.find(t => t.key === selectedType);

  return (
    <View style={styles.container}>
      <LinearGradient colors={gradient} locations={[0, 0.5, 1]} style={StyleSheet.absoluteFillObject} />
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
          <TouchableOpacity onPress={requestLocation} activeOpacity={0.7}
            style={[styles.locBadge, location && styles.locBadgeActive]}
          >
            <Icon name="mapPin" size={14} color="#fff" strokeWidth={2.5} />
            <Text style={styles.locText}>{location ? '✓ Konum Alındı' : 'Konum Al'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Form kart */}
      <View style={styles.card}>
        <View style={styles.pullHandle} />
        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}>

          {/* ─ Hasar türü ─ */}
          <View style={styles.sectionHeader}>
            <LinearGradient colors={['#E53E3E', '#FC8181']} start={{x:0,y:0}} end={{x:1,y:0}} style={styles.sectionDot} />
            <Text style={styles.sectionLabel}>HASAR TÜRÜ</Text>
          </View>
          <View style={styles.typeGrid}>
            {reportTypes.map(t => {
              const isSel = selectedType === t.key;
              return (
                <AnimatedPress key={t.key} onPress={() => setSelectedType(t.key)}
                  scale={isSel ? 1.03 : 0.97}
                  style={[styles.typeCard, { borderColor: isSel ? t.color : '#E8EEF4' },
                    isSel && { backgroundColor: t.bg, borderWidth: 2 }]}
                >
                  <View style={[styles.typeIconBg, { backgroundColor: isSel ? t.color : t.color + '22' }]}>
                    <Icon name={t.icon} size={20} color={isSel ? '#fff' : t.color} strokeWidth={2} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.typeLabel, { color: isSel ? t.color : colors.textPrimary }]}>{t.label}</Text>
                    <Text style={[styles.typeDesc, { color: isSel ? t.color + 'BB' : colors.textMuted }]}>{t.desc}</Text>
                  </View>
                  {isSel && <View style={[styles.selDot, { backgroundColor: t.color }]} />}
                </AnimatedPress>
              );
            })}
          </View>

          {/* ─ AI Analiz Sonucu (fotoğraf eklendikten sonra) ─ */}
          {aiResult !== null && (
            <View style={[styles.aiCard, { borderColor: aiLevels[aiResult].color + '44', backgroundColor: aiLevels[aiResult].bg }]}>
              <View style={styles.aiHeader}>
                <View style={[styles.aiIconWrap, { backgroundColor: aiLevels[aiResult].color }]}>
                  <Icon name="shield" size={16} color="#fff" strokeWidth={2} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.aiTitle}>AI Hasar Analizi</Text>
                  <Text style={[styles.aiLevel, { color: aiLevels[aiResult].color }]}>{aiLevels[aiResult].label}</Text>
                </View>
                <View style={[styles.aiBadge, { backgroundColor: aiLevels[aiResult].color }]}>
                  <Text style={styles.aiBadgeText}>{Math.round(aiLevels[aiResult].bar * 100)}%</Text>
                </View>
              </View>
              <View style={styles.aiBarBg}>
                <View style={[styles.aiBarFill, { width: `${aiLevels[aiResult].bar * 100}%` as any, backgroundColor: aiLevels[aiResult].color }]} />
              </View>
              <Text style={styles.aiNote}>Fotoğraf analizi yapay zeka ile gerçekleştirildi. Manuel kontrol önerilir.</Text>
            </View>
          )}

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
          <TouchableOpacity onPress={handleSubmit} activeOpacity={0.85} style={styles.submitWrap}>
            <LinearGradient
              colors={selected ? [selected.color, selected.color + 'BB'] : [gradient[0], gradient[2]]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={styles.submitBtn}
            >
              <Icon name="checkCircle" size={22} color="#fff" strokeWidth={2.5} />
              <Text style={styles.submitText}>Raporu Gönder</Text>
              <View style={styles.submitArrow}>
                <Icon name="chevronRight" size={20} color="#fff" strokeWidth={3} />
              </View>
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
    flex: 1, backgroundColor: '#F5F7FA',
    borderTopLeftRadius: 32, borderTopRightRadius: 32,
    shadowColor: '#000', shadowOffset: { width: 0, height: -8 }, shadowOpacity: 0.12, shadowRadius: 20, elevation: 20,
  },
  pullHandle: {
    width: 44, height: 5, borderRadius: 3,
    backgroundColor: '#D1D9E6', alignSelf: 'center',
    marginTop: 12, marginBottom: 18,
  },
  scrollContent: { paddingHorizontal: 18 },

  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12, marginTop: 6 },
  sectionDot: { width: 4, height: 18, borderRadius: 2 },
  sectionLabel: { fontSize: 12, fontWeight: '900', color: '#4A5568', letterSpacing: 1.2 },
  photoBadge: {
    marginLeft: 'auto' as any,
    backgroundColor: '#E2E8F0', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20,
  },
  photoBadgeText: { fontSize: 12, fontWeight: '800', color: '#4A5568' },

  typeGrid: { gap: 10, marginBottom: 20 },
  typeCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#E8EEF4',
    borderRadius: 16, paddingHorizontal: 14, paddingVertical: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 2,
  },
  typeIconBg: {
    width: 44, height: 44, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
  },
  typeLabel: { fontSize: 15, fontWeight: '800', color: colors.textPrimary },
  typeDesc: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
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
    borderWidth: 1.5, borderColor: '#E2E8F0', borderRadius: 16,
    backgroundColor: '#fff', marginBottom: 20,
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
});
