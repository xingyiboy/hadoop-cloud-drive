/*
 * @Date: 2025-04-28 14:48:50
 * @LastEditors: xingyi && 2416820386@qq.com
 * @LastEditTime: 2025-05-26 14:50:46
 * @FilePath: \CloudDiskWeb\src\views\login\index.tsx
 */


import { Form, Input, Button, Checkbox, Avatar, Space, message } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";

import { useAppDispatch } from "@/store/hooks";
import { login as loginAction, setUserProfile } from "@/store/modules/user";

import { useNavigate, useLocation } from "react-router-dom";
import { login, getUserProfile, register } from "@/api";
import { setToken } from "@/utils/setToken";
import { useEffect, useState } from "react";
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
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [skipFormReset, setSkipFormReset] = useState(false);

  // 页面加载时，尝试填充保存的账号密码
  useEffect(() => {
    const fillSavedCredentials = () => {
      const savedCredentials = getSavedCredentials();
      if (savedCredentials && !isRegisterMode) {
        form.setFieldsValue({
          userName: savedCredentials.username,
          password: savedCredentials.password,
          remember: true,
        });
      }
    };
    
    fillSavedCredentials();
  }, [location.key, form, isRegisterMode]); // 使用location.key，每次导航都会变化

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

  // 模式切换时重置表单
  useEffect(() => {
    if (!skipFormReset) {
      form.resetFields();
      
      // 如果切换到登录模式，尝试填充保存的凭据
      if (!isRegisterMode) {
        const savedCredentials = getSavedCredentials();
        if (savedCredentials) {
          setTimeout(() => {
            form.setFieldsValue({
              userName: savedCredentials.username,
              password: savedCredentials.password,
              remember: true,
            });
          }, 50);
        }
      }
    }
    setSkipFormReset(false);
  }, [isRegisterMode, form]);

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      if (isRegisterMode) {
        // 注册逻辑
        if (values.password !== values.confirmPassword) {
          message.error("两次输入的密码不一致");
          setLoading(false);
          return;
        }

        await register({
          username: values.userName,
          nickname: values.nickname,
          password: values.password,
        });

        message.success("注册成功，请登录");
        
        // 设置跳过表单重置标志，然后切换模式
        setSkipFormReset(true);
        setIsRegisterMode(false);
        
        // 延迟设置表单值，确保模式切换完成
        setTimeout(() => {
          form.setFieldsValue({
            userName: values.userName,
            password: values.password,
            remember: true,
          });
        }, 100);
      } else {
        // 登录逻辑
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

        // 获取用户信息
        const userProfileRes = await getUserProfile();
        if (userProfileRes.code === 0) {
          dispatch(setUserProfile(userProfileRes.data));
          // 更新用户状态
          dispatch(loginAction(values.userName));
          message.success("登录成功");
          navigate("/", { replace: true });
        } else {
          message.error(userProfileRes.msg || "获取用户信息失败");
        }
      }
    } catch (error: any) {
      // request拦截器已经显示了具体的错误信息，这里不再重复显示任何错误
      console.error(isRegisterMode ? "注册失败" : "登录失败", error);
    } finally {
      setLoading(false);
    }
  };
  //图标
  const IconBottem = ({ url }: { url: string }) => {
    const handleClick = () => {
      message.info('暂不支持第三方登录');
    };
    
    return (
      <Avatar 
        size={26} 
        src={<img src={url} alt="avatar" />} 
        onClick={handleClick}
        style={{ cursor: 'pointer' }}
      />
    );
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
            <div className="clickable-link" onClick={() => navigate('/login')}>Hadoop</div> 
            <div className="clickable-link" onClick={() => navigate('/login')}>云端网盘</div>
          </div>
          <div className="right">
            <div className="clickable-link" onClick={() => navigate('/login')}>云端首页</div> 
            <div className="clickable-placeholder" onClick={() => {}}>APP下载</div> 
            <div className="clickable-placeholder" onClick={() => window.open('https://gitee.com/xingyiboy/hadoop-cloud-drive', '_blank')}>联系我们</div>
          </div>
        </div>
        <div className="submit-form">
          <div className="title">{isRegisterMode ? "用户注册" : "账号密码登录"}</div>
          <div className="form-wrap">
            <Form form={form} size="large" onFinish={onFinish}>
              <Form.Item
                name="userName"
                label={isRegisterMode ? "用户账号" : undefined}
                rules={
                  isRegisterMode
                    ? [
                        { required: true, message: "用户账号不能为空" },
                        {
                          pattern: /^[a-zA-Z0-9]{4,30}$/,
                          message: "用户账号由数字、字母组成",
                        },
                        { min: 4, max: 30, message: "用户账号长度为 4-30 个字符" },
                      ]
                    : [{ required: true, message: "登录账号不能为空" }]
                }
              >
                <Input
                  prefix={<UserOutlined />}
                  placeholder={isRegisterMode ? "请输入用户账号" : "账号/邮箱/用户名"}
                  disabled={loading}
                />
              </Form.Item>
              
              {isRegisterMode && (
                <Form.Item
                  name="nickname"
                  label="用户昵称"
                  rules={[
                    { required: true, message: "用户昵称不能为空" },
                    { max: 30, message: "用户昵称长度不能超过 30 个字符" },
                  ]}
                >
                  <Input placeholder="请输入用户昵称" disabled={loading} />
                </Form.Item>
              )}
              
              <Form.Item
                name="password"
                label={isRegisterMode ? "密码" : undefined}
                rules={
                  isRegisterMode
                    ? [
                        { required: true, message: "密码不能为空" },
                        { min: 4, max: 16, message: "密码长度为 4-16 位" },
                      ]
                    : [{ required: true, message: "登录密码不能为空" }]
                }
              >
                <Input.Password 
                  prefix={<LockOutlined />} 
                  placeholder={isRegisterMode ? "请输入密码" : "密码"} 
                  disabled={loading}
                />
              </Form.Item>
              
              {isRegisterMode && (
                <Form.Item
                  name="confirmPassword"
                  label="确认密码"
                  rules={[
                    { required: true, message: "确认密码不能为空" },
                    { min: 4, max: 16, message: "密码长度为 4-16 位" },
                  ]}
                >
                  <Input.Password placeholder="请再次输入密码进行确认" disabled={loading} />
                </Form.Item>
              )}
              
              {isRegisterMode ? (
                <Form.Item
                  name="agreement"
                  valuePropName="checked"
                  rules={[{ required: true, message: "请阅读并同意用户协议" }]}
                >
                  <Checkbox disabled={loading}>
                    我已阅读并同意《Hadoop用户协议》
                  </Checkbox>
                </Form.Item>
              ) : (
                <Form.Item name="remember" valuePropName="checked">
                  <Checkbox disabled={loading}>记住我</Checkbox>
                </Form.Item>
              )}
              
              <Form.Item>
                <Button type="primary" block htmlType="submit" loading={loading}>
                  {isRegisterMode ? "注册" : "登 录"}
                </Button>
              </Form.Item>
              
              {!isRegisterMode && (
                <Form.Item>
                  <Space wrap size={12}>
                    {iconUrl.map((item, index) => {
                      return <IconBottem key={index} url={item} />;
                    })}
                  </Space>
                </Form.Item>
              )}
              
              <div className="bottom">
                <a></a>
                <a 
                  onClick={loading ? undefined : () => setIsRegisterMode(!isRegisterMode)}
                  style={{ 
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.5 : 1 
                  }}
                >
                  {isRegisterMode ? "已有账号，去登录" : "立即注册"}
                </a>
                <a 
                  onClick={() => message.info('请联系管理员QQ：2416820386')}
                  style={{ cursor: 'pointer' }}
                >
                  忘记密码?
                </a>
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
