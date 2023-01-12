import {Platform} from 'react-native';
import {requestMultiple, PERMISSIONS, request} from 'react-native-permissions';

export const Permissions = async () => {
  if (Platform.OS === 'android') {
    if (Platform.Version >= 29) {
      await request(PERMISSIONS.ANDROID.ACCESS_BACKGROUND_LOCATION).then(
        status => {
          console.log(
            'LOKASI BG',
            status[PERMISSIONS.ANDROID.ACCESS_BACKGROUND_LOCATION],
          );
        },
      );
    }
    await requestMultiple([
      PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
      PERMISSIONS.ANDROID.ACCESS_COARSE_LOCATION,
    ])
      .then(status => {
        console.log('LOKASI', status[PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION]);
        console.log(
          'LOKASI COARSE',
          status[PERMISSIONS.ANDROID.ACCESS_COARSE_LOCATION],
        );
      })
      .catch(err => {
        console.log(err);
      });
  }
};

export default Permissions;
