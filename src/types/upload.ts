export type UploadStatus = "pending" | "uploading" | "success" | "failed";

export interface UploadTask {
  id: string;
  file: File;
  progress: number;
  status: UploadStatus;
  catalogue: string;
  createTime: number;
  error?: string;
  elapsedSeconds: number;
  sizeInBytes: number;
  deleteTask?: () => void;
}
