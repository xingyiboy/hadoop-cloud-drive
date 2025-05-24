/*
 * @Date: 2025-05-09 12:03:12
 * @LastEditors: xingyi && 2416820386@qq.com
 * @LastEditTime: 2025-05-12 16:16:14
 * @FilePath: \CloudDiskWeb\src\layout\component\SiderMain.tsx
 */
import { Layout, Menu } from "antd";
import {
  ShareAltOutlined,
  RestOutlined,
  FileImageOutlined,
  CustomerServiceOutlined,
  PlaySquareOutlined,
  FileTextOutlined,
  CloudDownloadOutlined,
  FileUnknownOutlined,
  FolderOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import React from "react";
import "../style/sider-main.scss";
import { FileType } from "@/enums/FileTypeEnum";

const { Sider } = Layout;

interface SiderMainProps {
  onFileTypeChange: (type: FileType | undefined) => void;
}

const SiderMain: React.FC<SiderMainProps> = ({ onFileTypeChange }) => {
  const items: MenuProps["items"] = [
    {
      key: "all",
      icon: React.createElement(FolderOutlined),
      label: "全部文件",
      onClick: () => onFileTypeChange(undefined),
    },
    {
      key: String(FileType.IMAGE),
      icon: React.createElement(FileImageOutlined),
      label: "图片",
      onClick: () => onFileTypeChange(FileType.IMAGE),
    },
    {
      key: String(FileType.AUDIO),
      icon: React.createElement(CustomerServiceOutlined),
      label: "音频",
      onClick: () => onFileTypeChange(FileType.AUDIO),
    },
    {
      key: String(FileType.VIDEO),
      icon: React.createElement(PlaySquareOutlined),
      label: "视频",
      onClick: () => onFileTypeChange(FileType.VIDEO),
    },
    {
      key: String(FileType.DOCUMENT),
      icon: React.createElement(FileTextOutlined),
      label: "文档",
      onClick: () => onFileTypeChange(FileType.DOCUMENT),
    },
    {
      key: String(FileType.PLANT),
      icon: React.createElement(CloudDownloadOutlined),
      label: "种子",
      onClick: () => onFileTypeChange(FileType.PLANT),
    },
    {
      key: String(FileType.OTHER),
      icon: React.createElement(FileUnknownOutlined),
      label: "其他",
      onClick: () => onFileTypeChange(FileType.OTHER),
    },
    {
      key: "share",
      icon: React.createElement(ShareAltOutlined),
      label: "我的分享",
    },
    {
      key: "recycle",
      icon: React.createElement(RestOutlined),
      label: "回收站",
    },
  ];

  return (
    <Sider width={200} style={{ background: "#fff" }}>
      <Menu
        mode="inline"
        defaultSelectedKeys={["all"]}
        style={{ height: "100%", borderRight: 0 }}
        items={items}
      />
    </Sider>
  );
};

export default SiderMain;
