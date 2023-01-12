import {Platform, Pressable, StyleSheet, Text, View} from 'react-native';
import React, {useEffect, useState} from 'react';
import globalStyles from '../../styles/globalStyles';
import {useNavigation} from '@react-navigation/native';
import Voice from '@react-native-voice/voice';
import Tts from 'react-native-tts';
import Ionicons from 'react-native-vector-icons/Ionicons';

const ListenPlace = () => {
  const navigation = useNavigation();
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    if (Platform.OS === 'android') {
      Voice.getSpeechRecognitionServices().then(res => {
        console.log('res services', res);
        // Alert.alert('Your Speech Service', res.toString());
      });
    }

    Voice.onSpeechStart = onSpeechStart;
    Voice.onSpeechEnd = onSpeechEnd;
    Voice.onSpeechError = onSpeechError;
    Voice.onSpeechResults = onSpeechResults;
    Voice.onSpeechPartialResults = onSpeechPartialResults;
    startRecognizing();
    return () => {
      Tts.stop();

      setIsListening(false);
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  const onSpeechStart = async e => {
    console.log('onSpeechStart', e);
    setIsListening(true);
    // setStarted('checked');
    // setEnd('');
  };

  const onSpeechEnd = async e => {
    console.log('onSpeechEnd', e);
    // setStarted('');
    // setEnd('checked');
    setIsListening(false);
    // setPageState('result');
  };

  const onSpeechError = async e => {
    console.log('onSpeechError', e);
    // setError(JSON.stringify(e.error));
    Tts.speak('Please try again');
    setTimeout(() => {
      setIsListening(true);
      startRecognizing();
    }, 2000);
  };

  const onSpeechResults = e => {
    console.log('onSpeechResults', e);
    let text = e.value[0];
    navigation.navigate('Destination', {result: text});
    setIsListening(false);
    // setResults(text);
  };

  const onSpeechPartialResults = e => {
    console.log('onSpeechPartialResults', e);
    // setPartialResults(e.value);
    setIsListening(false);
  };

  const startRecognizing = async () => {
    try {
      await Voice.start('en-SG', {RECOGNIZER_ENGINE: 'GOOGLE'});
      // await Voice.start('id-ID', {RECOGNIZER_ENGINE: 'GOOGLE'});
      // setError('');
      // setStarted('');
      // setResults([]);
      // setPartialResults([]);
      // setEnd('');
      setIsListening(true);
      console.log('Started recognize');
    } catch (error) {
      console.log(error);
      setIsListening(false);
    }
  };

  return (
    <View style={globalStyles.container}>
      {Platform.OS === 'ios' && (
        <Pressable style={styles.btnBack} onPress={() => navigation.goBack()}>
          <Text>Go Back</Text>
        </Pressable>
      )}
      <Pressable
        style={[globalStyles.container, {paddingHorizontal: 15}]}
        onPress={startRecognizing}>
        <Pressable
          style={[
            styles.micContainer,
            {borderColor: isListening ? 'green' : 'grey'},
          ]}>
          <Ionicons
            name="mic"
            size={50}
            color={isListening ? 'green' : 'grey'}
          />
        </Pressable>
        <Text
          // onPress={() => setPageState('result')}
          style={[styles.text, {color: isListening ? 'green' : 'grey'}]}>
          Listening
        </Text>
      </Pressable>
    </View>
  );
};

export default ListenPlace;

const styles = StyleSheet.create({
  micContainer: {
    padding: 30,
    borderRadius: 100,
    borderWidth: 5,
  },
  text: {
    fontSize: 30,
    color: 'black',
    textAlign: 'center',
  },
  btnBack: {position: 'absolute', top: 70, left: 10},
});
