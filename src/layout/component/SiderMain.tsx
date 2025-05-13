/*
 * @Date: 2025-05-09 12:03:12
 * @LastEditors: xingyi && 2416820386@qq.com
 * @LastEditTime: 2025-05-12 16:16:14
 * @FilePath: \CloudDiskWeb\src\layout\component\SiderMain.tsx
 */
const { Sider } = Layout;
import { Layout, Menu } from "antd";
import { ShareAltOutlined, RestOutlined } from "@ant-design/icons";
import type { MenuProps } from "antd";
import React from "react";
import "../style/sider-main.scss";

const items2: MenuProps["items"] = [
  { key: "1", icon: "", label: "全部文件" },
  { key: "2", icon: "", label: "图片" },
  { key: "3", icon: "", label: "音频" },
  { key: "4", icon: "", label: "视频" },
  { key: "5", icon: "", label: "文档" },
  { key: "6", icon: "", label: "种子" },
  { key: "7", icon: "", label: "更多" },
  { key: "8", icon: React.createElement(ShareAltOutlined), label: "我的分享" },
  { key: "9", icon: React.createElement(RestOutlined), label: "回收站" },
];

console.log(items2);

function SiderMain() {
  return (
    <Sider width={200} style={{ background: "#fff" }}>
      <Menu
        mode="inline"
        defaultSelectedKeys={["1"]}
        defaultOpenKeys={["1"]}
        style={{ height: "100%", borderRight: 0 }}
        items={items2}
      />
    </Sider>
  );
}

export default SiderMain;
