import React from "react";
import { useParams } from "react-router-dom";
import { Layout } from "antd";
import { useShareFiles } from "@/hooks/useShareFiles";
import ShareErrorContent from "./components/ShareErrorContent";
import ShareFileTable from "./components/ShareFileTable";

const { Content } = Layout;

const ShareView: React.FC = () => {
  const { shareKey } = useParams<{ shareKey: string }>();
  const { loading, fileList, error, handleDownload } = useShareFiles(shareKey);

  if (error) {
    return <ShareErrorContent error={error} />;
  }

  return (
    <Layout className="share-view">
      <Content className="share-content">
        <div className="share-header">
          <h2>分享文件</h2>
          <p>分享密钥：{shareKey}</p>
        </div>
        <ShareFileTable
          fileList={fileList}
          loading={loading}
          onDownload={handleDownload}
        />
      </Content>
    </Layout>
  );
};

export default ShareView;
