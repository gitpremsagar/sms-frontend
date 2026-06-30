import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { AuthUser } from "@/lib/roles";

export type AuthStatus =
  | "idle"
  | "loading"
  | "authenticated"
  | "unauthenticated";

type AuthState = {
  user: AuthUser | null;
  status: AuthStatus;
};

const initialState: AuthState = {
  user: null,
  status: "idle",
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<AuthUser>) {
      state.user = action.payload;
      state.status = "authenticated";
    },
    clearUser(state) {
      state.user = null;
      state.status = "unauthenticated";
    },
    setStatus(state, action: PayloadAction<AuthStatus>) {
      state.status = action.payload;
    },
  },
});

export const { setUser, clearUser, setStatus } = authSlice.actions;
export default authSlice.reducer;
