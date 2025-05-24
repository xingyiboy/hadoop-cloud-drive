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

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <HeaderMain />
      <Layout>
        <SiderMain onFileTypeChange={setCurrentFileType} />
        <Layout style={{ padding: "0 24px 24px" }}>
          <ContentMain fileType={currentFileType} />
        </Layout>
      </Layout>
    </Layout>
  );
}

export default LayoutApp;
