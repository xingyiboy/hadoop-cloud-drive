package cn.iocoder.yudao.module.system.service.education;

import java.util.*;

import cn.iocoder.yudao.framework.common.pojo.CommonResult;
import cn.iocoder.yudao.module.system.controller.admin.education.vo.*;
import cn.iocoder.yudao.module.system.dal.dataobject.education.EducationDO;
import cn.iocoder.yudao.module.system.dal.dataobject.educationcollect.EducationCollectDO;
import cn.iocoder.yudao.module.system.dal.dataobject.educationcomment.EducationCommentDO;
import cn.iocoder.yudao.module.system.dal.dataobject.educationlike.EducationLikeDO;
import cn.iocoder.yudao.framework.common.pojo.PageResult;
import cn.iocoder.yudao.framework.common.pojo.PageParam;

import javax.validation.Valid;

/**
 * 教育 Service 接口
 *
 * @author 芋道源码
 */
public interface EducationService {

    /**
     * 创建教育
     *
     * @param createReqVO 创建信息
     * @return 编号
     */
    Long createEducation(@Valid EducationSaveReqVO createReqVO);

    /**
     * 更新教育
     *
     * @param updateReqVO 更新信息
     */
    void updateEducation(@Valid EducationSaveReqVO updateReqVO);

    /**
     * 删除教育
     *
     * @param id 编号
     */
    void deleteEducation(Long id);

    /**
     * 获得教育
     *
     * @param id 编号
     * @return 教育
     */
    EducationDO getEducation(Long id);

    /**
     * 获得教育分页
     *
     * @param pageReqVO 分页查询
     * @return 教育分页
     */
    PageResult<EducationDO> getEducationPage(EducationPageReqVO pageReqVO);

    // ==================== 子表（教育收藏） ====================

    /**
     * 获得教育收藏列表
     *
     * @param educationId 教育编号
     * @return 教育收藏列表
     */
    List<EducationCollectDO> getEducationCollectListByEducationId(Long educationId);

    // ==================== 子表（教育评论） ====================

    /**
     * 获得教育评论列表
     *
     * @param educationId 教育编号
     * @return 教育评论列表
     */
    List<EducationCommentDO> getEducationCommentListByEducationId(Long educationId);

    // ==================== 子表（教育点赞） ====================

    /**
     * 获得教育点赞列表
     *
     * @param educationId 教育编号
     * @return 教育点赞列表
     */
    List<EducationLikeDO> getEducationLikeListByEducationId(Long educationId);

    Long createLikes(EducationLikeDO createReqVO);

    CommonResult<Boolean> isLike(Long id);

    Long createComment(EducationCommentDO createReqVO);

    CommonResult<Boolean> isCollect(Long id);

    Long createCollect(cn.iocoder.yudao.module.system.dal.dataobject.educationcollect.EducationCollectDO createReqVO);

    PageResult<cn.iocoder.yudao.module.system.dal.dataobject.educationcollect.EducationCollectDO> page(EducationPageReqVO pageReqVO);
}
