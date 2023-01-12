import React from 'react';
import crashlytics from '@react-native-firebase/crashlytics';
import {BackHandler, StyleSheet, Text, View} from 'react-native';
import Button from '../Button';
import globalStyles from '../../styles/globalStyles';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {hasError: false};
  }

  static getDerivedStateFromError(error) {
    crashlytics().log('getDerivedStateFromError');
    crashlytics().log(error);
    // Update state so the next render will show the fallback UI.
    return {hasError: true};
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    crashlytics().log('error component did catch...');
    crashlytics().recordError(error);
    crashlytics().recordError(errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <View style={globalStyles.displayFlex}>
          <Text style={styles.txt}>Something went wrong.</Text>
          <Button
            text="Exit App"
            textColor="black"
            onClick={() => BackHandler.exitApp()}
          />
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  txt: {color: 'red', fontWeight: 'bold'},
});
