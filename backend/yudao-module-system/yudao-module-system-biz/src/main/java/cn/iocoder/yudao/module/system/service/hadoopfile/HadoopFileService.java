package cn.iocoder.yudao.module.system.service.hadoopfile;

import java.io.InputStream;
import javax.validation.Valid;
import java.util.List;

import cn.iocoder.yudao.module.system.controller.admin.hadoopfile.vo.HadoopFilePageReqVO;
import cn.iocoder.yudao.module.system.controller.admin.hadoopfile.vo.HadoopFileSaveReqVO;
import cn.iocoder.yudao.module.system.dal.dataobject.hadoopfile.HadoopFileDO;
import cn.iocoder.yudao.framework.common.pojo.PageResult;

/**
 * hadoop文件 Service 接口
 *
 * @author 管理员1
 */
public interface HadoopFileService {

    /**
     * 创建hadoop文件
     *
     * @param createReqVO 创建信息
     * @return 编号
     */
    Long createHadoopFile(@Valid HadoopFileSaveReqVO createReqVO);


    /**
     * 删除hadoop文件
     *
     * @param id 编号
     */
    void deleteHadoopFile(Long id);

    /**
     * 获得hadoop文件
     *
     * @param id 编号
     * @return hadoop文件
     */
    HadoopFileDO getHadoopFile(Long id);

    /**
     * 获得hadoop文件分页
     *
     * @param pageReqVO 分页查询
     * @return hadoop文件分页
     */
    PageResult<HadoopFileDO> getHadoopFilePage(HadoopFilePageReqVO pageReqVO);

    /**
     * 获取文件内容
     *
     * @param id 文件编号
     * @return 文件输入流
     */
    InputStream getFileContent(Long id);

    /**
     * 恢复回收站中的文件
     *
     * @param id 编号
     */
    void restoreHadoopFile(Long id);

    /**
     * 分享文件
     *
     * @param id 编号
     */
    void shareHadoopFile(Long id);

    /**
     * 批量分享文件，将多个文件合并到一个分享文件夹中
     *
     * @param ids 文件ID列表
     */
    void batchShareHadoopFiles(List<Long> ids);

    /**
     * 取消分享文件
     *
     * @param id 编号
     */
    void cancelShare(Long id);

    /**
     * 获取分享文件列表
     *
     * @param shareKey 分享密钥
     * @return 分享文件列表
     */
    List<HadoopFileDO> getShareFiles(String shareKey);

    /**
     * 获取单个分享文件
     *
     * @param shareKey 分享密钥
     * @param fileName 文件名
     * @return 分享文件信息
     */
    HadoopFileDO getShareFile(String shareKey, String fileName);

    /**
     * 重命名文件
     *
     * @param id 文件编号
     * @param newName 新文件名
     */
    void renameHadoopFile(Long id, String newName);

    /**
     * 更新文件夹下所有文件的路径
     *
     * @param oldPath 原路径
     * @param newPath 新路径
     */
    void updateSubFilePaths(String oldPath, String newPath);

    /**
     * 移动文件或文件夹
     *
     * @param id 文件编号
     * @param targetPath 目标路径
     */
    void moveHadoopFile(Long id, String targetPath);

    /**
     * 保存分享文件到个人文件夹
     *
     * @param files 要保存的文件列表
     * @param targetPath 目标路径
     */
    void saveSharedFiles(List<HadoopFileDO> files, String targetPath);

}
