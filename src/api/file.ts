/*
 * @Date: 2025-05-24 18:34:17
 * @LastEditors: xingyi && 2416820386@qq.com
 * @LastEditTime: 2025-05-24 21:07:25
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
  id: number;
  name: string;
  type: number;
  size: string;
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

export interface FileListParams {
  catalogue?: string;
  type?: number;
  keyword?: string;
  pageNo?: number;
  pageSize?: number;
  sortField?: string;
  sortOrder?: "ascend" | "descend" | null;
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
export const createFile = async (
  data: FormData,
  config?: AxiosRequestConfig
) => {
  return request.post("/admin-api/system/hadoop-file/create", data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    ...config,
  });
};

// 获取文件列表
export const getFileList = (params: FileListParams) => {
  return request.get<FileListResponse>("/admin-api/system/hadoop-file/list", {
    params,
  });
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

export async function downloadFile(params: {
  fileId: string;
  onDownloadProgress?: (progressEvent: any) => void;
}) {
  // 使用 fetch API 处理文件下载
  const response = await fetch(
    `/admin-api/system/hadoop-file/download/${params.fileId}`,
    {
      method: "GET",
    }
  );

  if (!response.ok) {
    throw new Error(`下载失败: ${response.status} ${response.statusText}`);
  }

  // 获取文件名
  const contentDisposition = response.headers.get("content-disposition");
  let filename = "";
  if (contentDisposition) {
    const matches = /filename\*=UTF-8''(.+)/.exec(contentDisposition);
    if (matches && matches[1]) {
      filename = decodeURIComponent(matches[1]);
    }
  }

  // 获取文件内容
  const blob = await response.blob();

  return {
    data: blob,
    headers: {
      "content-disposition": contentDisposition,
      "content-type": response.headers.get("content-type"),
    },
  };
}
