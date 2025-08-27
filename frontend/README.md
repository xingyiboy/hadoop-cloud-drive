# Hadoop云盘系统 - 前端应用

<div align="center">
<h3>基于React + TypeScript的现代化云盘前端应用</h3>
</div>

## 📖 项目介绍

这是Hadoop云盘系统的前端应用，采用现代化的Web技术栈构建，为用户提供直观、高效的文件管理体验。应用支持文件上传下载、文件夹管理、文件分享、多视图切换等完整的云盘功能。

## 🛠️ 技术栈

### 核心技术
- **框架**: React 18 + TypeScript 4.x
- **构建工具**: Vite 2.x (快速构建与热更新)
- **UI组件库**: Ant Design 4.x (企业级UI设计语言)
- **状态管理**: Redux Toolkit + Zustand (轻量级状态管理)
- **路由管理**: React Router DOM 6.x
- **样式处理**: Sass/SCSS (CSS预处理器)
- **HTTP客户端**: Axios (API请求处理)

### 辅助工具
- **时间处理**: Day.js
- **加密解密**: CryptoJS  
- **图标库**: @ant-design/icons
- **本地存储**: IndexedDB (离线数据存储)

## 📁 项目结构

```
frontend/
├── public/                     # 静态资源
├── src/
│   ├── api/                   # API接口定义
│   │   ├── file.ts           # 文件操作API
│   │   └── index.ts          # 通用API配置
│   ├── components/           # 通用组件
│   │   ├── AuthRoute.tsx     # 路由守卫组件
│   │   ├── DownloadIndicator.tsx  # 下载进度指示器
│   │   ├── ErrorBoundary.tsx      # 错误边界组件
│   │   ├── FileUpload.tsx         # 文件上传组件
│   │   ├── ShareDownloadModal.tsx # 分享下载弹窗
│   │   └── UploadIndicator.tsx    # 上传进度指示器
│   ├── constants/            # 常量定义
│   │   ├── fileConstants.ts  # 文件相关常量
│   │   ├── layoutConstants.ts # 布局常量
│   │   └── routeConstants.ts  # 路由常量
│   ├── enums/               # 枚举定义
│   │   └── FileTypeEnum.ts  # 文件类型枚举
│   ├── hooks/               # 自定义Hook
│   │   ├── useCurrentPath.ts     # 当前路径管理
│   │   ├── useDownloadNavigation.ts # 下载导航
│   │   ├── useFileEdit.ts        # 文件编辑
│   │   ├── useFileList.ts        # 文件列表管理
│   │   ├── useFileOperations.ts  # 文件操作
│   │   ├── useFileSelection.ts   # 文件选择
│   │   ├── useNavigation.ts      # 页面导航
│   │   └── useViewMode.ts        # 视图模式切换
│   ├── layout/              # 布局组件
│   │   ├── components/
│   │   │   └── UserProfileModal.tsx # 用户信息弹窗
│   │   ├── ContentMain.tsx       # 主内容区域
│   │   ├── HeaderMain.tsx        # 顶部导航栏
│   │   └── SiderMain.tsx         # 侧边栏导航
│   ├── services/            # 业务服务
│   │   └── indexedDB.ts     # 本地数据库服务
│   ├── store/               # 状态管理
│   │   ├── modules/
│   │   │   └── user.ts      # 用户状态模块
│   │   ├── downloadStore.ts # 下载状态管理
│   │   ├── uploadStore.ts   # 上传状态管理
│   │   ├── hooks.ts         # Store Hooks
│   │   ├── index.ts         # Store入口
│   │   └── types.ts         # 状态类型定义
│   ├── types/               # TypeScript类型定义
│   │   ├── download.ts      # 下载相关类型
│   │   ├── file.ts          # 文件相关类型
│   │   ├── upload.ts        # 上传相关类型
│   │   ├── user.ts          # 用户相关类型
│   │   └── index.d.ts       # 全局类型声明
│   ├── utils/               # 工具函数
│   │   ├── crypto.ts        # 加密解密工具
│   │   ├── fileUtils.ts     # 文件处理工具
│   │   ├── format.ts        # 格式化工具
│   │   ├── request.ts       # HTTP请求工具
│   │   ├── storage.ts       # 存储工具
│   │   ├── time.ts          # 时间处理工具
│   │   └── validate.ts      # 数据验证工具
│   ├── views/               # 页面组件
│   │   ├── download/        # 下载页面
│   │   ├── login/           # 登录页面
│   │   ├── main/            # 主页面(文件管理)
│   │   ├── share/           # 分享页面
│   │   └── upload/          # 上传页面
│   ├── styles/              # 样式文件
│   │   ├── components/      # 组件样式
│   │   ├── layout/          # 布局样式
│   │   ├── views/           # 页面样式
│   │   ├── index.scss       # 全局样式
│   │   └── variables.scss   # 样式变量
│   ├── App.tsx              # 应用根组件
│   └── main.tsx             # 应用入口文件
├── index.html               # HTML模板
├── package.json             # 项目配置
├── tsconfig.json            # TypeScript配置
├── vite.config.ts           # Vite构建配置
└── README.md                # 项目说明文档
```

## ⚡ 快速开始

### 环境要求
- **Node.js**: 14+ (推荐 16+)
- **包管理器**: pnpm (推荐) / npm / yarn

### 安装pnpm (推荐)
```bash
npm install -g pnpm
```

### 安装依赖
```bash
# 使用pnpm (推荐)
pnpm install
```

### 启动开发服务器
```bash
# 使用pnpm
pnpm run dev
```

访问地址：http://localhost:9527

### 构建生产版本
```bash
# 使用pnpm
pnpm run build
```

## 🌟 主要功能

### 📁 文件管理
- **多视图模式**: 支持列表视图和网格视图
- **文件操作**: 上传、下载、重命名、移动、删除、复制
- **文件夹管理**: 创建文件夹、嵌套浏览
- **批量操作**: 支持多文件选择和批量操作
- **搜索功能**: 实时文件名搜索

### 📤 上传下载
- **拖拽上传**: 支持拖拽文件和文件夹上传
- **进度显示**: 实时上传/下载进度条
- **断点续传**: 大文件上传支持断点续传
- **并发控制**: 智能并发控制，优化传输效率

### 🔗 分享功能
- **一键分享**: 生成分享链接
- **批量分享**: 支持多文件批量分享
- **分享管理**: 查看和管理已分享文件
- **访问控制**: 分享链接访问权限控制

### 🗂️ 文件分类
- **智能识别**: 按文件类型自动分类
- **图标展示**: 不同文件类型对应图标
- **预览支持**: 部分文件类型支持预览

### 🎨 用户体验
- **响应式设计**: 适配不同屏幕尺寸
- **主题风格**: 现代化UI设计
- **操作反馈**: 完善的loading和成功/错误提示
- **快捷操作**: 右键菜单、快捷键支持
- **面包屑导航**: 清晰的路径导航

## 🔧 开发指南

### 开发规范
- **代码风格**: 使用ESLint + Prettier进行代码格式化
- **TypeScript**: 严格的类型检查，确保代码质量
- **组件设计**: 遵循单一职责原则，可复用组件设计
- **状态管理**: 合理使用Redux Toolkit和Zustand
- **API调用**: 统一的错误处理和loading状态管理

### 目录规范
- `components/`: 通用可复用组件
- `views/`: 页面级组件
- `hooks/`: 自定义React Hooks
- `utils/`: 纯函数工具类
- `services/`: 业务服务层
- `types/`: TypeScript类型定义

### 新增功能开发流程
1. 在`types/`中定义相关类型
2. 在`api/`中添加API接口
3. 在`hooks/`中实现业务逻辑
4. 在`components/`或`views/`中实现UI组件
5. 在`styles/`中添加样式文件

## 🔗 相关链接

- **后端项目**: ../backend/README.md
- **主项目文档**: ../README.md
- **API文档**: 启动后端服务后访问 Swagger 文档

## 📞 技术支持

如遇到问题，请：
1. 联系QQ:2416820386

---

⭐ 如果这个项目对你有帮助，请给我们一个 Star！
