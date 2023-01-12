import {Platform, Pressable, StyleSheet, Text} from 'react-native';
import React, {useCallback, useEffect, useState} from 'react';
import {useNavigation} from '@react-navigation/native';
import globalStyles from '../../styles/globalStyles';
import {checkMultiple, PERMISSIONS} from 'react-native-permissions';
import RNFS from 'react-native-fs';
// import useIOSDirStore from '../../zustand/iosdir';

const SplashScreen = () => {
  const navigation = useNavigation();
  // const setIosDir = useIOSDirStore(state => state.setIosDir);

  const [page, setPage] = useState('');

  useEffect(() => {
    checkPermissions();
  }, []);

  const checkPermissions = () => {
    if (Platform.OS === 'android') {
      checkMultiple([
        PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
        PERMISSIONS.ANDROID.ACCESS_COARSE_LOCATION,
        PERMISSIONS.ANDROID.RECORD_AUDIO,
        PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE,
      ]).then(statuses => {
        console.log(
          'fineloc',
          statuses[PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION],
        );
        console.log(
          'coarse',
          statuses[PERMISSIONS.ANDROID.ACCESS_COARSE_LOCATION],
        );
        console.log('rec audio', statuses[PERMISSIONS.ANDROID.RECORD_AUDIO]);
        console.log(
          'rec write',
          statuses[PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE],
        );
        if (
          statuses[PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION] === 'denied' ||
          statuses[PERMISSIONS.ANDROID.ACCESS_COARSE_LOCATION] === 'denied' ||
          statuses[PERMISSIONS.ANDROID.RECORD_AUDIO] === 'denied' ||
          statuses[PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE] === 'denied'
        ) {
          setPage('PermissionsPage');
          // setTimeout(() => {
          //   navigation.navigate('PermissionsPage');
          // }, 1000);
        } else {
          setPage('AskPlace');
          // setTimeout(() => {
          //   navigation.navigate('AskPlace');
          // }, 1000);
        }
      });
    } else {
      checkMultiple([
        PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
        PERMISSIONS.IOS.MICROPHONE,
      ]).then(statuses => {
        console.log('LOC WHEN', statuses[PERMISSIONS.IOS.LOCATION_WHEN_IN_USE]);
        console.log('mic', statuses[PERMISSIONS.IOS.MICROPHONE]);
        if (
          statuses[PERMISSIONS.IOS.LOCATION_ALWAYS] === 'denied' ||
          statuses[PERMISSIONS.IOS.MICROPHONE] === 'denied'
        ) {
          // setTimeout(() => {
          //   navigation.navigate('PermissionsPage');
          // }, 1000);
        } else {
          setPage('AskPlace');
          // setTimeout(() => {
          //   navigation.navigate('AskPlace');
          // }, 1000);
        }
      });
    }
  };

  const _onCopyFileAndroid = useCallback(() => {
    RNFS.readDirAssets('custom')
      .then(res => {
        res.map(o => {
          RNFS.copyFileAssets(
            o.path,
            '/storage/emulated/0/Android/data/com.myrlabs/audio' + '/' + o.name,
          )
            .then(() => {
              console.log('resCopy successed');
            })
            .catch(errCP => console.log('errCP', errCP));
        });
      })
      .catch(err => console.log(err));
  }, []);

  useEffect(() => {
    if (Platform.OS === 'android') {
      RNFS.readDir(RNFS.ExternalStorageDirectoryPath)
        .then(async () => {
          if (
            await RNFS.exists(
              '/storage/emulated/0/Android/data/com.myrlabs/audio',
            )
          ) {
            RNFS.readDir('/storage/emulated/0/Android/data/com.myrlabs/audio')
              .then(() => {
                _onCopyFileAndroid();
              })
              .catch(errReadDir => {
                console.log('readDir: ', errReadDir);
              });
          } else {
            RNFS.mkdir('/storage/emulated/0/Android/data/com.myrlabs/audio')
              .then(resMkdir => {
                console.log('mkdir', resMkdir);
                _onCopyFileAndroid();
              })
              .catch(errMkdir => {
                console.log('errMkdir', errMkdir);
              });
          }
        })
        .catch(errEXT => console.log('errExt', errEXT));
    }

    if (Platform.OS === 'ios') {
      RNFS.readDir(RNFS.MainBundlePath)
        .then(resBundle => {
          console.log('resBundle', resBundle);
          // const findIdx = resBundle.findIndex(o => o.name === 'assets');

          // setIosDir(resBundle[findIdx].path);
        })
        .catch(errBundle => {
          console.log('errBundle', errBundle);
        });
    }
  }, []);

  return (
    <Pressable
      style={globalStyles.container}
      // onPress={() => navigation.navigate('AskPlace')}
    >
      <Text style={styles.title}>Myrlabs</Text>
    </Pressable>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: 'black',
    letterSpacing: 10,
  },
});
