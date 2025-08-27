/*
 * @Date: 2025-05-24 21:37:25
 * @LastEditors: xingyi && 2416820386@qq.com
 * @LastEditTime: 2025-05-26 10:20:41
 * @FilePath: \CloudDiskWeb\src\layout\component\ContentMain.tsx
 */
import { Layout } from "antd";
import { useState } from "react";
import DiskContent from "@/views/main/components/DiskContent";
import UploadingContent from "@/views/upload/components/UploadingContent";
import DownloadingContent from "@/views/download/components/DownloadingContent";
import { FileType } from "@/enums/FileTypeEnum";

const { Content } = Layout;

interface ContentMainProps {
  fileType: FileType | undefined;
  activeTab: number;
  onTabChange?: (tab: number) => void;
}

const ContentMain: React.FC<ContentMainProps> = ({ fileType, activeTab, onTabChange }) => {
  const renderContent = () => {
    switch (activeTab) {
      case 1:
        return <DiskContent fileType={fileType} onTabChange={onTabChange} />;
      case 3:
        return <UploadingContent />;
      case 4:
        return <DownloadingContent onTabChange={onTabChange} />;
      default:
        return <DiskContent fileType={fileType} onTabChange={onTabChange} />;
    }
  };

  return <Content className="content-main">{renderContent()}</Content>;
};

export default ContentMain;
