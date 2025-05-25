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
    type: number;
  };
  status: DownloadStatus;
  progress: number;
  error?: string;
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
