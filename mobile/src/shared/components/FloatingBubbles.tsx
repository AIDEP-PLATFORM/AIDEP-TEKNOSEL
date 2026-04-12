import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

const BUBBLES = [
  { size: 280, x: -60,        y: -80,       opacity: 0.10, duration: 8000  },
  { size: 180, x: width-100,  y: 40,        opacity: 0.08, duration: 10000 },
  { size: 120, x: 40,         y: 160,       opacity: 0.06, duration: 7000  },
  { size: 220, x: width-140,  y: height*0.3,opacity: 0.07, duration: 12000 },
  { size: 90,  x: width*0.4,  y: 30,        opacity: 0.05, duration: 9000  },
  { size: 150, x: 20,         y: height*0.4,opacity: 0.06, duration: 11000 },
];

export default function FloatingBubbles({ color = '#fff' }: { color?: string }) {
  const anims = useRef(BUBBLES.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    anims.forEach((anim, i) => {
      const loop = () => {
        Animated.sequence([
          Animated.timing(anim, {
            toValue: 1,
            duration: BUBBLES[i].duration,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: BUBBLES[i].duration,
            useNativeDriver: true,
          }),
        ]).start(loop);
      };
      // Offset starts so they don't all move together
      setTimeout(loop, i * 1200);
    });
  }, []);

  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
      {BUBBLES.map((b, i) => {
        const translateY = anims[i].interpolate({
          inputRange: [0, 1],
          outputRange: [0, -30 - i * 8],
        });
        const scale = anims[i].interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [1, 1.06, 1],
        });
        return (
          <Animated.View
            key={i}
            style={[
              styles.bubble,
              {
                width: b.size, height: b.size, borderRadius: b.size / 2,
                left: b.x, top: b.y,
                opacity: b.opacity,
                backgroundColor: color,
                transform: [{ translateY }, { scale }],
              },
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bubble: { position: 'absolute' },
});
