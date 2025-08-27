/*
 * @Date: 2025-01-15 20:00:00
 * @LastEditors: xingyi && 2416820386@qq.com
 * @LastEditTime: 2025-01-15 20:00:00
 * @FilePath: \CloudDiskWeb\src\constants\layoutConstants.ts
 */

import {
  FolderOutlined,
  FileImageOutlined,
  FileTextOutlined,
  PlaySquareOutlined,
  CustomerServiceOutlined,
  FileUnknownOutlined,
  DeleteOutlined,
  ShareAltOutlined,
  CloudUploadOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  CloudDownloadOutlined,
} from "@ant-design/icons";
import { FileType } from "../enums/FileTypeEnum";

// 标签页配置
export const TAB_CONFIG = {
  DISK: 1,
  UPLOAD: 3,
  DOWNLOAD: 4,
} as const;

// 导航菜单项配置
export const NAV_MENU_ITEMS = [
  { key: "1", label: "网盘" },
  { key: "3", label: "正在上传" },
  { key: "4", label: "正在下载" },
];

// 网盘页面菜单项配置
export const DISK_MENU_ITEMS = [
  {
    key: "all",
    icon: FolderOutlined,
    label: "全部文件",
    fileType: undefined,
  },
  {
    key: "image",
    icon: FileImageOutlined,
    label: "图片",
    fileType: FileType.IMAGE,
  },
  {
    key: "document",
    icon: FileTextOutlined,
    label: "文档",
    fileType: FileType.DOCUMENT,
  },
  {
    key: "video",
    icon: PlaySquareOutlined,
    label: "视频",
    fileType: FileType.VIDEO,
  },
  {
    key: "audio",
    icon: CustomerServiceOutlined,
    label: "音频",
    fileType: FileType.AUDIO,
  },
  {
    key: "other",
    icon: FileUnknownOutlined,
    label: "其他",
    fileType: FileType.OTHER,
  },
  {
    key: "recycle",
    icon: DeleteOutlined,
    label: "回收站",
    fileType: FileType.RECYCLE,
  },
  {
    key: "share",
    icon: ShareAltOutlined,
    label: "我的分享",
    fileType: FileType.SHARE,
  },
];

// 上传页面菜单项配置
export const UPLOAD_MENU_ITEMS = [
  {
    key: "upload/uploading",
    icon: CloudUploadOutlined,
    label: "正在上传",
  },
  {
    key: "upload/success",
    icon: CheckCircleOutlined,
    label: "已上传",
  },
  {
    key: "upload/failed",
    icon: CloseCircleOutlined,
    label: "上传失败",
  },
];

// 下载页面菜单项配置
export const DOWNLOAD_MENU_ITEMS = [
  {
    key: "download/downloading",
    icon: CloudDownloadOutlined,
    label: "正在下载",
  },
  {
    key: "download/downloaded",
    icon: CheckCircleOutlined,
    label: "已下载",
  },
  {
    key: "download/failed",
    icon: CloseCircleOutlined,
    label: "下载失败",
  },
];

// 用户菜单项配置
export const USER_MENU_ITEMS = [
  {
    key: "profile",
    label: "个人信息",
  },
  {
    type: "divider" as const,
  },
  {
    key: "logout",
    label: "退出登录",
  },
];

// 默认头像
export const DEFAULT_AVATAR = "https://ts3.tc.mm.bing.net/th/id/OIP-C.g5M-iZUiocFCi9YAzojtRAAAAA?w=250&h=250&c=8&rs=1&qlt=90&o=6&dpr=1.5&pid=3.1&rm=2";

// Logo URL
export const LOGO_URL = "https://tse2-mm.cn.bing.net/th/id/OIP-C.sSgrwKorjXKJfCZlF_ImcgAAAA?w=197&h=197&c=7&r=0&o=7&cb=iwp2&dpr=1.5&pid=1.7&rm=3";

// 缓存配置
export const CACHE_CONFIG = {
  PROFILE_UPDATE_TIME_KEY: "profileUpdateTime",
  CURRENT_PATH_KEY: "currentPath",
  PROFILE_CACHE_DURATION: 60 * 60 * 1000, // 1小时
  PATH_CHECK_INTERVAL: 1000, // 1秒
} as const;
