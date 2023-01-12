import {configureStore} from '@reduxjs/toolkit';
import currentPosReducer from '../rdx/features/currentPosSlice';
import rhumbReducer from '../rdx/features/rhumbSlice';

export const store = configureStore({
  reducer: {
    currentPos: currentPosReducer,
    rhumb: rhumbReducer,
  },
});
