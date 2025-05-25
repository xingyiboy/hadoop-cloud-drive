/*
 * @Date: 2025-04-28 17:45:53
 * @LastEditors: xingyi && 2416820386@qq.com
 * @LastEditTime: 2025-05-08 14:33:35
 * @FilePath: \CloudDiskWeb\src\routes\index.tsx
 */
import React, { Suspense } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { getToken } from "@/utils/setToken";
import LayoutApp from "@/layout";
import DownloadingContent from "@/components/DownloadingContent";

const Login = React.lazy(() => import("@/views/login"));
const Register = React.lazy(() => import("@/views/register"));

// 路由守卫组件
const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const token = getToken();
  const location = useLocation();

  if (
    !token &&
    location.pathname !== "/login" &&
    location.pathname !== "/register"
  ) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// 路由配置
const routes = [
  {
    path: "/login",
    element: (
      <Suspense fallback={<div>加载中...</div>}>
        <Login />
      </Suspense>
    ),
  },
  {
    path: "/register",
    element: (
      <Suspense fallback={<div>加载中...</div>}>
        <Register />
      </Suspense>
    ),
  },
  {
    path: "/",
    element: (
      <PrivateRoute>
        <LayoutApp />
      </PrivateRoute>
    ),
    children: [
      {
        path: "",
        element: <Navigate to="/all" replace />,
      },
      {
        path: "all",
        element: <LayoutApp />,
      },
      {
        path: "image",
        element: <LayoutApp />,
      },
      {
        path: "doc",
        element: <LayoutApp />,
      },
      {
        path: "video",
        element: <LayoutApp />,
      },
      {
        path: "music",
        element: <LayoutApp />,
      },
      {
        path: "other",
        element: <LayoutApp />,
      },
      {
        path: "upload",
        element: <LayoutApp />,
      },
      {
        path: "upload/uploading",
        element: <LayoutApp />,
      },
      {
        path: "upload/success",
        element: <LayoutApp />,
      },
      {
        path: "upload/failed",
        element: <LayoutApp />,
      },
      {
        path: "download/downloading",
        element: <DownloadingContent />,
      },
      {
        path: "download/downloaded",
        element: <DownloadingContent />,
      },
      {
        path: "download/failed",
        element: <DownloadingContent />,
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
];

export default routes;
