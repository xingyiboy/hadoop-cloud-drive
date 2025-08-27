/**
 * 文件操作相关常量
 */

// 分页默认配置
export const DEFAULT_PAGINATION = {
  current: 1,
  pageSize: 10,
  total: 0,
};

// 文件操作类型
export const FILE_OPERATION_TYPES = {
  UPLOAD: 'upload',
  DOWNLOAD: 'download',
  SHARE: 'share',
  DELETE: 'delete',
  RENAME: 'rename',
  MOVE: 'move',
  RESTORE: 'restore',
} as const;

// 视图类型
export const VIEW_TYPES = {
  LIST: 'list',
  GRID: 'grid',
} as const;

// 文件状态
export const FILE_STATUS = {
  PENDING: 'pending',
  UPLOADING: 'uploading',
  DOWNLOADING: 'downloading',
  SUCCESS: 'success',
  DOWNLOADED: 'downloaded',
  FAILED: 'failed',
} as const;

// 特殊文件类型检查
export const FILE_TYPE_CHECKS = {
  isRecycleBin: (type: number | undefined): boolean => type === 7,
  isSharedFiles: (type: number | undefined): boolean => type === 8,
} as const;

// 文件图标映射
export const FILE_ICONS = {
  DIRECTORY: "📁",
  IMAGE: "🖼️", 
  AUDIO: "🎵",
  VIDEO: "🎬",
  DOCUMENT: "📄",
  PLANT: "🌱",
  FILE: "📎",
} as const;

// 分享页面相关常量
export const SHARE_CONSTANTS = {
  ERROR_MESSAGES: {
    LOAD_FAILED: "获取分享文件失败，请检查分享链接是否正确",
    DOWNLOAD_FAILED: "下载失败",
    INVALID_LINK: "请确认分享链接是否完整，或者该分享可能已经被取消。",
  },
  API_ENDPOINTS: {
    GET_SHARE_FILES: (shareKey: string) => `/admin-api/system/hadoop-file/share-link/${shareKey}`,
    DOWNLOAD_SHARED: (shareKey: string, fileName: string) => 
      `/admin-api/system/hadoop-file/download-shared/${shareKey}/${fileName}`,
  },
} as const;