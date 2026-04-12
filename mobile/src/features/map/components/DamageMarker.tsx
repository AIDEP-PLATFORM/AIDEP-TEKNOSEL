import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Marker, Callout } from 'react-native-maps';
import type { DamageReport } from '../types';

interface Props {
  report: DamageReport;
  onPress?: (report: DamageReport) => void;
}

function pinColor(severity: number | null): string {
  if (severity == null) return '#64748B';
  if (severity >= 7) return '#DC2626';
  if (severity >= 4) return '#D97706';
  return '#059669';
}

export default function DamageMarker({ report, onPress }: Props) {
  if (report.lat == null || report.lng == null) return null;

  const color = pinColor(report.severity);

  return (
    <Marker
      coordinate={{ latitude: report.lat, longitude: report.lng }}
      onPress={() => onPress?.(report)}
      tracksViewChanges={false}
    >
      {/* Custom pin */}
      <View style={[styles.pinOuter, { borderColor: color }]}>
        <View style={[styles.pinInner, { backgroundColor: color }]} />
      </View>

      <Callout tooltip>
        <View style={styles.callout}>
          <View style={[styles.calloutHeader, { backgroundColor: color }]}>
            <Text style={styles.calloutHeaderText}>
              {report.damage_class ?? 'Hasar Raporu'}
            </Text>
          </View>
          <View style={styles.calloutBody}>
            {report.severity != null && (
              <Text style={styles.calloutSeverity}>
                Şiddet: <Text style={{ color }}>{report.severity}/10</Text>
              </Text>
            )}
            <Text style={styles.calloutStatus}>Durum: {report.status}</Text>
            {report.description != null && (
              <Text style={styles.calloutDesc} numberOfLines={2}>
                {report.description}
              </Text>
            )}
            <Text style={styles.calloutDate}>
              {new Date(report.created_at).toLocaleDateString('tr-TR')}
            </Text>
          </View>
        </View>
      </Callout>
    </Marker>
  );
}

const styles = StyleSheet.create({
  pinOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  pinInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },

  callout: {
    width: 200,
    backgroundColor: '#fff',
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  calloutHeader: {
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  calloutHeaderText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#fff',
  },
  calloutBody: {
    padding: 12,
    gap: 4,
  },
  calloutSeverity: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E293B',
  },
  calloutStatus: {
    fontSize: 11,
    color: '#64748B',
  },
  calloutDesc: {
    fontSize: 11,
    color: '#475569',
    lineHeight: 16,
  },
  calloutDate: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 2,
  },
});
