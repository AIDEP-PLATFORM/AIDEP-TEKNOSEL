import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MapScreen from '../../features/map/screens/MapScreen';
import LogoHeader from '../../shared/components/LogoHeader';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerTitle: () => <LogoHeader />,
        headerStyle: {
          backgroundColor: '#ffffff',
        },
        headerShadowVisible: true,
      }}
    >
      <Stack.Screen 
        name="Map" 
        component={MapScreen} 
        options={{
          headerTitle: () => <LogoHeader />,
        }}
      />
    </Stack.Navigator>
  );
};

export default AppNavigator;
