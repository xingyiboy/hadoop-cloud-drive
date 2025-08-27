package cn.iocoder.yudao.module.system.controller.app.forum;

import cn.iocoder.yudao.framework.apilog.core.annotation.ApiAccessLog;
import cn.iocoder.yudao.framework.common.pojo.CommonResult;
import cn.iocoder.yudao.framework.common.pojo.PageParam;
import cn.iocoder.yudao.framework.common.pojo.PageResult;
import cn.iocoder.yudao.framework.common.util.object.BeanUtils;
import cn.iocoder.yudao.framework.excel.core.util.ExcelUtils;
import cn.iocoder.yudao.module.system.controller.admin.forum.vo.ForumPageReqVO;
import cn.iocoder.yudao.module.system.controller.admin.forum.vo.ForumRespVO;
import cn.iocoder.yudao.module.system.controller.admin.forum.vo.ForumSaveReqVO;
import cn.iocoder.yudao.module.system.dal.dataobject.forum.ForumDO;
import cn.iocoder.yudao.module.system.dal.dataobject.forumcomment.ForumCommentDO;
import cn.iocoder.yudao.module.system.dal.dataobject.forumlikes.ForumLikesDO;
import cn.iocoder.yudao.module.system.service.forum.ForumService;
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

@Tag(name = "管理后台 - 论坛")
@RestController
@RequestMapping("/system/forum")
@Validated
public class AppForumController {

    @Resource
    private ForumService forumService;

    @PostMapping("/create")
    @Operation(summary = "创建论坛")
    public CommonResult<Long> createForum(@Valid @RequestBody ForumSaveReqVO createReqVO) {
        return success(forumService.createForum(createReqVO));
    }

    @PostMapping("/createLikes")
    @Operation(summary = "创建点赞")
    public CommonResult<Long> createForum(@Valid @RequestBody ForumLikesDO createReqVO) {
        return success(forumService.createLikes(createReqVO));
    }

    @PostMapping("/createComment")
    @Operation(summary = "创建评论")
    public CommonResult<Long> createComment(@Valid @RequestBody ForumCommentDO createReqVO) {
        return success(forumService.createComment(createReqVO));
    }

    @PutMapping("/update")
    @Operation(summary = "更新论坛")
    public CommonResult<Boolean> updateForum(@Valid @RequestBody ForumSaveReqVO updateReqVO) {
        forumService.updateForum(updateReqVO);
        return success(true);
    }

    @DeleteMapping("/delete")
    @Operation(summary = "删除论坛")
    @Parameter(name = "id", description = "编号", required = true)
    public CommonResult<Boolean> deleteForum(@RequestParam("id") Long id) {
        forumService.deleteForum(id);
        return success(true);
    }

    @GetMapping("/get")
    @Operation(summary = "获得论坛")
    @Parameter(name = "id", description = "编号", required = true, example = "1024")
    public CommonResult<ForumRespVO> getForum(@RequestParam("id") Long id) {
        ForumDO forum = forumService.getForum(id);
        return success(BeanUtils.toBean(forum, ForumRespVO.class));
    }

    @GetMapping("/page")
    @Operation(summary = "获得论坛分页")
    public CommonResult<PageResult<ForumRespVO>> getForumPage(@Valid ForumPageReqVO pageReqVO) {
        PageResult<ForumDO> pageResult = forumService.getForumPage(pageReqVO);
        return success(BeanUtils.toBean(pageResult, ForumRespVO.class));
    }

    @GetMapping("/export-excel")
    @Operation(summary = "导出论坛 Excel")
    @ApiAccessLog(operateType = EXPORT)
    public void exportForumExcel(@Valid ForumPageReqVO pageReqVO,
              HttpServletResponse response) throws IOException {
        pageReqVO.setPageSize(PageParam.PAGE_SIZE_NONE);
        List<ForumDO> list = forumService.getForumPage(pageReqVO).getList();
        // 导出 Excel
        ExcelUtils.write(response, "论坛.xls", "数据", ForumRespVO.class,
                        BeanUtils.toBean(list, ForumRespVO.class));
    }

    // ==================== 子表（论坛评论） ====================

    @GetMapping("/forum-comment/list-by-forum-id")
    @Operation(summary = "获得论坛评论列表")
    @Parameter(name = "forumId", description = "论坛编号")
    public CommonResult<List<ForumCommentDO>> getForumCommentListByForumId(@RequestParam("forumId") Long forumId) {
        return success(forumService.getForumCommentListByForumId(forumId));
    }

    // ==================== 子表（论坛点赞） ====================

    @GetMapping("/forum-likes/list-by-forum-id")
    @Operation(summary = "获得论坛点赞列表")
    @Parameter(name = "forumId", description = "论坛编号")
    public CommonResult<List<ForumLikesDO>> getForumLikesListByForumId(@RequestParam("forumId") Long forumId) {
        return success(forumService.getForumLikesListByForumId(forumId));
    }

}
