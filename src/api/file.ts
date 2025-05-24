import request from "@/utils/request";
import { ApiResponse } from "./index";
import { CreateFileRequest, FileListRequest, FileInfo } from "@/types/file";

// 创建文件或目录
export const createFile = (
  data: CreateFileRequest
): Promise<ApiResponse<number>> => {
  const formData = new FormData();
  formData.append("name", data.name);
  formData.append("type", data.type.toString());
  formData.append("catalogue", data.catalogue);

  if (data.size) {
    formData.append("size", data.size);
  }

  if (data.file) {
    formData.append("file", data.file);
  }

  return request.post("/admin-api/system/hadoop-file/create", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

// 获取文件列表
export const getFileList = (
  params: FileListRequest
): Promise<ApiResponse<FileInfo[]>> => {
  return request.get("/admin-api/system/hadoop-file/list", { params });
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
