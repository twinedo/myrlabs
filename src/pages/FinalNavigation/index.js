import {
  Alert,
  Button,
  Dimensions,
  NativeModules,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import {
  Animated,
  AnimatedRegion,
  Marker,
  Polyline,
  PROVIDER_GOOGLE,
} from 'react-native-maps';
import {useNavigation, useRoute} from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Entypo from 'react-native-vector-icons/Entypo';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {findNearest, getDistance, isPointWithinRadius} from 'geolib';
import Geolocation from '@react-native-community/geolocation';
import Permissions from '../../services/utils/Permissions';
import {
  _direction,
  _onGetDistanceCurrentToNextStep,
  getDirect,
} from '../../services/fun';
import RenderHTML from 'react-native-render-html';
import Tts from 'react-native-tts';
import RNFS from 'react-native-fs';
import {Spacer} from '../../components';
import CompassHeading from 'react-native-compass-heading';
import {SafeAreaView} from 'react-native-safe-area-context';
import globalStyles from '../../styles/globalStyles';
import crashlytics from '@react-native-firebase/crashlytics';
import {useDispatch, useSelector} from 'react-redux';
import {setBearing, setCompassDir} from '../../rdx/features/rhumbSlice';
import {setCurrentPos} from '../../rdx/features/currentPosSlice';
import {setCoords, setLegs, setSteps} from '../../rdx/features/predictionSlice';
const {BridgeModule} = NativeModules;

const {width} = Dimensions.get('window');

const LATITUDE_DELTA = 0.05;
const LONGITUDE_DELTA = 0.05;

const FinalNavigation = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  let mapsRef = useRef(null);
  let animMarkerDirRef = useRef(null);
  let animMarkerRef = useRef(null);

  const coords = useSelector(state => state.prediction.coords);
  const legs = useSelector(state => state.prediction.legs);
  const currentPos = useSelector(state => state.currentPos);
  const iosdir = useSelector(state => state.iosdir.iosdir);
  const rhumb = useSelector(state => state.rhumb.rhumb);

  // console.log('legs.s', legs);
  // console.log('coords.s', coords);
  // console.log('currentPosste', currentPos);

  const [stateDegree, setStateDegree] = useState(0);

  const [stepsArray, setStepsArray] = useState(legs.steps);

  const [getCurrentBtn, setGetCurrentBtn] = useState(false);

  const [updateDirectBtn, setUpdateDirectBtn] = useState(false);

  const [audioCueBtn, setAudioCueBtn] = useState(false);

  const [coordAnimMarker, setCoordAnimMarker] = useState(
    new AnimatedRegion({
      latitude: coords[0].latitude,
      longitude: coords[0].longitude,
      latitudeDelta: 0.012,
      longitudeDelta: 0.012,
    }),
  );

  let degreeRef = useRef(0);

  useEffect(() => {
    const destination = `${route.params.destination.latitude},${route.params.destination.longitude}`;

    getDirect(
      `${route.params.origin.latitude},${route.params.origin.longitude}`,
      destination,
    ).then(res => {
      dispatch(setLegs(res.legs));
      dispatch(setCoords(res.newCoords));
    });

    _getCurrentLoc();
  }, []);

  let play_directional_audio_flag = useRef(false);

  useEffect(() => {
    console.log('testt');
    Geolocation.getCurrentPosition(
      async position => {
        dispatch(
          setCurrentPos({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          }),
        );
        dispatch(
          setBearing(
            position.coords.latitude,
            position.coords.longitude,
            coords[1].latitude,
            coords[1].longitude,
          ),
        );
        dispatch(
          setCompassDir(
            position.coords.latitude,
            position.coords.longitude,
            coords[1].latitude,
            coords[1].longitude,
          ),
        );
        mapsRef?.current?.animateCamera(
          {
            center: {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            },
            zoom: 21,
            // heading: position.coords.heading - cam.heading,
            heading: rhumb,
          },
          5000,
        );

        const newCoordinate = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          latitudeDelta: 0.012,
          longitudeDelta: 0.012,
        };
        coordAnimMarker.timing(newCoordinate).start();
        setCoordAnimMarker(new AnimatedRegion(newCoordinate));
        if (Platform.OS === 'android') {
          // if (animMarkerDirRef.current) {
          animMarkerDirRef.current.animateMarkerToCoordinate(
            newCoordinate,
            8000,
          ); //  number of duration between points
          // if (animMarkerRef.current) {
          animMarkerRef.current.animateMarkerToCoordinate(newCoordinate, 8000); //  number of duration between points
          // }
        } else {
          coordAnimMarker.timing(newCoordinate).start();
        }
      },
      error => {
        console.log(error.code, error.message);
        Permissions();
      },
      {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
    );
  }, []);

  // Compass Heading function
  useEffect(() => {
    const degree_update_rate = 3;
    CompassHeading.start(degree_update_rate, ({heading}) => {
      if (heading === degreeRef.current) {
        play_directional_audio_flag.current = false;
      } else {
        play_directional_audio_flag.current = true;
      }

      setStateDegree(heading);
      degreeRef.current = heading;
    });

    return () => CompassHeading.stop();
  }, []);

  const _checkTable = heading => {
    //forward
    if (heading >= 337.5 || heading < 22.5) {
      BridgeModule.changePosition(0, 1, 0);
    }

    //forward right
    else if (heading >= 22.5 && heading < 67.5) {
      // BridgeModule.changePosition(-1, 1, 0);
      BridgeModule.changePosition(1, 1, 0);
    }

    //right
    else if (heading >= 67.5 && heading < 112.5) {
      // BridgeModule.changePosition(-1, 0, 0);
      BridgeModule.changePosition(1, 0, 0);
    }

    //backward right
    else if (heading >= 112.5 && heading < 157.5) {
      // BridgeModule.changePosition(-1, -1, 0);
      BridgeModule.changePosition(1, -1, 0);
    }

    //backward
    else if (heading >= 157.5 && heading < 202.5) {
      BridgeModule.changePosition(0, -1, 0);
      // BridgeModule.changePosition(0, -1, 0);
    }

    //backward left
    else if (heading >= 202.5 && heading < 247.5) {
      // BridgeModule.changePosition(1, -1, 0);
      BridgeModule.changePosition(-1, -1, 0);
    }

    //left
    else if (heading >= 247.5 && heading < 292.5) {
      // BridgeModule.changePosition(1, 0, 0);
      BridgeModule.changePosition(-1, 0, 0);
    }

    //forward left
    else if (heading >= 292.5 && heading < 337.5) {
      // BridgeModule.changePosition(1, 1, 0);
      BridgeModule.changePosition(-1, 1, 0);
    }
  };

  const _updateDirection = () => {
    crashlytics().log('update direction...');
    setGetCurrentBtn(true);
    setAudioCueBtn(true);
    setUpdateDirectBtn(true);
    Geolocation.getCurrentPosition(
      async position => {
        dispatch(
          setBearing(
            position.coords.latitude,
            position.coords.longitude,
            coords[0].latitude,
            coords[0].longitude,
          ),
        );
        dispatch(
          setCompassDir(
            position.coords.latitude,
            position.coords.longitude,
            coords[0].latitude,
            coords[0].longitude,
          ),
        );
        mapsRef?.current?.animateCamera(
          {
            center: {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            },
            zoom: 21,
            // heading: position.coords.heading - cam.heading,
            heading: rhumb,
          },
          5000,
        );

        dispatch(
          setCurrentPos({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          }),
        );

        const destination = `${route.params.destination.latitude},${route.params.destination.longitude}`;

        getDirect(
          `${position.coords.latitude},${position.coords.longitude}`,
          destination,
        ).then(res => {
          dispatch(setLegs(res.legs));
          dispatch(setCoords(res.newCoords));
        });

        setGetCurrentBtn(false);
        setAudioCueBtn(false);
        setUpdateDirectBtn(false);
      },
      error => {
        console.log(error.code, error.message);
        Permissions();
      },
      {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
    );
  };

  const [distanceToCheck, setDistanceToCheck] = useState(0);

  let play_nearby = useRef(false);
  let play_google_audio = useRef(true);

  //watch position useeffect
  useEffect(() => {
    const watchId = Geolocation.watchPosition(
      async position => {
        dispatch(
          setCurrentPos({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          }),
        );

        dispatch(
          setBearing(
            position.coords.latitude,
            position.coords.longitude,
            coords[1].latitude,
            coords[1].longitude,
          ),
        );
        dispatch(
          setCompassDir(
            position.coords.latitude,
            position.coords.longitude,
            coords[1].latitude,
            coords[1].longitude,
          ),
        );
        mapsRef?.current?.animateCamera({
          center: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          },
          zoom: 19,
          // heading: position.coords.heading - cam.heading,
          heading: rhumb,
        });
        const distanceToCoords = _onGetDistanceCurrentToNextStep(
          position.coords.latitude,
          position.coords.longitude,
          coords[0].latitude,
          coords[0].longitude,
        );

        const nearestLatLong = findNearest(
          {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          },
          coords,
        );

        const findIdx = coords.findIndex(
          o => o.latitude === nearestLatLong.latitude,
        );

        const isRadiusCoords = isPointWithinRadius(
          {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          },
          {
            latitude: coords[findIdx].latitude,
            longitude: coords[findIdx].longitude,
          },
          20,
        );
        const distanceToCheckPoint = getDistance(position.coords, {
          latitude: legs.steps[0].end_location.lat,
          longitude: legs.steps[0].end_location.lng,
        });
        console.log('distanceToCheckPoint', distanceToCheckPoint);

        setDistanceToCheck(distanceToCheckPoint);

        if (isRadiusCoords || distanceToCoords <= 10) {
          // let newC = [...coords];
          const filterNewC = coords.filter((_, i) => i > findIdx);
          dispatch(setCoords(filterNewC));
        }

        let arrLegsSteps = [];
        legs?.steps.map(o => {
          let item = {
            latitude: o.end_location.lat,
            longitude: o.end_location.lng,
          };
          arrLegsSteps.push(item);
        });

        const nearestLatLongCheckPoint = findNearest(
          {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          },
          arrLegsSteps,
        );

        const findIdxCheck = arrLegsSteps.findIndex(
          o => o.latitude === nearestLatLongCheckPoint.latitude,
        );

        const isRadiusToCheckpoint = isPointWithinRadius(
          position.coords,
          {
            latitude: legs.steps[findIdxCheck].end_location.lat,
            longitude: legs.steps[findIdxCheck].end_location.lng,
          },
          20,
        );

        if (isRadiusToCheckpoint || distanceToCheckPoint <= 15) {
          // const newAr = [...stepsArray];
          const filterSteps = legs.steps.filter((_, i) => i > findIdxCheck);
          dispatch(setSteps(filterSteps));
          setStepsArray(filterSteps);
          if (legs.steps.length !== filterSteps.length) {
            play_nearby.current = true;
          }
        }

        if (!isRadiusCoords && distanceToCoords > 200) {
          const destination = `${route.params.destination.latitude},${route.params.destination.longitude}`;

          getDirect(
            `${position.coords.latitude},${position.coords.longitude}`,
            destination,
          ).then(res => {
            dispatch(setLegs(res.legs));
            dispatch(setCoords(res.newCoords));
          });
        }

        const radiusFinish = isPointWithinRadius(
          position.coords,
          {
            latitude: route.params.destination.latitude,
            longitude: route.params.destination.longitude,
          },
          50,
        );
        if (radiusFinish) {
          // alert('radiusFinish');
          Tts.stop();
          play_google_audio.current = false;
          play_nearby.current = false;
          play_directional_audio_flag.current = false;
          navigation.reset({
            index: 0,
            routes: [{name: 'ArrivalPlace'}],
          });
        }

        const newCoordinate = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          latitudeDelta: 0.012,
          longitudeDelta: 0.012,
        };
        coordAnimMarker.timing(newCoordinate).start();
        setCoordAnimMarker(new AnimatedRegion(newCoordinate));
        if (Platform.OS === 'android') {
          if (animMarkerDirRef.current) {
            animMarkerDirRef.current.animateMarkerToCoordinate(
              newCoordinate,
              5000,
            ); //  number of duration between points
            if (animMarkerRef.current) {
              animMarkerRef.current.animateMarkerToCoordinate(
                newCoordinate,
                5000,
              ); //  number of duration between points
            }
          }
        } else {
          coordAnimMarker.timing(newCoordinate).start();
        }
      },
      err => {
        if (err.message.includes('not granted')) {
          Alert.alert(
            'Warning', // alert title
            'Please grant location access', //alert desc
            [
              {
                text: 'Cancel',
                style: 'cancel',
              },
              {
                text: 'OK',
                onPress: () => Permissions(),
              },
            ],
          );
        }
      },
      {
        interval: 2500,
        fastestInterval: 1500,
        timeout: 5000,
        enableHighAccuracy: true,
        distanceFilter: 2,
        useSignificantChanges: true,
      },
    );
    return () => Geolocation.clearWatch(watchId);
  }, []);

  // timer 90
  useEffect(() => {
    // let timer;
    const timer90 = setInterval(() => {
      if (play_google_audio.current) {
        play_google_audio.current = false;
        const distanceToCheckPoint = getDistance(
          {
            latitude: currentPos.latitude,
            longitude: currentPos.longitude,
          },
          {
            latitude: legs?.steps[0].end_location.lat,
            longitude: legs?.steps[0].end_location.lng,
          },
        );
        Tts.speak('in ' + legs?.steps[0]?.duration.text);
        Tts.speak(legs?.steps[0]?.html_instructions.replace(/<[^>]+>/g, ''));
        Tts.speak('about ' + legs?.steps[0]?.distance?.text);
        play_google_audio.current = true;
      }
    }, 90000);

    return () => clearInterval(timer90);
  }, []);

  // const [countGoogleInstructions, setCountGoogleInstruction] = useState(0);
  useEffect(() => {
    const checkNextPoint = setInterval(async () => {
      const distanceToCheckPoint = getDistance(
        {
          latitude: currentPos.latitude,
          longitude: currentPos.longitude,
        },
        {
          latitude: legs?.steps[0].end_location.lat,
          longitude: legs?.steps[0].end_location.lng,
        },
      );
      if (distanceToCheckPoint <= 20) {
        if (play_nearby.current) {
          // _googleInstructions();
          Tts.speak('about ' + distanceToCheckPoint + ' meters');
          Tts.speak(legs?.steps[0]?.html_instructions.replace(/<[^>]+>/g, ''));
          play_nearby.current = false;
        }
      }
    }, 3000);
    return () => {
      clearInterval(checkNextPoint);
      // setCountGoogleInstruction(0);
    };
  }, []);

  const _getCurrentLoc = () => {
    // crashlytics.log('get current loc...');
    crashlytics().log('get current loc...');
    setGetCurrentBtn(true);
    setUpdateDirectBtn(true);
    setAudioCueBtn(true);
    setTimeout(() => {
      Geolocation.getCurrentPosition(
        async position => {
          dispatch(
            setCurrentPos({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            }),
          );
          dispatch(
            setBearing(
              position.coords.latitude,
              position.coords.longitude,
              coords[1].latitude,
              coords[1].longitude,
            ),
          );
          dispatch(
            setCompassDir(
              position.coords.latitude,
              position.coords.longitude,
              coords[1].latitude,
              coords[1].longitude,
            ),
          );
          mapsRef?.current?.animateCamera(
            {
              center: {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
              },
              zoom: 21,
              // heading: position.coords.heading - cam.heading,
              heading: rhumb,
            },
            5000,
          );

          setUpdateDirectBtn(false);
          setAudioCueBtn(false);
          setGetCurrentBtn(false);

          const newCoordinate = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            latitudeDelta: 0.012,
            longitudeDelta: 0.012,
          };
          coordAnimMarker.timing(newCoordinate).start();
          setCoordAnimMarker(new AnimatedRegion(newCoordinate));
          if (Platform.OS === 'android') {
            // if (animMarkerDirRef.current) {
            animMarkerDirRef.current.animateMarkerToCoordinate(
              newCoordinate,
              8000,
            ); //  number of duration between points
            // if (animMarkerRef.current) {
            animMarkerRef.current.animateMarkerToCoordinate(
              newCoordinate,
              8000,
            ); //  number of duration between points
            // }
          } else {
            coordAnimMarker.timing(newCoordinate).start();
          }
        },
        error => {
          console.log(error.code, error.message);
          Permissions();
          setUpdateDirectBtn(false);
          setAudioCueBtn(false);
          setGetCurrentBtn(false);
        },
        {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
      );
    }, 1000);
  };

  const _googleInstructions = () => {
    crashlytics().log('play google instruction...');
    const distanceToCheckPoint = getDistance(
      {
        latitude: currentPos.latitude,
        longitude: currentPos.longitude,
      },
      {
        latitude: legs?.steps[0].end_location.lat,
        longitude: legs?.steps[0].end_location.lng,
      },
    );
    Tts.speak('in ' + legs?.steps[0]?.duration.text);
    Tts.speak(legs?.steps[0]?.html_instructions.replace(/<[^>]+>/g, ''));
    Tts.speak('about ' + distanceToCheckPoint + ' meters');
  };

  // const _setBridge = async path => {
  //   // crashlytics.log('set file path & play audio...');
  //   crashlytics().log('set file path & play audio...');
  //   await BridgeModule.setFilePath(path);
  //   await BridgeModule.playAudio();
  // };

  const _onTapAnywhere = () => _onCheckUserHeading();

  const _onCheckUserHeading = () => {
    crashlytics().log('on check user heading...');
    setGetCurrentBtn(true);
    setUpdateDirectBtn(true);
    setAudioCueBtn(true);
    if (play_directional_audio_flag.current) {
      // const newHead = await useHeadingDegreeStore.getState().headingDegree;
      // const C = 360 - stateDegree;
      const C = 360 - degreeRef.current;
      const D = Math.round(rhumb) + C;
      let deg;
      if (D > 360) {
        deg = D - 360;
      } else {
        deg = D;
      }

      if (Platform.OS === 'android') {
        // if (
        //   await RNFS.exists('/storage/emulated/0/Android/data/com.myrlabs/audio')
        // ) {

        if (deg >= 337.5 || deg < 22.5) {
          BridgeModule.setFilePath(
            '/storage/emulated/0/Android/data/com.myrlabs/audio/heading_forward.wav',
          );
        } else if (deg >= 22.5 && deg < 67.5) {
          BridgeModule.setFilePath(
            '/storage/emulated/0/Android/data/com.myrlabs/audio/heading_forward_right.wav',
          );
        } else if (deg >= 67.5 && deg < 112.5) {
          BridgeModule.setFilePath(
            '/storage/emulated/0/Android/data/com.myrlabs/audio/heading_right.wav',
            // '/storage/emulated/0/Android/data/com.myrlabs/audio/heading_left.wav',
          );
        } else if (deg >= 112.5 && deg < 157.5) {
          BridgeModule.setFilePath(
            '/storage/emulated/0/Android/data/com.myrlabs/audio/heading_backward_right.wav',
            // '/storage/emulated/0/Android/data/com.myrlabs/audio/heading_backward_left.wav',
          );
        } else if (deg >= 157.5 && deg < 202.5) {
          BridgeModule.setFilePath(
            '/storage/emulated/0/Android/data/com.myrlabs/audio/heading_backward.wav',
          );
        } else if (deg >= 202.5 && deg < 247.5) {
          BridgeModule.setFilePath(
            '/storage/emulated/0/Android/data/com.myrlabs/audio/heading_backward_left.wav',
            // '/storage/emulated/0/Android/data/com.myrlabs/audio/heading_backward_right.wav',
          );
        } else if (deg >= 247.5 && deg < 292.5) {
          BridgeModule.setFilePath(
            '/storage/emulated/0/Android/data/com.myrlabs/audio/heading_left.wav',
            // '/storage/emulated/0/Android/data/com.myrlabs/audio/heading_right.wav',
          );
        } else if (deg >= 292.5 && deg < 337.5) {
          BridgeModule.setFilePath(
            '/storage/emulated/0/Android/data/com.myrlabs/audio/heading_forward_left.wav',
            // '/storage/emulated/0/Android/data/com.myrlabs/audio/heading_forward_right.wav',
          );
        }
        // }
        play_directional_audio_flag.current = false;
      }

      if (Platform.OS === 'ios') {
        RNFS.readDir(iosdir).then(res => {
          if (deg >= 337.5 || deg < 22.5) {
            const findIdx = res.findIndex(
              o => o.name === 'heading_forward.wav',
            );
            BridgeModule.setFilePath(res[findIdx].path);
          } else if (deg >= 22.5 && deg < 67.5) {
            const findIdx = res.findIndex(
              o => o.name === 'heading_forward_right.wav',
            );
            BridgeModule.setFilePath(res[findIdx].path);
          } else if (deg >= 67.5 && deg < 112.5) {
            const findIdx = res.findIndex(o => o.name === 'heading_right.wav');
            BridgeModule.setFilePath(res[findIdx].path);
          } else if (deg >= 112.5 && deg < 157.5) {
            const findIdx = res.findIndex(
              o => o.name === 'heading_backward_right.wav',
            );
            BridgeModule.setFilePath(res[findIdx].path);
          } else if (deg >= 157.5 && deg < 202.5) {
            const findIdx = res.findIndex(
              o => o.name === 'heading_backward.wav',
            );
            BridgeModule.setFilePath(res[findIdx].path);
          } else if (deg >= 202.5 && deg < 247.5) {
            const findIdx = res.findIndex(
              o => o.name === 'heading_backward_left.wav',
            );
            BridgeModule.setFilePath(res[findIdx].path);
          } else if (deg >= 247.5 && deg < 292.5) {
            const findIdx = res.findIndex(o => o.name === 'heading_left.wav');
            BridgeModule.setFilePath(res[findIdx].path);
          } else if (deg >= 292.5 && deg < 337.5) {
            const findIdx = res.findIndex(
              o => o.name === 'heading_forward_left.wav',
            );
            BridgeModule.setFilePath(res[findIdx].path);
          }

          play_directional_audio_flag.current = false;
        });
      }
      _checkTable(deg);
      BridgeModule.playAudio();
      setGetCurrentBtn(false);
      setUpdateDirectBtn(false);
      setAudioCueBtn(false);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (play_directional_audio_flag.current) {
        crashlytics().log('play directional audio...');
        // const newHead = await useHeadingDegreeStore.getState().headingDegree;
        // const C = 360 - stateDegree;
        const C = 360 - degreeRef.current;
        const D = Math.round(rhumb) + C;
        let deg;
        if (D > 360) {
          deg = D - 360;
        } else {
          deg = D;
        }

        if (Platform.OS === 'android') {
          // if (
          //   await RNFS.exists('/storage/emulated/0/Android/data/com.myrlabs/audio')
          // ) {

          if (deg >= 337.5 || deg < 22.5) {
            BridgeModule.setFilePath(
              '/storage/emulated/0/Android/data/com.myrlabs/audio/heading_forward.wav',
            );
          } else if (deg >= 22.5 && deg < 67.5) {
            BridgeModule.setFilePath(
              '/storage/emulated/0/Android/data/com.myrlabs/audio/heading_forward_right.wav',
            );
          } else if (deg >= 67.5 && deg < 112.5) {
            BridgeModule.setFilePath(
              '/storage/emulated/0/Android/data/com.myrlabs/audio/heading_right.wav',
              // '/storage/emulated/0/Android/data/com.myrlabs/audio/heading_left.wav',
            );
          } else if (deg >= 112.5 && deg < 157.5) {
            BridgeModule.setFilePath(
              '/storage/emulated/0/Android/data/com.myrlabs/audio/heading_backward_right.wav',
              // '/storage/emulated/0/Android/data/com.myrlabs/audio/heading_backward_left.wav',
            );
          } else if (deg >= 157.5 && deg < 202.5) {
            BridgeModule.setFilePath(
              '/storage/emulated/0/Android/data/com.myrlabs/audio/heading_backward.wav',
            );
          } else if (deg >= 202.5 && deg < 247.5) {
            BridgeModule.setFilePath(
              '/storage/emulated/0/Android/data/com.myrlabs/audio/heading_backward_left.wav',
              // '/storage/emulated/0/Android/data/com.myrlabs/audio/heading_backward_right.wav',
            );
          } else if (deg >= 247.5 && deg < 292.5) {
            BridgeModule.setFilePath(
              '/storage/emulated/0/Android/data/com.myrlabs/audio/heading_left.wav',
              // '/storage/emulated/0/Android/data/com.myrlabs/audio/heading_right.wav',
            );
          } else if (deg >= 292.5 && deg < 337.5) {
            BridgeModule.setFilePath(
              '/storage/emulated/0/Android/data/com.myrlabs/audio/heading_forward_left.wav',
              // '/storage/emulated/0/Android/data/com.myrlabs/audio/heading_forward_right.wav',
            );
          }
          // }
          play_directional_audio_flag.current = false;
        }

        if (Platform.OS === 'ios') {
          RNFS.readDir(iosdir).then(res => {
            if (deg >= 337.5 || deg < 22.5) {
              const findIdx = res.findIndex(
                o => o.name === 'heading_forward.wav',
              );
              BridgeModule.setFilePath(res[findIdx].path);
            } else if (deg >= 22.5 && deg < 67.5) {
              const findIdx = res.findIndex(
                o => o.name === 'heading_forward_right.wav',
              );
              BridgeModule.setFilePath(res[findIdx].path);
            } else if (deg >= 67.5 && deg < 112.5) {
              const findIdx = res.findIndex(
                o => o.name === 'heading_right.wav',
              );
              BridgeModule.setFilePath(res[findIdx].path);
            } else if (deg >= 112.5 && deg < 157.5) {
              const findIdx = res.findIndex(
                o => o.name === 'heading_backward_right.wav',
              );
              BridgeModule.setFilePath(res[findIdx].path);
            } else if (deg >= 157.5 && deg < 202.5) {
              const findIdx = res.findIndex(
                o => o.name === 'heading_backward.wav',
              );
              BridgeModule.setFilePath(res[findIdx].path);
            } else if (deg >= 202.5 && deg < 247.5) {
              const findIdx = res.findIndex(
                o => o.name === 'heading_backward_left.wav',
              );
              BridgeModule.setFilePath(res[findIdx].path);
            } else if (deg >= 247.5 && deg < 292.5) {
              const findIdx = res.findIndex(o => o.name === 'heading_left.wav');
              BridgeModule.setFilePath(res[findIdx].path);
            } else if (deg >= 292.5 && deg < 337.5) {
              const findIdx = res.findIndex(
                o => o.name === 'heading_forward_left.wav',
              );
              BridgeModule.setFilePath(res[findIdx].path);
            }

            play_directional_audio_flag.current = false;
          });
        }
        _checkTable(deg);
        BridgeModule.playAudio();
      }
    }, 4000);
    return () => clearInterval(interval);
    // }, [stateDegree]);
  }, []);

  const errorHandler = (error, stackTrace) => {
    /* Log the error to an error reporting service */
    crashlytics().log('error boundary mapscreen...');
    crashlytics().recordError(error);
    crashlytics().recordError(stackTrace);
  };

  return (
    // <ErrorBoundary onError={errorHandler}>
    <SafeAreaView style={globalStyles.displayFlex}>
      <Pressable style={styles.container}>
        <Animated
          style={styles.map}
          initialRegion={{
            latitude: route.params.origin.latitude,
            longitude: route.params.origin.longitude,
            latitudeDelta: LATITUDE_DELTA,
            longitudeDelta: LONGITUDE_DELTA,
          }}
          showsMyLocationButton
          showsUserLocation={false}
          showsCompass={false}
          zoomControlEnabled={false}
          provider={PROVIDER_GOOGLE}
          ref={mapsRef}>
          {/* <Marker
            key={'aidnw'}
            title={'origin'}
            tracksViewChanges={false}
            description={''}
            coordinate={{
              latitude: legs?.steps[0].start_location?.lat,
              longitude: legs?.steps[0].start_location?.lng,
            }}>
            <View>
              <Text>
                <Ionicons name="pin" color="blue" size={40} />
              </Text>
            </View>
          </Marker>
          <Marker
            key={'wwea'}
            title={'destination'}
            tracksViewChanges={false}
            description={''}
            coordinate={{
              latitude: legs?.steps[legs?.steps.length - 1].start_location.lat,
              longitude: legs?.steps[legs?.steps.length - 1].start_location.lng,
            }}>
            <View>
              <Text>
                <Ionicons name="pin" color="red" size={40} />
              </Text>
            </View>
          </Marker> */}
          {coords.length > 0 && (
            <Polyline
              coordinates={coords}
              strokeWidth={6}
              strokeColor="black"
              lineCap="round"
              lineJoin="miter"
              geodesic={true}
            />
          )}
          {coords.length > 0 && (
            <Polyline
              coordinates={coords}
              strokeWidth={4}
              strokeColor="red"
              lineCap="round"
              lineJoin="miter"
              geodesic={true}
            />
          )}

          {/* {coords.length > 0 &&
            coords.map((o, i) => (
              <Circle
                key={i}
                center={{latitude: o.latitude, longitude: o.longitude}}
                radius={10}
                strokeWidth={1}
                strokeColor="green"
                fillColor="rgba(147, 250, 165, 0.8)"
                lineCap="round"
                lineJoin="round"
                miterLimit={5}
                lineDashPattern={[20, 20]}
                zIndex={100}
              />
            ))} */}

          <Marker.Animated
            ref={animMarkerRef}
            coordinate={coordAnimMarker}
            flat={true}
            // rotation={headDegree}
            rotation={stateDegree}
            tracksViewChanges={false}
            anchor={{x: 0.5, y: 0.5}}
            title="You're here">
            <View>
              <Text>
                <MaterialCommunityIcons
                  name="navigation"
                  size={50}
                  color="blue"
                  style={{
                    // transform: [{rotate: headDegree + 'deg'}],
                    transform: [{rotate: stateDegree + 'deg'}],
                  }}
                />
              </Text>
            </View>
          </Marker.Animated>

          {/* <Marker.Animated
            ref={animMarkerDirRef}
            coordinate={coordAnimMarker}
            flat={true}
            rotation={rhumb}
            tracksViewChanges={false}
            anchor={{x: 0.5, y: 0.5}}
            title="Your Navigation"
            style={styles.ovVisible}>
            <View style={styles.redDirection}>
              <Text style={styles.txtAlignCenter}>
                <FontAwesome
                  name="long-arrow-up"
                  size={50}
                  color="red"
                  style={{transform: [{rotate: 360 - rhumb + 'deg'}]}}
                />
              </Text>
              <Text style={styles.txtAlignCenter}>
                <FontAwesome
                  name="circle-o"
                  size={20}
                  color="red"
                  style={{transform: [{rotate: 360 - rhumb + 'deg'}]}}
                />
              </Text>
              <Text style={styles.red}>{compassDir}</Text>
            </View>
          </Marker.Animated> */}
          {stepsArray.length > 0 &&
            stepsArray.map((o, i) => (
              <Marker
                key={o?.polyline?.points}
                title={'check point ' + (i + 1)}
                description={o.html_instructions}
                tracksViewChanges={false}
                coordinate={{
                  latitude: o?.start_location?.lat,
                  longitude: o?.start_location?.lng,
                }}>
                <View>
                  <Text>
                    <Entypo name="location-pin" color="orange" size={50} />
                  </Text>
                </View>
              </Marker>
            ))}
        </Animated>
        <View style={styles.header}>
          <View style={styles.flexRow}>
            <View style={styles.w70}>
              <Ionicons name="arrow-up" size={40} color="black" />
            </View>
            <Pressable onPress={_googleInstructions}>
              <RenderHTML
                contentWidth={width}
                source={{
                  // html: `<div style="font-size: 1.7rem; color: black">in ${legs.steps[0]?.duration?.text}, ${legs.steps[0]?.html_instructions} about ${distanceToCheck} meters</div>`,
                  html: `<div style="font-size: 1.7rem; color: black">in ${legs.steps[0]?.duration?.text}, ${legs.steps[0]?.html_instructions} about ${legs.steps[0]?.distance?.value} meters</div>`,
                }}
              />
            </Pressable>
          </View>
        </View>

        <View style={{width: '100%'}}>
          <View style={styles.content}>
            <Text style={styles.blue}>
              {/* User Heading: {_direction(headDegree)} | {headDegree}° */}
              User Heading: {_direction(stateDegree)} | {stateDegree}°
            </Text>
            <Text style={styles.red}>
              User should Heading to: {_direction(rhumb)}
            </Text>
            <Spacer height={10} />
            <View style={styles.flexRow}>
              <Button
                title="Get Current Loc"
                onPress={_getCurrentLoc}
                disabled={getCurrentBtn}
              />
              <Button
                title="Update Direction"
                onPress={_updateDirection}
                disabled={updateDirectBtn}
              />
            </View>
            <Spacer height={15} />
            <View style={styles.flexRow}>
              <Button
                title="Audio Cue"
                onPress={_onTapAnywhere}
                disabled={audioCueBtn}
              />
            </View>
          </View>
        </View>
      </Pressable>
    </SafeAreaView>
  );
};
{
  /* </ErrorBoundary> */
}

export default FinalNavigation;

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    backgroundColor: 'white',
    marginBottom: 20,
    marginHorizontal: 10,
    padding: 8,
    elevation: 2,
    borderRadius: 5,
  },
  txtAlignCenter: {textAlign: 'center'},
  header: {
    position: 'absolute',
    width: Platform.OS === 'ios' ? width * 0.95 : width,
    alignSelf: 'center',
    top: Platform.OS === 'ios' ? 50 : 0,
    flexDirection: 'row',
    backgroundColor: 'white',
    padding: 10,
    elevation: 1,
    borderRadius: Platform.OS === 'ios' ? 10 : 0,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    opacity: 0.8,
  },
  flexRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  containerMarker: {
    backgroundColor: 'white',
    elevation: 5,
    borderRadius: 30,
  },
  redDirection: {marginBottom: 10, marginLeft: 100},
  ovVisible: {overflow: 'visible'},
  blue: {color: 'blue'},
  red: {color: 'red'},
  w70: {width: 70},
});
