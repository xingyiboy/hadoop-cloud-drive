package cn.iocoder.yudao.module.system.dal.mysql.education;

import java.util.*;

import cn.iocoder.yudao.framework.common.pojo.PageResult;
import cn.iocoder.yudao.framework.mybatis.core.query.LambdaQueryWrapperX;
import cn.iocoder.yudao.framework.mybatis.core.mapper.BaseMapperX;
import cn.iocoder.yudao.module.system.dal.dataobject.education.EducationDO;
import org.apache.ibatis.annotations.Mapper;
import cn.iocoder.yudao.module.system.controller.admin.education.vo.*;

/**
 * 教育 Mapper
 *
 * @author 芋道源码
 */
@Mapper
public interface EducationMapper extends BaseMapperX<EducationDO> {

    default PageResult<EducationDO> selectPage(EducationPageReqVO reqVO) {
        return selectPage(reqVO, new LambdaQueryWrapperX<EducationDO>()
                .betweenIfPresent(EducationDO::getCreateTime, reqVO.getCreateTime())
                .eqIfPresent(EducationDO::getVidio, reqVO.getVidio())
                .likeIfPresent(EducationDO::getTitle, reqVO.getTitle())
                .eqIfPresent(EducationDO::getPicture, reqVO.getPicture())
                .eqIfPresent(EducationDO::getViews, reqVO.getViews())
                .eqIfPresent(EducationDO::getComment, reqVO.getComment())
                .eqIfPresent(EducationDO::getLikes, reqVO.getLikes())
                .orderByDesc(EducationDO::getId));
    }

}
