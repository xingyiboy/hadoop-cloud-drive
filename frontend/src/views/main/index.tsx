/*
 * @Date: 2025-01-27 17:45:53
 * @LastEditors: xingyi && 2416820386@qq.com
 * @LastEditTime: 2025-01-27 17:45:53
 * @FilePath: \CloudDiskWeb\src\views\main\index.tsx
 */
import { Layout } from "antd";
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import HeaderMain from "@/layout/HeaderMain";
import SiderMain from "@/layout/SiderMain";
import ContentMain from "@/layout/ContentMain";

import { FileType } from "@/enums/FileTypeEnum";

function MainView() {
  const location = useLocation();
  const [currentFileType, setCurrentFileType] = useState<FileType | undefined>(
    undefined
  );
  const [activeTab, setActiveTab] = useState<number>(1);

  // 根据当前路径初始化activeTab
  useEffect(() => {
    const path = location.pathname;
    if (path.startsWith("/upload/")) {
      setActiveTab(3);
    } else if (path.startsWith("/download/")) {
      setActiveTab(4);
    } else {
      setActiveTab(1);
    }
  }, [location.pathname]);

  const handleTabChange = (key: number) => {
    setActiveTab(key);
    if (key !== 1) {
      setCurrentFileType(undefined);
    }
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <HeaderMain activeTab={activeTab} onTabChange={handleTabChange} />
      <Layout>
        <SiderMain
          onFileTypeChange={setCurrentFileType}
          activeTab={activeTab}
        />
        <Layout style={{ padding: "0 24px 24px" }}>
          <ContentMain fileType={currentFileType} activeTab={activeTab} onTabChange={handleTabChange} />
        </Layout>
      </Layout>
    </Layout>
  );
}

export default MainView;
