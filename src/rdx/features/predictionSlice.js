import {createSlice} from '@reduxjs/toolkit';

const initialState = {
  place: '',
  legs: {
    distance: {text: '', value: 0},
    duration: {text: '', value: 0},
    end_address: '',
    end_location: {lat: 0, lng: 0},
    start_address: '',
    start_location: {lat: 0, lng: 0},
    steps: [{start_location: {lat: 0, lng: 0}}],
    traffic_speed_entry: [],
    via_waypoint: [],
  },
  coords: [{latitude: 0, longitude: 0}],
};

export const predictionSlice = createSlice({
  name: 'prediction',
  initialState,
  reducers: {
    setCoords: (state, action) => {
      state.coords === action.payload;
    },
    setLegss: (state, action) => {
      state.legs === action.payload;
    },
    setPlace: (state, action) => {
      state.place === action.payload;
    },
  },
});

// Action creators are generated for each case reducer function
export const {setCoords, setLegs, setPlace} = predictionSlice.actions;

export default predictionSlice.reducer;