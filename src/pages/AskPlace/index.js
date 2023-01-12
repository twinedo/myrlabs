import {Alert, Pressable, StyleSheet, Text, View} from 'react-native';
import React, {useEffect, useState} from 'react';
import globalStyles from '../../styles/globalStyles';
import {useNavigation} from '@react-navigation/native';
import Tts from 'react-native-tts';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Spacer from '../../components/Spacer';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {SafeAreaView} from 'react-native-safe-area-context';

const AskPlace = () => {
  const navigation = useNavigation();
  const [textSearch, setTextSearch] = useState('');

  useEffect(() => {
    Tts.setDefaultLanguage('en-IE');
    Tts.getInitStatus().then(() => {
      Tts.speak('Hi, Where do you want to go?');
      Tts.speak('Please tap anywhere and say your destination');
    });
    return () => Tts.stop();
  }, []);

  const _onSearch = () => {
    if (textSearch.length > 0) {
      navigation.navigate('Destination', {result: textSearch});
    } else {
      Alert.alert('Caution', 'please type any place to search');
    }
  };

  return (
    <SafeAreaView style={globalStyles.displayFlex}>
      <View style={[globalStyles.container]}>
        <Pressable
          onPress={() => navigation.navigate('ListenPlace')}
          style={styles.body}>
          <Text style={[styles.text]}>Hi,{'\n'} Where do you want to go?</Text>
        </Pressable>
        <View style={[styles.footer, styles.row]}>
          <Input
            placeholder="Any Places"
            placeholderTextColor={'grey'}
            containerStyle={styles.txtInput}
            value={textSearch}
            onChangeText={text => setTextSearch(text)}
            postfix={
              <View>
                {textSearch.length > 0 ? (
                  <Ionicons
                    name="close"
                    color="grey"
                    size={24}
                    onPress={() => setTextSearch('')}
                  />
                ) : null}
              </View>
            }
          />
          <Spacer width={10} />
          <View style={globalStyles.displayFlex}>
            <Button
              text="Search"
              containerStyle={styles.btnSearch}
              textColor="white"
              onPress={_onSearch}
            />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default AskPlace;

const styles = StyleSheet.create({
  text: {
    fontSize: 30,
    color: 'black',
    textAlign: 'center',
  },
  txtInput: {
    flex: 2,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: 'grey',
    borderRadius: 5,
    color: 'black',
    paddingHorizontal: 10,
  },
  body: {flex: 1, justifyContent: 'center', paddingHorizontal: 15},
  row: {
    flexDirection: 'row',
  },
  footer: {
    backgroundColor: 'white',
    width: '100%',
    padding: 10,
  },
  btnSearch: {backgroundColor: 'lightgreen', elevation: 2},
});
