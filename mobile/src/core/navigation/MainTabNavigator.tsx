import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import HomeScreen from '../../features/home/screens/HomeScreen';
import TeamScreen from '../../features/team/screens/TeamScreen';
import MapScreen from '../../features/map/screens/MapScreen';
import ProfileScreen from '../../features/profile/screens/ProfileScreen';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

export type MainTabParamList = {
  Raporla: undefined;
  Harita: undefined;
  Ekibim: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();
const Stack = createNativeStackNavigator();

// Profile stack — tab dışında ama ulaşılabilir
function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
    </Stack.Navigator>
  );
}

// Orta büyük harita butonu
function MapTabButton({ onPress }: { onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.mapButton} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.mapButtonInner}>
        <Text style={styles.mapButtonIcon}>🗺️</Text>
        <Text style={styles.mapButtonText}>Harita</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: '#38bdf8',
        tabBarInactiveTintColor: '#475569',
        tabBarLabelStyle: styles.tabLabel,
      }}
    >
      <Tab.Screen
        name="Raporla"
        component={HomeStack}
        options={{
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>📋</Text>,
        }}
      />
      <Tab.Screen
        name="Harita"
        component={MapScreen}
        options={{
          tabBarLabel: '',
          tabBarIcon: () => <View />,
          tabBarButton: ({ onPress }) => (
            <MapTabButton onPress={(onPress as () => void) ?? (() => {})} />
          ),
        }}
      />
      <Tab.Screen
        name="Ekibim"
        component={TeamScreen}
        options={{
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>👥</Text>,
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#0f172a',
    borderTopColor: '#1e293b',
    borderTopWidth: 1,
    height: 72,
    paddingBottom: 8,
    paddingTop: 8,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  mapButton: {
    top: -20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapButtonInner: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#38bdf8',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#38bdf8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
  mapButtonIcon: {
    fontSize: 26,
  },
  mapButtonText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0f172a',
    marginTop: 2,
  },
});
