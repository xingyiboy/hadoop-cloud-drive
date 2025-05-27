/*
 * @Date: 2025-04-28 17:45:53
 * @LastEditors: xingyi && 2416820386@qq.com
 * @LastEditTime: 2025-05-27 10:38:13
 * @FilePath: \CloudDiskWeb\src\utils\request.ts
 */
// 封装 axios

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import { message } from "antd";
import { getToken } from "@/utils/setToken";

export interface ApiResponse<T> {
  code: number;
  data: T;
  msg?: string;
  headers?: {
    [key: string]: string;
  };
}

const instance: AxiosInstance = axios.create({
  // baseURL: "http://113.45.31.128:6767",
  baseURL: "http://localhost:48080",
  timeout: 60000,
});

// 请求拦截器
instance.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    // 登录和注册接口不需要token
    if (
      ![
        "/admin-api/system/auth/login",
        "/admin-api/system/auth/register",
      ].includes(config.url || "")
    ) {
      const token = getToken();
      if (token) {
        config.headers = config.headers || {};
        config.headers["Authorization"] = `Bearer ${token}`;
      } else {
        // 如果需要token但没有token，直接跳转到登录页
        window.location.hash = "#/login";
        return Promise.reject(new Error("请先登录"));
      }
    }

    // 添加租户ID
    config.headers = config.headers || {};
    config.headers["tenant-id"] = "1";

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
instance.interceptors.response.use(
  (response: AxiosResponse<ApiResponse<any>>) => {
    // 如果是下载文件，直接返回响应
    if (response.config.responseType === "blob") {
      return response;
    }

    const res = response.data;
    if (res.code === 401) {
      // 未登录或token过期
      window.location.hash = "#/login";
      message.error(res.msg || "登录失效");
      return Promise.reject(new Error("请先登录"));
    }
    if (res.code !== 0) {
      message.error(res.msg || "请求失败");
      return Promise.reject(new Error(res.msg || "请求失败"));
    }
    return res;
  },
  (error) => {
    if (error.response?.status === 401) {
      // 未登录或token过期
      window.location.hash = "#/login";
      message.error(error.response?.data?.msg || error.message || "请先登录");
      return Promise.reject(error.response?.data || error);
    }
    message.error(error.response?.data?.msg || error.message || "网络错误");
    return Promise.reject(error.response?.data || error);
  }
);

const request = {
  get: <T = any>(url: string, config?: AxiosRequestConfig) =>
    instance.get<any, ApiResponse<T>>(url, config),

  post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) =>
    instance.post<any, ApiResponse<T>>(url, data, config),

  put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) =>
    instance.put<any, ApiResponse<T>>(url, data, config),

  delete: <T = any>(url: string, config?: AxiosRequestConfig) =>
    instance.delete<any, ApiResponse<T>>(url, config),
};

export default request;
