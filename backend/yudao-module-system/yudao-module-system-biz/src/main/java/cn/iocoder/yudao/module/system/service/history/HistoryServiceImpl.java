package cn.iocoder.yudao.module.system.service.history;

import org.springframework.stereotype.Service;
import org.springframework.validation.annotation.Validated;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import cn.iocoder.yudao.module.system.controller.admin.history.vo.*;
import cn.iocoder.yudao.module.system.dal.dataobject.history.HistoryDO;
import cn.iocoder.yudao.framework.common.pojo.PageResult;
import cn.iocoder.yudao.framework.common.pojo.PageParam;
import cn.iocoder.yudao.framework.common.util.object.BeanUtils;

import cn.iocoder.yudao.module.system.dal.mysql.history.HistoryMapper;

import javax.annotation.Resource;

import static cn.iocoder.yudao.framework.common.exception.util.ServiceExceptionUtil.exception;
import static cn.iocoder.yudao.module.system.enums.ErrorCodeConstants.*;

/**
 * 历史 Service 实现类
 *
 * @author 管理员
 */
@Service
@Validated
public class HistoryServiceImpl implements HistoryService {

    @Resource
    private HistoryMapper historyMapper;

    @Override
    public Long createHistory(HistorySaveReqVO createReqVO) {
        // 插入
        HistoryDO history = BeanUtils.toBean(createReqVO, HistoryDO.class);
        historyMapper.insert(history);
        // 返回
        return history.getId();
    }

    @Override
    public void updateHistory(HistorySaveReqVO updateReqVO) {
        // 校验存在
        validateHistoryExists(updateReqVO.getId());
        // 更新
        HistoryDO updateObj = BeanUtils.toBean(updateReqVO, HistoryDO.class);
        historyMapper.updateById(updateObj);
    }

    @Override
    public void deleteHistory(Long id) {
        // 校验存在
        validateHistoryExists(id);
        // 删除
        historyMapper.deleteById(id);
    }

    private void validateHistoryExists(Long id) {
        if (historyMapper.selectById(id) == null) {
            throw exception(HISTORY_NOT_EXISTS);
        }
    }

    @Override
    public HistoryDO getHistory(Long id) {
        return historyMapper.selectById(id);
    }

    @Override
    public PageResult<HistoryDO> getHistoryPage(HistoryPageReqVO pageReqVO) {
        return historyMapper.selectPage(pageReqVO);
    }

}
