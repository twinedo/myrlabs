import {getCompassDirection, getDistance, getRhumbLineBearing} from 'geolib';

export const _direction = degree => {
  if (degree >= 22.5 && degree < 67.5) {
    return 'North East';
  } else if (degree >= 67.5 && degree < 112.5) {
    return 'East';
  } else if (degree >= 112.5 && degree < 157.5) {
    return 'South East';
  } else if (degree >= 157.5 && degree < 202.5) {
    return 'South';
  } else if (degree >= 202.5 && degree < 247.5) {
    return 'South West';
  } else if (degree >= 247.5 && degree < 292.5) {
    return 'West';
  } else if (degree >= 292.5 && degree < 337.5) {
    return 'North West';
  } else {
    return 'North';
  }
};

export const _onGetHeading = (currLat, currLong, destLat, destLong) => {
  const result = getRhumbLineBearing(
    {
      latitude: currLat,
      longitude: currLong,
    },
    {
      latitude: destLat,
      longitude: destLong,
    },
  );
  return result;
};

const _onGetCompassDirection = (currLat, currLong, destLat, destLong) => {
  const result = getCompassDirection(
    {
      latitude: currLat,
      longitude: currLong,
    },
    {
      latitude: destLat,
      longitude: destLong,
    },
  );
  return result;
};

export const _onGetDistanceCurrentToNextStep = (
  currentLat,
  currentLong,
  destLat,
  destLong,
) => {
  const result = getDistance(
    {latitude: currentLat, longitude: currentLong},
    {
      latitude: destLat,
      longitude: destLong,
    },
  );
  return result;
};
