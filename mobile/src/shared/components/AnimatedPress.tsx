import React, { useRef } from 'react';
import { Animated, TouchableWithoutFeedback, StyleProp, ViewStyle } from 'react-native';

interface Props {
  children: React.ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  scale?: number;
  activeOpacity?: number;
}

export default function AnimatedPress({ children, onPress, style, scale = 0.95 }: Props) {
  const anim = useRef(new Animated.Value(1)).current;

  const pressIn = () => Animated.spring(anim, { toValue: scale, useNativeDriver: true, speed: 50, bounciness: 4 }).start();
  const pressOut = () => Animated.spring(anim, { toValue: 1, useNativeDriver: true, speed: 30, bounciness: 6 }).start();

  return (
    <TouchableWithoutFeedback onPress={onPress} onPressIn={pressIn} onPressOut={pressOut}>
      <Animated.View style={[style, { transform: [{ scale: anim }] }]}>
        {children}
      </Animated.View>
    </TouchableWithoutFeedback>
  );
}
