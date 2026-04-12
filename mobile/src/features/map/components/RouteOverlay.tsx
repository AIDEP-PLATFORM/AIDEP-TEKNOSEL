import React from 'react';
import { Polyline } from 'react-native-maps';
import type { Route } from '../types';

interface Props {
  route: Route;
}

export default function RouteOverlay({ route }: Props) {
  const coordinates = route.coordinates.map((c) => ({
    latitude: c.lat,
    longitude: c.lng,
  }));

  if (coordinates.length < 2) return null;

  return (
    <>
      {/* Shadow line */}
      <Polyline
        coordinates={coordinates}
        strokeColor="rgba(0,0,0,0.15)"
        strokeWidth={8}
        lineJoin="round"
      />
      {/* Main route line */}
      <Polyline
        coordinates={coordinates}
        strokeColor="#7C3AED"
        strokeWidth={4}
        lineJoin="round"
      />
    </>
  );
}
