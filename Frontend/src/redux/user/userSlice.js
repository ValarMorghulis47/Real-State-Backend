import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  currentUser: null,
  error: false,
  loading: false,
  initialFetchDone: false,
  LoggedIn: false,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    updateError: (state, action) => {
      state.error = false;
    },
    toggleLoggedIn: (state) => {
      state.LoggedIn = !state.LoggedIn;
    },
    setInitialFetchDone: (state) => {
      state.initialFetchDone = true;
    },
    signUpStart: (state) => {
      state.loading = true;
    },
    signUpSuccess: (state, action) => {
      state.loading = false;
      state.error = false;
    },
    signUpFailure: (state, action) => {
      state.error = true;
      state.loading = false;
    },
    signInStart: (state) => {
      state.loading = true;
    },
    signInSuccess: (state, action) => {
      state.currentUser = action.payload;
      state.loading = false;
      state.error = false;
    },
    signInFailure: (state, action) => {
      state.error = true;
      state.loading = false;
    },
    updateUserStart: (state) => {
      state.loading = true;
    },
    updateUserSuccess: (state, action) => {
      state.currentUser = action.payload;
      state.loading = false;
      state.error = null;
    },
    updateUserFailure: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    deleteUserStart: (state) => {
      state.loading = true;
    },
    deleteUserSuccess: (state) => {
      state.currentUser = null;
      state.loading = false;
      state.error = null;
    },
    deleteUserFailure: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    signOutUserStart: (state) => {
      state.loading = true;
    },
    signOutUserSuccess: (state) => {
      state.currentUser = null;
      state.loading = false;
      state.error = null;
    },
    signOutUserFailure: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const {
  updateError,
  setInitialFetchDone,
  toggleLoggedIn,
  signUpStart,
  signUpSuccess,
  signUpFailure,
  signInStart,
  signInSuccess,
  signInFailure,
  updateUserFailure,
  updateUserSuccess,
  updateUserStart,
  deleteUserFailure,
  deleteUserSuccess,
  deleteUserStart,
  signOutUserFailure,
  signOutUserSuccess,
  signOutUserStart,
} = userSlice.actions;

export default userSlice.reducer;
