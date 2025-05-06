/*
 * @Date: 2025-04-28 14:48:50
 * @LastEditors: xingyi && 2416820386@qq.com
 * @LastEditTime: 2025-04-29 10:17:53
 * @FilePath: \CloudDiskWeb\src\views\login\index.tsx
 */
import "./index.scss";

import { Form, Input, Button, Checkbox, Avatar, Space } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";

import { useAppDispatch } from "@/store/hooks";
import { login } from "@/store/modules/user";

import { useNavigate } from "react-router-dom";

function Login() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const onFinish = (value: User.loginInfo) => {
    dispatch(login(value.userName));
    navigate("/", { replace: true });
  };
  //表单
  const [form] = Form.useForm();
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
        <div className="header">
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
                <Input
                  prefix={<LockOutlined />}
                  type="password"
                  placeholder="密码"
                />
              </Form.Item>
              <Form.Item name="disabled" valuePropName="checked">
                <Checkbox>记住密码</Checkbox>
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
