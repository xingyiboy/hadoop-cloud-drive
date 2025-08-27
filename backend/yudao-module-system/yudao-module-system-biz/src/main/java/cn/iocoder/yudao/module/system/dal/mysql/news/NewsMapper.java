package cn.iocoder.yudao.module.system.dal.mysql.news;

import java.util.*;

import cn.iocoder.yudao.framework.common.pojo.PageResult;
import cn.iocoder.yudao.framework.mybatis.core.query.LambdaQueryWrapperX;
import cn.iocoder.yudao.framework.mybatis.core.mapper.BaseMapperX;
import cn.iocoder.yudao.module.system.dal.dataobject.news.NewsDO;
import org.apache.ibatis.annotations.Mapper;
import cn.iocoder.yudao.module.system.controller.admin.news.vo.*;

/**
 * 新闻资讯 Mapper
 *
 * @author 芋道源码
 */
@Mapper
public interface NewsMapper extends BaseMapperX<NewsDO> {

    default PageResult<NewsDO> selectPage(NewsPageReqVO reqVO) {
        return selectPage(reqVO, new LambdaQueryWrapperX<NewsDO>()
                .betweenIfPresent(NewsDO::getCreateTime, reqVO.getCreateTime())
                .eqIfPresent(NewsDO::getPicture, reqVO.getPicture())
                .likeIfPresent(NewsDO::getTitle, reqVO.getTitle())
                .eqIfPresent(NewsDO::getView, reqVO.getView())
                .eqIfPresent(NewsDO::getContent, reqVO.getContent())
                .orderByDesc(NewsDO::getId));
    }

}
