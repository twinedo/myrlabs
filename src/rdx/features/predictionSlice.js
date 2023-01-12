import { createSlice } from '@reduxjs/toolkit';

const initialState = {
	place: '',
	legs: {},
	coords: [{ latitude: 0, longitude: 0 }],
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
export const { setCoords, setLegs, setPlace } = predictionSlice.actions;

export default predictionSlice.reducer;
