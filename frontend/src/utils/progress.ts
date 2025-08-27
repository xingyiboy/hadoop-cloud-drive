// 定义上传和下载速度（字节/秒）
export const UPLOAD_SPEED = 1024 * 1024; // 1MB/s
export const DOWNLOAD_SPEED = 2 * 1024 * 1024; // 2MB/s

// 将不同单位的大小转换为字节
export function convertToBytes(
  size: number,
  unit: "B" | "KB" | "MB" | "GB"
): number {
  const units = {
    B: 1,
    KB: 1024,
    MB: 1024 * 1024,
    GB: 1024 * 1024 * 1024,
  };
  return size * units[unit];
}

// 计算进度
export function calculateProgress(
  totalBytes: number,
  elapsedSeconds: number,
  speedBytesPerSecond: number,
  currentProgress: number,
  isUpload: boolean
): number {
  if (totalBytes <= 0) return 0;

  // 计算理论进度
  const expectedBytes = elapsedSeconds * speedBytesPerSecond;
  const theoreticalProgress = Math.min((expectedBytes / totalBytes) * 100, 100);

  // 如果是上传，直接返回实际进度
  if (isUpload) {
    return currentProgress;
  }

  // 如果是下载，使用平滑进度
  const smoothingFactor = 0.3; // 平滑因子，可以调整以改变进度更新的平滑程度
  const smoothedProgress =
    currentProgress + (theoreticalProgress - currentProgress) * smoothingFactor;

  // 确保进度不会超过99.9%，除非确实完成了下载
  if (smoothedProgress >= 99.9 && smoothedProgress < 100) {
    return 99.9;
  }

  return Math.min(Math.max(smoothedProgress, 0), 100);
}

// 格式化文件大小
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";

  const units = ["B", "KB", "MB", "GB", "TB"];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + units[i];
}
