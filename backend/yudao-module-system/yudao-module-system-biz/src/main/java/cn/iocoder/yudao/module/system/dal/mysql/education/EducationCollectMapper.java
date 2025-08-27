package cn.iocoder.yudao.module.system.dal.mysql.educationcollect;

import java.util.*;

import cn.iocoder.yudao.framework.common.pojo.PageResult;
import cn.iocoder.yudao.framework.common.pojo.PageParam;
import cn.iocoder.yudao.framework.mybatis.core.query.LambdaQueryWrapperX;
import cn.iocoder.yudao.framework.mybatis.core.mapper.BaseMapperX;
import cn.iocoder.yudao.module.system.dal.dataobject.educationcollect.EducationCollectDO;
import org.apache.ibatis.annotations.Mapper;

/**
 * 教育收藏 Mapper
 *
 * @author 芋道源码
 */
@Mapper
public interface EducationCollectMapper extends BaseMapperX<EducationCollectDO> {

    default List<EducationCollectDO> selectListByEducationId(Long educationId) {
        return selectList(EducationCollectDO::getEducationId, educationId);
    }

    default int deleteByEducationId(Long educationId) {
        return delete(EducationCollectDO::getEducationId, educationId);
    }

}