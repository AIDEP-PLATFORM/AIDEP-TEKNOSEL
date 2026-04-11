import React from 'react';
import Svg, { Path, Circle, Line, G } from 'react-native-svg';

interface IconProps {
  name: keyof typeof icons;
  size?: number;
  color?: string;
  strokeWidth?: number;
}

const icons = {
  chevronLeft: (color: string, sw: number) => (
    <Path d="M15 18l-6-6 6-6" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" />
  ),
  chevronRight: (color: string, sw: number) => (
    <Path d="M9 18l6-6-6-6" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" />
  ),
  close: (color: string, sw: number) => (
    <G>
      <Line x1="18" y1="6" x2="6" y2="18" stroke={color} strokeWidth={sw} strokeLinecap="round" />
      <Line x1="6" y1="6" x2="18" y2="18" stroke={color} strokeWidth={sw} strokeLinecap="round" />
    </G>
  ),
  eye: (color: string, sw: number) => (
    <G>
      <Path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke={color} strokeWidth={sw} strokeLinecap="round" fill="none" />
      <Circle cx="12" cy="12" r="3" stroke={color} strokeWidth={sw} fill="none" />
    </G>
  ),
  eyeOff: (color: string, sw: number) => (
    <G>
      <Path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" stroke={color} strokeWidth={sw} strokeLinecap="round" fill="none" />
      <Path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" stroke={color} strokeWidth={sw} strokeLinecap="round" fill="none" />
      <Line x1="1" y1="1" x2="23" y2="23" stroke={color} strokeWidth={sw} strokeLinecap="round" />
    </G>
  ),
  mail: (color: string, sw: number) => (
    <G>
      <Path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke={color} strokeWidth={sw} fill="none" strokeLinecap="round" />
      <Path d="M22 6l-10 7L2 6" stroke={color} strokeWidth={sw} strokeLinecap="round" />
    </G>
  ),
  lock: (color: string, sw: number) => (
    <G>
      <Path d="M19 11H5a2 2 0 00-2 2v7a2 2 0 002 2h14a2 2 0 002-2v-7a2 2 0 00-2-2z" stroke={color} strokeWidth={sw} fill="none" />
      <Path d="M7 11V7a5 5 0 0110 0v4" stroke={color} strokeWidth={sw} strokeLinecap="round" fill="none" />
    </G>
  ),
  user: (color: string, sw: number) => (
    <G>
      <Path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke={color} strokeWidth={sw} strokeLinecap="round" fill="none" />
      <Circle cx="12" cy="7" r="4" stroke={color} strokeWidth={sw} fill="none" />
    </G>
  ),
  phone: (color: string, sw: number) => (
    <Path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.68A2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" stroke={color} strokeWidth={sw} strokeLinecap="round" fill="none" />
  ),
  mapPin: (color: string, sw: number) => (
    <G>
      <Path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" stroke={color} strokeWidth={sw} fill="none" />
      <Circle cx="12" cy="10" r="3" stroke={color} strokeWidth={sw} fill="none" />
    </G>
  ),
  alertTriangle: (color: string, sw: number) => (
    <G>
      <Path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke={color} strokeWidth={sw} fill="none" strokeLinecap="round" />
      <Line x1="12" y1="9" x2="12" y2="13" stroke={color} strokeWidth={sw} strokeLinecap="round" />
      <Line x1="12" y1="17" x2="12.01" y2="17" stroke={color} strokeWidth={sw} strokeLinecap="round" />
    </G>
  ),
  checkCircle: (color: string, sw: number) => (
    <G>
      <Path d="M22 11.08V12a10 10 0 11-5.93-9.14" stroke={color} strokeWidth={sw} fill="none" strokeLinecap="round" />
      <Path d="M22 4L12 14.01l-3-3" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </G>
  ),
  info: (color: string, sw: number) => (
    <G>
      <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth={sw} fill="none" />
      <Line x1="12" y1="8" x2="12" y2="12" stroke={color} strokeWidth={sw} strokeLinecap="round" />
      <Line x1="12" y1="16" x2="12.01" y2="16" stroke={color} strokeWidth={sw} strokeLinecap="round" />
    </G>
  ),
  shield: (color: string, sw: number) => (
    <Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" fill="none" />
  ),
  camera: (color: string, sw: number) => (
    <G>
      <Path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" stroke={color} strokeWidth={sw} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <Circle cx="12" cy="13" r="4" stroke={color} strokeWidth={sw} fill="none" />
    </G>
  ),
  image: (color: string, sw: number) => (
    <G>
      <Path d="M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2z" stroke={color} strokeWidth={sw} fill="none" strokeLinecap="round" />
      <Circle cx="8.5" cy="8.5" r="1.5" stroke={color} strokeWidth={sw} fill="none" />
      <Path d="M21 15l-5-5L5 21" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </G>
  ),
  users: (color: string, sw: number) => (
    <G>
      <Path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke={color} strokeWidth={sw} strokeLinecap="round" fill="none" />
      <Circle cx="9" cy="7" r="4" stroke={color} strokeWidth={sw} fill="none" />
      <Path d="M23 21v-2a4 4 0 00-3-3.87" stroke={color} strokeWidth={sw} strokeLinecap="round" fill="none" />
      <Path d="M16 3.13a4 4 0 010 7.75" stroke={color} strokeWidth={sw} strokeLinecap="round" fill="none" />
    </G>
  ),
};

const Icon = ({ name, size = 24, color = '#0A2540', strokeWidth = 2 }: IconProps) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {icons[name](color, strokeWidth)}
    </Svg>
  );
};

export default Icon;
