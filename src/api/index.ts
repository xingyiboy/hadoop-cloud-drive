import request from "@/utils/request";
import { UserProfile } from "@/types/user";

// 登录接口
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  userId: number;
  accessToken: string;
  refreshToken: string;
  expiresTime: number;
}

// API响应格式
export interface ApiResponse<T> {
  code: number;
  data: T;
  msg: string;
}

// 注册接口
export interface RegisterRequest {
  username: string;
  nickname: string;
  password: string;
}

// 登录API
export const login = (
  data: LoginRequest
): Promise<ApiResponse<LoginResponse>> =>
  request.post("/admin-api/system/auth/login", data);

// 注册API
export const register = (data: RegisterRequest): Promise<ApiResponse<void>> =>
  request.post("/admin-api/system/auth/register", data);

// 使用封装后的 axios 配置接口
export const requestName = (data: any): Promise<any> =>
  request.post(`api-url`, data);

// 获取用户信息
export const getUserProfile = (): Promise<ApiResponse<UserProfile>> => {
  return request.get("/admin-api/system/user/profile/get");
};

// 更新用户信息
export const updateUserProfile = (
  profile: Partial<UserProfile>
): Promise<ApiResponse<void>> => {
  return request.put("/admin-api/system/user/profile/update", profile);
};
