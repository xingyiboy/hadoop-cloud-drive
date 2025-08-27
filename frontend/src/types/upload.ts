export type UploadStatus = "pending" | "uploading" | "success" | "failed";

export interface UploadTask {
  id: string;
  file: File;
  fileName: string; // 添加文件名字段，用于持久化存储
  progress: number;
  status: UploadStatus;
  catalogue: string;
  createTime: number;
  error?: string;
  elapsedSeconds: number;
  sizeInBytes: number;
  deleteTask?: () => void;
}
