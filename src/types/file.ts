import { FileType } from "@/enums/FileTypeEnum";

// 文件信息接口
export interface FileInfo {
  id: number;
  name: string;
  type: FileType;
  size?: string;
  createTime: string;
  catalogue?: string;
}

// 创建文件请求参数
export interface CreateFileParams {
  name: string;
  type: FileType;
  catalogue?: string;
  size?: string;
}

// 文件列表请求参数
export interface FileListRequest {
  catalogue?: string;
  type?: FileType;
  keyword?: string;
  pageNo?: number;
  pageSize?: number;
}

// 文件列表响应
export interface FileListResponse {
  code: number;
  data: {
    list: FileInfo[];
    total: number;
  };
  msg: string;
}

export interface FileListParams {
  catalogue?: string;
  type?: number;
  name?: string;
  pageNo: number;
  pageSize: number;
  sortField?: string;
  sortOrder?: string;
  excludeShared?: boolean;
  ids?: string[];
}
