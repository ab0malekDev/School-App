import { configureStore } from '@reduxjs/toolkit';

// Create a dummy reducer for now
const dummyReducer = (state = {}, action: any) => {
  return state;
};

export const store = configureStore({
  reducer: {
    app: dummyReducer
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 