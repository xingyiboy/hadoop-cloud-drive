import { Layout } from "antd";
import React from "react";

const { Content } = Layout;

const DownloadingContent: React.FC = () => {
  return (
    <Content className="content-main">
      <div>正在下载页面</div>
    </Content>
  );
};

export default DownloadingContent;
