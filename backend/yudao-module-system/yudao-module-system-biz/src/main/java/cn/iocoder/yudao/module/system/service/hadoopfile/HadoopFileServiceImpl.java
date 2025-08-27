package cn.iocoder.yudao.module.system.service.hadoopfile;

import cn.iocoder.yudao.framework.mybatis.core.query.LambdaQueryWrapperX;
import cn.iocoder.yudao.framework.security.core.util.SecurityFrameworkUtils;
import cn.iocoder.yudao.module.system.enums.FileTypeEnum;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import jodd.util.StringUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.validation.annotation.Validated;
import org.apache.hadoop.conf.Configuration;
import cn.iocoder.yudao.framework.common.exception.ServiceException;

import java.util.*;
import cn.iocoder.yudao.module.system.controller.admin.hadoopfile.vo.*;
import cn.iocoder.yudao.module.system.dal.dataobject.hadoopfile.HadoopFileDO;
import cn.iocoder.yudao.framework.common.pojo.PageResult;
import cn.iocoder.yudao.framework.common.pojo.PageParam;
import cn.iocoder.yudao.framework.common.util.object.BeanUtils;

import cn.iocoder.yudao.module.system.dal.mysql.hadoopfile.HadoopFileMapper;
import cn.iocoder.yudao.module.system.util.HdfsUtils;

import javax.annotation.Resource;

import static cn.iocoder.yudao.framework.common.exception.util.ServiceExceptionUtil.exception;
import static cn.iocoder.yudao.module.infra.enums.ErrorCodeConstants.FILE_NOT_EXISTS;
import static cn.iocoder.yudao.module.system.enums.ErrorCodeConstants.*;

import java.io.IOException;
import java.io.InputStream;
import java.time.LocalDateTime;

/**
 * hadoop文件 Service 实现类
 *
 * @author 管理员1
 */
@Service
@Validated
@Slf4j
public class HadoopFileServiceImpl implements HadoopFileService {

    @Resource
    private HadoopFileMapper hadoopFileMapper;

    // HDFS服务器配置
    private static final String NAMENODE_HOST = "113.45.31.128";
    private static final int NAMENODE_PORT = 9870;
    private static final String DATANODE_HOST = "113.45.31.128";
    private static final int DATANODE_PORT = 9864;
    private static final String USER = "hadoop-namenode";
    private static final int TIMEOUT = 60000; // 60秒
    private static final int MAX_RETRIES = 3;
    private static final String RECYCLE_BIN_PREFIX = "回收站（hadoop）";
    private static final String SHARE_PREFIX = "分享（hadoop）";

    @Override
    public Long createHadoopFile(HadoopFileSaveReqVO createReqVO) {

        // 获取当前登录用户ID
        Long loginUserId = SecurityFrameworkUtils.getLoginUserId();

        // 处理文件名和目录名中的空格
        String fileName = createReqVO.getName().replaceAll("\\s+", "");
        String catalogue = createReqVO.getCatalogue().replaceAll("\\s+", "");
        createReqVO.setName(fileName);
        createReqVO.setCatalogue(catalogue);

        // 检查同名文件
        LambdaQueryWrapper<HadoopFileDO> queryWrapper = new LambdaQueryWrapper<HadoopFileDO>()
                .eq(HadoopFileDO::getName, fileName)
                .eq(HadoopFileDO::getCatalogue, catalogue)
                .eq(HadoopFileDO::getCreator, loginUserId);

        // 如果存在同名文件，进行重命名
        if (hadoopFileMapper.exists(queryWrapper)) {
            int index = 1;
            String nameWithoutExt = fileName;
            String extension = "";

            // 处理文件扩展名
            int lastDotIndex = fileName.lastIndexOf(".");
            if (lastDotIndex > 0) {
                nameWithoutExt = fileName.substring(0, lastDotIndex);
                extension = fileName.substring(lastDotIndex);
            }

            // 循环查找可用的文件名
            String newFileName;
            do {
                newFileName = nameWithoutExt + "(" + index + ")" + extension;
                index++;
                queryWrapper = new LambdaQueryWrapper<HadoopFileDO>()
                        .eq(HadoopFileDO::getName, newFileName)
                        .eq(HadoopFileDO::getCatalogue, catalogue)
                        .eq(HadoopFileDO::getCreator, loginUserId);
            } while (hadoopFileMapper.exists(queryWrapper));

            fileName = newFileName;
            createReqVO.setName(fileName);
        }

        // 创建HDFS配置
        HdfsUtils.HdfsConfig config = new HdfsUtils.HdfsConfig(
            NAMENODE_HOST, NAMENODE_PORT,
            DATANODE_HOST, DATANODE_PORT,
            USER, TIMEOUT, MAX_RETRIES
        );

        try {
            // 构建HDFS文件路径，使用用户ID和当前目录
            String hdfsPath = "/" + loginUserId + catalogue + "/" + fileName;

            // 如果是目录类型，则创建目录
            if (FileTypeEnum.DIRECTORY.getType().equals(createReqVO.getType())) {
                // 确保父目录存在
                String parentDir = "/" + loginUserId + catalogue;
                if (!HdfsUtils.exists(config, parentDir)) {
                    HdfsUtils.mkdir(config, parentDir, "755");
                }

                boolean success = HdfsUtils.mkdir(config, hdfsPath, "755");
                if (!success) {
                    throw exception(HADOOP_FILE_NOT_EXISTS);
                }
            } else {
                // 如果是文件类型，上传文件
                // 确保父目录存在
                String parentDir = "/" + loginUserId + catalogue;
                if (!HdfsUtils.exists(config, parentDir)) {
                    HdfsUtils.mkdir(config, parentDir, "755");
                }

                // 上传文件
                if (createReqVO.getFile() != null) {
                    try (InputStream inputStream = createReqVO.getFile().getInputStream()) {
                        boolean success = HdfsUtils.createFile(config, hdfsPath, inputStream);
                        if (!success) {
                            throw exception(HADOOP_FILE_NOT_EXISTS);
                        }
                    } catch (IOException e) {
                        throw exception(HADOOP_FILE_NOT_EXISTS);
                    }
                }
            }
        } catch (Exception e) {
            throw exception(HADOOP_FILE_NOT_EXISTS);
        }

        // 插入数据库记录
        HadoopFileDO hadoopFile = BeanUtils.toBean(createReqVO, HadoopFileDO.class);
        hadoopFileMapper.insert(hadoopFile);
        return hadoopFile.getId();
    }


    @Override
    public void deleteHadoopFile(Long id) {
        // 获取文件信息
        HadoopFileDO file = hadoopFileMapper.selectById(id);
        if (file == null) {
            return;
        }

        // 获取当前登录用户ID
        Long loginUserId = SecurityFrameworkUtils.getLoginUserId();

        try {
            // 创建HDFS配置
            HdfsUtils.HdfsConfig config = new HdfsUtils.HdfsConfig(
                NAMENODE_HOST, NAMENODE_PORT,
                DATANODE_HOST, DATANODE_PORT,
                USER, TIMEOUT, MAX_RETRIES
            );

            // 处理目录路径，避免双斜杠
            String catalogue = file.getCatalogue();
            if (catalogue == null || catalogue.equals("/")) {
                catalogue = "";
            }

            // 构建HDFS文件路径
            String filePath = "/" + loginUserId + catalogue + "/" + file.getName();

            // 如果文件已经在回收站中，则直接删除
            if (file.getName().startsWith(RECYCLE_BIN_PREFIX)) {
                // 在HDFS中删除文件
                boolean success = HdfsUtils.delete(config, filePath, true);
                if (!success) {
                    throw exception(HADOOP_FILE_NOT_EXISTS);
                }
                // 删除数据库记录
                hadoopFileMapper.deleteById(id);
            } else {
                // 否则，将文件移动到回收站（重命名）
                String recyclePath = "/" + loginUserId + catalogue + "/" + RECYCLE_BIN_PREFIX + "/" + file.getName();

                // 确保回收站目录存在
                String recycleDir = "/" + loginUserId + catalogue + "/" + RECYCLE_BIN_PREFIX;
                if (!HdfsUtils.exists(config, recycleDir)) {
                    HdfsUtils.mkdir(config, recycleDir, "755");
                }

                // 在HDFS中移动文件到回收站
                boolean success = HdfsUtils.mv(config, filePath, recyclePath);
                if (!success) {
                    throw exception(HADOOP_FILE_NOT_EXISTS);
                }

                // 更新数据库记录
                file.setName(RECYCLE_BIN_PREFIX + "/" + file.getName());
                hadoopFileMapper.updateById(file);
            }
        } catch (Exception e) {
            log.error("[deleteHadoopFile][文件({})删除失败]", id, e);
            throw exception(HADOOP_FILE_NOT_EXISTS);
        }
    }

    @Override
    public void renameHadoopFile(Long id, String newName) {
        // 1. 校验文件是否存在
        HadoopFileDO file = hadoopFileMapper.selectById(id);
        if (file == null) {
            throw exception(FILE_NOT_EXISTS);
        }

        // 获取当前登录用户ID
        Long loginUserId = SecurityFrameworkUtils.getLoginUserId();

        // 2. 检查新名称在当前目录下是否已存在
        LambdaQueryWrapper<HadoopFileDO> queryWrapper = new LambdaQueryWrapper<HadoopFileDO>()
                .eq(HadoopFileDO::getName, newName)
                .eq(HadoopFileDO::getCatalogue, file.getCatalogue())
                .eq(HadoopFileDO::getCreator, loginUserId);
        if (hadoopFileMapper.exists(queryWrapper)) {
            throw exception(FILE_NAME_EXISTS);
        }

        try {
            // 3. 创建HDFS配置
            HdfsUtils.HdfsConfig config = new HdfsUtils.HdfsConfig(
                NAMENODE_HOST, NAMENODE_PORT,
                DATANODE_HOST, DATANODE_PORT,
                USER, TIMEOUT, MAX_RETRIES
            );

            // 4. 处理目录路径，避免双斜杠
            String catalogue = file.getCatalogue();
            if (catalogue == null || catalogue.equals("/")) {
                catalogue = "";
            }

            // 5. 构建HDFS文件路径
            String oldPath = "/" + loginUserId + catalogue + "/" + file.getName();
            String newPath = "/" + loginUserId + catalogue + "/" + newName;

            // 6. 如果是目录，使用复制-删除策略
            if (FileTypeEnum.DIRECTORY.getType().equals(file.getType())) {
                // 6.1 创建新目录
                if (!HdfsUtils.mkdir(config, newPath, "755")) {
                    throw exception(HADOOP_FILE_NOT_EXISTS);
                }

                // 6.2 获取所有子文件和子文件夹（包括嵌套的）
                // 注意：这里需要使用完整的HDFS路径进行查询
                String oldFullPath = "/" + loginUserId + catalogue + "/" + file.getName();
                List<HadoopFileDO> subFiles = hadoopFileMapper.selectList(
                    new LambdaQueryWrapperX<HadoopFileDO>()
                        .eq(HadoopFileDO::getCreator, loginUserId)
                        .eq(HadoopFileDO::getCatalogue, catalogue)
                        .likeRight(HadoopFileDO::getName, file.getName() + "/")
                        .orderByAsc(HadoopFileDO::getName) // 按名称排序，确保父文件夹在子文件之前处理
                );

                // 6.3 复制所有子文件到新目录
                for (HadoopFileDO subFile : subFiles) {
                    // 构建源文件和目标文件的路径
                    String subOldPath = "/" + loginUserId + catalogue + "/" + subFile.getName();
                    String subNewPath = "/" + loginUserId + catalogue + "/" + newName +
                                      subFile.getName().substring(file.getName().length());

                    if (FileTypeEnum.DIRECTORY.getType().equals(subFile.getType())) {
                        // 如果是子文件夹，创建目录
                        if (!HdfsUtils.mkdir(config, subNewPath, "755")) {
                            throw exception(HADOOP_FILE_NOT_EXISTS);
                        }
                    } else {
                        // 如果是文件，复制文件内容
                        try (InputStream inputStream = HdfsUtils.readFile(config, subOldPath)) {
                            if (inputStream == null) {
                                log.error("[renameHadoopFile][无法读取文件内容:{}]", subOldPath);
                                throw exception(HADOOP_FILE_NOT_EXISTS);
                            }
                            if (!HdfsUtils.createFile(config, subNewPath, inputStream)) {
                                throw exception(HADOOP_FILE_NOT_EXISTS);
                            }
                        }
                    }

                    // 更新数据库中的文件路径
                    String newSubFileName = newName + subFile.getName().substring(file.getName().length());
                    subFile.setName(newSubFileName);
                    hadoopFileMapper.updateById(subFile);
                }

                // 6.4 更新文件夹本身的记录
                file.setName(newName);
                hadoopFileMapper.updateById(file);

                // 6.5 删除原目录
                if (!HdfsUtils.delete(config, oldPath, true)) {
                    throw exception(HADOOP_FILE_NOT_EXISTS);
                }
            } else {
                // 7. 如果是普通文件，直接重命名
                if (!HdfsUtils.mv(config, oldPath, newPath)) {
                    throw exception(HADOOP_FILE_NOT_EXISTS);
                }

                // 更新数据库记录
                file.setName(newName);
                hadoopFileMapper.updateById(file);
            }
        } catch (Exception e) {
            log.error("[renameHadoopFile][id: {} newName: {}] 重命名文件失败", id, newName, e);
            throw exception(HADOOP_FILE_NOT_EXISTS);
        }
    }

    @Override
    public void restoreHadoopFile(Long id) {
        // 获取文件信息
        HadoopFileDO file = hadoopFileMapper.selectById(id);
        if (file == null) {
            return;
        }

        // 检查文件是否在回收站中
        if (!file.getName().startsWith(RECYCLE_BIN_PREFIX)) {
            throw exception(HADOOP_FILE_NOT_EXISTS);
        }

        // 获取当前登录用户ID
        Long loginUserId = SecurityFrameworkUtils.getLoginUserId();

        try {
            // 创建HDFS配置
            HdfsUtils.HdfsConfig config = new HdfsUtils.HdfsConfig(
                NAMENODE_HOST, NAMENODE_PORT,
                DATANODE_HOST, DATANODE_PORT,
                USER, TIMEOUT, MAX_RETRIES
            );

            // 处理目录路径，避免双斜杠
            String catalogue = file.getCatalogue();
            if (catalogue == null || catalogue.equals("/")) {
                catalogue = "";
            }

            // 构建当前文件路径（在回收站中）
            String currentPath = "/" + loginUserId + catalogue + "/" + file.getName();

            // 构建目标路径（从回收站中恢复）
            String originalName = file.getName().substring(RECYCLE_BIN_PREFIX.length() + 1); // +1 是为了去掉斜杠
            String targetPath = "/" + loginUserId + catalogue + "/" + originalName;

            // 检查目标路径是否已存在同名文件
            if (HdfsUtils.exists(config, targetPath)) {
                // 如果存在同名文件，进行重命名
                int index = 1;
                String nameWithoutExt = originalName;
                String extension = "";

                // 处理文件扩展名
                int lastDotIndex = originalName.lastIndexOf(".");
                if (lastDotIndex > 0) {
                    nameWithoutExt = originalName.substring(0, lastDotIndex);
                    extension = originalName.substring(lastDotIndex);
                }

                // 循环查找可用的文件名
                String newFileName;
                do {
                    newFileName = nameWithoutExt + "(" + index + ")" + extension;
                    targetPath = "/" + loginUserId + catalogue + "/" + newFileName;
                    index++;
                } while (HdfsUtils.exists(config, targetPath));

                originalName = newFileName;
            }

            // 移动文件到原始位置
            boolean success = HdfsUtils.mv(config, currentPath, targetPath);
            if (!success) {
                throw exception(HADOOP_FILE_NOT_EXISTS);
            }

            // 更新数据库记录
            file.setName(originalName);
            hadoopFileMapper.updateById(file);
        } catch (Exception e) {
            log.error("[restoreHadoopFile][文件({})恢复失败]", id, e);
            throw exception(HADOOP_FILE_NOT_EXISTS);
        }
    }

    private void validateHadoopFileExists(Long id) {
        if (hadoopFileMapper.selectById(id) == null) {
            throw exception(HADOOP_FILE_NOT_EXISTS);
        }
    }

    @Override
    public HadoopFileDO getHadoopFile(Long id) {
        return hadoopFileMapper.selectById(id);
    }

    @Override
    public PageResult<HadoopFileDO> getHadoopFilePage(HadoopFilePageReqVO pageReqVO) {
        // 获取当前登录用户ID
        Long loginUserId = SecurityFrameworkUtils.getLoginUserId();

        LambdaQueryWrapper<HadoopFileDO> hadoopFileDOLambdaQueryWrapper = new LambdaQueryWrapperX<HadoopFileDO>()
                .eq(HadoopFileDO::getCreator, loginUserId);

        // 处理回收站和分享类型的查询
        if (pageReqVO.getType() != null) {
            if (pageReqVO.getType() == 7) { // 7 是回收站类型
                // 查询回收站中的文件
                hadoopFileDOLambdaQueryWrapper.likeRight(HadoopFileDO::getName, RECYCLE_BIN_PREFIX);
            } else if (pageReqVO.getType() == 8) { // 8 是分享类型
                // 查询分享的文件
                hadoopFileDOLambdaQueryWrapper.likeRight(HadoopFileDO::getName, SHARE_PREFIX);
            } else {
                // 其他类型的文件查询
                hadoopFileDOLambdaQueryWrapper
                    .eq(HadoopFileDO::getType, pageReqVO.getType())
                    .eq(StringUtil.isNotBlank(pageReqVO.getCatalogue()), HadoopFileDO::getCatalogue, pageReqVO.getCatalogue())
                    .notLikeRight(HadoopFileDO::getName, RECYCLE_BIN_PREFIX) // 排除回收站文件
                    .notLikeRight(HadoopFileDO::getName, SHARE_PREFIX); // 排除分享文件
            }
        } else {
            // 普通目录浏览，需要排除回收站和分享的文件
            hadoopFileDOLambdaQueryWrapper
                .eq(StringUtil.isNotBlank(pageReqVO.getCatalogue()), HadoopFileDO::getCatalogue, pageReqVO.getCatalogue())
                .notLikeRight(HadoopFileDO::getName, RECYCLE_BIN_PREFIX) // 排除回收站文件
                .notLikeRight(HadoopFileDO::getName, SHARE_PREFIX); // 排除分享文件
        }

        // 处理文件名搜索
        if (StringUtil.isNotBlank(pageReqVO.getName())) {
            Integer type = pageReqVO.getType();
            hadoopFileDOLambdaQueryWrapper.like(HadoopFileDO::getName, pageReqVO.getName());
        }

        // 处理排除已分享文件
        if (Boolean.TRUE.equals(pageReqVO.getExcludeShared())) {
            hadoopFileDOLambdaQueryWrapper.notLikeRight(HadoopFileDO::getName, SHARE_PREFIX);
        }

        // 处理排除名称列表
        if (pageReqVO.getExcludeNames() != null && !pageReqVO.getExcludeNames().isEmpty()) {
            for (String excludeName : pageReqVO.getExcludeNames()) {
                hadoopFileDOLambdaQueryWrapper.notLike(StringUtil.isNotBlank(excludeName), HadoopFileDO::getName, excludeName);
            }
        }
        // 处理单个排除名称
        if (StringUtil.isNotBlank(pageReqVO.getExcludeName())) {
            hadoopFileDOLambdaQueryWrapper.notLike(HadoopFileDO::getName, pageReqVO.getExcludeName());
        }

        // 添加排序条件
        if (pageReqVO.getSortField() != null && pageReqVO.getSortOrder() != null) {
            switch (pageReqVO.getSortField()) {
                case "name":
                    hadoopFileDOLambdaQueryWrapper.orderBy(true, "ascend".equals(pageReqVO.getSortOrder()), HadoopFileDO::getName);
                    break;
                case "size":
                    hadoopFileDOLambdaQueryWrapper.orderBy(true, "ascend".equals(pageReqVO.getSortOrder()), HadoopFileDO::getSize);
                    break;
                case "createTime":
                    hadoopFileDOLambdaQueryWrapper.orderBy(true, "ascend".equals(pageReqVO.getSortOrder()), HadoopFileDO::getCreateTime);
                    break;
                default:
                    // 默认排序：目录排在前面，然后按创建时间排序
                    hadoopFileDOLambdaQueryWrapper
                            .orderByDesc(HadoopFileDO::getType)
                            .orderByDesc(HadoopFileDO::getCreateTime);
            }
        } else {
            // 默认排序：目录排在前面，然后按创建时间排序
            hadoopFileDOLambdaQueryWrapper
                    .orderByDesc(HadoopFileDO::getType)
                    .orderByDesc(HadoopFileDO::getCreateTime);
        }

        // 执行查询
        PageResult<HadoopFileDO> pageResult = hadoopFileMapper.selectPage(pageReqVO, hadoopFileDOLambdaQueryWrapper);

        // 如果是回收站查询，处理返回结果，移除回收站前缀
        if (pageReqVO.getType() != null && pageReqVO.getType() == 7) {
            pageResult.getList().forEach(file -> {
                if (file.getName().startsWith(RECYCLE_BIN_PREFIX)) {
                    file.setName(file.getName().substring(RECYCLE_BIN_PREFIX.length() + 1)); // +1 是为了去掉斜杠
                }
            });
        }

        return pageResult;
    }

    @Override
    public InputStream getFileContent(Long id) {
        // 1. 获取文件信息
        HadoopFileDO file = getHadoopFile(id);
        if (file == null) {
            throw exception(HADOOP_FILE_NOT_EXISTS);
        }

        // 2. 检查是否是目录
        if (FileTypeEnum.DIRECTORY.getType().equals(file.getType())) {
            throw exception(HADOOP_FILE_IS_DIRECTORY);
        }

        // 3. 检查文件权限（如果不是分享文件，则检查是否是当前用户的文件）
        Long loginUserId = SecurityFrameworkUtils.getLoginUserId();
        if (!file.getName().startsWith(SHARE_PREFIX) && !loginUserId.toString().equals(file.getCreator())) {
            throw exception(HADOOP_FILE_PERMISSION_DENIED);
        }

        try {
            // 4. 创建HDFS配置
            HdfsUtils.HdfsConfig config = new HdfsUtils.HdfsConfig(
                NAMENODE_HOST, NAMENODE_PORT,
                DATANODE_HOST, DATANODE_PORT,
                USER, TIMEOUT, MAX_RETRIES
            );

            // 5. 构建HDFS文件路径
            String filePath = "/" + file.getCreator();
            // 处理目录路径，避免双斜杠
            if (!"/".equals(file.getCatalogue())) {
                filePath += file.getCatalogue();
            }
            filePath += "/" + file.getName();

            // 6. 检查文件是否存在
            if (!HdfsUtils.exists(config, filePath)) {
                throw exception(HADOOP_FILE_NOT_EXISTS);
            }

            // 7. 获取文件输入流
            return HdfsUtils.readFile(config, filePath);
        } catch (Exception e) {
            log.error("[getFileContent][文件({})下载失败]", id, e);
            throw exception(HADOOP_FILE_DOWNLOAD_FAIL);
        }
    }

    @Override
    public void shareHadoopFile(Long id) {
        List<Long> ids = Collections.singletonList(id);
        batchShareHadoopFiles(ids);
    }

    /**
     * 递归复制文件夹
     *
     * @param config HDFS配置
     * @param sourcePath 源文件夹路径
     * @param targetPath 目标文件夹路径
     * @param loginUserId 当前登录用户ID
     * @param shareKey 分享密钥
     * @return 是否复制成功
     */
    private boolean copyDirectory(HdfsUtils.HdfsConfig config, String sourcePath, String targetPath,
                                Long loginUserId, String shareKey) throws Exception {
        // 确保目标文件夹存在
        if (!HdfsUtils.exists(config, targetPath)) {
            HdfsUtils.mkdir(config, targetPath, "755");
        }

        try {
            // 获取源文件夹下的所有文件和子文件夹
            List<HadoopFileDO> files = hadoopFileMapper.selectList(
                new LambdaQueryWrapperX<HadoopFileDO>()
                    .eq(HadoopFileDO::getCreator, loginUserId)
                    .likeRight(HadoopFileDO::getCatalogue, sourcePath)
            );

            for (HadoopFileDO file : files) {
                String sourceFilePath = file.getCatalogue() + "/" + file.getName();
                String targetFilePath = targetPath + "/" + file.getName();

                if (FileTypeEnum.DIRECTORY.getType().equals(file.getType())) {
                    // 递归复制子文件夹
                    copyDirectory(config, sourceFilePath, targetFilePath, loginUserId, shareKey);
                } else {
                    // 复制文件
                    if (copyFile(config, sourceFilePath, targetFilePath)) {
                        // 创建分享文件记录
                        HadoopFileDO shareFile = new HadoopFileDO();
                        shareFile.setName(SHARE_PREFIX + "/" + shareKey + targetFilePath.substring(sourcePath.length()));
                        shareFile.setCatalogue("/");
                        shareFile.setType(file.getType());
                        shareFile.setSize(file.getSize());
                        shareFile.setCreator(loginUserId.toString());
                        shareFile.setCreateTime(LocalDateTime.now());
                        hadoopFileMapper.insert(shareFile);
                    }
                }
            }
            return true;
        } catch (Exception e) {
            log.error("[copyDirectory][复制文件夹失败:{}]", sourcePath, e);
            return false;
        }
    }

    /**
     * 批量分享文件，将多个文件合并到一个分享文件夹中
     *
     * @param ids 文件ID列表
     */
    @Override
    public void batchShareHadoopFiles(List<Long> ids) {
        if (ids == null || ids.isEmpty()) {
            return;
        }

        // 获取当前登录用户ID
        Long loginUserId = SecurityFrameworkUtils.getLoginUserId();

        try {
            // 创建HDFS配置
            HdfsUtils.HdfsConfig config = new HdfsUtils.HdfsConfig(
                NAMENODE_HOST, NAMENODE_PORT,
                DATANODE_HOST, DATANODE_PORT,
                USER, TIMEOUT, MAX_RETRIES
            );

            // 生成分享密钥
            String shareKey = UUID.randomUUID().toString().substring(0, 8);

            // 构建分享根目录路径
            String shareRootDir = "/" + loginUserId + "/" + SHARE_PREFIX;
            // 构建本次分享的目录路径
            String shareKeyDir = shareRootDir + "/" + shareKey;

            // 确保分享根目录存在
            if (!HdfsUtils.exists(config, shareRootDir)) {
                HdfsUtils.mkdir(config, shareRootDir, "755");
            }

            // 创建本次分享的目录
            HdfsUtils.mkdir(config, shareKeyDir, "755");

            // 遍历所有要分享的文件
            for (Long fileId : ids) {
                // 获取文件信息
                HadoopFileDO file = hadoopFileMapper.selectById(fileId);
                if (file == null) {
                    continue;
                }

                // 构建源文件路径
                String sourcePath = "/" + loginUserId;
                if (!"/".equals(file.getCatalogue())) {
                    sourcePath += file.getCatalogue();
                }
                sourcePath += "/" + file.getName();

                // 构建目标文件路径
                String sharePath = shareKeyDir + "/" + file.getName();

                if (FileTypeEnum.DIRECTORY.getType().equals(file.getType())) {
                    // 如果是文件夹，进行递归复制
                    boolean success = copyDirectory(config, sourcePath, sharePath, loginUserId, shareKey);
                    if (!success) {
                        log.error("[batchShareHadoopFiles][文件夹({})分享失败]", fileId);
                        continue;
                    }

                    // 创建分享文件夹记录
                    HadoopFileDO shareFile = new HadoopFileDO();
                    shareFile.setName(SHARE_PREFIX + "/" + shareKey + "/" + file.getName());
                    shareFile.setCatalogue("/");
                    shareFile.setType(file.getType());
                    shareFile.setSize(file.getSize());
                    shareFile.setCreator(file.getCreator());
                    shareFile.setCreateTime(LocalDateTime.now());
                    hadoopFileMapper.insert(shareFile);
                } else {
                    // 复制普通文件
                    boolean success = copyFile(config, sourcePath, sharePath);
                    if (!success) {
                        log.error("[batchShareHadoopFiles][文件({})分享失败]", fileId);
                        continue;
                    }

                    // 创建分享文件记录
                    HadoopFileDO shareFile = new HadoopFileDO();
                    shareFile.setName(SHARE_PREFIX + "/" + shareKey + "/" + file.getName());
                    shareFile.setCatalogue("/");
                    shareFile.setType(file.getType());
                    shareFile.setSize(file.getSize());
                    shareFile.setCreator(file.getCreator());
                    shareFile.setCreateTime(LocalDateTime.now());
                    hadoopFileMapper.insert(shareFile);
                }
            }
        } catch (Exception e) {
            log.error("[batchShareHadoopFiles][批量分享文件失败]", e);
            throw exception(HADOOP_FILE_NOT_EXISTS);
        }
    }

    /**
     * 复制HDFS文件
     *
     * @param config HDFS配置
     * @param sourcePath 源文件路径
     * @param destinationPath 目标文件路径
     * @return 操作是否成功
     * @throws Exception 操作过程中发生的异常
     */
    private boolean copyFile(HdfsUtils.HdfsConfig config, String sourcePath, String destinationPath) throws Exception {
        // 读取源文件
        InputStream inputStream = HdfsUtils.readFile(config, sourcePath);
        if (inputStream == null) {
            return false;
        }

        // 创建目标文件
        try {
            return HdfsUtils.createFile(config, destinationPath, inputStream);
        } finally {
            inputStream.close();
        }
    }

    @Override
    public void cancelShare(Long id) {
        // 获取文件信息
        HadoopFileDO file = hadoopFileMapper.selectById(id);
        if (file == null) {
            return;
        }

        // 获取当前登录用户ID
        Long loginUserId = SecurityFrameworkUtils.getLoginUserId();

        try {
            // 创建HDFS配置
            HdfsUtils.HdfsConfig config = new HdfsUtils.HdfsConfig(
                NAMENODE_HOST, NAMENODE_PORT,
                DATANODE_HOST, DATANODE_PORT,
                USER, TIMEOUT, MAX_RETRIES
            );

            // 构建HDFS文件路径（从根目录的分享目录中删除）
            String filePath = "/" + loginUserId;
            // 处理目录路径，避免双斜杠
            if (!"/".equals(file.getCatalogue())) {
                filePath += file.getCatalogue();
            }
            filePath += "/" + file.getName();

            // 删除HDFS中的分享文件
            boolean success = HdfsUtils.delete(config, filePath, true);
            if (!success) {
                throw exception(HADOOP_FILE_NOT_EXISTS);
            }

            // 删除数据库记录
            hadoopFileMapper.deleteById(id);

        } catch (Exception e) {
            log.error("[cancelShare][文件({})取消分享失败]", id, e);
            throw exception(HADOOP_FILE_NOT_EXISTS);
        }
    }

    @Override
    public List<HadoopFileDO> getShareFiles(String shareKey) {
        // 构建查询条件：文件名以 "分享/shareKey/" 开头
        String sharePrefix = SHARE_PREFIX + "/" + shareKey + "/";
        return hadoopFileMapper.selectList(new LambdaQueryWrapperX<HadoopFileDO>()
                .likeRight(HadoopFileDO::getName, sharePrefix));
    }

    @Override
    public HadoopFileDO getShareFile(String shareKey, String fileName) {
        // 构建完整的文件路径
        String fullPath = SHARE_PREFIX + "/" + shareKey + "/" + fileName;
        // 查询文件
        return hadoopFileMapper.selectOne(new LambdaQueryWrapperX<HadoopFileDO>()
                .eq(HadoopFileDO::getName, fullPath));
    }

    @Override
    public void updateSubFilePaths(String oldPath, String newPath) {
        // 获取当前登录用户ID
        Long loginUserId = SecurityFrameworkUtils.getLoginUserId();

        // 1. 查找当前目录下的所有文件和文件夹
        List<HadoopFileDO> subFiles = hadoopFileMapper.selectList(
            new LambdaQueryWrapperX<HadoopFileDO>()
                .eq(HadoopFileDO::getCreator, loginUserId)
                .eq(HadoopFileDO::getCatalogue, oldPath)  // 查找在这个目录下的所有文件
        );

        // 2. 更新每个文件的目录路径
        for (HadoopFileDO file : subFiles) {
            // 更新文件的目录路径
            file.setCatalogue(newPath);
            hadoopFileMapper.updateById(file);

            // 3. 如果是文件夹，递归更新其子文件
            if (FileTypeEnum.DIRECTORY.getType().equals(file.getType())) {
                String subOldPath = oldPath + "/" + file.getName();
                String subNewPath = newPath + "/" + file.getName();
                updateSubFilePaths(subOldPath, subNewPath);
            }
        }
    }

    @Override
    public void moveHadoopFile(Long id, String targetPath) {
        // 1. 校验文件是否存在
        HadoopFileDO file = hadoopFileMapper.selectById(id);
        if (file == null) {
            throw exception(FILE_NOT_EXISTS);
        }

        // 获取当前登录用户ID
        Long loginUserId = SecurityFrameworkUtils.getLoginUserId();

        // 2. 检查目标路径下是否已存在同名文件
        LambdaQueryWrapper<HadoopFileDO> queryWrapper = new LambdaQueryWrapper<HadoopFileDO>()
                .eq(HadoopFileDO::getName, file.getName())
                .eq(HadoopFileDO::getCatalogue, targetPath)
                .eq(HadoopFileDO::getCreator, loginUserId);
        if (hadoopFileMapper.exists(queryWrapper)) {
            throw exception(FILE_NAME_EXISTS);
        }

        try {
            // 3. 创建HDFS配置
            HdfsUtils.HdfsConfig config = new HdfsUtils.HdfsConfig(
                NAMENODE_HOST, NAMENODE_PORT,
                DATANODE_HOST, DATANODE_PORT,
                USER, TIMEOUT, MAX_RETRIES
            );

            // 4. 处理目录路径，避免双斜杠
            String sourceCatalogue = file.getCatalogue();
            if (sourceCatalogue == null || sourceCatalogue.equals("/")) {
                sourceCatalogue = "";
            }

            String targetCatalogue = targetPath;
            if (targetCatalogue == null || targetCatalogue.equals("/")) {
                targetCatalogue = "";
            }

            // 5. 构建HDFS文件路径
            String oldPath = "/" + loginUserId + sourceCatalogue + "/" + file.getName();
            String newPath = "/" + loginUserId + targetCatalogue + "/" + file.getName();

            // 6. 如果是目录，使用复制-删除策略
            if (FileTypeEnum.DIRECTORY.getType().equals(file.getType())) {
                // 6.1 创建新目录
                if (!HdfsUtils.mkdir(config, newPath, "755")) {
                    throw exception(HADOOP_FILE_NOT_EXISTS);
                }

                // 6.2 获取所有子文件和子文件夹（包括嵌套的）
                List<HadoopFileDO> subFiles = hadoopFileMapper.selectList(
                    new LambdaQueryWrapperX<HadoopFileDO>()
                        .eq(HadoopFileDO::getCreator, loginUserId)
                        .eq(HadoopFileDO::getCatalogue, sourceCatalogue + "/" + file.getName())
                        .orderByAsc(HadoopFileDO::getName) // 按名称排序，确保父文件夹在子文件之前处理
                );

                // 6.3 复制所有子文件到新目录
                for (HadoopFileDO subFile : subFiles) {
                    // 构建源文件和目标文件的路径
                    String subOldPath = "/" + loginUserId + sourceCatalogue + "/" + subFile.getName();
                    String subNewPath = "/" + loginUserId + targetCatalogue + "/" + file.getName() +
                                      subFile.getName().substring(file.getName().length());

                    if (FileTypeEnum.DIRECTORY.getType().equals(subFile.getType())) {
                        // 如果是子文件夹，创建目录
                        if (!HdfsUtils.mkdir(config, subNewPath, "755")) {
                            throw exception(HADOOP_FILE_NOT_EXISTS);
                        }
                    } else {
                        // 如果是文件，复制文件内容
                        try (InputStream inputStream = HdfsUtils.readFile(config, subOldPath)) {
                            if (inputStream == null) {
                                log.error("[moveHadoopFile][无法读取文件内容:{}]", subOldPath);
                                throw exception(HADOOP_FILE_NOT_EXISTS);
                            }
                            if (!HdfsUtils.createFile(config, subNewPath, inputStream)) {
                                throw exception(HADOOP_FILE_NOT_EXISTS);
                            }
                        }
                    }

                    // 更新数据库中的文件路径
                    subFile.setCatalogue(targetCatalogue + "/" + file.getName());
                    hadoopFileMapper.updateById(subFile);
                }

                // 6.4 更新文件夹本身的记录
                file.setCatalogue(targetCatalogue);
                hadoopFileMapper.updateById(file);

                // 6.5 删除原目录
                if (!HdfsUtils.delete(config, oldPath, true)) {
                    throw exception(HADOOP_FILE_NOT_EXISTS);
                }
            } else {
                // 7. 如果是普通文件，直接移动
                if (!HdfsUtils.mv(config, oldPath, newPath)) {
                    throw exception(HADOOP_FILE_NOT_EXISTS);
                }

                // 更新数据库记录
                file.setCatalogue(targetCatalogue);
                hadoopFileMapper.updateById(file);
            }
        } catch (Exception e) {
            log.error("[moveHadoopFile][id: {} targetPath: {}] 移动文件失败", id, targetPath, e);
            throw exception(HADOOP_FILE_NOT_EXISTS);
        }
    }

    @Override
    public void saveSharedFiles(List<HadoopFileDO> files, String targetPath) {
        if (files.isEmpty()) {
            return;
        }

        // 获取当前用户ID
        Long userId = SecurityFrameworkUtils.getLoginUserId();

        // 处理目标路径
        String catalogue = targetPath;
        String hdfsTargetPath = "/" + userId + targetPath;

        // 创建 HDFS 配置
        HdfsUtils.HdfsConfig conf = new HdfsUtils.HdfsConfig(
            NAMENODE_HOST, NAMENODE_PORT,
            DATANODE_HOST, DATANODE_PORT,
            USER, TIMEOUT, MAX_RETRIES
        );

        try {
            for (HadoopFileDO file : files) {
                // 1. 构建源文件和目标文件路径
                String fileName = file.getName().substring(file.getName().lastIndexOf("/") + 1);
                String oldPath = "/" + file.getCreator() + "/" + file.getName(); // 直接使用完整路径
                String newPath = hdfsTargetPath + "/" + fileName;

                // 2. 复制文件
                if (file.getType() == 6) { // 如果是文件夹
                    // 创建目标文件夹
                    HadoopFileDO newFolder = new HadoopFileDO();
                    newFolder.setName(fileName);
                    newFolder.setType(6);
                    newFolder.setCatalogue(catalogue);
                    newFolder.setCreator(userId.toString());
                    hadoopFileMapper.insert(newFolder);

                    // 递归复制文件夹内容
                    copyFolderContents(oldPath, newPath, userId, catalogue);
                } else {
                    // 确保目标目录存在
                    if (!HdfsUtils.exists(conf, hdfsTargetPath)) {
                        HdfsUtils.mkdir(conf, hdfsTargetPath, "755");
                    }

                    // 复制文件到 HDFS
                    try (InputStream inputStream = HdfsUtils.readFile(conf, oldPath)) {
                        if (inputStream != null) {
                            if (!HdfsUtils.createFile(conf, newPath, inputStream)) {
                                throw new RuntimeException("创建文件失败");
                            }
                        } else {
                            throw new RuntimeException("无法读取源文件");
                        }
                    }

                    // 创建新的文件记录
                    HadoopFileDO newFile = new HadoopFileDO();
                    newFile.setName(fileName);
                    newFile.setType(file.getType());
                    newFile.setSize(file.getSize());
                    newFile.setCatalogue(catalogue);
                    newFile.setCreator(userId.toString());
                    hadoopFileMapper.insert(newFile);
                }
            }
        } catch (Exception e) {
            log.error("[saveSharedFiles] 保存分享文件失败", e);
            throw new RuntimeException("保存文件失败: " + e.getMessage());
        }
    }

    /**
     * 递归复制文件夹内容
     */
    private void copyFolderContents(String sourcePath, String targetPath, Long userId, String parentCatalogue) {
        // 查询源文件夹下的所有文件和文件夹
        LambdaQueryWrapper<HadoopFileDO> queryWrapper = new LambdaQueryWrapper<HadoopFileDO>()
                .likeRight(HadoopFileDO::getName, sourcePath);
        List<HadoopFileDO> contents = hadoopFileMapper.selectList(queryWrapper);

        HdfsUtils.HdfsConfig conf = new HdfsUtils.HdfsConfig(
            NAMENODE_HOST, NAMENODE_PORT,
            DATANODE_HOST, DATANODE_PORT,
            USER, TIMEOUT, MAX_RETRIES
        );

        for (HadoopFileDO content : contents) {
            String sourceFilePath = "/" + content.getCreator() + "/" + content.getName();
            String fileName = content.getName().substring(content.getName().lastIndexOf("/") + 1);
            String targetFilePath = targetPath + "/" + fileName;

            // 构建新的目录路径
            String newCatalogue = parentCatalogue.equals("/") ?
                "/" + fileName : parentCatalogue + "/" + fileName;

            try {
                if (content.getType() == 6) { // 如果是文件夹
                    // 创建新文件夹
                    HadoopFileDO newFolder = new HadoopFileDO();
                    newFolder.setName(fileName);
                    newFolder.setType(6);
                    newFolder.setCatalogue(parentCatalogue);
                    newFolder.setCreator(userId.toString());
                    hadoopFileMapper.insert(newFolder);

                    // 递归复制子文件夹内容
                    copyFolderContents(sourceFilePath, targetFilePath, userId, newCatalogue);
                } else {
                    // 确保目标目录存在
                    String parentDir = targetPath.substring(0, targetPath.lastIndexOf("/"));
                    if (!HdfsUtils.exists(conf, parentDir)) {
                        HdfsUtils.mkdir(conf, parentDir, "755");
                    }

                    // 复制文件到 HDFS
                    try (InputStream inputStream = HdfsUtils.readFile(conf, sourceFilePath)) {
                        if (inputStream != null) {
                            if (!HdfsUtils.createFile(conf, targetFilePath, inputStream)) {
                                throw new RuntimeException("创建文件失败");
                            }
                        } else {
                            throw new RuntimeException("无法读取源文件");
                        }
                    }

                    // 创建新的文件记录
                    HadoopFileDO newFile = new HadoopFileDO();
                    newFile.setName(fileName);
                    newFile.setType(content.getType());
                    newFile.setSize(content.getSize());
                    newFile.setCatalogue(parentCatalogue);
                    newFile.setCreator(userId.toString());
                    hadoopFileMapper.insert(newFile);
                }
            } catch (Exception e) {
                log.error("[copyFolderContents] 复制文件失败: {}", sourceFilePath, e);
                throw new RuntimeException("复制文件夹内容失败: " + e.getMessage());
            }
        }
    }

}
