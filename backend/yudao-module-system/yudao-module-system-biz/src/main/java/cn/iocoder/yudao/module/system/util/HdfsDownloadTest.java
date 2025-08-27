package cn.iocoder.yudao.module.system.util;

import java.io.*;

public class HdfsDownloadTest {
    // HDFS服务器配置
    private static final String NAMENODE_HOST = "113.45.31.128";
    private static final int NAMENODE_PORT = 9870;
    private static final String DATANODE_HOST = "113.45.31.128";
    private static final int DATANODE_PORT = 9864;
    private static final String USER = "hadoop-namenode";
    private static final int TIMEOUT = 60000; // 60秒
    private static final int MAX_RETRIES = 3;

    public static void main(String[] args) {
        try {
            // 1. 创建HDFS配置
            HdfsUtils.HdfsConfig config = new HdfsUtils.HdfsConfig(
                NAMENODE_HOST, NAMENODE_PORT,
                DATANODE_HOST, DATANODE_PORT,
                USER, TIMEOUT, MAX_RETRIES
            );

            // 2. 指定要下载的文件路径
            String hdfsPath = "/142/ww/性能测试(1).mp4";
            
            // 3. 检查文件是否存在
            if (!HdfsUtils.exists(config, hdfsPath)) {
                System.out.println("文件不存在：" + hdfsPath);
                return;
            }

            // 4. 获取文件输入流
            try (InputStream inputStream = HdfsUtils.readFile(config, hdfsPath)) {
                // 5. 创建本地文件
                String localFilePath = "D:/test_download/性能测试(1).mp4";
                File localFile = new File(localFilePath);
                
                // 确保目录存在
                localFile.getParentFile().mkdirs();

                System.out.println("开始下载文件...");
                long startTime = System.currentTimeMillis();

                // 6. 将文件内容写入本地文件
                try (FileOutputStream outputStream = new FileOutputStream(localFile)) {
                    byte[] buffer = new byte[8192];
                    int bytesRead;
                    long totalBytes = 0;
                    
                    while ((bytesRead = inputStream.read(buffer)) != -1) {
                        outputStream.write(buffer, 0, bytesRead);
                        totalBytes += bytesRead;
                        
                        // 打印下载进度
                        if (totalBytes % (1024 * 1024) == 0) { // 每MB打印一次
                            System.out.printf("已下载: %.2f MB\n", totalBytes / (1024.0 * 1024.0));
                        }
                    }
                    
                    long endTime = System.currentTimeMillis();
                    double timeInSeconds = (endTime - startTime) / 1000.0;
                    double speedInMBps = (totalBytes / (1024.0 * 1024.0)) / timeInSeconds;
                    
                    System.out.println("\n下载完成！");
                    System.out.printf("文件保存在: %s\n", localFilePath);
                    System.out.printf("文件大小: %.2f MB\n", totalBytes / (1024.0 * 1024.0));
                    System.out.printf("耗时: %.2f 秒\n", timeInSeconds);
                    System.out.printf("平均速度: %.2f MB/s\n", speedInMBps);
                }
            }
        } catch (Exception e) {
            System.out.println("下载失败：" + e.getMessage());
            e.printStackTrace();
        }
    }
} 