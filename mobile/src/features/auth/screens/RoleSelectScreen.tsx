import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import colors from '../../../shared/theme/colors';
import Icon from '../../../shared/components/Icon';

const { width } = Dimensions.get('window');

const roles = [
  {
    key: 'normal',
    title: 'Normal Kullanıcı',
    description: 'Afet durumunda yardım talep edebilir, bildirim alabilirsiniz.',
    accentColor: colors.info,
    gradientColors: ['#1565C0', '#1976D2', '#42A5F5'] as [string, string, string],
    iconName: 'user' as const,
    tag: 'Vatandaş',
    tagColor: '#BBDEFB',
    tagTextColor: '#0D47A1',
  },
  {
    key: 'stk',
    title: 'STK Gönüllü',
    description: 'Sivil toplum kuruluşu gönüllüsü olarak sahada görev alabilirsiniz.',
    accentColor: colors.success,
    gradientColors: ['#1B5E20', '#2E7D32', '#43A047'] as [string, string, string],
    iconName: 'mapPin' as const,
    tag: 'Gönüllü',
    tagColor: '#C8E6C9',
    tagTextColor: '#1B5E20',
  },
  {
    key: 'yetkili',
    title: 'Yetkili Kullanıcı',
    description: 'Kurumsal yetki ile koordinasyon ve yönetim işlemleri yapabilirsiniz.',
    accentColor: colors.emergency,
    gradientColors: ['#7B1FA2', '#8E24AA', '#AB47BC'] as [string, string, string],
    iconName: 'shield' as const,
    tag: 'Kurum',
    tagColor: '#F3E5F5',
    tagTextColor: '#6A1B9A',
  },
];

const RoleSelectScreen = () => {
  const navigation = useNavigation<any>();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Full background gradient - Unified with LoginScreen */}
      <LinearGradient
        colors={['#1976D2', '#42A5F5', '#64B5F6', '#90CAF9']}
        locations={[0, 0.35, 0.7, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Decorative circles - Consistent with LoginScreen */}
      <View style={[styles.decorCircle, styles.decor1]} />
      <View style={[styles.decorCircle, styles.decor2]} />
      <View style={[styles.decorCircle, styles.decor3]} />
      <View style={[styles.decorCircle, styles.decor4]} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <View style={styles.backIconWrap}>
            <Icon name="chevronLeft" size={20} color="#fff" />
          </View>
          <Text style={styles.backText}>Geri</Text>
        </TouchableOpacity>

        <View style={styles.headerMain}>
          <View style={styles.logoWrap}>
            <Image
              source={require('../../../../assets/logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.title}>Kayıt Türü Seçin</Text>
          <Text style={styles.subtitle}>Platforma nasıl katılmak istediğinizi belirleyin</Text>
        </View>
      </View>

      {/* Body card */}
      <View style={styles.body}>
        {/* Pull handle */}
        <View style={styles.pullHandle} />

        <Text style={styles.sectionLabel}>Kullanıcı Rolünüzü Seçin</Text>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.roleList}
        >
          {roles.map((role) => (
            <TouchableOpacity
              key={role.key}
              onPress={() => navigation.navigate('Register', { role: role.key })}
              activeOpacity={0.88}
              style={styles.roleCardWrapper}
            >
              <LinearGradient
                colors={role.gradientColors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.roleCard}
              >
                {/* Background decorative circle */}
                <View style={styles.cardDecorCircle} />

                {/* Icon area */}
                <View style={styles.roleIconWrap}>
                  <Icon name={role.iconName} size={28} color="#fff" />
                </View>

                {/* Text */}
                <View style={styles.roleTextWrapper}>
                  <View style={styles.roleTitleRow}>
                    <Text style={styles.roleTitle}>{role.title}</Text>
                    <View style={[styles.roleTag, { backgroundColor: 'rgba(255,255,255,0.22)' }]}>
                      <Text style={styles.roleTagText}>{role.tag}</Text>
                    </View>
                  </View>
                  <Text style={styles.roleDescription}>{role.description}</Text>
                </View>

                {/* Arrow */}
                <View style={styles.roleArrow}>
                  <Icon name="chevronRight" size={18} color="rgba(255,255,255,0.9)" />
                </View>
              </LinearGradient>
            </TouchableOpacity>
          ))}

          <Text style={styles.footerNote}>
            Rol seçiminizi daha sonra değiştiremezsiniz. Lütfen dikkatli seçin.
          </Text>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  decorCircle: {
    position: 'absolute',
    borderRadius: 999,
  },
  decor1: {
    width: 320,
    height: 320,
    top: -80,
    right: -100,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  decor2: {
    width: 200,
    height: 200,
    top: 60,
    left: -80,
    backgroundColor: 'rgba(229,62,62,0.06)',
  },
  decor3: {
    width: 160,
    height: 160,
    bottom: 280,
    right: -50,
    backgroundColor: 'rgba(79,195,247,0.05)',
  },
  decor4: {
    width: 80,
    height: 80,
    bottom: 320,
    left: 30,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  // Header
  header: {
    paddingBottom: 24,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 10,
    gap: 6,
  },
  backIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backText: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 15,
    fontWeight: '600',
  },
  headerMain: {
    alignItems: 'center',
    paddingTop: 4,
  },
  logoWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    shadowColor: '#4FC3F7',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 10,
  },
  logo: {
    width: 48,
    height: 48,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -0.3,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.65)',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  // Body
  body: {
    flex: 1,
    backgroundColor: colors.surface,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 16,
  },
  pullHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    paddingHorizontal: 22,
    marginBottom: 12,
  },
  roleList: {
    paddingHorizontal: 18,
    paddingBottom: 36,
    gap: 14,
  },
  roleCardWrapper: {
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 8,
  },
  roleCard: {
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    overflow: 'hidden',
  },
  cardDecorCircle: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255,255,255,0.06)',
    right: -40,
    top: -50,
  },
  roleIconWrap: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  roleTextWrapper: {
    flex: 1,
  },
  roleTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 5,
    flexWrap: 'wrap',
  },
  roleTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#fff',
  },
  roleTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  roleTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.9)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  roleDescription: {
    fontSize: 12.5,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 18,
  },
  roleArrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  footerNote: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 20,
    lineHeight: 18,
  },
});

export default RoleSelectScreen;
