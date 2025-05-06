/*
 * @Date: 2025-04-28 17:45:53
 * @LastEditors: xingyi && 2416820386@qq.com
 * @LastEditTime: 2025-05-06 11:52:06
 * @FilePath: \CloudDiskWeb\src\routes\index.tsx
 */
import React from "react";
import { useRoutes } from "react-router-dom";

/**
 * React.lazy 懒加载
 * 使组件动态导入
 */
const Login = React.lazy(() => import("@/views/login/index"));
const Layout = React.lazy(() => import("@/layout/index"));
const Register = React.lazy(() => import("@/views/register/index"));

function MyRoute() {
  let element = useRoutes([
    {
      path: "/login",
      element: <Login />,
    },
    {
      path: "/register",
      element: <Register />,
    },
    {
      path: "/",
      element: <Layout />,
      children: [],
    },
  ]);

  return element;
}

export default MyRoute;
