/**
 * 文件相关工具函数
 */
import React from "react";
import { FileType } from "@/enums/FileTypeEnum";
import dayjs from "dayjs";

/**
 * 获取文件图标
 */
export const getFileIcon = (type: FileType): JSX.Element => {
  switch (type) {
    case FileType.DIRECTORY:
      return React.createElement("span", { className: "folder-icon" }, "📁");
    case FileType.IMAGE:
      return React.createElement("span", { className: "image-icon" }, "🖼️");
    case FileType.AUDIO:
      return React.createElement("span", { className: "audio-icon" }, "🎵");
    case FileType.VIDEO:
      return React.createElement("span", { className: "video-icon" }, "🎬");
    case FileType.DOCUMENT:
      return React.createElement("span", { className: "document-icon" }, "📄");
    case FileType.PLANT:
      return React.createElement("span", { className: "plant-icon" }, "🌱");
    default:
      return React.createElement("span", { className: "file-icon" }, "📎");
  }
};

/**
 * 格式化时间戳
 */
export const formatDateTime = (timestamp: number): string => {
  if (!timestamp) return "-";
  // 如果是13位时间戳，需要除以1000转换为正确的时间
  const normalizedTimestamp =
    String(timestamp).length === 13 ? timestamp / 1000 : timestamp;
  return dayjs(normalizedTimestamp * 1000).format("YYYY-MM-DD HH:mm:ss");
};

/**
 * 格式化持续时间
 */
export const formatDuration = (milliseconds: number): string => {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}小时${minutes % 60}分钟`;
  } else if (minutes > 0) {
    return `${minutes}分钟${seconds % 60}秒`;
  } else {
    return `${seconds}秒`;
  }
};

/**
 * 生成统计信息消息
 */
export const generateStatsMessage = (
  stats: { successCount: number; failedCount: number },
  duration: number,
  type: "upload" | "download"
): string => {
  const actionText = type === "upload" ? "上传" : "下载";
  return `${actionText}完成！用时：${formatDuration(duration)}，成功：${
    stats.successCount
  }个，失败：${stats.failedCount}个`;
};

/**
 * 计算任务统计
 */
export const calculateTaskStats = (tasks: any[]) => {
  return {
    successCount: tasks.filter(
      (task) => task.status === "success" || task.status === "downloaded"
    ).length,
    failedCount: tasks.filter((task) => task.status === "failed").length,
  };
};

/**
 * 复制文本到剪贴板
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    // 优先使用 navigator.clipboard
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // 在非 HTTPS 环境下使用传统方法
      return fallbackCopy(text);
    }
  } catch (error) {
    console.error("Copy error:", error);
    return fallbackCopy(text);
  }
};

/**
 * 传统复制方法
 */
const fallbackCopy = (text: string): boolean => {
  const tempInput = document.createElement("input");
  tempInput.style.position = "fixed";
  tempInput.style.opacity = "0";
  tempInput.value = text;
  document.body.appendChild(tempInput);

  try {
    tempInput.select();
    tempInput.setSelectionRange(0, 99999);
    const success = document.execCommand("copy");
    document.body.removeChild(tempInput);
    return success;
  } catch (err) {
    document.body.removeChild(tempInput);
    return false;
  }
};
