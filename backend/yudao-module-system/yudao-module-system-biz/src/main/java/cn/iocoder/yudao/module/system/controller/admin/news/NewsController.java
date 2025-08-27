package cn.iocoder.yudao.module.system.controller.admin.news;

import cn.iocoder.yudao.framework.security.core.util.SecurityFrameworkUtils;
import cn.iocoder.yudao.module.system.dal.dataobject.historyrecord.HistoryRecordDO;
import cn.iocoder.yudao.module.system.dal.mysql.historyrecord.HistoryRecordMapper;
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

import cn.iocoder.yudao.module.system.controller.admin.news.vo.*;
import cn.iocoder.yudao.module.system.dal.dataobject.news.NewsDO;
import cn.iocoder.yudao.module.system.service.news.NewsService;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletResponse;
import javax.validation.Valid;

@Tag(name = "管理后台 - 新闻资讯")
@RestController
@RequestMapping("/system/news")
@Validated
public class NewsController {

    @Resource
    private NewsService newsService;
    @Resource
    private HistoryRecordMapper historyRecordMapper;

    @PostMapping("/create")
    @Operation(summary = "创建新闻资讯")
    public CommonResult<Long> createNews(@Valid @RequestBody NewsSaveReqVO createReqVO) {
        return success(newsService.createNews(createReqVO));
    }

    @PutMapping("/update")
    @Operation(summary = "更新新闻资讯")
    public CommonResult<Boolean> updateNews(@Valid @RequestBody NewsSaveReqVO updateReqVO) {
        newsService.updateNews(updateReqVO);
        return success(true);
    }

    @DeleteMapping("/delete")
    @Operation(summary = "删除新闻资讯")
    @Parameter(name = "id", description = "编号", required = true)
    public CommonResult<Boolean> deleteNews(@RequestParam("id") Long id) {
        newsService.deleteNews(id);
        return success(true);
    }

    @GetMapping("/get")
    @Operation(summary = "获得新闻资讯")
    @Parameter(name = "id", description = "编号", required = true, example = "1024")
    public CommonResult<NewsRespVO> getNews(@RequestParam("id") Long id) {
        NewsDO news = newsService.getNews(id);
        HistoryRecordDO historyRecordDO = new HistoryRecordDO();
        historyRecordDO.setPageUrl("/pages/news/detail");
        historyRecordDO.setUserId(SecurityFrameworkUtils.getLoginUserId());
        historyRecordDO.setHistoryId(news.getId());
        historyRecordDO.setLocation("新闻资讯");
        historyRecordDO.setPicture(news.getPicture());
        historyRecordDO.setTitle(news.getTitle());
        historyRecordMapper.insert(historyRecordDO);
        return success(BeanUtils.toBean(news, NewsRespVO.class));
    }

    @GetMapping("/page")
    @Operation(summary = "获得新闻资讯分页")
    public CommonResult<PageResult<NewsRespVO>> getNewsPage(@Valid NewsPageReqVO pageReqVO) {
        PageResult<NewsDO> pageResult = newsService.getNewsPage(pageReqVO);
        return success(BeanUtils.toBean(pageResult, NewsRespVO.class));
    }

    @GetMapping("/export-excel")
    @Operation(summary = "导出新闻资讯 Excel")
    @ApiAccessLog(operateType = EXPORT)
    public void exportNewsExcel(@Valid NewsPageReqVO pageReqVO,
              HttpServletResponse response) throws IOException {
        pageReqVO.setPageSize(PageParam.PAGE_SIZE_NONE);
        List<NewsDO> list = newsService.getNewsPage(pageReqVO).getList();
        // 导出 Excel
        ExcelUtils.write(response, "新闻资讯.xls", "数据", NewsRespVO.class,
                        BeanUtils.toBean(list, NewsRespVO.class));
    }

}
