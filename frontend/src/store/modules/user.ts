import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { UserProfile } from "@/types/user";

// 从localStorage获取用户信息
const getStoredUserInfo = () => {
  try {
    const storedProfile = localStorage.getItem("userProfile");
    const storedUsername = localStorage.getItem("username");
    return {
      username: storedUsername || "",
      profile: storedProfile ? JSON.parse(storedProfile) : null,
    };
  } catch (error) {
    console.error("从localStorage获取用户信息失败:", error);
    return {
      username: "",
      profile: null,
    };
  }
};

interface UserState {
  username: string;
  profile: UserProfile | null;
}

const initialState: UserState = getStoredUserInfo();

const userSlice = createSlice({
  // 命名空间,值会作为 action type 的前缀
  name: "user",
  initialState,
  reducers: {
    login: (state, action: PayloadAction<string>) => {
      state.username = action.payload;
      localStorage.setItem("username", action.payload);
    },
    setUserProfile: (state, action: PayloadAction<UserProfile>) => {
      state.profile = action.payload;
      localStorage.setItem("userProfile", JSON.stringify(action.payload));
    },
    logout: (state) => {
      state.username = "";
      state.profile = null;
      localStorage.removeItem("username");
      localStorage.removeItem("userProfile");
    },
  },
});

export const { login, logout, setUserProfile } = userSlice.actions;

export default userSlice.reducer;
