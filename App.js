import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import Routes from 'routes';
import {enableLatestRenderer} from 'react-native-maps';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import crashlytics from '@react-native-firebase/crashlytics';
import {Provider} from 'react-redux';
import {store} from './src/rdx/store';

enableLatestRenderer();

const App = () => {
  const errorHandler = (error, stackTrace) => {
    /* Log the error to an error reporting service */
    crashlytics().log('error boundary...');
    crashlytics().recordError(error);
    crashlytics().recordError(stackTrace);
  };

  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <NavigationContainer>
          <Routes />
        </NavigationContainer>
      </SafeAreaProvider>
    </Provider>
  );
};

export default App;
