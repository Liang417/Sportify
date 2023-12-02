import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

export const getUser = createAsyncThunk("user/getUser", async () => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/user/`, {
      credentials: "include",
    });
    const data = await response.json();
    if (response.status !== 200) throw Error(data.message);
    return data.user;
  } catch (err) {
    throw new Error(err);
  }
});

const initialState = {
  isAuthenticated: false,
  isLoading: true,
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getUser.fulfilled, (state, action) => {
        state.isAuthenticated = true;
        state.isLoading = false;
        state.user = action.payload;
      })
      .addCase(getUser.rejected, (state) => {
        state.isAuthenticated = false;
        state.isLoading = false;
      });
  },
});

export const { reset } = userSlice.actions;

export default userSlice.reducer;
