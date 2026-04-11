import React from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';

const LogoHeader = () => {
  return (
    <View style={styles.container}>
      <Image
        source={require('../../../assets/logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={styles.title}>AIDEP</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 4,
  },
  logo: {
    width: 32,
    height: 32,
    marginRight: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#003366', // Koyu mavi (tema uyumlu)
    letterSpacing: 0.5,
  },
});

export default LogoHeader;
