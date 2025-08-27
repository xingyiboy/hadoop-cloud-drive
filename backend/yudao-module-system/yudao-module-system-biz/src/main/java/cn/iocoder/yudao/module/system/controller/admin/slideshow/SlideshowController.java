package cn.iocoder.yudao.module.system.controller.admin.slideshow;

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

import cn.iocoder.yudao.module.system.controller.admin.slideshow.vo.*;
import cn.iocoder.yudao.module.system.dal.dataobject.slideshow.SlideshowDO;
import cn.iocoder.yudao.module.system.service.slideshow.SlideshowService;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletResponse;
import javax.validation.Valid;

@Tag(name = "管理后台 - 轮播图")
@RestController
@RequestMapping("/system/slideshow")
@Validated
public class SlideshowController {

    @Resource
    private SlideshowService slideshowService;

    @PostMapping("/create")
    @Operation(summary = "创建轮播图")
    public CommonResult<Long> createSlideshow(@Valid @RequestBody SlideshowSaveReqVO createReqVO) {
        return success(slideshowService.createSlideshow(createReqVO));
    }

    @PutMapping("/update")
    @Operation(summary = "更新轮播图")
    public CommonResult<Boolean> updateSlideshow(@Valid @RequestBody SlideshowSaveReqVO updateReqVO) {
        slideshowService.updateSlideshow(updateReqVO);
        return success(true);
    }

    @DeleteMapping("/delete")
    @Operation(summary = "删除轮播图")
    @Parameter(name = "id", description = "编号", required = true)
    public CommonResult<Boolean> deleteSlideshow(@RequestParam("id") Long id) {
        slideshowService.deleteSlideshow(id);
        return success(true);
    }

    @GetMapping("/get")
    @Operation(summary = "获得轮播图")
    @Parameter(name = "id", description = "编号", required = true, example = "1024")
    public CommonResult<SlideshowRespVO> getSlideshow(@RequestParam("id") Long id) {
        SlideshowDO slideshow = slideshowService.getSlideshow(id);
        return success(BeanUtils.toBean(slideshow, SlideshowRespVO.class));
    }

    @GetMapping("/page")
    @Operation(summary = "获得轮播图分页")
    public CommonResult<PageResult<SlideshowRespVO>> getSlideshowPage(@Valid SlideshowPageReqVO pageReqVO) {
        PageResult<SlideshowDO> pageResult = slideshowService.getSlideshowPage(pageReqVO);
        return success(BeanUtils.toBean(pageResult, SlideshowRespVO.class));
    }

    @GetMapping("/export-excel")
    @Operation(summary = "导出轮播图 Excel")
    @ApiAccessLog(operateType = EXPORT)
    public void exportSlideshowExcel(@Valid SlideshowPageReqVO pageReqVO,
              HttpServletResponse response) throws IOException {
        pageReqVO.setPageSize(PageParam.PAGE_SIZE_NONE);
        List<SlideshowDO> list = slideshowService.getSlideshowPage(pageReqVO).getList();
        // 导出 Excel
        ExcelUtils.write(response, "轮播图.xls", "数据", SlideshowRespVO.class,
                        BeanUtils.toBean(list, SlideshowRespVO.class));
    }

}
