/*
 * @Date: 2025-04-28 14:48:50
 * @LastEditors: xingyi && 2416820386@qq.com
 * @LastEditTime: 2025-05-08 14:33:54
 * @FilePath: \CloudDiskWeb\src\views\register\index.tsx
 */
import "./index.scss";

import { Form, Input, Button, Checkbox, Avatar, Space } from "antd";
import { UserOutlined, LockOutlined, MailOutlined } from "@ant-design/icons";

import { useAppDispatch } from "@/store/hooks";
import { login } from "@/store/modules/user";

import { useNavigate } from "react-router-dom";

function Register() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const onFinish = (value: User.loginInfo) => {
    dispatch(login(value.userName));
    navigate("/login", { replace: false });
  };
  //表单
  const [form] = Form.useForm();

  //页脚图标
  const IconFooter = ({ url, name }: { url: string; name: string }) => {
    return (
      <div className="icon-footer">
        <Avatar size={50} src={<img src={url} alt="avatar" />} />
        <div className="name">{name}</div>
      </div>
    );
  };
  const iconFooterUrl = [
    {
      url: "https://tse4-mm.cn.bing.net/th/id/OIP-C.5SvY9ldRrjIX0wEPm7iftAAAAA?w=181&h=181&c=7&r=0&o=5&dpr=1.5&pid=1.7",
      name: "经营性网站备案信息",
    },
    {
      url: "https://tse2-mm.cn.bing.net/th/id/OIP-C.zIV_gwbyg51ltVu8ZMUdoQHaHa?w=195&h=195&c=7&r=0&o=5&dpr=1.5&pid=1.7",
      name: "阅读网站值得信用",
    },
    {
      url: "https://tse3-mm.cn.bing.net/th/id/OIP-C.99hCBz1SGf8dHsS398h0cwHaHa?w=216&h=216&c=7&r=0&o=5&dpr=1.5&pid=1.7",
      name: "青岛网站都魔都网站",
    },
    {
      url: "https://tse1-mm.cn.bing.net/th/id/OIP-C.esEedh03Q09mRC_ovHoBYAHaHa?w=203&h=203&c=7&r=0&o=5&dpr=1.5&pid=1.7",
      name: "诚信网站",
    },
  ];

  return (
    <div className="register-page">
      <div className="header">
        <div className="left">
          <div className="logo">QST</div>
          <div className="name">青软实训</div>
          <div className="shu">|</div>
          <div className="title"> 注册云端网盘账号</div>
        </div>
        <div className="right">
          <div className="link">已有账号</div>{" "}
          <div className="login" onClick={() => navigate("/login")}>
            登录
          </div>
        </div>
      </div>
      <div className="form">
        <div className="left">
          <div className="form-wrap">
            <Form form={form} size="large" onFinish={onFinish}>
              <Form.Item
                label="用户名"
                className="form-item"
                name="userName"
                rules={[{ required: true, message: "登录账号不能为空" }]}
              >
                <Input placeholder="请输入用户名" />
              </Form.Item>
              {/* 手机号 */}
              <Form.Item
                label="手机号"
                className="form-item"
                name="phone"
                rules={[
                  { required: true, message: "手机号不能为空" },
                  { pattern: /^[0-9]{11}$/, message: "请输入11位数字的手机号" },
                ]}
              >
                <Input placeholder="请输入手机号" maxLength={11} />
              </Form.Item>
              {/* 邮箱 */}
              <Form.Item
                label="邮箱"
                className="form-item"
                name="email"
                rules={[
                  { required: true, message: "邮箱不能为空" },
                  { type: "email", message: "请输入正确的邮箱格式" },
                ]}
              >
                <Input placeholder="请输入邮箱" />
              </Form.Item>
              <Form.Item
                label="密码"
                className="form-item"
                name="password"
                rules={[{ required: true, message: "登录密码不能为空" }]}
              >
                <Input type="password" placeholder="请输入密码" />
              </Form.Item>
              {/* 确认密码 */}
              <Form.Item
                label="确认密码"
                className="form-item"
                name="confirmPassword"
                rules={[{ required: true, message: "确认密码不能为空" }]}
              >
                <Input type="password" placeholder="请再次输入密码进行确认" />
              </Form.Item>
              <Form.Item name="disabled" valuePropName="checked">
                <Checkbox>
                  <div className="link">
                    <div>接收并阅读《</div>
                    <div>QST用户协议</div>
                    <div>》</div>
                  </div>
                </Checkbox>
              </Form.Item>
              <Form.Item>
                <Button type="primary" block htmlType="submit">
                  注册
                </Button>
              </Form.Item>
            </Form>
          </div>
        </div>
        <div className="right">
          <div className="title">
            <Avatar
              size={30}
              src={
                <img
                  src={
                    "https://ts1.tc.mm.bing.net/th/id/OIP-C.esEedh03Q09mRC_ovHoBYAHaHa?w=200&h=211&c=8&rs=1&qlt=90&o=6&dpr=1.5&pid=3.1&rm=2"
                  }
                  alt="avatar"
                />
              }
            />
            手机号快速注册
          </div>
          <div className="content">请使用中国大陆手机号。编辑短信:</div>
          <div className="hint interleave">
            6-14位字符（支持数字/字母/符号）
          </div>
          <div className="content">作为登录密码，发送至:</div>
          <div className="hint">1232-1313-2313</div>
          <div className="content interleave">
            操作注册成功，手机号作为登录号
          </div>
        </div>
      </div>
      <div className="footer2">
        <div className="center">
          {iconFooterUrl.map((item, index) => {
            return <IconFooter key={index} url={item.url} name={item.name} />;
          })}
        </div>
      </div>
    </div>
  );
}

export default Register;
