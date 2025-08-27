package cn.iocoder.yudao.module.system.service.historyrecord;

import cn.iocoder.yudao.framework.security.core.util.SecurityFrameworkUtils;
import org.springframework.stereotype.Service;
import org.springframework.validation.annotation.Validated;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import cn.iocoder.yudao.module.system.controller.admin.historyrecord.vo.*;
import cn.iocoder.yudao.module.system.dal.dataobject.historyrecord.HistoryRecordDO;
import cn.iocoder.yudao.framework.common.pojo.PageResult;
import cn.iocoder.yudao.framework.common.pojo.PageParam;
import cn.iocoder.yudao.framework.common.util.object.BeanUtils;

import cn.iocoder.yudao.module.system.dal.mysql.historyrecord.HistoryRecordMapper;

import javax.annotation.Resource;

import static cn.iocoder.yudao.framework.common.exception.util.ServiceExceptionUtil.exception;
import static cn.iocoder.yudao.module.system.enums.ErrorCodeConstants.*;

/**
 * 历史记录 Service 实现类
 *
 * @author 管理员
 */
@Service
@Validated
public class HistoryRecordServiceImpl implements HistoryRecordService {

    @Resource
    private HistoryRecordMapper historyRecordMapper;

    @Override
    public Long createHistoryRecord(HistoryRecordSaveReqVO createReqVO) {
        // 插入
        HistoryRecordDO historyRecord = BeanUtils.toBean(createReqVO, HistoryRecordDO.class);
        historyRecordMapper.insert(historyRecord);
        // 返回
        return historyRecord.getId();
    }

    @Override
    public void updateHistoryRecord(HistoryRecordSaveReqVO updateReqVO) {
        // 校验存在
        validateHistoryRecordExists(updateReqVO.getId());
        // 更新
        HistoryRecordDO updateObj = BeanUtils.toBean(updateReqVO, HistoryRecordDO.class);
        historyRecordMapper.updateById(updateObj);
    }

    @Override
    public void deleteHistoryRecord(Long id) {
        // 校验存在
        validateHistoryRecordExists(id);
        // 删除
        historyRecordMapper.deleteById(id);
    }

    private void validateHistoryRecordExists(Long id) {
        if (historyRecordMapper.selectById(id) == null) {
            throw exception(HISTORY_RECORD_NOT_EXISTS);
        }
    }

    @Override
    public HistoryRecordDO getHistoryRecord(Long id) {
        return historyRecordMapper.selectById(id);
    }

    @Override
    public PageResult<HistoryRecordDO> getHistoryRecordPage(HistoryRecordPageReqVO pageReqVO) {
        pageReqVO.setUserId(SecurityFrameworkUtils.getLoginUserId());
        return historyRecordMapper.selectPage(pageReqVO);
    }

}
