import React from "react";
import { Layout } from "antd";
import { SHARE_CONSTANTS } from "@/constants/fileConstants";

const { Content } = Layout;

interface ShareErrorContentProps {
  error: string;
}

const ShareErrorContent: React.FC<ShareErrorContentProps> = ({ error }) => {
  return (
    <Layout className="share-view">
      <Content className="share-content error-content">
        <div className="error-message">
          <h2>😢 {error}</h2>
          <p>提示：{SHARE_CONSTANTS.ERROR_MESSAGES.INVALID_LINK}</p>
        </div>
      </Content>
    </Layout>
  );
};

export default ShareErrorContent;
