/*
 * @Date: 2025-05-09 12:03:12
 * @LastEditors: xingyi && 2416820386@qq.com
 * @LastEditTime: 2025-05-26 19:51:43
 * @FilePath: \CloudDiskWeb\src\layout\component\HeaderMain.tsx
 */
import { useNavigate } from "react-router-dom";
import {
  Avatar,
  Dropdown,
  Menu,
  Space,
  Layout,
} from "antd";
import { useState } from "react";
import type { MenuProps } from "antd";

import { useUserProfile } from "@/hooks/useUserProfile";
import { useCurrentPath } from "@/hooks/useCurrentPath";
import UserProfileModal from "@/layout/components/UserProfileModal";
import {
  NAV_MENU_ITEMS,
  USER_MENU_ITEMS,
  DEFAULT_AVATAR,
  LOGO_URL,
} from "@/constants/layoutConstants";

const { Header } = Layout;

interface HeaderMainProps {
  activeTab: number;
  onTabChange: (key: number) => void;
}

const HeaderMain: React.FC<HeaderMainProps> = ({ activeTab, onTabChange }) => {
  const navigate = useNavigate();
  const { userProfile, username, updateProfile, handleLogout } = useUserProfile();
  const currentPath = useCurrentPath();
  const [isProfileModalVisible, setIsProfileModalVisible] = useState(false);

  // 处理用户菜单点击
  const handleUserMenuClick: MenuProps["onClick"] = (info) => {
    switch (info.key) {
      case "profile":
        setIsProfileModalVisible(true);
        break;
      case "logout":
        handleLogout();
        break;
    }
  };

  // 处理导航菜单点击
  const handleTabClick = (key: number) => {
    onTabChange(key);
    // 根据不同的 tab 导航到不同的页面
    switch (key) {
      case 1: // 网盘
        navigate("/all");
        break;
      case 3: // 正在上传
        navigate("/upload/uploading");
        break;
      case 4: // 正在下载
        navigate("/download/downloading");
        break;
      default:
        break;
    }
  };

  return (
    <Header
      className="header"
      style={{ display: "flex", alignItems: "center" }}
    >
      <div className="left">
        <div className="logo">
          <img
            src={LOGO_URL}
            alt="Hadoop Logo"
            style={{
              height: "40px",
              width: "auto",
              objectFit: "contain",
            }}
          />
        </div>
        <div className="logo-title">云端网盘</div>
        <Menu
          className="menu"
          theme="light"
          mode="horizontal"
          selectedKeys={[activeTab.toString()]}
          items={NAV_MENU_ITEMS}
          style={{ flex: 1, minWidth: 0 }}
          onClick={(info) => handleTabClick(Number(info.key))}
        />
      </div>
      <div className="right">
        <Space size={13}>
          <Dropdown
            menu={{ items: USER_MENU_ITEMS, onClick: handleUserMenuClick }}
            trigger={["click"]}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                cursor: "pointer",
              }}
            >
              <Avatar
                size={35}
                src={userProfile?.avatar || DEFAULT_AVATAR}
              />
              <div style={{ marginLeft: "8px" }}>
                {userProfile?.nickname || userProfile?.username || "未登录"}
              </div>
            </div>
          </Dropdown>
          <div>|</div>
          <div>当前目录: {currentPath}</div>
        </Space>
      </div>

      <UserProfileModal
        visible={isProfileModalVisible}
        userProfile={userProfile}
        onCancel={() => setIsProfileModalVisible(false)}
        onSave={updateProfile}
      />
    </Header>
  );
};

export default HeaderMain;
