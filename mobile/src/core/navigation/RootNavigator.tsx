import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './AppNavigator';
import AuthNavigator from './AuthNavigator';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const RootNavigator = () => {
  // Simüle edilmiş kimlik doğrulama durumu
  // Navigasyon akışını test etmek için false (Auth) olarak başlatıyoruz
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        {isAuthenticated ? <AppNavigator /> : <AuthNavigator />}
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

export default RootNavigator;
