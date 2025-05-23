/*
 * @Date: 2025-04-28 14:48:50
 * @LastEditors: xingyi && 2416820386@qq.com
 * @LastEditTime: 2025-05-23 15:56:12
 * @FilePath: \CloudDiskWeb\src\views\login\index.tsx
 */
import "./index.scss";

import { Form, Input, Button, Checkbox, Avatar, Space, message } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";

import { useAppDispatch } from "@/store/hooks";
import { login as loginAction } from "@/store/modules/user";

import { useNavigate, useLocation } from "react-router-dom";
import { login } from "@/api";
import { setToken } from "@/utils/setToken";
import { useEffect } from "react";
import { encrypt, decrypt } from "@/utils/crypto";

// 保存加密后的账号密码到localStorage
const saveCredentials = (username: string, password: string) => {
  try {
    const encryptedData = encrypt(JSON.stringify({ username, password }));
    localStorage.setItem("savedCredentials", encryptedData);
  } catch (error) {
    console.error("保存账号密码时发生错误:", error);
  }
};

// 获取并解密保存的账号密码
const getSavedCredentials = () => {
  try {
    const encryptedData = localStorage.getItem("savedCredentials");
    if (!encryptedData) return null;

    const decryptedData = decrypt(encryptedData);
    return JSON.parse(decryptedData);
  } catch (error) {
    console.error("获取账号密码时发生错误:", error);
    // 如果解密失败，清除可能损坏的数据
    clearCredentials();
    return null;
  }
};

// 清除保存的账号密码
const clearCredentials = () => {
  localStorage.removeItem("savedCredentials");
};

function Login() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [form] = Form.useForm();

  // 页面加载时，尝试填充保存的账号密码
  useEffect(() => {
    const savedCredentials = getSavedCredentials();
    if (savedCredentials) {
      form.setFieldsValue({
        userName: savedCredentials.username,
        password: savedCredentials.password,
        remember: true,
      });
    }
  }, []);

  // 如果有注册页面传来的账号密码，自动填写
  useEffect(() => {
    const state = location.state as {
      username?: string;
      password?: string;
    } | null;
    if (state?.username && state?.password) {
      form.setFieldsValue({
        userName: state.username,
        password: state.password,
      });
      // 清除state，防止刷新页面时重复填写
      navigate(location.pathname, { replace: true });
    }
  }, [location.state]);

  const onFinish = async (values: any) => {
    try {
      const response = await login({
        username: values.userName,
        password: values.password,
      });

      // 如果勾选了记住密码，保存加密后的账号密码
      if (values.remember) {
        saveCredentials(values.userName, values.password);
      } else {
        clearCredentials();
      }

      // 保存token
      setToken(response.data.accessToken);
      // 更新用户状态
      dispatch(loginAction(values.userName));
      message.success("登录成功");
      navigate("/", { replace: true });
    } catch (error: any) {
      message.error(error || "登录失败");
    }
  };
  //图标
  const IconBottem = ({ url }: { url: string }) => {
    return <Avatar size={26} src={<img src={url} alt="avatar" />} />;
  };
  const iconUrl = [
    "https://ts1.tc.mm.bing.net/th/id/OIP-C.Aaxi4cxgPp86-NpFVtAI4wAAAA?w=160&h=211&c=8&rs=1&qlt=90&o=6&dpr=1.5&pid=3.1&rm=2",
    "https://ts1.tc.mm.bing.net/th/id/OIP-C.egAheO43KIl0j6UWri4yswAAAA?w=177&h=211&c=8&rs=1&qlt=90&o=6&dpr=1.5&pid=3.1&rm=2",
    "https://tse1-mm.cn.bing.net/th/id/OIP-C.TffDbEMniJKpTx-vgXAnzAHaHa?w=169&h=187&c=7&r=0&o=5&dpr=1.5&pid=1.7",
  ];
  //页脚图标
  const IconFooter = ({ url, name }: { url: string; name: string }) => {
    return (
      <div>
        <Avatar size={50} src={<img src={url} alt="avatar" />} />
        <div className="name">{name}</div>
      </div>
    );
  };
  const iconFooterUrl = [
    {
      url: "https://tse4-mm.cn.bing.net/th/id/OIP-C.5SvY9ldRrjIX0wEPm7iftAAAAA?w=181&h=181&c=7&r=0&o=5&dpr=1.5&pid=1.7",
      name: "Android",
    },
    {
      url: "https://tse2-mm.cn.bing.net/th/id/OIP-C.zIV_gwbyg51ltVu8ZMUdoQHaHa?w=195&h=195&c=7&r=0&o=5&dpr=1.5&pid=1.7",
      name: "Windows",
    },
    {
      url: "https://tse3-mm.cn.bing.net/th/id/OIP-C.99hCBz1SGf8dHsS398h0cwHaHa?w=216&h=216&c=7&r=0&o=5&dpr=1.5&pid=1.7",
      name: "Mac",
    },
    {
      url: "https://tse1-mm.cn.bing.net/th/id/OIP-C.esEedh03Q09mRC_ovHoBYAHaHa?w=203&h=203&c=7&r=0&o=5&dpr=1.5&pid=1.7",
      name: "iPhone",
    },
  ];
  return (
    <div className="main">
      <div className="login-page">
        <div className="header-login">
          <div className="left">
            <div>QST</div> <div>云端网盘</div>
          </div>
          <div className="right">
            <div>云端首页</div> <div>APP下载</div> <div>联系我们</div>
          </div>
        </div>
        <div className="submit-form">
          <div className="title">账号密码登录</div>
          <div className="form-wrap">
            <Form form={form} size="large" onFinish={onFinish}>
              <Form.Item
                name="userName"
                rules={[{ required: true, message: "登录账号不能为空" }]}
              >
                <Input
                  prefix={<UserOutlined />}
                  placeholder="账号/邮箱/用户名"
                />
              </Form.Item>
              <Form.Item
                name="password"
                rules={[{ required: true, message: "登录密码不能为空" }]}
              >
                <Input.Password prefix={<LockOutlined />} placeholder="密码" />
              </Form.Item>
              <Form.Item name="remember" valuePropName="checked">
                <Checkbox>记住我</Checkbox>
              </Form.Item>
              <Form.Item>
                <Button type="primary" block htmlType="submit">
                  登 录
                </Button>
              </Form.Item>
              <Form.Item>
                <Space wrap size={12}>
                  {iconUrl.map((item, index) => {
                    return <IconBottem key={index} url={item} />;
                  })}
                </Space>
              </Form.Item>
              <div className="bottom">
                <a></a>
                <a onClick={() => navigate("/register")}>立即注册</a>
                <a>忘记密码?</a>
              </div>
            </Form>
          </div>
        </div>
      </div>
      <div className="footer">
        <Space wrap size={150}>
          {iconFooterUrl.map((item, index) => {
            return <IconFooter key={index} url={item.url} name={item.name} />;
          })}
        </Space>
      </div>
    </div>
  );
}

export default Login;
