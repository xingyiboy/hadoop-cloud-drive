package cn.iocoder.yudao.module.system.dal.mysql.hadoopfile;

import java.util.*;

import cn.iocoder.yudao.framework.common.pojo.PageResult;
import cn.iocoder.yudao.framework.mybatis.core.query.LambdaQueryWrapperX;
import cn.iocoder.yudao.framework.mybatis.core.mapper.BaseMapperX;
import cn.iocoder.yudao.module.system.dal.dataobject.hadoopfile.HadoopFileDO;
import org.apache.ibatis.annotations.Mapper;
import cn.iocoder.yudao.module.system.controller.admin.hadoopfile.vo.*;
import org.springframework.util.StringUtils;

/**
 * hadoop文件 Mapper
 *
 * @author 管理员1
 */
@Mapper
public interface HadoopFileMapper extends BaseMapperX<HadoopFileDO> {

    default PageResult<HadoopFileDO> selectPage(HadoopFilePageReqVO reqVO) {
        LambdaQueryWrapperX<HadoopFileDO> queryWrapper = new LambdaQueryWrapperX<HadoopFileDO>()
                .betweenIfPresent(HadoopFileDO::getCreateTime, reqVO.getCreateTime())
                .eqIfPresent(HadoopFileDO::getType, reqVO.getType())
                .likeIfPresent(HadoopFileDO::getName, reqVO.getName())
                .likeIfPresent(HadoopFileDO::getCatalogue, reqVO.getCatalogue())
                .eqIfPresent(HadoopFileDO::getSize, reqVO.getSize());

        // 处理单个排除名称
        if (StringUtils.hasText(reqVO.getExcludeName())) {
            queryWrapper.notLike(HadoopFileDO::getName, reqVO.getExcludeName());
        }

        // 处理多个排除名称
        if (reqVO.getExcludeNames() != null && !reqVO.getExcludeNames().isEmpty()) {
            for (String excludeName : reqVO.getExcludeNames()) {
                if (StringUtils.hasText(excludeName)) {
                    queryWrapper.notLike(HadoopFileDO::getName, excludeName);
                }
            }
        }

        queryWrapper.orderByDesc(HadoopFileDO::getId);
        return selectPage(reqVO, queryWrapper);
    }

}