import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { userService } from '../services/UserService.js';

export const fetchUsers = createAsyncThunk('users/fetchAll', async () => {
  const response = await userService.listUsers();
  return response;
});

export const updateUser = createAsyncThunk('users/update', async ({ username, userData }) => {
  const response = await userService.updateUser(username, userData);
  return response;
});

export const deleteUser = createAsyncThunk('users/delete', async (username) => {
  const response = await userService.deleteUser(username);
  return response;
});

export const updateCurrentUser = createAsyncThunk('users/updateCurrent', async (userData) => {
  const response = await userService.updateCurrentUser(userData);
  return response;
});

const usersSlice = createSlice({
  name: 'users',
  initialState: {
    items: [],
    currentUser: null,
    status: 'idle',
    error: null
  },
  reducers: {
    setCurrentUser: (state, action) => {
      state.currentUser = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        const index = state.items.findIndex(item => item.username === action.payload.username);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.items = state.items.filter(item => item.username !== action.payload.username);
      })
      .addCase(updateCurrentUser.fulfilled, (state, action) => {
        state.currentUser = action.payload;
      });
  }
});

export const { setCurrentUser } = usersSlice.actions;
export default usersSlice.reducer;
