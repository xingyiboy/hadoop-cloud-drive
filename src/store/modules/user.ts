import { createSlice, PayloadAction } from '@reduxjs/toolkit'

import { setToken } from '@/utils/setToken'

export interface UserState {
  userName: string
}

const userSlice = createSlice({
  // 命名空间,值会作为 action type 的前缀
  name: 'user',
  initialState: {
    userName: ''
  },
  reducers: {
    login: (state: UserState, action: PayloadAction<string>) => {
      state.userName = action.payload
      setToken('login')
    },
    logout: (state: UserState) => {
      state.userName = ''
      setToken('')
    }
  }
})

export const { login, logout } = userSlice.actions

export default userSlice.reducer
