import React, { useEffect, useRef, useState } from 'react';
import { Animated, Text, StyleSheet, View, Platform, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from './Icon';

export type ToastType = 'success' | 'error' | 'info' | 'warning' | 'location';

interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
}

const STATUSBAR_HEIGHT = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) : 44;

const toastConfig: Record<ToastType, {
  color: string; bg: string; border: string;
  icon: 'checkCircle' | 'close' | 'info' | 'alertTriangle' | 'mapPin';
  gradient?: [string, string];
}> = {
  success:  { color: '#059669', bg: '#ECFDF5', border: '#6EE7B7',  icon: 'checkCircle'  },
  error:    { color: '#DC2626', bg: '#FEF2F2', border: '#FCA5A5',  icon: 'close'        },
  info:     { color: '#1976D2', bg: '#EFF6FF', border: '#93C5FD',  icon: 'info'         },
  warning:  { color: '#D97706', bg: '#FFFBEB', border: '#FCD34D',  icon: 'alertTriangle'},
  location: { color: '#fff',   bg: 'transparent', border: 'transparent', icon: 'mapPin',
              gradient: ['#0F4C81', '#1565C0'] },
};

let _show: ((msg: string, type?: ToastType) => void) | null = null;

export function showToast(message: string, type: ToastType = 'info') {
  _show?.(message, type);
}

function ToastItem({ item, onDone }: { item: ToastItem; onDone: () => void }) {
  const anim   = useRef(new Animated.Value(0)).current;
  const pulse  = useRef(new Animated.Value(1)).current;
  const cfg    = toastConfig[item.type];
  const isLoc  = item.type === 'location';

  useEffect(() => {
    Animated.sequence([
      Animated.spring(anim, { toValue: 1, useNativeDriver: true, speed: 18, bounciness: 10 }),
      Animated.delay(2600),
      Animated.timing(anim, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start(onDone);

    if (isLoc) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, { toValue: 1.25, duration: 700, useNativeDriver: true }),
          Animated.timing(pulse, { toValue: 1,    duration: 700, useNativeDriver: true }),
        ])
      ).start();
    }
  }, []);

  const inner = (
    <Animated.View style={[
      styles.toast,
      !isLoc && { backgroundColor: cfg.bg, borderColor: cfg.border, borderWidth: 1.5 },
      isLoc  && styles.toastLocation,
      {
        opacity: anim,
        transform: [{
          translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [-24, 0] }),
        }, {
          scale: anim.interpolate({ inputRange: [0, 1], outputRange: [0.92, 1] }),
        }],
      },
    ]}>
      {/* İkon */}
      <View style={[styles.iconWrap, isLoc ? styles.iconWrapLoc : { backgroundColor: cfg.color + '20' }]}>
        {isLoc ? (
          <>
            {/* Pulse halkası */}
            <Animated.View style={[styles.pulseRing, { transform: [{ scale: pulse }], opacity: pulse.interpolate({ inputRange: [1, 1.25], outputRange: [0.6, 0] }) }]} />
            <Icon name="mapPin" size={18} color="#fff" strokeWidth={2.5} />
          </>
        ) : (
          <Icon name={cfg.icon} size={16} color={cfg.color} strokeWidth={2.5} />
        )}
      </View>

      {/* Metin */}
      <View style={{ flex: 1 }}>
        {isLoc && <Text style={styles.locTitle}>📍 Konum Alınıyor</Text>}
        <Text style={[styles.message, { color: isLoc ? '#fff' : cfg.color }]} numberOfLines={2}>
          {item.message}
        </Text>
      </View>

      {/* Sağ dekor */}
      {isLoc && (
        <View style={styles.locBadge}>
          <Text style={styles.locBadgeText}>GPS</Text>
        </View>
      )}
    </Animated.View>
  );

  if (isLoc && cfg.gradient) {
    return (
      <LinearGradient colors={cfg.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
        style={styles.locGradientWrap}>
        {inner}
      </LinearGradient>
    );
  }

  return inner;
}

export default function ToastProvider() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const counter = useRef(0);

  useEffect(() => {
    _show = (message, type = 'info') => {
      const id = ++counter.current;
      setToasts(prev => [...prev.slice(-2), { id, message, type }]);
    };
    return () => { _show = null; };
  }, []);

  const remove = (id: number) => setToasts(prev => prev.filter(t => t.id !== id));

  return (
    <View style={styles.container} pointerEvents="none">
      {toasts.map(t => (
        <ToastItem key={t.id} item={t} onDone={() => remove(t.id)} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: STATUSBAR_HEIGHT + 12,
    left: 16, right: 16,
    zIndex: 9999,
    gap: 8,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 14,
    elevation: 12,
  },
  toastLocation: {
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  locGradientWrap: {
    borderRadius: 20,
    shadowColor: '#1565C0',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 14,
    overflow: 'hidden',
  },
  iconWrap: {
    width: 36, height: 36, borderRadius: 11,
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  iconWrapLoc: {
    width: 40, height: 40, borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.35)',
    alignItems: 'center', justifyContent: 'center',
    position: 'relative',
  },
  pulseRing: {
    position: 'absolute',
    width: 40, height: 40, borderRadius: 20,
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.6)',
  },
  locTitle: {
    fontSize: 11, fontWeight: '800', color: 'rgba(255,255,255,0.75)',
    letterSpacing: 0.5, marginBottom: 2,
  },
  message: {
    flex: 1, fontSize: 14, fontWeight: '700', lineHeight: 20,
  },
  locBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.35)',
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10,
  },
  locBadgeText: {
    fontSize: 11, fontWeight: '900', color: '#fff', letterSpacing: 1,
  },
});
