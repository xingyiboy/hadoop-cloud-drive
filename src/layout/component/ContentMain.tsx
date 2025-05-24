import { Layout } from "antd";
import { useState } from "react";
import DiskContent from "../../components/DiskContent";
import ShareContent from "../../components/ShareContent";
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
      case 2:
        return <ShareContent />;
      case 3:
        return <UploadingContent />;
      case 4:
        return <DownloadingContent />;
      default:
        return <DiskContent fileType={fileType} />;
    }
  };

  return <>{renderContent()}</>;
};

export default ContentMain;
