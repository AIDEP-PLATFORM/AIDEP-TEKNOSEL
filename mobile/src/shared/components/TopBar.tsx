import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, StatusBar, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from './Icon';

interface TopBarProps {
  tint?: 'light' | 'dark';
}

const STATUSBAR_HEIGHT = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) : 44;

export default function TopBar({ tint = 'light' }: TopBarProps) {
  const navigation = useNavigation<any>();
  const iconColor = tint === 'light' ? '#fff' : '#1E293B';
  const textColor = tint === 'light' ? '#fff' : '#1E293B';
  const subColor  = tint === 'light' ? 'rgba(255,255,255,0.55)' : '#64748B';
  const btnBg     = tint === 'light' ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.06)';
  const btnBorder = tint === 'light' ? 'rgba(255,255,255,0.3)'  : 'rgba(0,0,0,0.1)';

  return (
    <View style={[styles.wrap, { paddingTop: STATUSBAR_HEIGHT }]}>
      <View style={styles.inner}>
        {/* Sol: Logo + AIDEP */}
        <View style={styles.left}>
          <View style={[styles.logoWrap, { backgroundColor: btnBg, borderColor: btnBorder }]}>
            <Image source={require('../../../assets/logo.png')} style={styles.logo} resizeMode="contain" />
          </View>
          <View>
            <Text style={[styles.appName, { color: textColor }]}>AIDEP</Text>
            <Text style={[styles.appSub, { color: subColor }]}>Acil Müdahale Sistemi</Text>
          </View>
        </View>

        {/* Sağ: Profil butonu */}
        <TouchableOpacity
          onPress={() => navigation.navigate('Profile')}
          activeOpacity={0.7}
          style={[styles.profileBtn, { backgroundColor: btnBg, borderColor: btnBorder }]}
        >
          <Icon name="user" size={17} color={iconColor} strokeWidth={2.5} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: 18, paddingBottom: 4 },
  inner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: 46 },
  left: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoWrap: {
    width: 34, height: 34, borderRadius: 10,
    overflow: 'hidden', borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
  },
  logo: { width: 30, height: 30 },
  appName: { fontSize: 17, fontWeight: '900', letterSpacing: 2 },
  appSub: { fontSize: 9, fontWeight: '600', letterSpacing: 0.5, marginTop: -1 },
  profileBtn: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1.5,
  },
});
