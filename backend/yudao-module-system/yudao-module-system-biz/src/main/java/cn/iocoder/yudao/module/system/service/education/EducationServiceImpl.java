package cn.iocoder.yudao.module.system.service.education;

import cn.iocoder.yudao.framework.common.pojo.CommonResult;
import cn.iocoder.yudao.framework.security.core.util.SecurityFrameworkUtils;
import cn.iocoder.yudao.module.system.dal.dataobject.forum.ForumDO;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import org.springframework.stereotype.Service;
import org.springframework.validation.annotation.Validated;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import cn.iocoder.yudao.module.system.controller.admin.education.vo.*;
import cn.iocoder.yudao.module.system.dal.dataobject.education.EducationDO;
import cn.iocoder.yudao.module.system.dal.dataobject.educationcollect.EducationCollectDO;
import cn.iocoder.yudao.module.system.dal.dataobject.educationcomment.EducationCommentDO;
import cn.iocoder.yudao.module.system.dal.dataobject.educationlike.EducationLikeDO;
import cn.iocoder.yudao.framework.common.pojo.PageResult;
import cn.iocoder.yudao.framework.common.pojo.PageParam;
import cn.iocoder.yudao.framework.common.util.object.BeanUtils;

import cn.iocoder.yudao.module.system.dal.mysql.education.EducationMapper;
import cn.iocoder.yudao.module.system.dal.mysql.educationcollect.EducationCollectMapper;
import cn.iocoder.yudao.module.system.dal.mysql.educationcomment.EducationCommentMapper;
import cn.iocoder.yudao.module.system.dal.mysql.educationlike.EducationLikeMapper;

import javax.annotation.Resource;

import static cn.iocoder.yudao.framework.common.exception.util.ServiceExceptionUtil.exception;
import static cn.iocoder.yudao.module.system.enums.ErrorCodeConstants.*;

/**
 * 教育 Service 实现类
 *
 * @author 芋道源码
 */
@Service
@Validated
public class EducationServiceImpl implements EducationService {

    @Resource
    private EducationMapper educationMapper;
    @Resource
    private EducationCollectMapper educationCollectMapper;
    @Resource
    private EducationCommentMapper educationCommentMapper;
    @Resource
    private EducationLikeMapper educationLikeMapper;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Long createEducation(EducationSaveReqVO createReqVO) {
        // 插入
        EducationDO education = BeanUtils.toBean(createReqVO, EducationDO.class);
        educationMapper.insert(education);

        // 插入子表
        createEducationCollectList(education.getId(), createReqVO.getEducationCollects());
        createEducationCommentList(education.getId(), createReqVO.getEducationComments());
        createEducationLikeList(education.getId(), createReqVO.getEducationLikes());
        // 返回
        return education.getId();
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void updateEducation(EducationSaveReqVO updateReqVO) {
        // 校验存在
        validateEducationExists(updateReqVO.getId());
        // 更新
        EducationDO updateObj = BeanUtils.toBean(updateReqVO, EducationDO.class);
        educationMapper.updateById(updateObj);

        // 更新子表
        updateEducationCollectList(updateReqVO.getId(), updateReqVO.getEducationCollects());
        updateEducationCommentList(updateReqVO.getId(), updateReqVO.getEducationComments());
        updateEducationLikeList(updateReqVO.getId(), updateReqVO.getEducationLikes());
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deleteEducation(Long id) {
        // 校验存在
        validateEducationExists(id);
        // 删除
        educationMapper.deleteById(id);

        // 删除子表
        deleteEducationCollectByEducationId(id);
        deleteEducationCommentByEducationId(id);
        deleteEducationLikeByEducationId(id);
    }

    private void validateEducationExists(Long id) {
        if (educationMapper.selectById(id) == null) {
            throw exception(EDUCATION_NOT_EXISTS);
        }
    }

    @Override
    public EducationDO getEducation(Long id) {
        EducationDO educationDO = educationMapper.selectById(id);
        educationDO.setViews(educationDO.getViews() + 1);
        educationMapper.updateById(educationDO);
        return educationDO;
    }

    @Override
    public PageResult<EducationDO> getEducationPage(EducationPageReqVO pageReqVO) {
        return educationMapper.selectPage(pageReqVO);
    }

    // ==================== 子表（教育收藏） ====================

    @Override
    public List<EducationCollectDO> getEducationCollectListByEducationId(Long educationId) {
        return educationCollectMapper.selectListByEducationId(educationId);
    }

    private void createEducationCollectList(Long educationId, List<EducationCollectDO> list) {
        list.forEach(o -> o.setEducationId(educationId));
        educationCollectMapper.insertBatch(list);
    }

    private void updateEducationCollectList(Long educationId, List<EducationCollectDO> list) {
        deleteEducationCollectByEducationId(educationId);
		list.forEach(o -> o.setId(null).setUpdater(null).setUpdateTime(null)); // 解决更新情况下：1）id 冲突；2）updateTime 不更新
        createEducationCollectList(educationId, list);
    }

    private void deleteEducationCollectByEducationId(Long educationId) {
        educationCollectMapper.deleteByEducationId(educationId);
    }

    // ==================== 子表（教育评论） ====================

    @Override
    public List<EducationCommentDO> getEducationCommentListByEducationId(Long educationId) {
        return educationCommentMapper.selectListByEducationId(educationId);
    }

    private void createEducationCommentList(Long educationId, List<EducationCommentDO> list) {
        list.forEach(o -> o.setEducationId(educationId));
        educationCommentMapper.insertBatch(list);
    }

    private void updateEducationCommentList(Long educationId, List<EducationCommentDO> list) {
        deleteEducationCommentByEducationId(educationId);
		list.forEach(o -> o.setId(null).setUpdater(null).setUpdateTime(null)); // 解决更新情况下：1）id 冲突；2）updateTime 不更新
        createEducationCommentList(educationId, list);
    }

    private void deleteEducationCommentByEducationId(Long educationId) {
        educationCommentMapper.deleteByEducationId(educationId);
    }

    // ==================== 子表（教育点赞） ====================

    @Override
    public List<EducationLikeDO> getEducationLikeListByEducationId(Long educationId) {
        return educationLikeMapper.selectListByEducationId(educationId);
    }

    @Override
    public Long createLikes(EducationLikeDO createReqVO) {
        EducationDO educationDO = educationMapper.selectById(createReqVO.getEducationId());
        LambdaQueryWrapper<EducationLikeDO> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(EducationLikeDO::getEducationId,createReqVO.getEducationId());
        queryWrapper.eq(EducationLikeDO::getUserId,SecurityFrameworkUtils.getLoginUserId());
        List<EducationLikeDO> educationLikeDOS = educationLikeMapper.selectList(queryWrapper);
        if (educationLikeDOS.size() > 0){
            educationDO.setLikes(educationDO.getLikes() - 1);
            educationLikeMapper.deleteById(educationLikeDOS.get(0).getId());
            educationMapper.updateById(educationDO);
            return null;
        }else{
            educationDO.setLikes(educationDO.getLikes() + 1);
            educationMapper.updateById(educationDO);
            createReqVO.setUserId(SecurityFrameworkUtils.getLoginUserId());
            educationLikeMapper.insert(createReqVO);
            return createReqVO.getId();
        }
    }


    @Override
    public CommonResult<Boolean> isLike(Long id) {
        LambdaQueryWrapper<EducationLikeDO> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(EducationLikeDO::getEducationId,id);
        queryWrapper.eq(EducationLikeDO::getUserId,SecurityFrameworkUtils.getLoginUserId());
        List<EducationLikeDO> educationLikeDOS = educationLikeMapper.selectList(queryWrapper);
        if (educationLikeDOS.size() > 0){
            return CommonResult.success(true);
        }
        return CommonResult.success(false);
    }

    @Override
    public Long createComment(EducationCommentDO createReqVO) {
        EducationDO educationDO = educationMapper.selectById(createReqVO.getEducationId());
        educationDO.setComment(educationDO.getComment() + 1);
        educationMapper.updateById(educationDO);
        createReqVO.setUserId(SecurityFrameworkUtils.getLoginUserId());
        educationCommentMapper.insert(createReqVO);
        return createReqVO.getId();
    }

    @Override
    public CommonResult<Boolean> isCollect(Long id) {
        LambdaQueryWrapper<EducationCollectDO> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(EducationCollectDO::getEducationId,id);
        queryWrapper.eq(EducationCollectDO::getUserId,SecurityFrameworkUtils.getLoginUserId());
        List<EducationCollectDO> educationCollectDOS = educationCollectMapper.selectList(queryWrapper);
        if (educationCollectDOS.size() > 0){
            return CommonResult.success(true);
        }
        return CommonResult.success(false);
    }

    @Override
    public Long createCollect(EducationCollectDO createReqVO) {
        createReqVO.setUserId(SecurityFrameworkUtils.getLoginUserId());
        LambdaQueryWrapper<EducationCollectDO> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(EducationCollectDO::getEducationId,createReqVO.getEducationId());
        queryWrapper.eq(EducationCollectDO::getUserId,SecurityFrameworkUtils.getLoginUserId());
        List<EducationCollectDO> educationCollectDOS = educationCollectMapper.selectList(queryWrapper);
        if (educationCollectDOS.size() > 0){
            educationCollectMapper.deleteById(educationCollectDOS.get(0).getId());
            return null;
        }else {
            educationCollectMapper.insert(createReqVO);
            return createReqVO.getId();
        }



    }

    @Override
    public PageResult<EducationCollectDO> page(EducationPageReqVO pageReqVO) {
        PageParam pageParam = new PageParam();
        pageParam.setPageNo(pageReqVO.getPageNo());
        pageParam.setPageSize(pageReqVO.getPageSize());
        LambdaQueryWrapper<EducationCollectDO> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(EducationCollectDO::getUserId,SecurityFrameworkUtils.getLoginUserId());
        return educationCollectMapper.selectPage(pageParam, queryWrapper);
    }

    private void createEducationLikeList(Long educationId, List<EducationLikeDO> list) {
        list.forEach(o -> o.setEducationId(educationId));
        educationLikeMapper.insertBatch(list);
    }

    private void updateEducationLikeList(Long educationId, List<EducationLikeDO> list) {
        deleteEducationLikeByEducationId(educationId);
		list.forEach(o -> o.setId(null).setUpdater(null).setUpdateTime(null)); // 解决更新情况下：1）id 冲突；2）updateTime 不更新
        createEducationLikeList(educationId, list);
    }

    private void deleteEducationLikeByEducationId(Long educationId) {
        educationLikeMapper.deleteByEducationId(educationId);
    }

}
