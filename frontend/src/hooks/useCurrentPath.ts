/*
 * @Date: 2025-01-15 20:00:00
 * @LastEditors: xingyi && 2416820386@qq.com
 * @LastEditTime: 2025-01-15 20:00:00
 * @FilePath: \CloudDiskWeb\src\hooks\useCurrentPath.ts
 */

import { useState, useEffect } from "react";
import { CACHE_CONFIG } from "@/constants/layoutConstants";

export const useCurrentPath = () => {
  const [currentPath, setCurrentPath] = useState(
    localStorage.getItem(CACHE_CONFIG.CURRENT_PATH_KEY) || "/"
  );

  useEffect(() => {
    const handleStorageChange = () => {
      const newPath = localStorage.getItem(CACHE_CONFIG.CURRENT_PATH_KEY) || "/";
      setCurrentPath(newPath);
    };

    // 添加事件监听
    window.addEventListener("storage", handleStorageChange);

    // 创建一个定时器每秒检查一次
    const interval = setInterval(() => {
      const newPath = localStorage.getItem(CACHE_CONFIG.CURRENT_PATH_KEY) || "/";
      if (newPath !== currentPath) {
        setCurrentPath(newPath);
      }
    }, CACHE_CONFIG.PATH_CHECK_INTERVAL);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, [currentPath]);

  return currentPath;
};
