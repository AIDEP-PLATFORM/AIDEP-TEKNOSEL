import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, ActivityIndicator } from 'react-native';
import AppNavigator from './AppNavigator';
import AuthNavigator from './AuthNavigator';
import { useAuthStore } from '../stores/auth.store';
import { authService } from '../../features/auth/services/auth.service';
import colors from '../../shared/theme/colors';

const RootNavigator = () => {
  const { session, setSession } = useAuthStore();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    authService.getSession().then((s) => {
      setSession(s);
      setChecking(false);
    });
  }, []);

  if (checking) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.white }}>
        <ActivityIndicator size="large" color={colors.navy} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        {session ? <AppNavigator /> : <AuthNavigator />}
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

export default RootNavigator;
