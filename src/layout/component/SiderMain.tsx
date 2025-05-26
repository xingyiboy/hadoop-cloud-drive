/*
 * @Date: 2025-05-09 12:03:12
 * @LastEditors: xingyi && 2416820386@qq.com
 * @LastEditTime: 2025-05-26 10:19:54
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
  DeleteOutlined,
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
    const diskKeys = [
      "all",
      "image",
      "document",
      "video",
      "audio",
      "other",
      "recycle",
    ];
    const path = location.pathname;

    // 如果是网盘页面的菜单项，使用状态中保存的选中项
    if (activeTab === 1 && diskKeys.includes(selectedMenuKey)) {
      return selectedMenuKey;
    }

    // 如果是上传或下载页面，返回完整的路径key
    if (path.startsWith("/upload/") || path.startsWith("/download/")) {
      return path.substring(1); // 去掉开头的斜杠
    }

    return path.substring(1);
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
    {
      key: "recycle",
      icon: <DeleteOutlined />,
      label: "回收站",
    },
    {
      key: "share",
      icon: <ShareAltOutlined />,
      label: "我的分享",
    },
  ];

  // 上传页面的菜单项
  const uploadMenuItems = [
    {
      key: "upload/uploading",
      icon: <CloudUploadOutlined />,
      label: "正在上传",
    },
    {
      key: "upload/success",
      icon: <CheckCircleOutlined />,
      label: "已上传",
    },
    {
      key: "upload/failed",
      icon: <CloseCircleOutlined />,
      label: "上传失败",
    },
  ];

  // 下载页面的菜单项
  const downloadMenuItems = [
    {
      key: "download/downloading",
      icon: <CloudDownloadOutlined />,
      label: "正在下载",
    },
    {
      key: "download/downloaded",
      icon: <CheckCircleOutlined />,
      label: "已下载",
    },
    {
      key: "download/failed",
      icon: <CloseCircleOutlined />,
      label: "下载失败",
    },
  ];

  // 根据当前标签页获取对应的菜单项
  const getMenuItems = () => {
    switch (activeTab) {
      case 1:
        return diskMenuItems;
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
    const diskKeys = [
      "all",
      "image",
      "document",
      "video",
      "audio",
      "other",
      "recycle",
      "share",
    ];
    if (diskKeys.includes(key)) {
      setSelectedMenuKey(key);
      if (onFileTypeChange) {
        if (key === "all") {
          onFileTypeChange(undefined);
        } else if (key === "recycle") {
          onFileTypeChange(FileType.RECYCLE);
        } else if (key === "share") {
          onFileTypeChange(FileType.SHARE);
        } else {
          onFileTypeChange(
            FileType[key.toUpperCase() as keyof typeof FileType]
          );
        }
      }
      return;
    }

    // 其他页面的正常跳转处理
    navigate(`/${key}`);
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
