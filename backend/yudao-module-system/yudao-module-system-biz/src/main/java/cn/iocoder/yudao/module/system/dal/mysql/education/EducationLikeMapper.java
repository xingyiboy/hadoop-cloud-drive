package cn.iocoder.yudao.module.system.dal.mysql.educationlike;

import java.util.*;

import cn.iocoder.yudao.framework.common.pojo.PageResult;
import cn.iocoder.yudao.framework.common.pojo.PageParam;
import cn.iocoder.yudao.framework.mybatis.core.query.LambdaQueryWrapperX;
import cn.iocoder.yudao.framework.mybatis.core.mapper.BaseMapperX;
import cn.iocoder.yudao.module.system.dal.dataobject.educationlike.EducationLikeDO;
import org.apache.ibatis.annotations.Mapper;

/**
 * 教育点赞 Mapper
 *
 * @author 芋道源码
 */
@Mapper
public interface EducationLikeMapper extends BaseMapperX<EducationLikeDO> {

    default List<EducationLikeDO> selectListByEducationId(Long educationId) {
        return selectList(EducationLikeDO::getEducationId, educationId);
    }

    default int deleteByEducationId(Long educationId) {
        return delete(EducationLikeDO::getEducationId, educationId);
    }

}