import request from "@/utils/request";
import type { ApiResponse } from "@/utils/request";
import { FileType } from "@/enums/FileTypeEnum";

export interface FileInfo {
  id: number;
  name: string;
  type: FileType;
  size?: string;
  catalogue: string;
  createTime: number;
}

interface CreateFileParams {
  name: string;
  type: FileType;
  catalogue?: string;
  size?: string;
  file?: File;
}

interface ProgressConfig {
  onUploadProgress?: (progressEvent: ProgressEvent) => void;
}

// 创建文件或目录
export const createFile = (
  data: CreateFileParams | FormData,
  config?: ProgressConfig
): Promise<ApiResponse> => {
  return request.request({
    url: "/admin-api/system/hadoop-file/create",
    method: "POST",
    data,
    headers: {
      "Content-Type": "multipart/form-data",
    },
    ...config,
  });
};

// 获取文件列表
export const getFileList = (params: {
  catalogue?: string;
  type?: FileType;
  keyword?: string;
  pageNo?: number;
  pageSize?: number;
}): Promise<ApiResponse<{ list: FileInfo[]; total: number }>> => {
  return request.get("/admin-api/system/hadoop-file/list", params);
};

// 删除文件或目录
export const deleteFile = (id: number): Promise<ApiResponse<void>> => {
  return request.delete(`/admin-api/system/hadoop-file/delete?id=${id}`);
};

// 移动文件或目录
export const moveFile = (
  id: number,
  newCatalogue: string
): Promise<ApiResponse<void>> => {
  return request.put("/admin-api/system/hadoop-file/move", {
    id,
    newCatalogue,
  });
};

// 重命名文件或目录
export const renameFile = (
  id: number,
  newName: string
): Promise<ApiResponse<void>> => {
  return request.put("/admin-api/system/hadoop-file/rename", {
    id,
    newName,
  });
};
