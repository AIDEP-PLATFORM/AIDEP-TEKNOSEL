import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, Image, Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import colors from '../../../shared/theme/colors';
import Icon from '../../../shared/components/Icon';
import AnimatedPress from '../../../shared/components/AnimatedPress';

const reportTypes = [
  { key: 'yikilanbina', label: 'Yıkılan Bina', color: '#E53E3E', bg: '#FFF5F5', icon: 'shield'        as const },
  { key: 'kapaliyol',   label: 'Kapanan Yol',   color: '#DD6B20', bg: '#FFFAF0', icon: 'alertTriangle' as const },
  { key: 'diger',       label: 'Diğer',         color: '#2B6CB0', bg: '#EBF8FF', icon: 'mapPin'        as const },
];

export default function ReportScreen() {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [focusedField, setFocusedField] = useState(false);

  const pickPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('İzin Gerekli', 'Fotoğraf seçmek için galeri iznine ihtiyaç var.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.7,
    });
    if (!result.canceled) {
      const uris = result.assets.map(a => a.uri);
      setPhotos(prev => [...prev, ...uris].slice(0, 5));
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('İzin Gerekli', 'Fotoğraf çekmek için kamera iznine ihtiyaç var.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.7 });
    if (!result.canceled) {
      setPhotos(prev => [...prev, result.assets[0].uri].slice(0, 5));
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!selectedType) { Alert.alert('Hata', 'Lütfen hasar türü seçiniz.'); return; }
    if (!description.trim()) { Alert.alert('Hata', 'Lütfen açıklama giriniz.'); return; }
    Alert.alert('Başarılı', 'Raporunuz gönderildi.', [
      { text: 'Tamam', onPress: () => { setSelectedType(null); setDescription(''); setPhotos([]); } }
    ]);
  };

  const selected = reportTypes.find(t => t.key === selectedType);

  return (
    <View style={styles.container}>
      {/* Gradient arka plan */}
      <LinearGradient
        colors={['#42A5F5', '#64B5F6', '#90CAF9']}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFillObject}
      />
      <View style={[styles.decor, { width: 280, height: 280, top: -80, right: -80 }]} />
      <View style={[styles.decor, { width: 150, height: 150, top: 50, left: -60, opacity: 0.06 }]} />

      {/* Header */}
      <View style={styles.heroSection}>
        <View style={styles.heroIconWrap}>
          <Icon name="alertTriangle" size={28} color="#fff" strokeWidth={2.5} />
        </View>
        <Text style={styles.heroTitle}>Hasar Raporla</Text>
        <Text style={styles.heroSub}>Bölgenizdeki hasar durumunu bildirin</Text>
      </View>

      {/* Form kart */}
      <View style={styles.card}>
        <View style={styles.pullHandle} />
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}
        >

          {/* Hasar türü */}
          <Text style={styles.sectionLabel}>HASAR TÜRÜ</Text>
          <View style={styles.typeGrid}>
            {reportTypes.map(t => {
              const isSel = selectedType === t.key;
              return (
                <AnimatedPress
                  key={t.key}
                  onPress={() => setSelectedType(t.key)}
                  scale={isSel ? 1.03 : 0.95}
                  style={[
                    styles.typeCard,
                    { borderColor: isSel ? t.color : t.color + '55', backgroundColor: t.bg },
                    isSel && styles.typeCardSelected,
                  ]}
                >
                  <View style={[styles.typeIconBg, { backgroundColor: t.color }]}>
                    <Icon name={t.icon} size={16} color="#fff" strokeWidth={2} />
                  </View>
                  <Text style={[styles.typeLabel, { color: t.color }, isSel && { fontWeight: '900' }]}>
                    {t.label}
                  </Text>
                  {isSel && (
                    <View style={[styles.selDot, { backgroundColor: t.color }]} />
                  )}
                </AnimatedPress>
              );
            })}
          </View>

          {/* Açıklama */}
          <Text style={styles.sectionLabel}>AÇIKLAMA</Text>
          <View style={[styles.textAreaWrap, focusedField && styles.textAreaWrapFocused]}>
            <TextInput
              style={styles.textArea}
              placeholder="Hasar durumunu detaylıca anlatın... (konum, şiddet, tehlike durumu vb.)"
              placeholderTextColor={colors.textMuted}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              onFocus={() => setFocusedField(true)}
              onBlur={() => setFocusedField(false)}
            />
          </View>

          {/* Fotoğraf */}
          <View style={styles.photoHeader}>
            <Text style={styles.sectionLabel}>FOTOĞRAF</Text>
            <View style={styles.photoBadge}>
              <Text style={styles.photoBadgeText}>{photos.length}/5</Text>
            </View>
          </View>
          <Text style={styles.photoHint}>Hasar fotoğrafı eklemek analiz doğruluğunu artırır</Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photoScroll}>
            {/* Kamera */}
            <TouchableOpacity style={styles.photoActionBtn} onPress={takePhoto}>
              <LinearGradient colors={['#1976D2', '#42A5F5']} style={styles.photoActionGrad}>
                <Icon name="camera" size={22} color="#fff" strokeWidth={2} />
              </LinearGradient>
              <Text style={styles.photoActionLabel}>Kamera</Text>
            </TouchableOpacity>

            {/* Galeri */}
            <TouchableOpacity style={styles.photoActionBtn} onPress={pickPhoto}>
              <LinearGradient colors={['#6B46C1', '#805AD5']} style={styles.photoActionGrad}>
                <Icon name="image" size={22} color="#fff" strokeWidth={2} />
              </LinearGradient>
              <Text style={styles.photoActionLabel}>Galeri</Text>
            </TouchableOpacity>

            {/* Seçilmiş fotoğraflar */}
            {photos.map((uri, i) => (
              <View key={i} style={styles.photoThumb}>
                <Image source={{ uri }} style={styles.photoImg} />
                <TouchableOpacity style={styles.photoRemove} onPress={() => removePhoto(i)}>
                  <Icon name="close" size={9} color="#fff" strokeWidth={3} />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>

          {/* Gönder */}
          <TouchableOpacity onPress={handleSubmit} activeOpacity={0.85} style={styles.submitWrap}>
            <LinearGradient
              colors={selected ? [selected.color, selected.color + 'CC'] : ['#1976D2', '#42A5F5']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={styles.submitBtn}
            >
              <View style={styles.submitLeft}>
                <Icon name="alertTriangle" size={18} color="#fff" strokeWidth={2.5} />
                <Text style={styles.submitText}>Raporu Gönder</Text>
              </View>
              <View style={styles.submitArrow}>
                <Icon name="chevronRight" size={18} color="#fff" strokeWidth={3} />
              </View>
            </LinearGradient>
          </TouchableOpacity>

          {/* Alt bilgi kartları */}
          <View style={styles.infoRow}>
            <LinearGradient colors={['#E53E3E', '#FC8181']} style={styles.infoCard}>
              <Icon name="shield" size={20} color="#fff" strokeWidth={2} />
              <Text style={styles.infoCardNum}>1.2K</Text>
              <Text style={styles.infoCardLabel}>Rapor</Text>
            </LinearGradient>
            <LinearGradient colors={['#DD6B20', '#F6AD55']} style={styles.infoCard}>
              <Icon name="mapPin" size={20} color="#fff" strokeWidth={2} />
              <Text style={styles.infoCardNum}>48</Text>
              <Text style={styles.infoCardLabel}>Aktif Bölge</Text>
            </LinearGradient>
            <LinearGradient colors={['#1976D2', '#42A5F5']} style={styles.infoCard}>
              <Icon name="users" size={20} color="#fff" strokeWidth={2} />
              <Text style={styles.infoCardNum}>320</Text>
              <Text style={styles.infoCardLabel}>Gönüllü</Text>
            </LinearGradient>
          </View>

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
    paddingBottom: 28,
    paddingHorizontal: 24,
  },
  heroIconWrap: {
    width: 54, height: 54, borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 14,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
  },
  heroTitle: { fontSize: 28, fontWeight: '900', color: '#fff', letterSpacing: -0.5 },
  heroSub: { fontSize: 14, color: 'rgba(255,255,255,0.7)', marginTop: 5, fontWeight: '500' },
  card: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.1, shadowRadius: 20, elevation: 20,
  },
  pullHandle: {
    width: 42, height: 5, borderRadius: 3,
    backgroundColor: '#E2E8F0', alignSelf: 'center',
    marginTop: 12, marginBottom: 20,
  },
  scrollContent: { paddingHorizontal: 22 },
  sectionLabel: {
    fontSize: 11, fontWeight: '800', color: colors.textSecondary,
    letterSpacing: 1, marginBottom: 12, textTransform: 'uppercase',
  },
  typeGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24,
  },
  typeCard: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    width: '48%',
    borderWidth: 1.5,
    borderRadius: 14, paddingHorizontal: 12, paddingVertical: 11,
  },
  typeCardSelected: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08, shadowRadius: 6, elevation: 3,
  },
  typeIconBg: {
    width: 30, height: 30, borderRadius: 9,
    alignItems: 'center', justifyContent: 'center',
  },
  typeLabel: {
    flex: 1, fontSize: 13, color: colors.textSecondary, fontWeight: '600',
  },
  selDot: {
    width: 8, height: 8, borderRadius: 4,
  },
  textAreaWrap: {
    borderWidth: 1.5, borderColor: '#E8EEF4',
    borderRadius: 16, backgroundColor: '#F8FAFC',
    marginBottom: 22,
  },
  textAreaWrapFocused: {
    borderColor: colors.navy + '60', backgroundColor: '#fff',
  },
  textArea: {
    padding: 14, fontSize: 14, color: colors.textPrimary,
    minHeight: 110, lineHeight: 21,
  },
  photoHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 4,
  },
  photoBadge: {
    backgroundColor: colors.navy + '15',
    paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20,
    marginBottom: 12,
  },
  photoBadgeText: {
    fontSize: 12, fontWeight: '800', color: colors.navy,
  },
  photoHint: {
    fontSize: 12, color: colors.textMuted,
    marginBottom: 14, marginTop: -10,
  },
  photoScroll: { marginBottom: 28 },
  photoActionBtn: {
    alignItems: 'center', marginRight: 12, width: 72,
  },
  photoActionGrad: {
    width: 72, height: 72, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 6,
  },
  photoActionLabel: {
    fontSize: 12, color: colors.textSecondary, fontWeight: '700',
  },
  photoThumb: {
    width: 72, height: 72, borderRadius: 18,
    marginRight: 12, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 4, elevation: 3,
  },
  photoImg: { width: '100%', height: '100%' },
  photoRemove: {
    position: 'absolute', top: 5, right: 5,
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.8)',
  },
  submitWrap: { marginTop: 4 },
  submitBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingLeft: 22, paddingRight: 14, paddingVertical: 16,
    borderRadius: 18,
    shadowColor: '#1976D2',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25, shadowRadius: 12, elevation: 8,
  },
  submitLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '900', letterSpacing: 0.3 },
  submitArrow: {
    width: 38, height: 38, borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  infoRow: {
    flexDirection: 'row', gap: 10, marginTop: 20,
  },
  infoCard: {
    flex: 1, borderRadius: 16, padding: 14,
    alignItems: 'center', gap: 4,
  },
  infoCardNum: {
    fontSize: 18, fontWeight: '900', color: '#fff',
  },
  infoCardLabel: {
    fontSize: 11, fontWeight: '700', color: 'rgba(255,255,255,0.85)',
  },
});
