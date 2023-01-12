import { configureStore } from '@reduxjs/toolkit';
import currentPosReducer from '../rdx/features/currentPosSlice';
import rhumbReducer from '../rdx/features/rhumbSlice';
import iosdirReducer from '../rdx/features/iosdirSlice';
import predictionReducer from '../rdx/features/predictionSlice';

export const store = configureStore({
	reducer: {
		currentPos: currentPosReducer,
		rhumb: rhumbReducer,
		iosdir: iosdirReducer,
		prediction: predictionReducer,
	},
});
