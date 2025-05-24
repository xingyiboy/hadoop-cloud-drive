/*
 * @Date: 2025-04-28 17:45:53
 * @LastEditors: xingyi && 2416820386@qq.com
 * @LastEditTime: 2025-05-08 14:33:35
 * @FilePath: \CloudDiskWeb\src\routes\index.tsx
 */
import React from "react";
import { useRoutes, Navigate } from "react-router-dom";
import { FileType } from "@/enums/FileTypeEnum";
import DiskContent from "@/components/DiskContent";
import UploadingContent from "@/components/UploadingContent";
import DownloadingContent from "@/components/DownloadingContent";
import LayoutApp from "@/layout";

/**
 * React.lazy 懒加载
 * 使组件动态导入
 */
const Login = React.lazy(() => import("@/views/login/index"));
const Main = React.lazy(() => import("@/layout/index"));
const Register = React.lazy(() => import("@/views/register/index"));

const routes = [
  {
    path: "/",
    element: <LayoutApp />,
    children: [
      {
        path: "/",
        element: <Navigate to="/all" />,
      },
      {
        path: "/all",
        element: <DiskContent fileType={undefined} />,
      },
      {
        path: "/image",
        element: <DiskContent fileType={FileType.IMAGE} />,
      },
      {
        path: "/document",
        element: <DiskContent fileType={FileType.DOCUMENT} />,
      },
      {
        path: "/video",
        element: <DiskContent fileType={FileType.VIDEO} />,
      },
      {
        path: "/music",
        element: <DiskContent fileType={FileType.AUDIO} />,
      },
      {
        path: "/other",
        element: <DiskContent fileType={FileType.OTHER} />,
      },
      {
        path: "/upload",
        children: [
          {
            path: "",
            element: <Navigate to="/upload/uploading" />,
          },
          {
            path: ":status",
            element: <UploadingContent />,
          },
        ],
      },
      {
        path: "/download",
        children: [
          {
            path: "",
            element: <Navigate to="/download/downloading" />,
          },
          {
            path: ":status",
            element: <DownloadingContent />,
          },
        ],
      },
    ],
  },
];

function MyRoute() {
  let element = useRoutes(routes);

  return element;
}

export default MyRoute;
