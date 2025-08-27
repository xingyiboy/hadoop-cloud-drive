package cn.iocoder.yudao.module.system.dal.mysql.history;

import java.util.*;

import cn.iocoder.yudao.framework.common.pojo.PageResult;
import cn.iocoder.yudao.framework.mybatis.core.query.LambdaQueryWrapperX;
import cn.iocoder.yudao.framework.mybatis.core.mapper.BaseMapperX;
import cn.iocoder.yudao.module.system.dal.dataobject.history.HistoryDO;
import org.apache.ibatis.annotations.Mapper;
import cn.iocoder.yudao.module.system.controller.admin.history.vo.*;

/**
 * 历史 Mapper
 *
 * @author 管理员
 */
@Mapper
public interface HistoryMapper extends BaseMapperX<HistoryDO> {

    default PageResult<HistoryDO> selectPage(HistoryPageReqVO reqVO) {
        return selectPage(reqVO, new LambdaQueryWrapperX<HistoryDO>()
                .betweenIfPresent(HistoryDO::getCreateTime, reqVO.getCreateTime())
                .eqIfPresent(HistoryDO::getContent, reqVO.getContent())
                .eqIfPresent(HistoryDO::getArea, reqVO.getArea())
                .eqIfPresent(HistoryDO::getIsVideo, reqVO.getIsVideo())
                .eqIfPresent(HistoryDO::getVidioUrl, reqVO.getVidioUrl())
                .eqIfPresent(HistoryDO::getTitle, reqVO.getTitle())
                .orderByDesc(HistoryDO::getId));
    }

}