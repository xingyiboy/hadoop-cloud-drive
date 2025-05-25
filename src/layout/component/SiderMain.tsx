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
import React, { useState } from "react";
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
  const [selectedMenuKey, setSelectedMenuKey] = useState<string>("all");

  // 获取当前选中的菜单项
  const getSelectedKey = () => {
    const diskKeys = ["all", "image", "document", "video", "audio", "other"];
    const path = location.pathname.split("/");
    const currentKey = path[path.length - 1];

    // 如果是网盘页面的菜单项，使用状态中保存的选中项
    if (activeTab === 1 && diskKeys.includes(selectedMenuKey)) {
      return selectedMenuKey;
    }

    return currentKey;
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
      key: "success",
      icon: <CheckCircleOutlined />,
      label: "已上传",
    },
    {
      key: "failed",
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
    // 网盘页面的特殊处理
    const diskKeys = ["all", "image", "document", "video", "audio", "other"];
    if (diskKeys.includes(key)) {
      setSelectedMenuKey(key);
      if (onFileTypeChange) {
        if (key === "all") {
          onFileTypeChange(undefined);
        } else {
          onFileTypeChange(
            FileType[key.toUpperCase() as keyof typeof FileType]
          );
        }
      }
      return;
    }

    // 其他页面的正常跳转处理
    if (key.startsWith("upload/") || key === "upload") {
      navigate(`/${key}`);
    } else if (["uploading", "success", "failed"].includes(key)) {
      navigate(`/upload/${key}`);
    } else {
      navigate(`/${key}`);
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
