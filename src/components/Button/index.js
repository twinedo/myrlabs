import {Pressable, StyleSheet, Text} from 'react-native';
import React from 'react';
import PropTypes from 'prop-types';
import {BLACK, WHITE} from '../../styles/colors';

const Button = props => {
  const {text, prefix, postfix, containerStyle, onPress, textColor} = props;
  return (
    <Pressable
      {...props}
      style={[styles.container, containerStyle]}
      onPress={onPress}>
      {prefix}
      <Text style={[styles.text, {color: textColor}]}>{text}</Text>
      {postfix}
    </Pressable>
  );
};

export default Button;

const styles = StyleSheet.create({
  container: {
    backgroundColor: WHITE,
    height: 50,
    borderRadius: 20,
    justifyContent: 'center',
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: {
    color: BLACK,
    fontSize: 18,
  },
});

Button.propTypes = {
  text: PropTypes.any,
  prefix: PropTypes.element,
  postfix: PropTypes.element,
  onPress: PropTypes.func,
  containerStyle: PropTypes.any,
  textColor: PropTypes.string,
};
