import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from '../../../shared/components/Icon';
import colors from '../../../shared/theme/colors';

export default function MapScreen() {
  return (
    <View style={styles.container}>
      {/* Background Gradient */}
      <LinearGradient 
        colors={['#42A5F5', '#1976D2', '#1A365D']}
        style={StyleSheet.absoluteFillObject} 
      />

      {/* Dekoratif Öğeler */}
      <View style={[styles.decor, { width: 350, height: 350, bottom: -120, left: -100, backgroundColor: 'rgba(255,255,255,0.05)' }]} />
      <View style={[styles.decor, { width: 200, height: 200, top: 20, right: -50, backgroundColor: 'rgba(255,255,255,0.03)' }]} />

      <View style={styles.content}>
        <View style={styles.card}>
          <LinearGradient
            colors={['#fff', '#F8FAFC']}
            style={styles.cardBg}
          >
            <View style={styles.iconWrap}>
              <Icon name="mapPin" size={40} color={colors.info} strokeWidth={1.5} />
            </View>
            <Text style={styles.title}>Harita Servisi</Text>
            <Text style={styles.subtitle}>
              İnteraktif harita entegrasyonu ve bölge analiz sistemleri çok yakında burada olacak.
            </Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>YAKINDA</Text>
            </View>
          </LinearGradient>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  decor: { position: 'absolute', borderRadius: 999 },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  card: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 30,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 15,
  },
  cardBg: {
    padding: 32,
    alignItems: 'center',
  },
  iconWrap: {
    width: 80, height: 80, borderRadius: 24,
    backgroundColor: '#EBF8FF',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: colors.navy,
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  badge: {
    backgroundColor: colors.navy,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
  },
});
