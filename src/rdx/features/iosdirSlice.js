import {createSlice} from '@reduxjs/toolkit';

const initialState = {
  iosdir: '',
};

export const iosdirSlice = createSlice({
  name: 'iosdir',
  initialState,
  reducers: {
    setIosDir: (state, action) => {
      state.iosdir === action.payload;
    },
  },
});

// Action creators are generated for each case reducer function
export const {setIosDir} = iosdirSlice.actions;

export default iosdirSlice.reducer;
