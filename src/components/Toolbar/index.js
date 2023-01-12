import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import PropTypes from 'prop-types';

const Toolbar = props => {
  const {text, prefix, postfix} = props;
  return (
    <View style={styles.container}>
      <View style={styles.prefix}>{prefix}</View>
      {text !== undefined && (
        <View style={styles.middle}>
          <Text style={styles.text}>{text}</Text>
        </View>
      )}
      <View style={styles.postfix}>{postfix}</View>
    </View>
  );
};

export default Toolbar;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 60,
    paddingHorizontal: 8,
  },
  middle: {
    flex: 2,
    alignItems: 'center',
  },
  text: {
    fontSize: 18,
    color: 'black',
  },
  prefix: {
    flex: 0.5,
    alignItems: 'flex-start',
  },
  postfix: {
    flex: 0.5,
    alignItems: 'flex-end',
  },
});

Toolbar.propTypes = {
  text: PropTypes.string,
  prefix: PropTypes.element,
  postfix: PropTypes.element,
};
