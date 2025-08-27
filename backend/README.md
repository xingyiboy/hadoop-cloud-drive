# Hadoop云盘系统 - 后端服务

<div align="center">
<h3>基于Spring Boot + Hadoop HDFS的分布式云盘后端服务</h3>
</div>

<p align="center">
 <img src="https://img.shields.io/badge/Spring%20Boot-2.7.18-blue.svg" alt="Spring Boot">
 <img src="https://img.shields.io/badge/Hadoop-3.x-orange.svg" alt="Hadoop">
 <img src="https://img.shields.io/badge/MySQL-5.7+-blue.svg" alt="MySQL">
 <img src="https://img.shields.io/badge/Redis-6.0+-red.svg" alt="Redis">
 <img src="https://img.shields.io/badge/JDK-1.8+-green.svg" alt="JDK">
</p>

## 📖 项目介绍

这是Hadoop云盘系统的后端服务，基于Spring Boot框架和芋道源码框架构建，集成Hadoop HDFS分布式文件系统，提供完整的云盘后端服务。系统支持大规模文件存储、用户权限管理、文件分享、安全认证等企业级功能。

### 🌟 核心特性

- **分布式存储**：基于Hadoop HDFS，支持海量文件存储和数据冗余
- **高可用架构**：Spring Boot多模块架构，支持微服务部署
- **安全认证**：基于Spring Security的JWT令牌认证体系
- **权限控制**：细粒度的用户权限和数据权限控制
- **文件管理**：完整的文件CRUD操作和文件夹层级管理
- **分享功能**：支持文件和文件夹的链接分享
- **缓存优化**：Redis缓存提升系统性能
- **API文档**：基于Swagger的完整API文档
- **监控告警**：完善的系统监控和日志记录
- **数据库支持**：支持MySQL、PostgreSQL等主流数据库

## 🏗️ 系统架构

本项目基于芋道源码框架，采用经典的分层架构设计：

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   前端应用层      │    │   网关层(可选)    │    │   负载均衡       │
│   React Web     │───▶│   Gateway       │───▶│   Nginx/LB      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                       │
                       ┌─────────────────────────────────┘
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                        应用服务层                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐               │
│  │   用户模块    │  │   文件模块    │  │   系统模块    │               │
│  │   User       │  │   File       │  │   System     │               │
│  └─────────────┘  └─────────────┘  └─────────────┘               │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                        数据访问层                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐               │
│  │   MySQL      │  │   Redis      │  │   HDFS       │               │
│  │   (元数据)    │  │   (缓存)     │  │   (文件)     │               │
│  └─────────────┘  └─────────────┘  └─────────────┘               │
└─────────────────────────────────────────────────────────────────┘
```

## 📁 项目结构

```
backend/
├── yudao-dependencies/                  # Maven依赖版本管理
│   └── pom.xml                         # 统一依赖版本控制
├── yudao-framework/                     # 框架核心模块
│   ├── yudao-common/                   # 通用模块
│   ├── yudao-spring-boot-starter-biz-data-permission/  # 数据权限
│   ├── yudao-spring-boot-starter-biz-ip/               # IP处理
│   ├── yudao-spring-boot-starter-biz-tenant/           # 多租户支持
│   ├── yudao-spring-boot-starter-excel/                # Excel处理
│   ├── yudao-spring-boot-starter-job/                  # 定时任务
│   ├── yudao-spring-boot-starter-monitor/              # 系统监控
│   ├── yudao-spring-boot-starter-mq/                   # 消息队列
│   ├── yudao-spring-boot-starter-mybatis/              # 数据库访问
│   ├── yudao-spring-boot-starter-protection/           # 安全防护
│   ├── yudao-spring-boot-starter-redis/                # Redis缓存
│   ├── yudao-spring-boot-starter-security/             # 安全认证
│   ├── yudao-spring-boot-starter-test/                 # 单元测试
│   ├── yudao-spring-boot-starter-web/                  # Web服务
│   └── yudao-spring-boot-starter-websocket/            # WebSocket支持
├── yudao-module-system/                 # 系统管理模块
│   ├── yudao-module-system-api/        # 系统API接口
│   └── yudao-module-system-biz/        # 系统业务实现
│       ├── src/main/java/cn/iocoder/yudao/module/system/
│       │   ├── controller/             # 控制器层
│       │   │   ├── admin/              # 管理端接口
│       │   │   └── app/                # 用户端接口
│       │   ├── service/                # 业务逻辑层
│       │   │   ├── hadoopfile/         # Hadoop文件服务 ⭐
│       │   │   ├── user/               # 用户管理服务
│       │   │   ├── auth/               # 认证服务
│       │   │   └── permission/         # 权限服务
│       │   ├── dal/                    # 数据访问层
│       │   │   ├── dataobject/         # 数据对象(DO)
│       │   │   └── mysql/              # MySQL数据访问
│       │   └── convert/                # 对象转换器
│       └── src/main/resources/
│           ├── mapper/                 # MyBatis映射文件
│           └── application-*.yaml      # 配置文件
├── yudao-module-infra/                  # 基础设施模块
│   ├── yudao-module-infra-api/         # 基础设施API
│   └── yudao-module-infra-biz/         # 基础设施业务
│       └── src/main/java/cn/iocoder/yudao/module/infra/
│           ├── controller/             # 文件上传下载控制器
│           ├── service/                # 文件处理服务
│           └── dal/                    # 文件元数据访问
├── yudao-server/                        # 应用启动模块
│   ├── src/main/java/
│   │   └── cn/iocoder/yudao/server/
│   │       └── YudaoServerApplication.java  # 应用启动类
│   ├── src/main/resources/
│   │   ├── application.yaml            # 主配置文件
│   │   ├── application-dev.yaml        # 开发环境配置
│   │   ├── application-local.yaml      # 本地环境配置
│   │   └── logback-spring.xml          # 日志配置
│   ├── Dockerfile                      # Docker构建文件
│   └── pom.xml                        # Maven配置
├── sql/                                # 数据库脚本
│   └── mdjrtt.zip                     # 数据库初始化脚本
└── pom.xml                            # Maven主配置文件
```

## 🛠️ 技术栈

### 核心框架
- **Spring Boot**: 2.7.18 (应用开发框架)
- **Spring Security**: 5.7+ (安全认证框架)
- **Spring MVC**: 5.3+ (Web MVC框架)
- **芋道框架**: 基于Spring Boot的企业级开发框架

### 数据存储
- **MySQL**: 5.7+ / 8.0+ (关系型数据库，存储元数据)
- **Redis**: 6.0+ (缓存数据库，会话存储)
- **Hadoop HDFS**: 3.x (分布式文件系统，文件存储) ⭐

### 数据访问
- **MyBatis Plus**: 3.5+ (持久层框架)
- **Druid**: 1.2+ (数据库连接池)
- **Dynamic Datasource**: 3.6+ (动态数据源)

### 工具库
- **Swagger/Springdoc**: API文档生成
- **MapStruct**: 对象映射转换
- **Hutool**: Java工具类库
- **Lombok**: 减少样板代码
- **Jackson**: JSON序列化
- **Quartz**: 定时任务调度

### 监控运维
- **Spring Boot Actuator**: 应用监控
- **SkyWalking**: 链路追踪(可选)
- **Logback**: 日志框架
- **Maven**: 项目构建管理
- **Docker**: 容器化部署

## ⚡ 快速开始

### 📋 环境要求

#### 基础环境
- **JDK**: 1.8+ (推荐 JDK 11)
- **Maven**: 3.6+
- **MySQL**: 5.7+ / 8.0+
- **Redis**: 6.0+

#### Hadoop环境
- **Hadoop**: 3.x (需要配置HDFS)
- **操作系统**: Linux/Windows (推荐Linux)

### 🔧 环境配置

#### 1. 数据库配置

**创建数据库**
```sql
CREATE DATABASE `hadoop_cloud_drive` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

**导入数据库脚本**
```bash
# 解压数据库脚本
cd backend/sql/
unzip mdjrtt.zip

# 导入到MySQL
mysql -u root -p hadoop_cloud_drive < [脚本文件名].sql
```

#### 2. Redis配置

确保Redis服务正常运行：
```bash
# 启动Redis (Linux)
redis-server

# 或使用systemctl (Linux)
systemctl start redis

# Windows下启动Redis
redis-server.exe redis.windows.conf
```

#### 3. Hadoop HDFS配置

**配置HDFS地址** (在业务代码中)

修改文件：`yudao-module-system-biz/src/main/java/cn/iocoder/yudao/module/system/service/hadoopfile/HadoopFileServiceImpl.java`

```java
// 配置Hadoop HDFS地址
private static final String HDFS_URI = "hdfs://localhost:9000"; // 修改为你的HDFS地址
```

**确保HDFS服务正常运行**：
```bash
# 启动Hadoop集群
start-dfs.sh
start-yarn.sh

# 检查HDFS状态
hdfs dfsadmin -report
```

#### 4. 应用配置

修改配置文件：`yudao-server/src/main/resources/application-dev.yaml`

**数据库配置**：
```yaml
spring:
  datasource:
    druid:
      master:
        url: jdbc:mysql://localhost:3306/hadoop_cloud_drive?useUnicode=true&characterEncoding=UTF-8&useSSL=false&serverTimezone=Asia/Shanghai
        username: root
        password: 你的密码
```

**Redis配置**：
```yaml
spring:
  redis:
    host: localhost
    port: 6379
    password: # 如果有密码请填写
    database: 0
```

### 🚀 启动应用

#### 1. 编译项目
```bash
cd backend/
mvn clean install -DskipTests
```

#### 2. 启动后端服务
```bash
# 方式一：使用Maven启动
cd yudao-server/
mvn spring-boot:run

# 方式二：使用IDE启动
# 直接运行 YudaoServerApplication.java 主类

# 方式三：使用jar包启动
cd yudao-server/target/
java -jar yudao-server.jar
```

#### 3. 验证启动

- **应用地址**: http://localhost:48080
- **API文档**: http://localhost:48080/doc.html
- **监控端点**: http://localhost:48080/actuator

默认管理员账号：
- 用户名：admin
- 密码：admin123

## 🔗 API接口

### 文件管理接口

| 接口 | 方法 | 描述 |
|------|------|------|
| `/admin-api/system/hadoop-file/upload` | POST | 文件上传 |
| `/admin-api/system/hadoop-file/download` | GET | 文件下载 |
| `/admin-api/system/hadoop-file/list` | GET | 获取文件列表 |
| `/admin-api/system/hadoop-file/delete` | DELETE | 删除文件 |
| `/admin-api/system/hadoop-file/rename` | PUT | 重命名文件 |
| `/admin-api/system/hadoop-file/create-folder` | POST | 创建文件夹 |
| `/admin-api/system/hadoop-file/share` | POST | 生成分享链接 |

### 用户认证接口

| 接口 | 方法 | 描述 |
|------|------|------|
| `/admin-api/system/auth/login` | POST | 用户登录 |
| `/admin-api/system/auth/logout` | POST | 用户登出 |
| `/admin-api/system/auth/refresh-token` | POST | 刷新令牌 |
| `/admin-api/system/auth/get-permission-info` | GET | 获取用户权限 |

### 系统管理接口

| 接口 | 方法 | 描述 |
|------|------|------|
| `/admin-api/system/user/*` | * | 用户管理 |
| `/admin-api/system/role/*` | * | 角色管理 |
| `/admin-api/system/menu/*` | * | 菜单管理 |
| `/admin-api/system/dict/*` | * | 字典管理 |

## 🔧 开发指南

### 代码结构规范

```java
// Controller层 - 接口控制器
@RestController
@RequestMapping("/admin-api/system/hadoop-file")
public class HadoopFileController {
    // 处理HTTP请求，参数校验，响应封装
}

// Service层 - 业务逻辑
@Service
public class HadoopFileServiceImpl implements HadoopFileService {
    // 核心业务逻辑，事务控制
}

// DAL层 - 数据访问
@Mapper
public interface HadoopFileMapper extends BaseMapperX<HadoopFileDO> {
    // 数据库操作
}

// DO - 数据对象
@Data
@TableName("system_hadoop_file")
public class HadoopFileDO {
    // 数据库实体对象
}
```

### 新增功能开发

1. **定义数据对象(DO)**：在`dal/dataobject/`中定义
2. **创建Mapper接口**：在`dal/mysql/`中定义
3. **编写Service业务**：在`service/`中实现
4. **实现Controller**：在`controller/`中定义
5. **添加权限配置**：在菜单管理中配置
6. **编写单元测试**：确保代码质量

### 配置文件说明

- `application.yaml`: 主配置文件
- `application-dev.yaml`: 开发环境配置  
- `application-local.yaml`: 本地环境配置
- `application-prod.yaml`: 生产环境配置

### 日志配置

系统使用Logback作为日志框架，配置文件：`logback-spring.xml`

```xml
<!-- 主要日志级别 -->
<logger name="cn.iocoder.yudao" level="INFO"/>
<logger name="cn.iocoder.yudao.module.system.service.hadoopfile" level="DEBUG"/>
```

## 🐳 部署指南

### Docker部署

```bash
# 构建镜像
cd yudao-server/
docker build -t hadoop-cloud-drive-backend .

# 运行容器
docker run -d \
  --name hadoop-cloud-drive-backend \
  -p 48080:48080 \
  -e SPRING_PROFILES_ACTIVE=prod \
  hadoop-cloud-drive-backend
```

### 传统部署

```bash
# 打包应用
mvn clean package -DskipTests

# 上传jar包到服务器
scp yudao-server/target/yudao-server.jar user@server:/opt/app/

# 启动应用
java -jar -Xms1024m -Xmx2048m \
  -Dspring.profiles.active=prod \
  /opt/app/yudao-server.jar
```

## 🔗 相关链接

- **前端项目**: ../frontend/README.md
- **主项目文档**: ../README.md
- **芋道框架文档**: https://doc.iocoder.cn/
- **Spring Boot官方文档**: https://spring.io/projects/spring-boot
- **Hadoop官方文档**: https://hadoop.apache.org/

## 🤝 贡献指南

1. Fork项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启Pull Request

### 开发规范
- 遵循阿里巴巴Java开发手册
- 编写完整的单元测试
- 保持代码注释的完整性
- 遵循RESTful API设计规范

## 📞 技术支持

如遇到问题，请：
1. 联系QQ:2416820386

---

⭐ 如果这个项目对你有帮助，请给我们一个 Star！
