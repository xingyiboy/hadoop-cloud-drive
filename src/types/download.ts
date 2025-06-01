import { FileType } from "../enums/FileTypeEnum";

export interface DownloadFile {
  name: string;
  size: number;
  type: number;
}

export type DownloadStatus =
  | "pending"
  | "downloading"
  | "downloaded"
  | "failed";

export interface DownloadTask {
  id: string;
  file: {
    name: string;
    size: number;
    type: any; // 这里使用实际的 FileType 类型
  };
  status: DownloadStatus;
  progress: number;
  error?: string;
  elapsedSeconds: number;
  sizeInBytes: number;
  deleteTask: () => void;
}

export interface DownloadStore {
  tasks: DownloadTask[];
  addTasks: (tasks: DownloadTask[]) => void;
  updateTaskProgress: (taskId: string, progress: number) => void;
  updateTaskStatus: (
    taskId: string,
    status: DownloadStatus,
    error?: string
  ) => void;
  clearTasksByStatus: (status?: DownloadStatus) => void;
}
