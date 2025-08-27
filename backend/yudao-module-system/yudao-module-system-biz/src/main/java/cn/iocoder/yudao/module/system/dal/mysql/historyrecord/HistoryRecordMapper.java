package cn.iocoder.yudao.module.system.dal.mysql.historyrecord;

import java.util.*;

import cn.iocoder.yudao.framework.common.pojo.PageResult;
import cn.iocoder.yudao.framework.mybatis.core.query.LambdaQueryWrapperX;
import cn.iocoder.yudao.framework.mybatis.core.mapper.BaseMapperX;
import cn.iocoder.yudao.module.system.dal.dataobject.historyrecord.HistoryRecordDO;
import org.apache.ibatis.annotations.Mapper;
import cn.iocoder.yudao.module.system.controller.admin.historyrecord.vo.*;

/**
 * 历史记录 Mapper
 *
 * @author 管理员
 */
@Mapper
public interface HistoryRecordMapper extends BaseMapperX<HistoryRecordDO> {

    default PageResult<HistoryRecordDO> selectPage(HistoryRecordPageReqVO reqVO) {
        return selectPage(reqVO, new LambdaQueryWrapperX<HistoryRecordDO>()
                .betweenIfPresent(HistoryRecordDO::getCreateTime, reqVO.getCreateTime())
                .eqIfPresent(HistoryRecordDO::getHistoryId, reqVO.getHistoryId())
                .eqIfPresent(HistoryRecordDO::getPageUrl, reqVO.getPageUrl())
                .eqIfPresent(HistoryRecordDO::getTitle, reqVO.getTitle())
                .eqIfPresent(HistoryRecordDO::getLocation, reqVO.getLocation())
                .eqIfPresent(HistoryRecordDO::getUserId, reqVO.getUserId())
                .eqIfPresent(HistoryRecordDO::getPicture, reqVO.getPicture())
                .orderByDesc(HistoryRecordDO::getId));
    }

}