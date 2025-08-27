/*
 * @Date: 2025-04-28 17:45:53
 * @LastEditors: xingyi && 2416820386@qq.com
 * @LastEditTime: 2025-05-08 14:33:35
 * @FilePath: \CloudDiskWeb\src\routes\index.tsx
 */
import React, { Suspense } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { getToken } from "@/utils/setToken";
import DownloadingContent from "@/views/download/components/DownloadingContent";
import ErrorBoundary from "@/components/ErrorBoundary";
import { 
  MAIN_APP_PATHS, 
  DOWNLOAD_PATHS, 
  AUTH_ROUTES, 
  PUBLIC_ROUTES,
  DEFAULT_REDIRECT 
} from "@/constants/routeConstants";

const Login = React.lazy(() => import("@/views/login"));
const MainView = React.lazy(() => import("@/views/main"));
const ShareView = React.lazy(() => import("@/views/share/ShareView"));

// 路由守卫组件
const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const token = getToken();
  const location = useLocation();

  if (
    !token &&
    location.pathname !== AUTH_ROUTES.LOGIN
  ) {
    return <Navigate to={AUTH_ROUTES.LOGIN} replace />;
  }

  return <>{children}</>;
};

// 主页面路由的通用组件包装器
const MainViewWrapper: React.FC = () => (
  <ErrorBoundary>
    <Suspense fallback={<LoadingFallback />}>
      <MainView />
    </Suspense>
  </ErrorBoundary>
);

// 下载页面的通用组件包装器
const DownloadWrapper: React.FC = () => (
  <ErrorBoundary>
    <Suspense fallback={<LoadingFallback />}>
      <DownloadingContent />
    </Suspense>
  </ErrorBoundary>
);

// 通用的加载组件
const LoadingFallback: React.FC = () => <div>加载中...</div>;

// 路由配置
const routes = [
  {
    path: "/",
    element: (
      <PrivateRoute>
        <MainViewWrapper />
      </PrivateRoute>
    ),
    children: [
      {
        path: "",
        element: <Navigate to={DEFAULT_REDIRECT} replace />,
      },
      // 主应用页面路由
      ...MAIN_APP_PATHS.map(path => ({
        path,
        element: <MainViewWrapper />,
      })),
      // 下载页面路由
      ...DOWNLOAD_PATHS.map(path => ({
        path,
        element: <DownloadWrapper />,
      })),
    ],
  },
  {
    path: AUTH_ROUTES.LOGIN,
    element: (
      <ErrorBoundary>
        <Suspense fallback={<LoadingFallback />}>
          <Login />
        </Suspense>
      </ErrorBoundary>
    ),
  },

  {
    path: PUBLIC_ROUTES.SHARE,
    element: (
      <ErrorBoundary>
        <Suspense fallback={<LoadingFallback />}>
          <ShareView />
        </Suspense>
      </ErrorBoundary>
    ),
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
];

export default routes;
