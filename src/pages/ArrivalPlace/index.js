import {Pressable, StyleSheet, Text} from 'react-native';
import React, {useEffect} from 'react';
import Tts from 'react-native-tts';
import {useNavigation} from '@react-navigation/native';

const ArrivalPlace = () => {
  const navigation = useNavigation();
  useEffect(() => {
    _onTapAnywhere();
    return () => {
      Tts.stop();
    };
  }, []);

  const _onTapAnywhere = () => {
    Tts.speak(
      'You have reached the destination. Press and hold to go elsewhere.',
    );
  };

  const _onLongPress = () => {
    navigation.navigate('AskPlace');
  };

  return (
    <Pressable
      style={styles.container}
      onPress={_onTapAnywhere}
      onLongPress={_onLongPress}>
      <Text style={styles.text}>You have arrived at your destination</Text>
    </Pressable>
  );
};

export default ArrivalPlace;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  text: {
    fontSize: 24,
    color: 'black',
    textAlign: 'center',
  },
});
