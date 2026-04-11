import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../../features/auth/screens/LoginScreen';
import RoleSelectScreen from '../../features/auth/screens/RoleSelectScreen';
import RegisterScreen from '../../features/auth/screens/RegisterScreen';
import RegisterStep2Screen from '../../features/auth/screens/RegisterStep2Screen';
import ForgotPasswordScreen from '../../features/auth/screens/ForgotPasswordScreen';

const Stack = createNativeStackNavigator();

const AuthNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="RoleSelect" component={RoleSelectScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="RegisterStep2" component={RegisterStep2Screen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </Stack.Navigator>
  );
};

export default AuthNavigator;
