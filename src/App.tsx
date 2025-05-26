/*
 * @Date: 2025-04-28 17:45:53
 * @LastEditors: xingyi && 2416820386@qq.com
 * @LastEditTime: 2025-04-29 10:19:41
 * @FilePath: \CloudDiskWeb\src\App.tsx
 */
import React, { useEffect, useState } from "react";
import { useRoutes, useLocation } from "react-router-dom";
import { ConfigProvider } from "antd";
import zhCN from "antd/es/locale/zh_CN";
import routes from "./routes";
import ShareDownloadModal from "@/components/ShareDownloadModal";

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
