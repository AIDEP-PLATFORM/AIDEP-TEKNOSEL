import React, { useRef } from 'react';
import { View, TouchableOpacity, StyleSheet, Text, Animated } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MapScreen from '../../features/map/screens/MapScreen';
import ReportScreen from '../../features/report/screens/ReportScreen';
import TasksScreen from '../../features/tasks/screens/TasksScreen';
import ProfileScreen from '../../features/profile/screens/ProfileScreen';
import Icon from '../../shared/components/Icon';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// ─── Custom Floating Tab Bar ──────────────────────────────────────────────────

const TAB_CONFIG = [
  { name: 'Raporla', icon: 'alertTriangle' as const, label: 'Raporla', color: '#EF4444' },
  { name: 'Harita',  icon: 'mapPin'        as const, label: 'Harita',  color: '#1976D2' },
  { name: 'Ekibim',  icon: 'users'         as const, label: 'Ekibim',  color: '#059669' },
];

function TabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const anims = useRef(TAB_CONFIG.map((_, i) => new Animated.Value(i === 0 ? 1 : 0))).current;

  const handlePress = (index: number, routeName: string) => {
    // Animate all tabs
    anims.forEach((anim, i) => {
      Animated.spring(anim, {
        toValue: i === index ? 1 : 0,
        useNativeDriver: true,
        speed: 30,
        bounciness: 8,
      }).start();
    });
    navigation.navigate(routeName);
  };

  return (
    <View style={[tabBar.outer, { paddingBottom: insets.bottom + 8 }]}>
      <View style={tabBar.container}>
        {TAB_CONFIG.map((tab, index) => {
          const focused = state.index === index;
          const scale = anims[index].interpolate({ inputRange: [0, 1], outputRange: [1, 1.08] });
          const iconY  = anims[index].interpolate({ inputRange: [0, 1], outputRange: [0, -2] });

          return (
            <TouchableOpacity
              key={tab.name}
              onPress={() => handlePress(index, tab.name)}
              activeOpacity={0.8}
              style={tabBar.tab}
            >
              <Animated.View style={[tabBar.tabInner, { transform: [{ scale }, { translateY: iconY }] }]}>
                {focused && (
                  <Animated.View style={[tabBar.activePill, { backgroundColor: tab.color + '18' }]} />
                )}
                <Icon
                  name={tab.icon}
                  size={focused ? 22 : 20}
                  color={focused ? tab.color : '#94A3B8'}
                  strokeWidth={focused ? 2.5 : 1.8}
                />
                <Text style={[tabBar.label, { color: focused ? tab.color : '#94A3B8', fontWeight: focused ? '800' : '500' }]}>
                  {tab.label}
                </Text>
              </Animated.View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const tabBar = StyleSheet.create({
  outer: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    paddingHorizontal: 20,
    backgroundColor: 'transparent',
  },
  container: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 28,
    paddingVertical: 10,
    paddingHorizontal: 8,
    shadowColor: '#1565C0',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 20,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.04)',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabInner: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
    position: 'relative',
  },
  activePill: {
    position: 'absolute',
    top: 0, bottom: 0, left: 0, right: 0,
    borderRadius: 20,
  },
  label: {
    fontSize: 10,
    marginTop: 3,
    letterSpacing: 0.3,
  },
});

// ─── Tab Navigator ────────────────────────────────────────────────────────────

const TabNavigator = () => (
  <Tab.Navigator
    tabBar={(props) => <TabBar {...props} />}
    screenOptions={{ headerShown: false }}
  >
    <Tab.Screen name="Raporla" component={ReportScreen} />
    <Tab.Screen name="Harita"  component={MapScreen}    />
    <Tab.Screen name="Ekibim"  component={TasksScreen}  />
  </Tab.Navigator>
);

// ─── Root Navigator ───────────────────────────────────────────────────────────

const AppNavigator = () => (
  <Stack.Navigator>
    <Stack.Screen name="Main" component={TabNavigator} options={{ headerShown: false }} />
    <Stack.Screen
      name="Profile"
      component={ProfileScreen}
      options={{ headerShown: false }}
    />
  </Stack.Navigator>
);

export default AppNavigator;
