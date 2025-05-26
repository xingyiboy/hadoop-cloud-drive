import { Layout } from "antd";
import { useState, useCallback } from "react";
import HeaderMain from "./component/HeaderMain";
import SiderMain from "./component/SiderMain";
import ContentMain from "./component/ContentMain";
import { FileType } from "../enums/FileTypeEnum";
import "./style/layout-main.scss";

const LayoutMain = () => {
  const [fileType, setFileType] = useState<FileType | undefined>(undefined);
  const [activeTab, setActiveTab] = useState<number>(1);

  const handleTabChange = useCallback((key: number) => {
    setActiveTab(key);
    if (key !== 1) {
      setFileType(undefined);
    }
  }, []);

  return (
    <Layout className="layout-main">
      <HeaderMain activeTab={activeTab} onTabChange={handleTabChange} />
      <Layout>
        {activeTab === 1 && (
          <SiderMain onFileTypeChange={setFileType} activeTab={activeTab} />
        )}
        <ContentMain fileType={fileType} activeTab={activeTab} />
      </Layout>
    </Layout>
  );
};

export default LayoutMain;
