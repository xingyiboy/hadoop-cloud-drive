/**
 * 路由相关常量
 */

// 主应用路由路径（需要登录验证）
export const MAIN_APP_ROUTES = {
  ALL: "all",
  IMAGE: "image", 
  DOC: "doc",
  VIDEO: "video",
  MUSIC: "music",
  OTHER: "other",
  UPLOAD: "upload",
  UPLOAD_UPLOADING: "upload/uploading",
  UPLOAD_SUCCESS: "upload/success", 
  UPLOAD_FAILED: "upload/failed",
} as const;

// 下载页面路由路径
export const DOWNLOAD_ROUTES = {
  DOWNLOADING: "download/downloading",
  DOWNLOADED: "download/downloaded", 
  FAILED: "download/failed",
} as const;

// 认证相关路由
export const AUTH_ROUTES = {
  LOGIN: "/login",
  REGISTER: "/register",
} as const;

// 公共路由（不需要登录验证）
export const PUBLIC_ROUTES = {
  SHARE: "/share/:shareKey",
} as const;

// 主应用路径数组（用于动态生成路由）
export const MAIN_APP_PATHS = Object.values(MAIN_APP_ROUTES);

// 下载页面路径数组（用于动态生成路由）
export const DOWNLOAD_PATHS = Object.values(DOWNLOAD_ROUTES);

// 默认重定向路径
export const DEFAULT_REDIRECT = `/${MAIN_APP_ROUTES.ALL}`;

// 路由标题映射
export const ROUTE_TITLES = {
  [MAIN_APP_ROUTES.ALL]: "全部文件",
  [MAIN_APP_ROUTES.IMAGE]: "图片",
  [MAIN_APP_ROUTES.DOC]: "文档", 
  [MAIN_APP_ROUTES.VIDEO]: "视频",
  [MAIN_APP_ROUTES.MUSIC]: "音乐",
  [MAIN_APP_ROUTES.OTHER]: "其他",
  [MAIN_APP_ROUTES.UPLOAD]: "上传",
  [DOWNLOAD_ROUTES.DOWNLOADING]: "下载中",
  [DOWNLOAD_ROUTES.DOWNLOADED]: "已下载",
  [DOWNLOAD_ROUTES.FAILED]: "下载失败",
} as const;
