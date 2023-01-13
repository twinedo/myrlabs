import {createSlice} from '@reduxjs/toolkit';
import {getCompassDirection, getRhumbLineBearing} from 'geolib';

const initialState = {
  rhumb: 0,
  compassDir: 'N',
};

export const rhumbSlice = createSlice({
  name: 'rhumb',
  initialState,
  reducers: {
    setBearing: (state, action) => {
      const result = getRhumbLineBearing(action.payload);
      return {...state, rhumb: result};
    },
    setCompassDir: (state, action) => {
      const result = getCompassDirection(action.payload);
      return {...state, compassDir: result};
    },
  },
});

// Action creators are generated for each case reducer function
export const {setBearing, setCompassDir} = rhumbSlice.actions;

export default rhumbSlice.reducer;
