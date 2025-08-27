package cn.iocoder.yudao.module.system.controller.app.news;

import cn.iocoder.yudao.framework.apilog.core.annotation.ApiAccessLog;
import cn.iocoder.yudao.framework.common.pojo.CommonResult;
import cn.iocoder.yudao.framework.common.pojo.PageParam;
import cn.iocoder.yudao.framework.common.pojo.PageResult;
import cn.iocoder.yudao.framework.common.util.object.BeanUtils;
import cn.iocoder.yudao.framework.excel.core.util.ExcelUtils;
import cn.iocoder.yudao.module.system.controller.admin.news.vo.NewsPageReqVO;
import cn.iocoder.yudao.module.system.controller.admin.news.vo.NewsRespVO;
import cn.iocoder.yudao.module.system.controller.admin.news.vo.NewsSaveReqVO;
import cn.iocoder.yudao.module.system.dal.dataobject.news.NewsDO;
import cn.iocoder.yudao.module.system.service.news.NewsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletResponse;
import javax.validation.Valid;
import java.io.IOException;
import java.util.List;

import static cn.iocoder.yudao.framework.apilog.core.enums.OperateTypeEnum.EXPORT;
import static cn.iocoder.yudao.framework.common.pojo.CommonResult.success;

@Tag(name = "用户App - 新闻资讯")
@RestController
@RequestMapping("/system/news")
@Validated
public class AppNewsController {

    @Resource
    private NewsService newsService;

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
