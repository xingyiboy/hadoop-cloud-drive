/*
 * @Date: 2025-05-24 18:34:17
 * @LastEditors: xingyi && 2416820386@qq.com
 * @LastEditTime: 2025-05-25 23:44:09
 * @FilePath: \CloudDiskWeb\src\api\file.ts
 */
import request from "@/utils/request";
import type { ApiResponse } from "@/utils/request";
import { FileType } from "@/enums/FileTypeEnum";
import type {
  AxiosRequestConfig,
  AxiosResponse,
  AxiosProgressEvent,
} from "axios";

export interface FileInfo {
  id: string;
  name: string;
  type: number;
  size: string;
  createTime: string;
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

export interface FileListParams {
  catalogue?: string;
  type?: number;
  name?: string;
  pageNo?: number;
  pageSize?: number;
  sortField?: string;
  sortOrder?: string;
  excludeShared?: boolean;
}

export interface FileListResponse {
  list: FileInfo[];
  total: number;
}

interface DownloadOptions {
  fileId: string;
  onDownloadProgress?: (progressEvent: {
    loaded: number;
    total?: number;
  }) => void;
}

// 创建文件
export const createFile = (
  data: FormData,
  config?: {
    onUploadProgress?: (progressEvent: AxiosProgressEvent) => void;
  }
) => {
  return request.post<ApiResponse<any>>(
    "/admin-api/system/hadoop-file/create",
    data,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      ...config,
    }
  );
};

// 获取文件列表
export const getFileList = (params: FileListParams) => {
  return request.get<ApiResponse<FileListResponse>>(
    "/admin-api/system/hadoop-file/list",
    { params }
  );
};

// 删除文件或目录
export const deleteFile = (id: string): Promise<ApiResponse<void>> => {
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

// 下载文件
export const downloadFile = (params: {
  fileId: string;
  onDownloadProgress?: (progressEvent: AxiosProgressEvent) => void;
}) => {
  return request.get(
    `/admin-api/system/hadoop-file/download/${params.fileId}`,
    {
      responseType: "blob",
      onDownloadProgress: params.onDownloadProgress,
    }
  );
};

// 分享文件
export function shareFile(fileId: string) {
  return request.post(`/admin-api/system/hadoop-file/share?id=${fileId}`);
}

// 批量分享文件
export function batchShareFiles(fileIds: string[]) {
  return request.post("/admin-api/system/hadoop-file/batch-share", fileIds);
}

// 取消分享文件
export function cancelShare(fileId: string) {
  return request.post(
    `/admin-api/system/hadoop-file/cancel-share?id=${fileId}`
  );
}
