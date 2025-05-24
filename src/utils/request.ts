/*
 * @Date: 2025-04-28 17:45:53
 * @LastEditors: xingyi && 2416820386@qq.com
 * @LastEditTime: 2025-05-24 17:26:01
 * @FilePath: \CloudDiskWeb\src\utils\request.ts
 */
// 封装 axios

import axios, { AxiosRequestConfig } from "axios";
import { message } from "antd";
import { getToken } from "@/utils/setToken";

export interface ApiResponse<T = any> {
  code: number;
  data: T;
  msg?: string;
}

const instance = axios.create({
  baseURL: "http://localhost:48080",
  timeout: 30000,
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
  (response) => {
    const res = response.data;
    // code为0表示成功
    if (res.code === 0) {
      return res;
    }
    message.error(res.msg || "请求失败");
    return Promise.reject(res);
  },
  (error) => {
    message.error(error?.response?.data?.msg || "网络错误");
    return Promise.reject(error);
  }
);

type RequestMethod = "get" | "post" | "put" | "delete";

function createRequest(method: RequestMethod) {
  return async function <T = any>(
    url: string,
    data?: any
  ): Promise<ApiResponse<T>> {
    const config: AxiosRequestConfig = {
      url,
      method,
    };

    if (method === "get") {
      config.params = data;
    } else {
      config.data = data;
    }

    const response = await instance(config);
    return response as unknown as ApiResponse<T>;
  };
}

const request = {
  get: createRequest("get"),
  post: createRequest("post"),
  put: createRequest("put"),
  delete: createRequest("delete"),
  request: async function <T = any>(
    config: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await instance(config);
    return response as unknown as ApiResponse<T>;
  },
};

export default request;
