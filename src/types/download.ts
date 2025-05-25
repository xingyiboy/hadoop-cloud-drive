export interface DownloadFile {
  name: string;
  size: number;
}

export interface DownloadTask {
  id: string;
  file: DownloadFile;
  status: "downloading" | "downloaded" | "failed";
  progress: number;
  error?: string;
}
