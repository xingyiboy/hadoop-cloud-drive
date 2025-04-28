// 封装 axios

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { getToken } from '@/utils/setToken'

// axios 实例配置
const _axios:AxiosInstance = axios.create({
  baseURL:'http://127.0.0.1',
  timeout:30000
})

// 请求拦截器
_axios.interceptors.request.use(
  (config:AxiosRequestConfig):AxiosRequestConfig => {
      const token = getToken()
      if(token){
        config.headers = config.headers || {}
        config.headers['Authorization'] = token
      }

      return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 响应拦截器
_axios.interceptors.response.use(
  (response:AxiosResponse):AxiosResponse => {
    return response.data
  },
  error => {
    return Promise.reject(error)
  }
)

export default _axios