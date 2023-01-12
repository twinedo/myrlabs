import {View} from 'react-native';
import React from 'react';
import PropTypes from 'prop-types';

const Spacer = props => {
  const {width, height} = props;
  return <View style={{width, height}} />;
};

export default Spacer;

Spacer.propTypes = {
  width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
};
