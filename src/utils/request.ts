/*
 * @Date: 2025-04-28 17:45:53
 * @LastEditors: xingyi && 2416820386@qq.com
 * @LastEditTime: 2025-05-24 17:26:01
 * @FilePath: \CloudDiskWeb\src\utils\request.ts
 */
// 封装 axios

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import { getToken } from "@/utils/setToken";

// axios 实例配置
const _axios: AxiosInstance = axios.create({
  baseURL: "http://localhost:48080",
  timeout: 30000,
});

// 请求拦截器
_axios.interceptors.request.use(
  (config: AxiosRequestConfig): AxiosRequestConfig => {
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
_axios.interceptors.response.use(
  (response: AxiosResponse) => {
    const res = response.data;
    // code为0表示成功
    if (res.code === 0) {
      return res;
    }
    return Promise.reject(res.msg);
  },
  (error) => {
    return Promise.reject(error?.response?.data?.msg || "网络错误");
  }
);

export default _axios;
