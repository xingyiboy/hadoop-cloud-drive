import { Layout } from "antd";
import HeaderMain from "./component/HeaderMain";
import SiderMain from "./component/SiderMain";
import ContentMain from "./component/ContentMain";
import "./style/layout.scss";

function LayoutIndex() {
  return (
    <Layout style={{ minHeight: "100vh" }}>
      <HeaderMain />
      <Layout>
        <SiderMain />
        <ContentMain />
      </Layout>
    </Layout>
  );
}

export default LayoutIndex;
