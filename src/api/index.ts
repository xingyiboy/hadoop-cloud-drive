import request from "@/utils/request"

// 使用封装后的 axios 配置接口
export const requestName = (data:any):Promise<any> => request.post(`api-url`,data)