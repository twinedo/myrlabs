import {
  Pressable,
  StyleSheet,
  Text,
  View,
  NativeModules,
  Platform,
} from 'react-native';
import React, {useEffect} from 'react';
import {useNavigation, useRoute} from '@react-navigation/native';
import {Spacer} from '../../components';
import Tts from 'react-native-tts';
import {DIRECTION_API, MAPS_KEY} from '@env';
// import usePredictionsStore from '../../zustand/legs';
// import useCurrentPosStore from '../../zustand/currentPos';
import Permissions from '../../services/utils/Permissions';
import Geolocation from '@react-native-community/geolocation';
import RNFS from 'react-native-fs';
// import useIOSDirStore from '../../zustand/iosdir';
import {SafeAreaView} from 'react-native-safe-area-context';
import globalStyles from '../../styles/globalStyles';
import {useDispatch, useSelector} from 'react-redux';
import {setCurrentPos} from '../../rdx/features/currentPosSlice';
import polyline from '@mapbox/polyline';
import {getDirect} from '../../services/fun';
import {setCoords, setLegs} from '../../rdx/features/predictionSlice';
const {BridgeModule} = NativeModules;

const ConfirmNav = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const {data} = route.params;
  const coords = useSelector(state => state.prediction.coords);
  const iosdir = useSelector(state => state.iosdir.iosdir);
  const dispatch = useDispatch();

  const getDirection = async (a, b) => {
    const {legs, newCoords} = await getDirect(a, b);
    dispatch(setLegs(legs));
    dispatch(setCoords(newCoords));
  };

  useEffect(() => {
    if (Platform.OS === 'android') {
      RNFS.exists('/storage/emulated/0/Android/data/com.myrlabs/audio').then(
        () => {
          BridgeModule.setFilePath(
            '/storage/emulated/0/Android/data/com.myrlabs/audio' +
              '/heading_forward.wav',
          );
        },
      );
    }

    if (Platform.OS === 'ios') {
      RNFS.readDir(iosdir).then(res => {
        const findIdx = res.findIndex(o => o.name === 'heading_forward.wav');
        BridgeModule.setFilePath(res[findIdx].path);
      });
    }

    Geolocation.getCurrentPosition(
      async position => {
        const destination = `${data.nav.end_location.lat},${data.nav.end_location.lng}`;
        getDirection(
          `${position.coords.latitude}, ${position.coords.longitude}`,
          destination,
        );
        // console.log('direct', direct);

        dispatch(
          setCurrentPos({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          }),
        );
      },
      error => {
        // See error code charts below.
        console.log(error.code, error.message);
        Permissions();
      },
      {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
    );
  }, []);

  useEffect(() => {
    Tts.setDefaultLanguage('en-IE');
    Tts.getInitStatus().then(() => {
      _confirmInstructtion();
    });
    return () => {
      Tts.stop();
    };
  }, []);

  const _confirmInstructtion = () => {
    Tts.speak('Good, Everything is Set');
    Tts.speak('Your current location');
    Tts.speak(data?.nav?.start_address);
    Tts.speak('Your destination location');
    Tts.speak(data?.nav?.end_address);
    Tts.speak(`Distance ${data?.nav?.distance?.text}, travel time
      ${data?.nav?.duration?.text}`);
    Tts.speak('Tap and hold anywhere to start');
  };

  const _onLongPressConfirmation = () => {
    if (coords.length > 1) {
      navigation.navigate('FinalNavigation', {
        // navigation.navigate('NavWithLib', {
        origin: {
          latitude: data?.nav?.start_location?.lat,
          longitude: data?.nav?.start_location?.lng,
        },
        destination: {
          latitude: data?.nav?.end_location.lat,
          longitude: data?.nav?.end_location.lng,
        },
      });
      Tts.stop();
    }
  };

  return (
    <SafeAreaView style={globalStyles.displayFlex}>
      <Pressable
        style={styles.container}
        onPress={_confirmInstructtion}
        onLongPress={_onLongPressConfirmation}>
        <View>
          <Text style={styles.subtitle}>Good, Everything is Set</Text>
          <Spacer height={20} />
          <Text style={styles.subtitle}>Your current location</Text>
          <Text style={styles.subtitle}>{data?.nav?.start_address}</Text>
          <Spacer height={20} />
          <Text style={styles.subtitle}>Your destination location</Text>
          <Text style={styles.subtitle}>{data?.nav?.end_address}</Text>
          <Spacer height={20} />
          <Text style={styles.subtitle}>
            Distance {data?.nav?.distance?.text}, travel time{' '}
            {data?.nav?.duration?.text}
          </Text>
          <Spacer height={20} />
          <Text style={styles.subtitle}>Tap and hold anywhere to start</Text>
        </View>
      </Pressable>
    </SafeAreaView>
  );
};

export default ConfirmNav;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  subtitle: {
    fontSize: 24,
    color: 'black',
    textAlign: 'left',
  },
});
