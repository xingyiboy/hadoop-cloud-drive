/*
 * @Date: 2025-05-24 21:37:25
 * @LastEditors: xingyi && 2416820386@qq.com
 * @LastEditTime: 2025-05-26 10:20:41
 * @FilePath: \CloudDiskWeb\src\layout\component\ContentMain.tsx
 */
import { Layout } from "antd";
import { useState } from "react";
import DiskContent from "../../components/DiskContent";
import UploadingContent from "../../components/UploadingContent";
import DownloadingContent from "../../components/DownloadingContent";
import { FileType } from "../../enums/FileTypeEnum";

const { Content } = Layout;

interface ContentMainProps {
  fileType: FileType | undefined;
  activeTab: number;
}

const ContentMain: React.FC<ContentMainProps> = ({ fileType, activeTab }) => {
  const renderContent = () => {
    switch (activeTab) {
      case 1:
        return <DiskContent fileType={fileType} />;
      case 3:
        return <UploadingContent />;
      case 4:
        return <DownloadingContent />;
      default:
        return <DiskContent fileType={fileType} />;
    }
  };

  return <Content className="content-main">{renderContent()}</Content>;
};

export default ContentMain;
