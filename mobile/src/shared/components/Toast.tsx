import React, { useEffect, useRef, useState } from 'react';
import { Animated, Text, StyleSheet, View, Platform, StatusBar } from 'react-native';
import Icon from './Icon';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
}

const STATUSBAR_HEIGHT = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) : 44;

const toastConfig: Record<ToastType, { color: string; bg: string; border: string; icon: 'checkCircle' | 'close' | 'info' | 'alertTriangle' }> = {
  success: { color: '#059669', bg: '#ECFDF5', border: '#6EE7B7', icon: 'checkCircle' },
  error:   { color: '#DC2626', bg: '#FEF2F2', border: '#FCA5A5', icon: 'close'       },
  info:    { color: '#1976D2', bg: '#EFF6FF', border: '#93C5FD', icon: 'info'        },
  warning: { color: '#D97706', bg: '#FFFBEB', border: '#FCD34D', icon: 'alertTriangle'},
};

let _show: ((msg: string, type?: ToastType) => void) | null = null;

export function showToast(message: string, type: ToastType = 'info') {
  _show?.(message, type);
}

function ToastItem({ item, onDone }: { item: ToastItem; onDone: () => void }) {
  const anim = useRef(new Animated.Value(0)).current;
  const cfg = toastConfig[item.type];

  useEffect(() => {
    Animated.sequence([
      Animated.spring(anim, { toValue: 1, useNativeDriver: true, speed: 20, bounciness: 8 }),
      Animated.delay(2800),
      Animated.timing(anim, { toValue: 0, duration: 250, useNativeDriver: true }),
    ]).start(onDone);
  }, []);

  return (
    <Animated.View style={[
      styles.toast,
      { backgroundColor: cfg.bg, borderColor: cfg.border },
      {
        opacity: anim,
        transform: [{
          translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [-20, 0] }),
        }],
      },
    ]}>
      <View style={[styles.iconWrap, { backgroundColor: cfg.color + '20' }]}>
        <Icon name={cfg.icon} size={16} color={cfg.color} strokeWidth={2.5} />
      </View>
      <Text style={[styles.message, { color: cfg.color }]} numberOfLines={2}>{item.message}</Text>
    </Animated.View>
  );
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
    left: 16,
    right: 16,
    zIndex: 9999,
    gap: 8,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 18,
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 10,
  },
  iconWrap: {
    width: 34, height: 34, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  message: {
    flex: 1, fontSize: 14, fontWeight: '700', lineHeight: 20,
  },
});
