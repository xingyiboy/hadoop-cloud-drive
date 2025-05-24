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
  onFileTypeChange?: (type: FileType | undefined) => void;
  activeTab: number;
}

const SiderMain: React.FC<SiderMainProps> = ({
  onFileTypeChange,
  activeTab,
}) => {
  // 网盘页面的菜单项
  const diskMenuItems = [
    {
      key: "all",
      label: "全部文件",
    },
    {
      key: "image",
      label: "图片",
    },
    {
      key: "document",
      label: "文档",
    },
    {
      key: "video",
      label: "视频",
    },
    {
      key: "audio",
      label: "音频",
    },
    {
      key: "other",
      label: "其他",
    },
  ];

  // 分享页面的菜单项
  const shareMenuItems = [
    {
      key: "shared_by_me",
      label: "我的分享",
    },
    {
      key: "shared_to_me",
      label: "收到的分享",
    },
  ];

  // 上传页面的菜单项
  const uploadMenuItems = [
    {
      key: "uploading",
      label: "正在上传",
    },
    {
      key: "uploaded",
      label: "已上传",
    },
    {
      key: "upload_failed",
      label: "上传失败",
    },
  ];

  // 下载页面的菜单项
  const downloadMenuItems = [
    {
      key: "downloading",
      label: "正在下载",
    },
    {
      key: "downloaded",
      label: "已下载",
    },
    {
      key: "download_failed",
      label: "下载失败",
    },
  ];

  // 根据当前标签页获取对应的菜单项
  const getMenuItems = () => {
    switch (activeTab) {
      case 1:
        return diskMenuItems;
      case 2:
        return shareMenuItems;
      case 3:
        return uploadMenuItems;
      case 4:
        return downloadMenuItems;
      default:
        return [];
    }
  };

  // 处理菜单点击
  const handleMenuClick = ({ key }: { key: string }) => {
    if (activeTab === 1 && onFileTypeChange) {
      // 只在网盘页面处理文件类型切换
      switch (key) {
        case "all":
          onFileTypeChange(undefined);
          break;
        case "image":
          onFileTypeChange(FileType.IMAGE);
          break;
        case "document":
          onFileTypeChange(FileType.DOCUMENT);
          break;
        case "video":
          onFileTypeChange(FileType.VIDEO);
          break;
        case "audio":
          onFileTypeChange(FileType.AUDIO);
          break;
        case "other":
          onFileTypeChange(FileType.OTHER);
          break;
      }
    }
  };

  return (
    <Sider className="sider-main" width={200}>
      <Menu
        mode="inline"
        style={{ height: "100%", borderRight: 0 }}
        items={getMenuItems()}
        onClick={handleMenuClick}
      />
    </Sider>
  );
};

export default SiderMain;
