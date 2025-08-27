package cn.iocoder.yudao.module.system.controller.admin.history;

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

import cn.iocoder.yudao.module.system.controller.admin.history.vo.*;
import cn.iocoder.yudao.module.system.dal.dataobject.history.HistoryDO;
import cn.iocoder.yudao.module.system.service.history.HistoryService;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletResponse;
import javax.validation.Valid;

@Tag(name = "管理后台 - 历史")
@RestController
@RequestMapping("/system/history")
@Validated
public class HistoryController {

    @Resource
    private HistoryService historyService;

    @PostMapping("/create")
    @Operation(summary = "创建历史")
    public CommonResult<Long> createHistory(@Valid @RequestBody HistorySaveReqVO createReqVO) {
        return success(historyService.createHistory(createReqVO));
    }

    @PutMapping("/update")
    @Operation(summary = "更新历史")
    public CommonResult<Boolean> updateHistory(@Valid @RequestBody HistorySaveReqVO updateReqVO) {
        historyService.updateHistory(updateReqVO);
        return success(true);
    }

    @DeleteMapping("/delete")
    @Operation(summary = "删除历史")
    @Parameter(name = "id", description = "编号", required = true)
    public CommonResult<Boolean> deleteHistory(@RequestParam("id") Long id) {
        historyService.deleteHistory(id);
        return success(true);
    }

    @GetMapping("/get")
    @Operation(summary = "获得历史")
    @Parameter(name = "id", description = "编号", required = true, example = "1024")
    public CommonResult<HistoryRespVO> getHistory(@RequestParam("id") Long id) {
        HistoryDO history = historyService.getHistory(id);
        return success(BeanUtils.toBean(history, HistoryRespVO.class));
    }

    @GetMapping("/page")
    @Operation(summary = "获得历史分页")
    public CommonResult<PageResult<HistoryRespVO>> getHistoryPage(@Valid HistoryPageReqVO pageReqVO) {
        PageResult<HistoryDO> pageResult = historyService.getHistoryPage(pageReqVO);
        return success(BeanUtils.toBean(pageResult, HistoryRespVO.class));
    }

    @GetMapping("/export-excel")
    @Operation(summary = "导出历史 Excel")
    @ApiAccessLog(operateType = EXPORT)
    public void exportHistoryExcel(@Valid HistoryPageReqVO pageReqVO,
              HttpServletResponse response) throws IOException {
        pageReqVO.setPageSize(PageParam.PAGE_SIZE_NONE);
        List<HistoryDO> list = historyService.getHistoryPage(pageReqVO).getList();
        // 导出 Excel
        ExcelUtils.write(response, "历史.xls", "数据", HistoryRespVO.class,
                        BeanUtils.toBean(list, HistoryRespVO.class));
    }

}
