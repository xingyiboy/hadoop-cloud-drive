package cn.iocoder.yudao.module.system.dal.mysql.educationcomment;

import java.util.*;

import cn.iocoder.yudao.framework.common.pojo.PageResult;
import cn.iocoder.yudao.framework.common.pojo.PageParam;
import cn.iocoder.yudao.framework.mybatis.core.query.LambdaQueryWrapperX;
import cn.iocoder.yudao.framework.mybatis.core.mapper.BaseMapperX;
import cn.iocoder.yudao.module.system.dal.dataobject.educationcomment.EducationCommentDO;
import org.apache.ibatis.annotations.Mapper;

/**
 * 教育评论 Mapper
 *
 * @author 芋道源码
 */
@Mapper
public interface EducationCommentMapper extends BaseMapperX<EducationCommentDO> {

    default List<EducationCommentDO> selectListByEducationId(Long educationId) {
        return selectList(EducationCommentDO::getEducationId, educationId);
    }

    default int deleteByEducationId(Long educationId) {
        return delete(EducationCommentDO::getEducationId, educationId);
    }

}