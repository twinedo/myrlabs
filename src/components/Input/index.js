import {StyleSheet, TextInput, View} from 'react-native';
import React from 'react';
import PropTypes from 'prop-types';

const Input = props => {
  const {containerStyle, prefix, postfix} = props;
  return (
    <View style={[styles.container, containerStyle]}>
      {prefix}
      <TextInput
        {...props}
        placeholderTextColor="grey"
        style={styles.txtInput}
      />
      {postfix}
    </View>
  );
};

export default Input;

Input.proptypes = {
  prefix: PropTypes.element,
  postfix: PropTypes.element,
  containerStyle: PropTypes.object,
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 5,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  txtInput: {flex: 1, color: 'black'},
});
