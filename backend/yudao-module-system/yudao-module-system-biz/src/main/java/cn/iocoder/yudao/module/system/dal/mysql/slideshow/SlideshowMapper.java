package cn.iocoder.yudao.module.system.dal.mysql.slideshow;

import java.util.*;

import cn.iocoder.yudao.framework.common.pojo.PageResult;
import cn.iocoder.yudao.framework.mybatis.core.query.LambdaQueryWrapperX;
import cn.iocoder.yudao.framework.mybatis.core.mapper.BaseMapperX;
import cn.iocoder.yudao.module.system.dal.dataobject.slideshow.SlideshowDO;
import org.apache.ibatis.annotations.Mapper;
import cn.iocoder.yudao.module.system.controller.admin.slideshow.vo.*;

/**
 * 轮播图 Mapper
 *
 * @author 芋道源码
 */
@Mapper
public interface SlideshowMapper extends BaseMapperX<SlideshowDO> {

    default PageResult<SlideshowDO> selectPage(SlideshowPageReqVO reqVO) {
        return selectPage(reqVO, new LambdaQueryWrapperX<SlideshowDO>()
                .betweenIfPresent(SlideshowDO::getCreateTime, reqVO.getCreateTime())
                .eqIfPresent(SlideshowDO::getPicture, reqVO.getPicture())
                .eqIfPresent(SlideshowDO::getUrl, reqVO.getUrl())
                .orderByDesc(SlideshowDO::getId));
    }

}