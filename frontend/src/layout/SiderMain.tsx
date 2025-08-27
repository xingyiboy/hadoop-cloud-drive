/*
 * @Date: 2025-05-09 12:03:12
 * @LastEditors: xingyi && 2416820386@qq.com
 * @LastEditTime: 2025-05-26 10:19:54
 * @FilePath: \CloudDiskWeb\src\layout\component\SiderMain.tsx
 */
import { Layout, Menu } from "antd";
import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import { FileType } from "@/enums/FileTypeEnum";
import {
  TAB_CONFIG,
  DISK_MENU_ITEMS,
  UPLOAD_MENU_ITEMS,
  DOWNLOAD_MENU_ITEMS,
} from "@/constants/layoutConstants";

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
    const diskKeys = DISK_MENU_ITEMS.map(item => item.key);
    const path = location.pathname;

    // 如果是网盘页面的菜单项，使用状态中保存的选中项
    if (activeTab === TAB_CONFIG.DISK && diskKeys.includes(selectedMenuKey)) {
      return selectedMenuKey;
    }

    // 如果是上传或下载页面，返回完整的路径key
    if (path.startsWith("/upload/") || path.startsWith("/download/")) {
      return path.substring(1); // 去掉开头的斜杠
    }

    return path.substring(1);
  };

  // 转换菜单项格式以适配Antd Menu组件
  const getDiskMenuItems = () => {
    return DISK_MENU_ITEMS.map(item => ({
      key: item.key,
      icon: React.createElement(item.icon),
      label: item.label,
    }));
  };

  const getUploadMenuItems = () => {
    return UPLOAD_MENU_ITEMS.map(item => ({
      key: item.key,
      icon: React.createElement(item.icon),
      label: item.label,
    }));
  };

  const getDownloadMenuItems = () => {
    return DOWNLOAD_MENU_ITEMS.map(item => ({
      key: item.key,
      icon: React.createElement(item.icon),
      label: item.label,
    }));
  };

  // 根据当前标签页获取对应的菜单项
  const getMenuItems = () => {
    switch (activeTab) {
      case TAB_CONFIG.DISK:
        return getDiskMenuItems();
      case TAB_CONFIG.UPLOAD:
        return getUploadMenuItems();
      case TAB_CONFIG.DOWNLOAD:
        return getDownloadMenuItems();
      default:
        return [];
    }
  };

  // 处理菜单点击
  const handleMenuClick = ({ key }: { key: string }) => {
    // 网盘页面的特殊处理
    const diskItem = DISK_MENU_ITEMS.find(item => item.key === key);
    if (diskItem) {
      setSelectedMenuKey(key);
      if (onFileTypeChange) {
        onFileTypeChange(diskItem.fileType);
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
