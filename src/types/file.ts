import { FileType } from "@/enums/FileTypeEnum";

// 文件信息接口
export interface FileInfo {
  id: number;
  name: string;
  type: FileType;
  size?: string;
  catalogue: string;
  createTime: string;
  modifyDate?: string;
}

// 创建文件请求参数
export interface CreateFileRequest {
  name: string;
  type: FileType;
  catalogue: string;
  size?: string;
  file?: File;
}

// 文件列表请求参数
export interface FileListRequest {
  catalogue?: string;
}

// 文件列表响应
export interface FileListResponse {
  code: number;
  data: FileInfo[];
  msg: string;
}
