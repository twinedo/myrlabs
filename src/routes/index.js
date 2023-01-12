import React from 'react';
// import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {
  SplashScreen,
  PermissionsPage,
  AskPlace,
  Destination,
  ConfirmNav,
  ListenPlace,
  // ArrivalPlace,
  // FinalNavigation,
} from '../pages';
import {createStackNavigator} from '@react-navigation/stack';

// const NativeStack = createNativeStackNavigator();
const Stack = createStackNavigator();

const Routes = () => {
  const {Navigator, Screen} = Stack;
  return (
    <Navigator>
      <Screen
        name="SplashScreen"
        component={SplashScreen}
        options={{headerShown: false}}
      />
      <Screen
        name="PermissionsPage"
        component={PermissionsPage}
        options={{headerShown: false}}
      />
      <Screen
        name="Destination"
        component={Destination}
        options={{headerShown: false}}
      />
      <Screen
        name="ConfirmNav"
        component={ConfirmNav}
        options={{headerShown: false}}
      />
      {/*
      <Screen
        name="FinalNavigation"
        component={FinalNavigation}
        options={{
          headerShown: false,
          animation: 'none',
        }}
      />
      <Screen
        name="ArrivalPlace"
        component={ArrivalPlace}
        options={{headerShown: false}}
      />
    */}
      <Screen
        name="ListenPlace"
        component={ListenPlace}
        options={{headerShown: false}}
      />
      <Screen
        name="AskPlace"
        component={AskPlace}
        options={{headerShown: false}}
      />
    </Navigator>
  );
};

export default Routes;
