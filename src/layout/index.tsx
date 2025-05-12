import { Breadcrumb, Layout } from "antd";

const { Header, Content, Sider } = Layout;
import HeaderMain from "./component/HeaderMain";
import SiderMain from "./component/SiderMain";
import ContentMain from "./component/ContentMain";

function Main() {
  return (
    <Layout style={{ height: "100%", borderRight: 0 }}>
      <HeaderMain />
      <Layout>
        <SiderMain />
        <Layout style={{ padding: "0 24px 24px" }}>
          <Breadcrumb
            items={[{ title: "Home" }, { title: "List" }, { title: "App" }]}
            style={{ margin: "16px 0" }}
          />
          <ContentMain />
        </Layout>
      </Layout>
    </Layout>
  );
}

export default Main;
