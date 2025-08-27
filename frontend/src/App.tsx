/*
 * @Date: 2025-04-28 17:45:53
 * @LastEditors: xingyi && 2416820386@qq.com
 * @LastEditTime: 2025-04-29 10:19:41
 * @FilePath: \CloudDiskWeb\src\App.tsx
 */
import React, { useEffect, useState, useCallback } from "react";
import { useRoutes, useLocation } from "react-router-dom";
import { ConfigProvider } from "antd";
import zhCN from "antd/es/locale/zh_CN";
import routes from "./routes";
import ShareDownloadModal from "@/components/ShareDownloadModal";
import { useUploadStore } from "@/store/uploadStore";

// 路由组件
const RouterElement: React.FC = () => {
  const element = useRoutes(routes);
  return element;
};

const App: React.FC = () => {
  const element = useRoutes(routes);
  const location = useLocation();
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareKey, setShareKey] = useState<string | null>(null);
  
  // 获取上传相关方法
  const { tasks, updateTaskStatus, stopProgressUpdate } = useUploadStore();

  // 取消所有正在上传的任务并设置为失败状态
  const cancelUploadingTasks = useCallback(() => {
    const uploadingTasks = tasks.filter(task => task.status === "uploading");
    
    // 停止进度更新
    stopProgressUpdate();
    
    // 将所有正在上传的任务设置为失败状态
    uploadingTasks.forEach(task => {
      updateTaskStatus(task.id, "failed", "刷新中断");
    });
  }, [tasks, stopProgressUpdate, updateTaskStatus]);

  useEffect(() => {
    // 检查URL是否包含分享链接
    const checkShareLink = () => {
      const path = window.location.pathname;
      const segments = path.split("/");
      const shareIndex = segments.indexOf("share");
      if (shareIndex !== -1 && segments.length > shareIndex + 1) {
        const key = segments[shareIndex + 1];
        setShareKey(key);
        setShowShareModal(true);
        // 清理URL
        window.history.replaceState(null, "", "/");
      }
    };

    checkShareLink();
  }, [location.pathname]);

  // 添加页面刷新/关闭时的处理逻辑
  useEffect(() => {
    const handleBeforeUnload = () => {
      // 取消所有正在上传的任务
      cancelUploadingTasks();
    };

    // 监听页面即将卸载事件
    window.addEventListener('beforeunload', handleBeforeUnload);

    // 清理函数
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [cancelUploadingTasks]); // 依赖cancelUploadingTasks函数

  return (
    <ConfigProvider locale={zhCN}>
      <RouterElement />
      {shareKey && (
        <ShareDownloadModal
          visible={showShareModal}
          shareKey={shareKey}
          onCancel={() => {
            setShowShareModal(false);
            setShareKey(null);
          }}
        />
      )}
    </ConfigProvider>
  );
};

export default App;
