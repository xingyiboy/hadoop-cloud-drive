package cn.iocoder.yudao.module.system.service.historyrecord;

import java.util.*;
import cn.iocoder.yudao.module.system.controller.admin.historyrecord.vo.*;
import cn.iocoder.yudao.module.system.dal.dataobject.historyrecord.HistoryRecordDO;
import cn.iocoder.yudao.framework.common.pojo.PageResult;
import cn.iocoder.yudao.framework.common.pojo.PageParam;

import javax.validation.Valid;

/**
 * 历史记录 Service 接口
 *
 * @author 管理员
 */
public interface HistoryRecordService {

    /**
     * 创建历史记录
     *
     * @param createReqVO 创建信息
     * @return 编号
     */
    Long createHistoryRecord(@Valid HistoryRecordSaveReqVO createReqVO);

    /**
     * 更新历史记录
     *
     * @param updateReqVO 更新信息
     */
    void updateHistoryRecord(@Valid HistoryRecordSaveReqVO updateReqVO);

    /**
     * 删除历史记录
     *
     * @param id 编号
     */
    void deleteHistoryRecord(Long id);

    /**
     * 获得历史记录
     *
     * @param id 编号
     * @return 历史记录
     */
    HistoryRecordDO getHistoryRecord(Long id);

    /**
     * 获得历史记录分页
     *
     * @param pageReqVO 分页查询
     * @return 历史记录分页
     */
    PageResult<HistoryRecordDO> getHistoryRecordPage(HistoryRecordPageReqVO pageReqVO);

}
