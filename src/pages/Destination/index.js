import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import globalStyles from '../../styles/globalStyles';
import Voice from '@react-native-voice/voice';
import axios from 'axios';
import {MAPS_KEY, AUTOCOMPLETE_API, GEOCODE_API, DIRECTION_API} from '@env';
import {Spacer} from '../../components';
import polyline from '@mapbox/polyline';
import Geolocation from '@react-native-community/geolocation';
import {useNavigation, useRoute} from '@react-navigation/native';
import Tts from 'react-native-tts';
import lodash from 'lodash';
import {useDispatch, useSelector} from 'react-redux';
import {setCoords, setLegs, setPlace} from '../../rdx/features/predictionSlice';

const {width} = Dimensions.get('window');

const Destination = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [loading, setLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const coords = useSelector(state => state.prediction.coords);
  const legs = useSelector(state => state.prediction.legs);
  const dispatch = useDispatch();

  console.log('coorsd', coords);
  console.log('legssdad', legs);

  // const setLegs = usePredictionsStore(state => state.setLegs);
  // const setPlace = usePredictionsStore(state => state.setPlace);

  useEffect(() => {
    console.log('paramsssdd', route.params.result);
    onSearchDestination(route.params.result);

    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, [route.params.result]);

  useEffect(() => {
    Tts.setDefaultLanguage('en-IE');
    if (!loading) {
      Tts.speak(
        'Here are the results for the destination of: ' + route.params.result,
      );
      Tts.speak('Tap once to hear the address suggestion.');
      Tts.speak('Swipe left or right for other address suggestion');
      Tts.speak('Tap and hold to confirm your destination');
    }

    return () => {
      Tts.stop();
    };
  }, [loading, route.params.result]);

  const [predictFrom, setPredictFrom] = useState([]);

  const onSearchDestination = async text => {
    const newText = text.replace(/\s+/g, '%20');
    setLoading(true);
    try {
      const response = await axios.get(
        `${AUTOCOMPLETE_API}?input=${newText}&key=${MAPS_KEY}&components=country:sg&region=sg`,
        // `${AUTOCOMPLETE_API}?input=${newText}&key=${MAPS_KEY}&components=country:id&region=id`,
      );
      console.log('response from', response);
      // setPredictFrom(response.data.predictions);
      if (response.data.predictions.length === 0) {
        _onErrorResult(text);
        setLoading(false);
      } else {
        console.log('cukkkkkkkkkkkk');
        let newArr = [];
        await response.data.predictions.map(async (o, i) => {
          const newDesc = o.description.replace(/\s+/g, '%20');
          try {
            const resPlace = await axios.get(
              `${GEOCODE_API}?address=` +
                newDesc +
                '&key=' +
                MAPS_KEY +
                '&region=sg',
              // '&region=id',
            );
            console.log('resssplaceeee', resPlace);

            const location = resPlace.data.results[0].geometry.location;
            Geolocation.getCurrentPosition(
              async position => {
                const destination = `${location.lat},${location.lng}`;
                try {
                  const direction = await getDirections(
                    `${position.coords.latitude},${position.coords.longitude}`,
                    destination,
                  );
                  console.log('directiawdjanwdkjnawd', direction);
                  // dispatch(setCoords(direction.coords));

                  let item = {
                    place: o.description,
                    nav: direction.legs,
                  };
                  newArr = [...newArr, item];

                  const ascDistance = lodash.orderBy(
                    newArr,
                    x => x.nav.distance.value,
                    'asc',
                  );
                  setPredictFrom(ascDistance);
                  if (i === response.data.predictions.length - 1) {
                    setLoading(false);
                  }
                  setIsError(false);
                } catch (error) {
                  setLoading(false);
                  setIsError(true);
                  // if (i === 0) {
                  //   _onErrorResult(text);
                  // }
                }
              },
              error => {
                // See error code charts below.
                console.log(error.code, error.message);
                setLoading(false);
              },
              {
                // accuracy: {
                //   android: 'high',
                //   ios: 'best',
                // },
                enableHighAccuracy: true,
                timeout: 15000,
                maximumAge: 10000,
              },
            );
          } catch (error) {
            navigation.goBack();
            console.log('error resPLace', error);
          }
        });
      }
    } catch (error) {
      console.log('error', error);
      setLoading(false);
    }
  };

  const _onErrorResult = text => {
    Tts.speak('We dont find any direction to' + text);
    Tts.speak('Tap anywhere and please say your destination clearly');
    setTimeout(() => {
      navigation.goBack();
    }, 5000);
  };

  const getDirections = async (origin, destination) => {
    try {
      let response = await fetch(
        `${DIRECTION_API}?origin=${origin}&destination=${destination}&mode=walking&key=${MAPS_KEY}`,
      );
      let respJson = await response.json();

      const legs = respJson.routes[0].legs[0];
      let points = polyline.decode(respJson.routes[0].overview_polyline.points);

      let coords = points.map((point, index) => {
        return {
          latitude: point[0],
          longitude: point[1],
        };
      });

      // const newCoords = [...coordinates, coords];
      // setCoordinates(newCoords);
      return Promise.resolve({legs, coords});
    } catch (error) {
      // alert('Error: ' + error);
      return Promise.reject(error);
    }
  };

  const onPressAddress = (item, index) => {
    Tts.speak('Option ' + (index + 1) + ', ' + item.place);
    Tts.speak('Destination:' + item.nav.end_address);
    Tts.speak('From your location: ' + item.nav.start_address);
    Tts.speak('Estimated Duration: ' + item.nav.duration.text);
    Tts.speak('Estimated Distance: ' + item.nav.distance.text);
  };

  const _onLongPressItem = item => {
    console.log('item', item);
    dispatch(setLegs(item.nav));
    dispatch(setPlace(item.place));
    // setLegs(item.nav);
    // setPlace(item.place);

    navigation.navigate('ConfirmNav', {data: item});

    // Tts.stop();
  };

  const RenderItem = ({item, index}) => (
    <Pressable
      style={{width: width - 32}}
      onPress={() => onPressAddress(item, index)}
      onLongPress={() => _onLongPressItem(item)}>
      <Text
        // onPress={() => onSelectFrom(item.description)}
        style={styles.predictItemView}>
        {item.place}
      </Text>
      <Text style={styles.predictItemView}>{item.nav.end_address}</Text>
      <Text style={styles.predictItemView}>From your location</Text>
      <Text style={styles.predictItemView}>{item.nav.start_address}</Text>
      <Text style={styles.predictItemView}>
        {item.nav.duration.text} ({item.nav.distance.text})
      </Text>
    </Pressable>
  );

  return (
    <View style={[globalStyles.container, {paddingHorizontal: 15}]}>
      {Platform.OS === 'ios' && (
        <Pressable
          style={{position: 'absolute', top: 70, left: 10}}
          onPress={() => navigation.goBack()}>
          <Text>Go Back</Text>
        </Pressable>
      )}
      <View style={{width: width - 32}}>
        <Text style={styles.subtitle}>
          Here are the results for the destination of
        </Text>
      </View>
      <Spacer height={10} />
      <View>
        <Text style={[styles.subtitle, styles.fontBold]}>
          {route.params.result}
        </Text>
        <Spacer height={20} />
        <View style={{width: width - 32, borderWidth: 1}}>
          {loading && predictFrom.length === 0 && (
            <ActivityIndicator size="large" />
          )}
          {predictFrom.length > 0 && !loading && (
            <FlatList
              // <FlashList
              data={predictFrom}
              keyExtractor={(_, index) => index.toString()}
              pagingEnabled
              horizontal
              // estimatedItemSize={500}
              // renderItem={renderItem}
              renderItem={RenderItem}
              // renderItem={memoizedValue}
            />
          )}
        </View>
        {/* <Text style={{color: 'black'}}>
              34 & 38 Greenwood Ave, Singapore 289236Seafood restaurantFrom your
              current location Watten Residences 32B Watten Rise, Singapore
              287334, Condo complex 6 minutes (450 m) via Watten Rise and
              Greenwood Ave Mostly flat
            </Text> */}
      </View>
      <Spacer height={20} />
      <View style={{width: width - 32}}>
        <Text style={[styles.miniText]}>
          Tap once to hear the address suggestion
        </Text>
        <Text style={[styles.miniText]}>
          Swipe left or right for other address suggestion
        </Text>
        <Text style={[styles.miniText]}>
          Tap and hold to confirm your destination
        </Text>
      </View>
    </View>
  );
};

export default Destination;

const styles = StyleSheet.create({
  text: {
    fontSize: 30,
    color: 'black',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 24,
    color: 'black',
    textAlign: 'left',
  },
  miniText: {
    fontSize: 16,
    textAlign: 'left',
    color: 'black',
  },
  micContainer: {
    padding: 30,
    borderRadius: 100,
    borderWidth: 5,
  },
  predictItemView: {
    padding: 10,
    fontSize: 20,
    // backgroundColor: 'white',
    color: 'black',
  },
  fontBold: {fontWeight: 'bold'},
});
