package cn.iocoder.yudao.module.system.service.slideshow;

import java.util.*;
import cn.iocoder.yudao.module.system.controller.admin.slideshow.vo.*;
import cn.iocoder.yudao.module.system.dal.dataobject.slideshow.SlideshowDO;
import cn.iocoder.yudao.framework.common.pojo.PageResult;
import cn.iocoder.yudao.framework.common.pojo.PageParam;

import javax.validation.Valid;

/**
 * 轮播图 Service 接口
 *
 * @author 芋道源码
 */
public interface SlideshowService {

    /**
     * 创建轮播图
     *
     * @param createReqVO 创建信息
     * @return 编号
     */
    Long createSlideshow(@Valid SlideshowSaveReqVO createReqVO);

    /**
     * 更新轮播图
     *
     * @param updateReqVO 更新信息
     */
    void updateSlideshow(@Valid SlideshowSaveReqVO updateReqVO);

    /**
     * 删除轮播图
     *
     * @param id 编号
     */
    void deleteSlideshow(Long id);

    /**
     * 获得轮播图
     *
     * @param id 编号
     * @return 轮播图
     */
    SlideshowDO getSlideshow(Long id);

    /**
     * 获得轮播图分页
     *
     * @param pageReqVO 分页查询
     * @return 轮播图分页
     */
    PageResult<SlideshowDO> getSlideshowPage(SlideshowPageReqVO pageReqVO);

}
