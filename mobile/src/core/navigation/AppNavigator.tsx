import React from 'react';
import { View, TouchableOpacity, StyleSheet, Image, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import MapScreen from '../../features/map/screens/MapScreen';
import ReportScreen from '../../features/report/screens/ReportScreen';
import TasksScreen from '../../features/tasks/screens/TasksScreen';
import ProfileScreen from '../../features/profile/screens/ProfileScreen';
import Icon from '../../shared/components/Icon';
import colors from '../../shared/theme/colors';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const HeaderBackground = () => (
  <LinearGradient
    colors={['#1565C0', '#1976D2', '#42A5F5']}
    start={{ x: 0, y: 0 }}
    end={{ x: 0, y: 1 }}
    style={StyleSheet.absoluteFillObject}
  />
);

const HeaderTitle = () => {
  const navigation = useNavigation<any>();
  return (
    <View style={header.wrap}>
      <View style={header.logoRow}>
        <View style={header.logoWrap}>
          <Image source={require('../../../assets/logo.png')} style={header.logo} resizeMode="contain" />
        </View>
        <Text style={header.logoText}>AIDEP</Text>
      </View>
      <TouchableOpacity onPress={() => navigation.navigate('Profile')} activeOpacity={0.7}>
        <View style={header.profileIconWrap}>
          <Icon name="user" size={18} color="#fff" strokeWidth={2.5} />
        </View>
      </TouchableOpacity>
    </View>
  );
};

const header = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 6,
    backgroundColor: 'transparent',
  },
  logoRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 8,
    backgroundColor: 'transparent',
  },
  logoWrap: {
    width: 36, height: 36, borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  logo: { width: 36, height: 36 },
  logoText: { fontSize: 20, fontWeight: '900', color: '#fff', letterSpacing: 2 },
  profileIconWrap: {
    width: 38, height: 38, borderRadius: 19,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.5)',
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
});

const TabNavigator = () => (
  <Tab.Navigator
    screenOptions={{
      headerBackground: () => <HeaderBackground />,
      headerTitle: () => <HeaderTitle />,
      headerTitleContainerStyle: { left: 0, right: 0 },
      headerTitleAlign: 'left',
      headerStyle: { 
        backgroundColor: 'transparent',
        elevation: 0, 
        shadowOpacity: 0, 
        height: 70 
      },
      headerShadowVisible: false,
      tabBarStyle: {
        backgroundColor: colors.white,
        borderTopWidth: 0,
        height: 70,
        paddingBottom: 12,
        paddingTop: 8,
        position: 'absolute',
        bottom: 0, left: 0, right: 0,
        elevation: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.06,
        shadowRadius: 10,
      },
      tabBarActiveTintColor: '#1976D2',
      tabBarInactiveTintColor: colors.textMuted,
      tabBarLabelStyle: { fontSize: 11, fontWeight: '700', marginTop: 2 },
    }}
  >
    <Tab.Screen
      name="Raporla"
      component={ReportScreen}
      options={{
        tabBarIcon: ({ focused }) => (
          <View style={[tabStyles.iconWrap, focused && tabStyles.activeIconWrap]}>
            <Icon name="alertTriangle" size={focused ? 22 : 20} color={focused ? '#1976D2' : colors.textMuted} strokeWidth={focused ? 2.5 : 2} />
          </View>
        ),
      }}
    />
    <Tab.Screen
      name="Harita"
      component={MapScreen}
      options={{
        tabBarIcon: ({ focused }) => (
          <View style={[tabStyles.iconWrap, focused && tabStyles.activeIconWrap]}>
            <Icon name="mapPin" size={focused ? 22 : 20} color={focused ? '#1976D2' : colors.textMuted} strokeWidth={focused ? 2.5 : 2} />
          </View>
        ),
      }}
    />
    <Tab.Screen
      name="Ekibim"
      component={TasksScreen}
      options={{
        tabBarIcon: ({ focused }) => (
          <View style={[tabStyles.iconWrap, focused && tabStyles.activeIconWrap]}>
            <Icon name="users" size={focused ? 22 : 20} color={focused ? '#1976D2' : colors.textMuted} strokeWidth={focused ? 2.5 : 2} />
          </View>
        ),
      }}
    />
  </Tab.Navigator>
);

const tabStyles = StyleSheet.create({
  iconWrap: {
    width: 40, height: 40,
    alignItems: 'center', justifyContent: 'center',
    borderRadius: 20,
  },
  activeIconWrap: { backgroundColor: '#EBF8FF' },
});

const AppNavigator = () => (
  <Stack.Navigator>
    <Stack.Screen name="Main" component={TabNavigator} options={{ headerShown: false }} />
    <Stack.Screen
      name="Profile"
      component={ProfileScreen}
      options={{
        headerTitle: 'Profilim',
        headerBackground: () => <HeaderBackground />,
        headerTitleStyle: { fontWeight: '800', fontSize: 18, color: '#fff' },
        headerTintColor: '#fff',
        headerShadowVisible: false,
      }}
    />
  </Stack.Navigator>
);

export default AppNavigator;
