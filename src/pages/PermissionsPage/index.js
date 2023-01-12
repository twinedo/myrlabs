import {Platform, Pressable, StyleSheet, Text} from 'react-native';
import React, {useEffect} from 'react';
import globalStyles from '../../styles/globalStyles';
import {Spacer} from '../../components';
import {PERMISSIONS, requestMultiple} from 'react-native-permissions';
import {useNavigation} from '@react-navigation/native';

const PermissionsPage = () => {
  const navigation = useNavigation();
  useEffect(() => {
    requestPermissions();
    return () => {};
  }, []);

  const requestPermissions = () => {
    if (Platform.OS === 'android') {
      requestMultiple([
        PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
        PERMISSIONS.ANDROID.ACCESS_COARSE_LOCATION,
        PERMISSIONS.ANDROID.RECORD_AUDIO,
        PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE,
      ]).then(statuses => {
        if (
          statuses[PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION] === 'granted' &&
          statuses[PERMISSIONS.ANDROID.ACCESS_COARSE_LOCATION] === 'granted' &&
          statuses[PERMISSIONS.ANDROID.RECORD_AUDIO] === 'granted' &&
          statuses[PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE] === 'granted'
        ) {
          navigation.navigate('SplashScreen');
        } else {
          navigation.goBack();
        }
      });
    } else {
      requestMultiple([
        PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
        PERMISSIONS.IOS.MICROPHONE,
      ]).then(statuses => {
        if (
          statuses[PERMISSIONS.IOS.LOCATION_WHEN_IN_USE] === 'granted' &&
          statuses[PERMISSIONS.IOS.MICROPHONE] === 'granted'
        ) {
          navigation.navigate('SplashScreen');
        } else {
          navigation.goBack();
        }
      });
    }
  };

  return (
    <Pressable
      style={[globalStyles.container, {paddingHorizontal: 24}]}
      onPress={() => navigation.navigate('SplashScreen')}>
      <Text style={styles.title}>
        Allow MyrLabs to access your location while using the app?
      </Text>
      <Spacer height={20} />
      <Text style={styles.descriptions}>
        Your current location will be displayed on the map and used for
        directions, nearby search results and estimated travel times.{' '}
      </Text>
    </Pressable>
  );
};

export default PermissionsPage;

const styles = StyleSheet.create({
  title: {
    fontSize: 20,
    color: 'black',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 20,
    color: 'black',
  },
  descriptions: {
    color: 'black',
    textAlign: 'center',
  },
});
