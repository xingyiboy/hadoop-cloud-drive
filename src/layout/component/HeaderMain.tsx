/*
 * @Date: 2025-05-09 12:03:12
 * @LastEditors: xingyi && 2416820386@qq.com
 * @LastEditTime: 2025-05-12 15:54:25
 * @FilePath: \CloudDiskWeb\src\layout\component\HeaderMain.tsx
 */
import { useNavigate } from "react-router-dom";
import { Avatar, Dropdown, Menu, message } from "antd";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { logout } from "@/store/modules/user";
import type { MenuProps } from "antd";
import { Layout, Space, Button } from "antd";

import "../style/header-main.scss";
import { removeToken } from "@/utils/setToken";

const { Header } = Layout;

const items1: MenuProps["items"] = [
  { key: 1, label: "网盘" },
  { key: 2, label: "分享" },
  { key: 3, label: "正在上传" },
  { key: 4, label: "正在下载" },
];

function HeaderMain() {
  const navigate = useNavigate(); //允许使用编程式导航
  const dispatch = useAppDispatch();
  const { userName } = useAppSelector((state) => state.user);

  const handleLogout = () => {
    // 只清除token，不清除保存的账号密码
    removeToken();
    // 清除用户状态
    dispatch(logout());
    message.success("退出登录成功");
    // 跳转到登录页
    navigate("/login", { replace: true });
  };

  const menu = (
    <Menu>
      <Menu.Item key="0">个人信息</Menu.Item>
      <Menu.Item key="1">修改密码</Menu.Item>
      <Menu.Divider />
      <Menu.Item key="2" onClick={handleLogout}>
        退出登录
      </Menu.Item>
    </Menu>
  );

  return (
    <Header
      className="header"
      style={{ display: "flex", alignItems: "center" }}
    >
      <div className="left">
        <div className="logo">QST</div>
        <div className="logo-title">云端网盘</div>
        <Menu
          className="menu"
          theme="light"
          mode="horizontal"
          defaultSelectedKeys={["1"]}
          items={items1}
          style={{ flex: 1, minWidth: 0 }}
        />
      </div>
      <div className="right">
        <Space size={13}>
          <Dropdown overlay={menu} trigger={["click"]}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                cursor: "pointer",
              }}
            >
              <Avatar
                size={35}
                src={
                  <img
                    src={
                      "https://ts3.tc.mm.bing.net/th/id/OIP-C.g5M-iZUiocFCi9YAzojtRAAAAA?w=250&h=250&c=8&rs=1&qlt=90&o=6&dpr=1.5&pid=3.1&rm=2"
                    }
                    alt="avatar"
                  />
                }
              />
              <div style={{ marginLeft: "8px" }}>admin</div>
            </div>
          </Dropdown>
          <div>|</div>
          <div>当前目录:</div>
          <div>|</div>
          <div>客户端下载</div>
          <Button shape="round" danger type="primary">
            会员中心
          </Button>
        </Space>
      </div>
    </Header>
  );
}

export default HeaderMain;
