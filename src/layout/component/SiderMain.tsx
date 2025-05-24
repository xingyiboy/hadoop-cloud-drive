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
  CloudUploadOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import React from "react";
import "../style/sider-main.scss";
import { FileType } from "@/enums/FileTypeEnum";
import { useNavigate, useLocation } from "react-router-dom";

const { Sider } = Layout;

interface SiderMainProps {
  onFileTypeChange?: (type: FileType | undefined) => void;
  activeTab: number;
}

const SiderMain: React.FC<SiderMainProps> = ({
  onFileTypeChange,
  activeTab,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  // 获取当前选中的菜单项
  const getSelectedKey = () => {
    const path = location.pathname.split("/");
    return path[path.length - 1];
  };

  // 网盘页面的菜单项
  const diskMenuItems = [
    {
      key: "all",
      icon: <FolderOutlined />,
      label: "全部文件",
    },
    {
      key: "image",
      icon: <FileImageOutlined />,
      label: "图片",
    },
    {
      key: "document",
      icon: <FileTextOutlined />,
      label: "文档",
    },
    {
      key: "video",
      icon: <PlaySquareOutlined />,
      label: "视频",
    },
    {
      key: "audio",
      icon: <CustomerServiceOutlined />,
      label: "音频",
    },
    {
      key: "other",
      icon: <FileUnknownOutlined />,
      label: "其他",
    },
  ];

  // 分享页面的菜单项
  const shareMenuItems = [
    {
      key: "shared_by_me",
      icon: <ShareAltOutlined />,
      label: "我的分享",
    },
    {
      key: "shared_to_me",
      icon: <ShareAltOutlined />,
      label: "收到的分享",
    },
  ];

  // 上传页面的菜单项
  const uploadMenuItems = [
    {
      key: "uploading",
      icon: <CloudUploadOutlined />,
      label: "正在上传",
    },
    {
      key: "uploaded",
      icon: <CheckCircleOutlined />,
      label: "已上传",
    },
    {
      key: "upload_failed",
      icon: <CloseCircleOutlined />,
      label: "上传失败",
    },
  ];

  // 下载页面的菜单项
  const downloadMenuItems = [
    {
      key: "downloading",
      icon: <CloudDownloadOutlined />,
      label: "正在下载",
    },
    {
      key: "downloaded",
      icon: <CheckCircleOutlined />,
      label: "已下载",
    },
    {
      key: "download_failed",
      icon: <CloseCircleOutlined />,
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
    if (activeTab === 1) {
      // 网盘页面处理文件类型切换
      switch (key) {
        case "all":
          onFileTypeChange?.(undefined);
          navigate("/all");
          break;
        case "image":
          onFileTypeChange?.(FileType.IMAGE);
          navigate("/image");
          break;
        case "document":
          onFileTypeChange?.(FileType.DOCUMENT);
          navigate("/document");
          break;
        case "video":
          onFileTypeChange?.(FileType.VIDEO);
          navigate("/video");
          break;
        case "audio":
          onFileTypeChange?.(FileType.AUDIO);
          navigate("/music");
          break;
        case "other":
          onFileTypeChange?.(FileType.OTHER);
          navigate("/other");
          break;
      }
    } else if (activeTab === 3) {
      // 上传页面处理状态切换
      navigate(`/upload/${key}`);
    } else if (activeTab === 4) {
      // 下载页面处理状态切换
      navigate(`/download/${key}`);
    }
  };

  return (
    <Sider className="sider-main" width={200}>
      <Menu
        mode="inline"
        style={{ height: "100%", borderRight: 0 }}
        items={getMenuItems()}
        onClick={handleMenuClick}
        selectedKeys={[getSelectedKey()]}
      />
    </Sider>
  );
};

export default SiderMain;
