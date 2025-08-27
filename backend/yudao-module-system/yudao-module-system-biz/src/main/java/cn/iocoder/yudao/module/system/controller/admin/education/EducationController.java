package cn.iocoder.yudao.module.system.controller.admin.education;

import cn.iocoder.yudao.framework.security.core.util.SecurityFrameworkUtils;
import cn.iocoder.yudao.module.system.dal.dataobject.historyrecord.HistoryRecordDO;
import cn.iocoder.yudao.module.system.dal.dataobject.user.AdminUserDO;
import cn.iocoder.yudao.module.system.dal.mysql.historyrecord.HistoryRecordMapper;
import cn.iocoder.yudao.module.system.dal.mysql.user.AdminUserMapper;
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

import cn.iocoder.yudao.module.system.controller.admin.education.vo.*;
import cn.iocoder.yudao.module.system.dal.dataobject.education.EducationDO;
import cn.iocoder.yudao.module.system.dal.dataobject.educationcollect.EducationCollectDO;
import cn.iocoder.yudao.module.system.dal.dataobject.educationcomment.EducationCommentDO;
import cn.iocoder.yudao.module.system.dal.dataobject.educationlike.EducationLikeDO;
import cn.iocoder.yudao.module.system.service.education.EducationService;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletResponse;
import javax.validation.Valid;

@Tag(name = "管理后台 - 教育")
@RestController
@RequestMapping("/system/education")
@Validated
public class EducationController {

    @Resource
    private EducationService educationService;
    @Resource
    private AdminUserMapper adminUserMapper;
    @Resource
    private HistoryRecordMapper historyRecordMapper;

    @PostMapping("/createCollect")
    @Operation(summary = "收藏-如果有收藏就是取消收藏")
    public CommonResult<Long> createCollect(@Valid @RequestBody EducationCollectDO createReqVO) {
        return success(educationService.createCollect(createReqVO));
    }

    @GetMapping("/isCollect")
    @Operation(summary = "判断用户是否收藏过")
    @Parameter(name = "id", description = "编号", required = true, example = "1024")
    public CommonResult<Boolean> isCollect(@RequestParam("id") Long id) {
        return educationService.isCollect(id);
    }

    @PostMapping("/createLikes")
    @Operation(summary = "点赞-如果有点赞就是取消点赞")
    public CommonResult<Long> createForum(@Valid @RequestBody EducationLikeDO createReqVO) {
        return success(educationService.createLikes(createReqVO));
    }

    @GetMapping("/isLike")
    @Operation(summary = "判断用户是否点赞过")
    @Parameter(name = "id", description = "编号", required = true, example = "1024")
    public CommonResult<Boolean> isLike(@RequestParam("id") Long id) {
        return educationService.isLike(id);
    }

    @PostMapping("/createComment")
    @Operation(summary = "创建评论")
    public CommonResult<Long> createComment(@Valid @RequestBody EducationCommentDO createReqVO) {
        return success(educationService.createComment(createReqVO));
    }

    @PostMapping("/create")
    @Operation(summary = "创建教育")
    public CommonResult<Long> createEducation(@Valid @RequestBody EducationSaveReqVO createReqVO) {
        return success(educationService.createEducation(createReqVO));
    }

    @PutMapping("/update")
    @Operation(summary = "更新教育")
    public CommonResult<Boolean> updateEducation(@Valid @RequestBody EducationSaveReqVO updateReqVO) {
        educationService.updateEducation(updateReqVO);
        return success(true);
    }

    @DeleteMapping("/delete")
    @Operation(summary = "删除教育")
    @Parameter(name = "id", description = "编号", required = true)
    public CommonResult<Boolean> deleteEducation(@RequestParam("id") Long id) {
        educationService.deleteEducation(id);
        return success(true);
    }

    @GetMapping("/get")
    @Operation(summary = "获得教育")
    @Parameter(name = "id", description = "编号", required = true, example = "1024")
    public CommonResult<EducationRespVO> getEducation(@RequestParam("id") Long id) {
        EducationDO education = educationService.getEducation(id);
        HistoryRecordDO historyRecordDO = new HistoryRecordDO();
        historyRecordDO.setPageUrl("/pages/education/detail");
        historyRecordDO.setUserId(SecurityFrameworkUtils.getLoginUserId());
        historyRecordDO.setHistoryId(education.getId());
        historyRecordDO.setLocation("教育");
        historyRecordDO.setPicture(education.getPicture());
        historyRecordDO.setTitle(education.getTitle());
        historyRecordMapper.insert(historyRecordDO);
        return success(BeanUtils.toBean(education, EducationRespVO.class));
    }

    @GetMapping("/page")
    @Operation(summary = "获得教育分页")
    public CommonResult<PageResult<EducationRespVO>> getEducationPage(@Valid EducationPageReqVO pageReqVO) {
        PageResult<EducationDO> pageResult = educationService.getEducationPage(pageReqVO);
        PageResult<EducationRespVO> bean = BeanUtils.toBean(pageResult, EducationRespVO.class);
        List<EducationRespVO> list = bean.getList();
        for (EducationRespVO educationRespVO : list) {
            AdminUserDO adminUserDO = adminUserMapper.selectById(Long.valueOf(educationRespVO.getCreator()));
            if (adminUserDO != null){
                if (adminUserDO.getNickname() != null) {
                    educationRespVO.setUserName(adminUserDO.getNickname());
                }
            }

        }
        bean.setList(list);
        return success(bean);
    }



    @GetMapping("/export-excel")
    @Operation(summary = "导出教育 Excel")
    @PreAuthorize("@ss.hasPermission('system:education:export')")
    @ApiAccessLog(operateType = EXPORT)
    public void exportEducationExcel(@Valid EducationPageReqVO pageReqVO,
              HttpServletResponse response) throws IOException {
        pageReqVO.setPageSize(PageParam.PAGE_SIZE_NONE);
        List<EducationDO> list = educationService.getEducationPage(pageReqVO).getList();
        // 导出 Excel
        ExcelUtils.write(response, "教育.xls", "数据", EducationRespVO.class,
                        BeanUtils.toBean(list, EducationRespVO.class));
    }

    // ==================== 子表（教育收藏） ====================

    @GetMapping("/education-collect/list-by-education-id")
    @Operation(summary = "获得教育收藏列表")
    @Parameter(name = "educationId", description = "教育编号")
    public CommonResult<List<EducationCollectDO>> getEducationCollectListByEducationId(@RequestParam("educationId") Long educationId) {
        return success(educationService.getEducationCollectListByEducationId(educationId));
    }

    @GetMapping("/pageCollect")
    @Operation(summary = "获得教育收藏分页")
    public CommonResult<PageResult<EducationDO>> getEducationCollectPage(@Valid EducationPageReqVO pageReqVO) {
        PageResult<EducationCollectDO> page = educationService.page(pageReqVO);
        List<EducationCollectDO> list = page.getList();
        List<EducationDO> educationList = new ArrayList<>();
        for (cn.iocoder.yudao.module.system.dal.dataobject.educationcollect.EducationCollectDO educationCollectDO : list) {
            EducationDO education = educationService.getEducation(educationCollectDO.getEducationId());
            educationList.add(education);
        }
        PageResult<EducationDO> bean = new PageResult<>();
        bean.setTotal(page.getTotal());
        bean.setList(educationList);
        return success(bean);
    }

    // ==================== 子表（教育评论） ====================

    @GetMapping("/education-comment/list-by-education-id")
    @Operation(summary = "获得教育评论列表")
    @Parameter(name = "educationId", description = "教育编号")
    public CommonResult<List<EducationCommentVO>> getEducationCommentListByEducationId(@RequestParam("educationId") Long educationId) {
        List<EducationCommentDO> list = educationService.getEducationCommentListByEducationId(educationId);
        List<EducationCommentVO> bean = BeanUtils.toBean(list, EducationCommentVO.class);
        for (EducationCommentVO educationCommentVO : bean) {
            AdminUserDO adminUserDO = adminUserMapper.selectById(educationCommentVO.getUserId());
            if (adminUserDO != null) {
                if (adminUserDO.getNickname() != null) {
                    educationCommentVO.setUserName(adminUserDO.getNickname());
                }
                if (adminUserDO.getAvatar() != null) {
                    educationCommentVO.setAvatar(adminUserDO.getAvatar());
                }
            }
        }
        return success(bean);
    }

    // ==================== 子表（教育点赞） ====================

    @GetMapping("/education-like/list-by-education-id")
    @Operation(summary = "获得教育点赞列表")
    @Parameter(name = "educationId", description = "教育编号")
    public CommonResult<List<EducationLikeDO>> getEducationLikeListByEducationId(@RequestParam("educationId") Long educationId) {
        return success(educationService.getEducationLikeListByEducationId(educationId));
    }

}
