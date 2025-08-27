package cn.iocoder.yudao.module.system.service.history;

import java.util.*;
import cn.iocoder.yudao.module.system.controller.admin.history.vo.*;
import cn.iocoder.yudao.module.system.dal.dataobject.history.HistoryDO;
import cn.iocoder.yudao.framework.common.pojo.PageResult;
import cn.iocoder.yudao.framework.common.pojo.PageParam;

import javax.validation.Valid;

/**
 * 历史 Service 接口
 *
 * @author 管理员
 */
public interface HistoryService {

    /**
     * 创建历史
     *
     * @param createReqVO 创建信息
     * @return 编号
     */
    Long createHistory(@Valid HistorySaveReqVO createReqVO);

    /**
     * 更新历史
     *
     * @param updateReqVO 更新信息
     */
    void updateHistory(@Valid HistorySaveReqVO updateReqVO);

    /**
     * 删除历史
     *
     * @param id 编号
     */
    void deleteHistory(Long id);

    /**
     * 获得历史
     *
     * @param id 编号
     * @return 历史
     */
    HistoryDO getHistory(Long id);

    /**
     * 获得历史分页
     *
     * @param pageReqVO 分页查询
     * @return 历史分页
     */
    PageResult<HistoryDO> getHistoryPage(HistoryPageReqVO pageReqVO);

}
