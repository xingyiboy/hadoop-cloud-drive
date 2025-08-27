package cn.iocoder.yudao.module.system.controller.admin.historyrecord;

import org.springframework.web.bind.annotation.*;
import org.springframework.validation.annotation.Validated;
import org.springframework.security.access.prepost.PreAuthorize;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.Operation;

import java.util.*;
import java.io.IOException;

import cn.iocoder.yudao.framework.common.pojo.PageParam;
import cn.iocoder.yudao.framework.common.pojo.PageResult;
import cn.iocoder.yudao.framework.common.pojo.CommonResult;
import cn.iocoder.yudao.framework.common.util.object.BeanUtils;
import static cn.iocoder.yudao.framework.common.pojo.CommonResult.success;

import cn.iocoder.yudao.framework.excel.core.util.ExcelUtils;

import cn.iocoder.yudao.framework.apilog.core.annotation.ApiAccessLog;
import static cn.iocoder.yudao.framework.apilog.core.enums.OperateTypeEnum.*;

import cn.iocoder.yudao.module.system.controller.admin.historyrecord.vo.*;
import cn.iocoder.yudao.module.system.dal.dataobject.historyrecord.HistoryRecordDO;
import cn.iocoder.yudao.module.system.service.historyrecord.HistoryRecordService;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletResponse;
import javax.validation.Valid;

@Tag(name = "管理后台 - 历史记录")
@RestController
@RequestMapping("/system/history-record")
@Validated
public class HistoryRecordController {

    @Resource
    private HistoryRecordService historyRecordService;

    @PostMapping("/create")
    @Operation(summary = "创建历史记录")
    public CommonResult<Long> createHistoryRecord(@Valid @RequestBody HistoryRecordSaveReqVO createReqVO) {
        return success(historyRecordService.createHistoryRecord(createReqVO));
    }

    @PutMapping("/update")
    @Operation(summary = "更新历史记录")
    public CommonResult<Boolean> updateHistoryRecord(@Valid @RequestBody HistoryRecordSaveReqVO updateReqVO) {
        historyRecordService.updateHistoryRecord(updateReqVO);
        return success(true);
    }

    @DeleteMapping("/delete")
    @Operation(summary = "删除历史记录")
    @Parameter(name = "id", description = "编号", required = true)
    public CommonResult<Boolean> deleteHistoryRecord(@RequestParam("id") Long id) {
        historyRecordService.deleteHistoryRecord(id);
        return success(true);
    }

    @GetMapping("/get")
    @Operation(summary = "获得历史记录")
    @Parameter(name = "id", description = "编号", required = true, example = "1024")
    public CommonResult<HistoryRecordRespVO> getHistoryRecord(@RequestParam("id") Long id) {
        HistoryRecordDO historyRecord = historyRecordService.getHistoryRecord(id);
        return success(BeanUtils.toBean(historyRecord, HistoryRecordRespVO.class));
    }

    @GetMapping("/page")
    @Operation(summary = "获得历史记录分页")
    public CommonResult<PageResult<HistoryRecordRespVO>> getHistoryRecordPage(@Valid HistoryRecordPageReqVO pageReqVO) {
        PageResult<HistoryRecordDO> pageResult = historyRecordService.getHistoryRecordPage(pageReqVO);
        return success(BeanUtils.toBean(pageResult, HistoryRecordRespVO.class));
    }

    @GetMapping("/export-excel")
    @Operation(summary = "导出历史记录 Excel")
    @ApiAccessLog(operateType = EXPORT)
    public void exportHistoryRecordExcel(@Valid HistoryRecordPageReqVO pageReqVO,
              HttpServletResponse response) throws IOException {
        pageReqVO.setPageSize(PageParam.PAGE_SIZE_NONE);
        List<HistoryRecordDO> list = historyRecordService.getHistoryRecordPage(pageReqVO).getList();
        // 导出 Excel
        ExcelUtils.write(response, "历史记录.xls", "数据", HistoryRecordRespVO.class,
                        BeanUtils.toBean(list, HistoryRecordRespVO.class));
    }

}
