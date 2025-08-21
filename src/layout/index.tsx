import { Layout } from "antd";
import { useState } from "react";
import HeaderMain from "./component/HeaderMain";
import SiderMain from "./component/SiderMain";
import ContentMain from "./component/ContentMain";
import "./style/layout.scss";
import { FileType } from "@/enums/FileTypeEnum";

function LayoutApp() {
  const [currentFileType, setCurrentFileType] = useState<FileType | undefined>(
    undefined
  );
  const [activeTab, setActiveTab] = useState<number>(1);

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
          <ContentMain fileType={currentFileType} activeTab={activeTab} />
        </Layout>
      </Layout>
    </Layout>
  );
}

export default LayoutApp;
