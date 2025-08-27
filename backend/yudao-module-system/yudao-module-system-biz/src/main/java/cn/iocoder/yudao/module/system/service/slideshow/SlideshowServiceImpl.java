package cn.iocoder.yudao.module.system.service.slideshow;

import org.springframework.stereotype.Service;
import org.springframework.validation.annotation.Validated;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import cn.iocoder.yudao.module.system.controller.admin.slideshow.vo.*;
import cn.iocoder.yudao.module.system.dal.dataobject.slideshow.SlideshowDO;
import cn.iocoder.yudao.framework.common.pojo.PageResult;
import cn.iocoder.yudao.framework.common.pojo.PageParam;
import cn.iocoder.yudao.framework.common.util.object.BeanUtils;

import cn.iocoder.yudao.module.system.dal.mysql.slideshow.SlideshowMapper;

import javax.annotation.Resource;

import static cn.iocoder.yudao.framework.common.exception.util.ServiceExceptionUtil.exception;
import static cn.iocoder.yudao.module.system.enums.ErrorCodeConstants.*;

/**
 * 轮播图 Service 实现类
 *
 * @author 芋道源码
 */
@Service
@Validated
public class SlideshowServiceImpl implements SlideshowService {

    @Resource
    private SlideshowMapper slideshowMapper;

    @Override
    public Long createSlideshow(SlideshowSaveReqVO createReqVO) {
        // 插入
        SlideshowDO slideshow = BeanUtils.toBean(createReqVO, SlideshowDO.class);
        slideshowMapper.insert(slideshow);
        // 返回
        return slideshow.getId();
    }

    @Override
    public void updateSlideshow(SlideshowSaveReqVO updateReqVO) {
        // 校验存在
        validateSlideshowExists(updateReqVO.getId());
        // 更新
        SlideshowDO updateObj = BeanUtils.toBean(updateReqVO, SlideshowDO.class);
        slideshowMapper.updateById(updateObj);
    }

    @Override
    public void deleteSlideshow(Long id) {
        // 校验存在
        validateSlideshowExists(id);
        // 删除
        slideshowMapper.deleteById(id);
    }

    private void validateSlideshowExists(Long id) {
        if (slideshowMapper.selectById(id) == null) {
            throw exception(SLIDESHOW_NOT_EXISTS);
        }
    }

    @Override
    public SlideshowDO getSlideshow(Long id) {
        return slideshowMapper.selectById(id);
    }

    @Override
    public PageResult<SlideshowDO> getSlideshowPage(SlideshowPageReqVO pageReqVO) {
        return slideshowMapper.selectPage(pageReqVO);
    }

}
