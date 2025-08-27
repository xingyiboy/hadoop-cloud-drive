package cn.iocoder.yudao.module.system.util;

import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import org.apache.http.HttpEntity;
import org.apache.http.HttpResponse;
import org.apache.http.client.config.RequestConfig;
import org.apache.http.client.methods.HttpDelete;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.methods.HttpPut;
import org.apache.http.entity.ContentType;
import org.apache.http.entity.FileEntity;
import org.apache.http.entity.InputStreamEntity;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.util.EntityUtils;

import java.io.*;
import java.net.HttpURLConnection;
import java.net.URI;
import java.net.URL;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * HDFS WebHDFS REST API 工具类
 * 提供上传、下载、目录操作等功能
 */
public class HdfsUtils {

    /**
     * HDFS 配置项
     */
    public static class HdfsConfig {
        private String nameNodeHost;    // NameNode主机地址
        private int nameNodePort;       // NameNode WebHDFS端口
        private String dataNodeHost;    // DataNode主机地址
        private int dataNodePort;       // DataNode WebHDFS端口
        private String user;            // HDFS用户名
        private int timeout;            // 超时时间（毫秒）
        private int maxRetries;         // 最大重试次数

        public HdfsConfig(String nameNodeHost, int nameNodePort, String dataNodeHost, int dataNodePort,
                          String user, int timeout, int maxRetries) {
            this.nameNodeHost = nameNodeHost;
            this.nameNodePort = nameNodePort;
            this.dataNodeHost = dataNodeHost;
            this.dataNodePort = dataNodePort;
            this.user = user;
            this.timeout = timeout;
            this.maxRetries = maxRetries;
        }

        // 使用默认值创建配置
        public static HdfsConfig createDefault(String nameNodeHost, String user) {
            return new HdfsConfig(
                nameNodeHost,
                9870,           // 默认NameNode WebHDFS端口
                nameNodeHost,   // 默认DataNode与NameNode相同
                9864,           // 默认DataNode WebHDFS端口
                user,
                60000,          // 默认60秒超时
                3               // 默认最多重试3次
            );
        }

        // Getters
        public String getNameNodeHost() { return nameNodeHost; }
        public int getNameNodePort() { return nameNodePort; }
        public String getDataNodeHost() { return dataNodeHost; }
        public int getDataNodePort() { return dataNodePort; }
        public String getUser() { return user; }
        public int getTimeout() { return timeout; }
        public int getMaxRetries() { return maxRetries; }

        // 构建WebHDFS基础URL
        public String getWebHdfsUrl() {
            return "http://" + nameNodeHost + ":" + nameNodePort + "/webhdfs/v1";
        }
    }

    /**
     * HDFS文件信息类
     */
    public static class HdfsFileInfo {
        private String path;                 // 文件路径
        private long length;                 // 文件大小
        private boolean isDirectory;         // 是否是目录
        private long modificationTime;       // 修改时间
        private String owner;                // 所有者
        private String group;                // 组
        private String permission;           // 权限
        private Map<String, String> attributes;  // 其他属性

        public HdfsFileInfo(String path, long length, boolean isDirectory, long modificationTime,
                            String owner, String group, String permission) {
            this.path = path;
            this.length = length;
            this.isDirectory = isDirectory;
            this.modificationTime = modificationTime;
            this.owner = owner;
            this.group = group;
            this.permission = permission;
            this.attributes = new HashMap<>();
        }

        // Getters
        public String getPath() { return path; }
        public long getLength() { return length; }
        public boolean isDirectory() { return isDirectory; }
        public long getModificationTime() { return modificationTime; }
        public String getOwner() { return owner; }
        public String getGroup() { return group; }
        public String getPermission() { return permission; }
        public Map<String, String> getAttributes() { return attributes; }

        // 添加其他属性
        public void addAttribute(String key, String value) {
            attributes.put(key, value);
        }

        @Override
        public String toString() {
            return "HdfsFileInfo{" +
                    "path='" + path + '\'' +
                    ", length=" + length +
                    ", isDirectory=" + isDirectory +
                    ", modificationTime=" + modificationTime +
                    ", owner='" + owner + '\'' +
                    ", group='" + group + '\'' +
                    ", permission='" + permission + '\'' +
                    ", attributes=" + attributes +
                    '}';
        }
    }

    /**
     * 上传文件到HDFS
     *
     * @param config HDFS配置
     * @param localFilePath 本地文件路径
     * @param hdfsPath HDFS目标路径
     * @param overwrite 是否覆盖已存在文件
     * @param progressCallback 进度回调接口
     * @return 上传是否成功
     * @throws Exception 上传过程中发生的异常
     */
    public static boolean uploadFile(HdfsConfig config, String localFilePath, String hdfsPath,
                                     boolean overwrite, ProgressCallback progressCallback) throws Exception {
        File file = new File(localFilePath);
        if (!file.exists()) {
            throw new FileNotFoundException("本地文件不存在: " + localFilePath);
        }

        // 配置HttpClient
        RequestConfig requestConfig = RequestConfig.custom()
                .setConnectTimeout(config.getTimeout())
                .setSocketTimeout(config.getTimeout())
                .setConnectionRequestTimeout(config.getTimeout())
                .build();

        try (CloseableHttpClient httpClient = HttpClients.custom().setDefaultRequestConfig(requestConfig).build()) {
            // 1. 获取重定向URL
            String initialUrl = config.getWebHdfsUrl() + hdfsPath + "?op=CREATE"
                    + "&user.name=" + config.getUser()
                    + "&overwrite=" + overwrite
                    + "&createparent=true";

            log(progressCallback, "正在初始化上传...");

            // 发送初始请求
            URL url = new URL(initialUrl);
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("PUT");
            conn.setInstanceFollowRedirects(false);
            conn.setConnectTimeout(config.getTimeout());
            conn.setReadTimeout(config.getTimeout());

            int responseCode = conn.getResponseCode();

            if (responseCode == 307) {  // 临时重定向
                String redirectUrl = conn.getHeaderField("Location");

                // 替换主机名为实际DataNode IP
                String modifiedRedirectUrl = redirectUrl.replaceFirst("://[^:/]+", "://" + config.getDataNodeHost());

                log(progressCallback, "获取到重定向URL");

                // 2. 向重定向URL发送文件数据
                HttpPut putRequest = new HttpPut(new URI(modifiedRedirectUrl));
                putRequest.setHeader("Content-Type", "application/octet-stream");

                // 创建文件实体
                FileEntity entity = new FileEntity(file, ContentType.APPLICATION_OCTET_STREAM);
                putRequest.setEntity(entity);

                log(progressCallback, "开始上传文件...");
                progress(progressCallback, 0, file.length());

                boolean success = false;
                Exception lastException = null;

                // 实现重试逻辑
                for (int i = 0; i <= config.getMaxRetries() && !success; i++) {
                    if (i > 0) {
                        log(progressCallback, "正在进行第 " + i + " 次重试...");
                        Thread.sleep(2000 * i);  // 增加等待时间
                    }

                    try {
                        HttpResponse response = httpClient.execute(putRequest);
                        int statusCode = response.getStatusLine().getStatusCode();

                        if (statusCode == 201) {  // 创建成功
                            progress(progressCallback, file.length(), file.length());
                            log(progressCallback, "文件上传成功!");
                            success = true;
                            break;
                        } else {
                            log(progressCallback, "文件上传失败，状态码: " + statusCode);
                        }
                    } catch (Exception e) {
                        lastException = e;
                        log(progressCallback, "上传失败: " + e.getMessage());
                    }
                }

                if (!success && lastException != null) {
                    throw lastException;
                }

                return success;
            } else {
                log(progressCallback, "获取重定向URL失败，响应码: " + responseCode);
                throw new IOException("获取重定向URL失败，响应码: " + responseCode);
            }
        }
    }

    /**
     * 从HDFS下载文件
     *
     * @param config HDFS配置
     * @param hdfsPath HDFS文件路径
     * @param localFilePath 本地保存路径
     * @param progressCallback 进度回调接口
     * @return 下载是否成功
     * @throws Exception 下载过程中发生的异常
     */
    public static boolean downloadFile(HdfsConfig config, String hdfsPath, String localFilePath,
                                      ProgressCallback progressCallback) throws Exception {
        // 配置HttpClient
        RequestConfig requestConfig = RequestConfig.custom()
                .setConnectTimeout(config.getTimeout())
                .setSocketTimeout(config.getTimeout())
                .setConnectionRequestTimeout(config.getTimeout())
                .build();

        try (CloseableHttpClient httpClient = HttpClients.custom().setDefaultRequestConfig(requestConfig).build()) {
            // 构建WebHDFS下载URL
            String downloadUrl = config.getWebHdfsUrl() + hdfsPath + "?op=OPEN"
                    + "&user.name=" + config.getUser()
                    + "&offset=0";

            log(progressCallback, "正在初始化下载...");

            // 发送初始请求
            URL url = new URL(downloadUrl);
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("GET");
            conn.setInstanceFollowRedirects(false);
            conn.setConnectTimeout(config.getTimeout());
            conn.setReadTimeout(config.getTimeout());

            int responseCode = conn.getResponseCode();

            if (responseCode == 307) {  // 临时重定向
                String redirectUrl = conn.getHeaderField("Location");

                // 替换主机名为实际DataNode IP
                String modifiedRedirectUrl = redirectUrl.replaceFirst("://[^:/]+", "://" + config.getDataNodeHost());

                log(progressCallback, "获取到重定向URL");

                // 获取文件信息，包括大小
                HdfsFileInfo fileInfo = getFileInfo(config, hdfsPath);
                if (fileInfo == null) {
                    throw new IOException("无法获取文件信息: " + hdfsPath);
                }

                long fileSize = fileInfo.getLength();

                // 发送GET请求下载文件
                HttpGet getRequest = new HttpGet(new URI(modifiedRedirectUrl));

                log(progressCallback, "开始下载文件...");
                progress(progressCallback, 0, fileSize);

                boolean success = false;
                Exception lastException = null;

                // 实现重试逻辑
                for (int i = 0; i <= config.getMaxRetries() && !success; i++) {
                    if (i > 0) {
                        log(progressCallback, "正在进行第 " + i + " 次重试...");
                        Thread.sleep(2000 * i);  // 增加等待时间
                    }

                    try (FileOutputStream fos = new FileOutputStream(localFilePath)) {
                        HttpResponse response = httpClient.execute(getRequest);
                        int statusCode = response.getStatusLine().getStatusCode();

                        if (statusCode == 200) {  // 下载成功
                            HttpEntity entity = response.getEntity();
                            if (entity != null) {
                                try (InputStream inputStream = entity.getContent()) {
                                    byte[] buffer = new byte[8192];
                                    int bytesRead;
                                    long totalBytesRead = 0;

                                    while ((bytesRead = inputStream.read(buffer)) != -1) {
                                        fos.write(buffer, 0, bytesRead);
                                        totalBytesRead += bytesRead;
                                        progress(progressCallback, totalBytesRead, fileSize);
                                    }
                                }

                                log(progressCallback, "文件下载成功!");
                                success = true;
                                break;
                            }
                        } else {
                            log(progressCallback, "文件下载失败，状态码: " + statusCode);
                        }
                    } catch (Exception e) {
                        lastException = e;
                        log(progressCallback, "下载失败: " + e.getMessage());
                    }
                }

                if (!success && lastException != null) {
                    throw lastException;
                }

                return success;
            } else {
                log(progressCallback, "获取重定向URL失败，响应码: " + responseCode);
                throw new IOException("获取重定向URL失败，响应码: " + responseCode);
            }
        }
    }

    /**
     * 列出HDFS目录内容
     *
     * @param config HDFS配置
     * @param hdfsPath HDFS目录路径
     * @return 目录内容列表
     * @throws Exception 操作过程中发生的异常
     */
    public static List<Map<String, Object>> listDirectory(HdfsConfig config, String hdfsPath) throws Exception {
        // 配置HttpClient
        RequestConfig requestConfig = RequestConfig.custom()
                .setConnectTimeout(config.getTimeout())
                .setSocketTimeout(config.getTimeout())
                .setConnectionRequestTimeout(config.getTimeout())
                .build();

        try (CloseableHttpClient httpClient = HttpClients.custom().setDefaultRequestConfig(requestConfig).build()) {
            // 构建WebHDFS URL
            String listUrl = config.getWebHdfsUrl() + hdfsPath + "?op=LISTSTATUS"
                    + "&user.name=" + config.getUser();

            HttpGet getRequest = new HttpGet(new URI(listUrl));

            HttpResponse response = httpClient.execute(getRequest);
            int statusCode = response.getStatusLine().getStatusCode();

            if (statusCode == 200) {
                String responseBody = EntityUtils.toString(response.getEntity());

                // 解析JSON响应
                Gson gson = new Gson();
                JsonObject jsonObject = gson.fromJson(responseBody, JsonObject.class);
                List<Map<String, Object>> fileList = new ArrayList<>();

                if (jsonObject.has("FileStatuses") && jsonObject.get("FileStatuses").isJsonObject()) {
                    JsonObject fileStatuses = jsonObject.getAsJsonObject("FileStatuses");

                    if (fileStatuses.has("FileStatus") && fileStatuses.get("FileStatus").isJsonArray()) {
                        JsonArray fileStatusArray = fileStatuses.getAsJsonArray("FileStatus");

                        for (int i = 0; i < fileStatusArray.size(); i++) {
                            JsonObject fileStatus = fileStatusArray.get(i).getAsJsonObject();
                            Map<String, Object> fileInfo = new HashMap<>();

                            fileInfo.put("name", fileStatus.get("pathSuffix").getAsString());
                            fileInfo.put("type", fileStatus.get("type").getAsString().equals("DIRECTORY") ? "目录" : "文件");
                            fileInfo.put("size", fileStatus.get("length").getAsLong());
                            fileInfo.put("modificationTime", fileStatus.get("modificationTime").getAsLong());
                            fileInfo.put("owner", fileStatus.get("owner").getAsString());
                            fileInfo.put("group", fileStatus.get("group").getAsString());
                            fileInfo.put("permission", fileStatus.get("permission").getAsString());

                            fileList.add(fileInfo);
                        }
                    }
                }

                return fileList;
            } else {
                throw new IOException("列出目录失败，状态码: " + statusCode);
            }
        }
    }

    /**
     * 获取HDFS文件或目录信息
     *
     * @param config HDFS配置
     * @param hdfsPath HDFS文件或目录路径
     * @return 文件信息对象，不存在则返回null
     * @throws Exception 操作过程中发生的异常
     */
    public static HdfsFileInfo getFileInfo(HdfsConfig config, String hdfsPath) throws Exception {
        // 配置HttpClient
        RequestConfig requestConfig = RequestConfig.custom()
                .setConnectTimeout(config.getTimeout())
                .setSocketTimeout(config.getTimeout())
                .setConnectionRequestTimeout(config.getTimeout())
                .build();

        try (CloseableHttpClient httpClient = HttpClients.custom().setDefaultRequestConfig(requestConfig).build()) {
            // 构建WebHDFS URL
            String infoUrl = config.getWebHdfsUrl() + hdfsPath + "?op=GETFILESTATUS"
                    + "&user.name=" + config.getUser();

            HttpGet getRequest = new HttpGet(new URI(infoUrl));

            HttpResponse response = httpClient.execute(getRequest);
            int statusCode = response.getStatusLine().getStatusCode();

            if (statusCode == 200) {
                String responseBody = EntityUtils.toString(response.getEntity());

                // 解析JSON响应
                Gson gson = new Gson();
                JsonObject jsonObject = gson.fromJson(responseBody, JsonObject.class);

                if (jsonObject.has("FileStatus") && jsonObject.get("FileStatus").isJsonObject()) {
                    JsonObject fileStatus = jsonObject.getAsJsonObject("FileStatus");

                    HdfsFileInfo fileInfo = new HdfsFileInfo(
                            hdfsPath,
                            fileStatus.get("length").getAsLong(),
                            fileStatus.get("type").getAsString().equals("DIRECTORY"),
                            fileStatus.get("modificationTime").getAsLong(),
                            fileStatus.get("owner").getAsString(),
                            fileStatus.get("group").getAsString(),
                            fileStatus.get("permission").getAsString()
                    );

                    // 添加其他属性
                    for (Map.Entry<String, com.google.gson.JsonElement> entry : fileStatus.entrySet()) {
                        if (!entry.getKey().equals("length") &&
                            !entry.getKey().equals("type") &&
                            !entry.getKey().equals("modificationTime") &&
                            !entry.getKey().equals("owner") &&
                            !entry.getKey().equals("group") &&
                            !entry.getKey().equals("permission")) {
                            fileInfo.addAttribute(entry.getKey(), entry.getValue().toString());
                        }
                    }

                    return fileInfo;
                }
            } else if (statusCode == 404) {
                return null;  // 文件不存在
            } else {
                throw new IOException("获取文件信息失败，状态码: " + statusCode);
            }
        }

        return null;
    }

    /**
     * 创建HDFS目录
     *
     * @param config HDFS配置
     * @param hdfsPath 要创建的目录路径
     * @param permission 目录权限（如"755"）
     * @return 创建是否成功
     * @throws Exception 操作过程中发生的异常
     */
    public static boolean mkdir(HdfsConfig config, String hdfsPath, String permission) throws Exception {
        // 配置HttpClient
        RequestConfig requestConfig = RequestConfig.custom()
                .setConnectTimeout(config.getTimeout())
                .setSocketTimeout(config.getTimeout())
                .setConnectionRequestTimeout(config.getTimeout())
                .build();

        try (CloseableHttpClient httpClient = HttpClients.custom().setDefaultRequestConfig(requestConfig).build()) {
            // 构建WebHDFS URL
            String mkdirUrl = config.getWebHdfsUrl() + hdfsPath + "?op=MKDIRS"
                    + "&user.name=" + config.getUser();

            if (permission != null && !permission.isEmpty()) {
                mkdirUrl += "&permission=" + permission;
            }

            HttpPut putRequest = new HttpPut(new URI(mkdirUrl));

            HttpResponse response = httpClient.execute(putRequest);
            int statusCode = response.getStatusLine().getStatusCode();

            if (statusCode == 200) {
                String responseBody = EntityUtils.toString(response.getEntity());

                // 解析JSON响应
                Gson gson = new Gson();
                JsonObject jsonObject = gson.fromJson(responseBody, JsonObject.class);

                if (jsonObject.has("boolean")) {
                    return jsonObject.get("boolean").getAsBoolean();
                }

                return false;
            } else {
                throw new IOException("创建目录失败，状态码: " + statusCode);
            }
        }
    }

    /**
     * 删除HDFS文件或目录
     *
     * @param config HDFS配置
     * @param hdfsPath 要删除的路径
     * @param recursive 是否递归删除子目录和文件
     * @return 删除是否成功
     * @throws Exception 操作过程中发生的异常
     */
    public static boolean delete(HdfsConfig config, String hdfsPath, boolean recursive) throws Exception {
        // 配置HttpClient
        RequestConfig requestConfig = RequestConfig.custom()
                .setConnectTimeout(config.getTimeout())
                .setSocketTimeout(config.getTimeout())
                .setConnectionRequestTimeout(config.getTimeout())
                .build();

        try (CloseableHttpClient httpClient = HttpClients.custom().setDefaultRequestConfig(requestConfig).build()) {
            // 构建WebHDFS URL
            String deleteUrl = config.getWebHdfsUrl() + hdfsPath + "?op=DELETE"
                    + "&user.name=" + config.getUser()
                    + "&recursive=" + recursive;

            HttpDelete deleteRequest = new HttpDelete(new URI(deleteUrl));

            HttpResponse response = httpClient.execute(deleteRequest);
            int statusCode = response.getStatusLine().getStatusCode();

            if (statusCode == 200) {
                String responseBody = EntityUtils.toString(response.getEntity());

                // 解析JSON响应
                Gson gson = new Gson();
                JsonObject jsonObject = gson.fromJson(responseBody, JsonObject.class);

                if (jsonObject.has("boolean")) {
                    return jsonObject.get("boolean").getAsBoolean();
                }

                return false;
            } else {
                throw new IOException("删除文件/目录失败，状态码: " + statusCode);
            }
        }
    }

    /**
     * 检查文件或目录是否存在
     *
     * @param config HDFS配置
     * @param hdfsPath 要检查的路径
     * @return 是否存在
     * @throws Exception 操作过程中发生的异常
     */
    public static boolean exists(HdfsConfig config, String hdfsPath) throws Exception {
        return getFileInfo(config, hdfsPath) != null;
    }

    /**
     * 记录状态日志
     */
    private static void log(ProgressCallback callback, String message) {
        if (callback != null) {
            callback.onStatusUpdate(message);
        }
    }

    /**
     * 更新进度
     */
    private static void progress(ProgressCallback callback, long current, long total) {
        if (callback != null) {
            callback.onProgress(current, total);
        }
    }

    /**
     * 进度回调接口
     */
    public interface ProgressCallback {
        /**
         * 当传输进度更新时调用
         *
         * @param bytesTransferred 已传输字节数
         * @param totalBytes 总字节数
         */
        void onProgress(long bytesTransferred, long totalBytes);

        /**
         * 当状态更新时调用
         *
         * @param status 状态信息
         */
        void onStatusUpdate(String status);
    }

    /**
     * 创建文件
     *
     * @param config HDFS配置
     * @param hdfsPath HDFS目标路径
     * @param inputStream 文件输入流
     * @return 创建是否成功
     * @throws Exception 操作过程中发生的异常
     */
    public static boolean createFile(HdfsConfig config, String hdfsPath, InputStream inputStream) throws Exception {
        // 配置HttpClient
        RequestConfig requestConfig = RequestConfig.custom()
                .setConnectTimeout(config.getTimeout())
                .setSocketTimeout(config.getTimeout())
                .setConnectionRequestTimeout(config.getTimeout())
                .build();

        try (CloseableHttpClient httpClient = HttpClients.custom().setDefaultRequestConfig(requestConfig).build()) {
            // 1. 获取重定向URL
            String initialUrl = config.getWebHdfsUrl() + hdfsPath + "?op=CREATE"
                    + "&user.name=" + config.getUser()
                    + "&overwrite=true"
                    + "&createparent=true";

            // 发送初始请求
            URL url = new URL(initialUrl);
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("PUT");
            conn.setInstanceFollowRedirects(false);
            conn.setConnectTimeout(config.getTimeout());
            conn.setReadTimeout(config.getTimeout());

            int responseCode = conn.getResponseCode();

            if (responseCode == 307) {  // 临时重定向
                String redirectUrl = conn.getHeaderField("Location");
                // 替换主机名为实际DataNode IP
                String modifiedRedirectUrl = redirectUrl.replaceFirst("://[^:/]+", "://" + config.getDataNodeHost());

                // 2. 向重定向URL发送文件数据
                HttpPut putRequest = new HttpPut(new URI(modifiedRedirectUrl));
                InputStreamEntity entity = new InputStreamEntity(inputStream, -1, ContentType.APPLICATION_OCTET_STREAM);
                putRequest.setEntity(entity);

                boolean success = false;
                Exception lastException = null;

                // 实现重试逻辑
                for (int i = 0; i <= config.getMaxRetries() && !success; i++) {
                    if (i > 0) {
                        Thread.sleep(2000 * i);  // 增加等待时间
                    }

                    try {
                        HttpResponse response = httpClient.execute(putRequest);
                        int statusCode = response.getStatusLine().getStatusCode();

                        if (statusCode == 201) {  // 创建成功
                            success = true;
                            break;
                        }
                    } catch (Exception e) {
                        lastException = e;
                    }
                }

                if (!success && lastException != null) {
                    throw lastException;
                }

                return success;
            } else {
                throw new IOException("获取重定向URL失败，响应码: " + responseCode);
            }
        }
    }

    /**
     * 读取HDFS文件内容
     *
     * @param config HDFS配置
     * @param hdfsPath HDFS文件路径
     * @return 文件输入流
     * @throws Exception 读取过程中发生的异常
     */
    public static InputStream readFile(HdfsConfig config, String hdfsPath) throws Exception {
        // 配置HttpClient
        RequestConfig requestConfig = RequestConfig.custom()
                .setConnectTimeout(config.getTimeout())
                .setSocketTimeout(config.getTimeout())
                .setConnectionRequestTimeout(config.getTimeout())
                .build();

        CloseableHttpClient httpClient = HttpClients.custom()
                .setDefaultRequestConfig(requestConfig)
                .build();

        // 构建WebHDFS URL
        String readUrl = config.getWebHdfsUrl() + hdfsPath + "?op=OPEN"
                + "&user.name=" + config.getUser()
                + "&offset=0";

        // 发送初始请求获取重定向URL
        URL url = new URL(readUrl);
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setRequestMethod("GET");
        conn.setInstanceFollowRedirects(false);
        conn.setConnectTimeout(config.getTimeout());
        conn.setReadTimeout(config.getTimeout());

        int responseCode = conn.getResponseCode();

        if (responseCode == 307) {  // 临时重定向
            String redirectUrl = conn.getHeaderField("Location");
            // 替换主机名为实际DataNode IP
            String modifiedRedirectUrl = redirectUrl.replaceFirst("://[^:/]+", "://" + config.getDataNodeHost());

            // 发送GET请求读取文件
            HttpGet getRequest = new HttpGet(new URI(modifiedRedirectUrl));
            HttpResponse response = httpClient.execute(getRequest);
            int statusCode = response.getStatusLine().getStatusCode();

            if (statusCode == 200) {
                HttpEntity entity = response.getEntity();
                if (entity != null) {
                    // 返回文件输入流，由调用者负责关闭
                    return entity.getContent();
                }
            }
            throw new IOException("读取文件失败，状态码: " + statusCode);
        } else {
            throw new IOException("获取重定向URL失败，响应码: " + responseCode);
        }
    }

    /**
     * 移动/重命名 HDFS 文件或目录
     *
     * @param config HDFS配置
     * @param sourcePath 源文件路径
     * @param destinationPath 目标文件路径
     * @return 操作是否成功
     * @throws Exception 操作过程中发生的异常
     */
    public static boolean mv(HdfsConfig config, String sourcePath, String destinationPath) throws Exception {
        // 配置HttpClient
        RequestConfig requestConfig = RequestConfig.custom()
                .setConnectTimeout(config.getTimeout())
                .setSocketTimeout(config.getTimeout())
                .setConnectionRequestTimeout(config.getTimeout())
                .build();

        try (CloseableHttpClient httpClient = HttpClients.custom().setDefaultRequestConfig(requestConfig).build()) {
            // 构建 RENAME 请求 URL
            String url = config.getWebHdfsUrl() + sourcePath + "?op=RENAME"
                    + "&user.name=" + config.getUser()
                    + "&destination=" + destinationPath;

            // 创建 PUT 请求
            HttpPut putRequest = new HttpPut(url);

            // 执行请求
            HttpResponse response = httpClient.execute(putRequest);
            int statusCode = response.getStatusLine().getStatusCode();

            // 检查响应
            if (statusCode == 200) {
                // 解析响应内容
                HttpEntity entity = response.getEntity();
                if (entity != null) {
                    String responseBody = EntityUtils.toString(entity);
                    Gson gson = new Gson();
                    JsonObject jsonResponse = gson.fromJson(responseBody, JsonObject.class);
                    return jsonResponse.has("boolean") && jsonResponse.get("boolean").getAsBoolean();
                }
            }

            return false;
        }
    }
}
