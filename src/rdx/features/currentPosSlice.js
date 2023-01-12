import {createSlice} from '@reduxjs/toolkit';

const initialState = {
  latitude: 0,
  longitude: 0,
};

export const currentPosSlice = createSlice({
  name: 'currentPos',
  initialState,
  reducers: {
    setCurrentPos: (state, action) => {
      state === action.payload;
    },
    resetCurrentPos: state => {
      state === initialState;
    },
  },
});

// Action creators are generated for each case reducer function
export const {setCurrentPos, resetCurrentPos} = currentPosSlice.actions;

export default currentPosSlice.reducer;
