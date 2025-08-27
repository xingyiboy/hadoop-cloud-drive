package cn.iocoder.yudao.module.system.controller.admin.hadoopfile;

import org.springframework.web.bind.annotation.*;
import org.springframework.validation.annotation.Validated;
import org.springframework.security.access.prepost.PreAuthorize;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.Operation;
import org.springframework.http.ResponseEntity;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.HttpStatus;

import java.util.*;
import java.io.IOException;
import java.io.InputStream;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

import cn.iocoder.yudao.framework.common.pojo.PageParam;
import cn.iocoder.yudao.framework.common.pojo.PageResult;
import cn.iocoder.yudao.framework.common.pojo.CommonResult;
import cn.iocoder.yudao.framework.common.util.object.BeanUtils;
import static cn.iocoder.yudao.framework.common.pojo.CommonResult.success;

import cn.iocoder.yudao.framework.excel.core.util.ExcelUtils;

import cn.iocoder.yudao.framework.apilog.core.annotation.ApiAccessLog;
import static cn.iocoder.yudao.framework.apilog.core.enums.OperateTypeEnum.*;

import cn.iocoder.yudao.module.system.controller.admin.hadoopfile.vo.*;
import cn.iocoder.yudao.module.system.dal.dataobject.hadoopfile.HadoopFileDO;
import cn.iocoder.yudao.module.system.service.hadoopfile.HadoopFileService;
import org.springframework.web.servlet.mvc.method.annotation.StreamingResponseBody;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletResponse;
import javax.validation.Valid;
import java.io.File;
import java.io.FileOutputStream;
import java.util.Base64;
import javax.servlet.AsyncContext;
import javax.servlet.http.HttpServletRequest;
import org.apache.commons.io.IOUtils;
import java.util.stream.Collectors;

@Tag(name = "管理后台 - hadoop文件")
@RestController
@RequestMapping("/system/hadoop-file")
@Validated
public class HadoopFileController {

    private static final String RECYCLE_BIN_PREFIX = "回收站（hadoop）/";

    @Resource
    private HadoopFileService hadoopFileService;

    @PostMapping("/create")
    @Operation(summary = "创建hadoop文件")
    public CommonResult<Long> createHadoopFile(@Valid @ModelAttribute HadoopFileSaveReqVO createReqVO) {
        String name = createReqVO.getName();
        if (name != null) {
            if (name.startsWith("回收站（hadoop）")) {
                name = "回收站(hadoop)" + name.substring("回收站（hadoop）".length());
            } else if (name.startsWith("分享（hadoop）")) {
                name = "分享(hadoop)" + name.substring("分享（hadoop）".length());
            }
        }
        createReqVO.setName(name);
        return success(hadoopFileService.createHadoopFile(createReqVO));
    }


    @DeleteMapping("/delete")
    @Operation(summary = "删除hadoop文件")
    @Parameter(name = "id", description = "编号", required = true)
    public CommonResult<Boolean> deleteHadoopFile(@RequestParam("id") Long id) {
        hadoopFileService.deleteHadoopFile(id);
        return success(true);
    }

    @GetMapping("/get")
    @Operation(summary = "获得hadoop文件")
    @Parameter(name = "id", description = "编号", required = true, example = "1024")
    public CommonResult<HadoopFileRespVO> getHadoopFile(@RequestParam("id") Long id) {
        HadoopFileDO hadoopFile = hadoopFileService.getHadoopFile(id);
        return success(BeanUtils.toBean(hadoopFile, HadoopFileRespVO.class));
    }

    @GetMapping("/list")
    @Operation(summary = "获得hadoop文件分页")
    public CommonResult<PageResult<HadoopFileRespVO>> getHadoopFilePage(@Valid HadoopFilePageReqVO pageReqVO) {
        // 如果不是查询分享文件（type != 8），则排除已分享的文件
        if (pageReqVO.getType() == null || pageReqVO.getType() != 8) {
            pageReqVO.setExcludeShared(true);
        }
        PageResult<HadoopFileDO> pageResult = hadoopFileService.getHadoopFilePage(pageReqVO);
        return success(BeanUtils.toBean(pageResult, HadoopFileRespVO.class));
    }

    @GetMapping("/download/{id}")
    @Operation(summary = "下载文件")
    @Parameter(name = "id", description = "文件编号", required = true)
    public ResponseEntity<byte[]> downloadFile(
            @PathVariable("id") Long id,
            @RequestHeader(value = "Range", required = false) String rangeHeader) throws IOException {
        // 1. 获取文件信息
        final HadoopFileDO file = hadoopFileService.getHadoopFile(id);
        if (file == null) {
            throw new IllegalArgumentException("文件不存在");
        }

        // 2. 读取文件内容
        byte[] fileContent;
        try (InputStream inputStream = hadoopFileService.getFileContent(id)) {
            fileContent = IOUtils.toByteArray(inputStream);
        }

        // 3. 设置响应头
        HttpHeaders headers = new HttpHeaders();

        // 设置文件名，使用 UTF-8 编码
        String encodedFileName = URLEncoder.encode(file.getName(), StandardCharsets.UTF_8.toString())
                .replaceAll("\\+", "%20"); // 替换空格
        headers.add(HttpHeaders.CONTENT_DISPOSITION,
                "attachment; filename*=UTF-8''" + encodedFileName);

        // 设置文件类型
        String contentType = determineContentType(file.getName());
        headers.add(HttpHeaders.CONTENT_TYPE, contentType);

        // 设置文件大小
        headers.setContentLength(fileContent.length);

        // 4. 返回响应
        return ResponseEntity.ok()
                .headers(headers)
                .body(fileContent);
    }

    /**
     * 根据文件名确定 Content-Type
     */
    private String determineContentType(String fileName) {
        String extension = fileName.substring(fileName.lastIndexOf(".") + 1).toLowerCase();
        switch (extension) {
            case "txt":
                return MediaType.TEXT_PLAIN_VALUE;
            case "html":
                return MediaType.TEXT_HTML_VALUE;
            case "pdf":
                return MediaType.APPLICATION_PDF_VALUE;
            case "jpg":
            case "jpeg":
                return MediaType.IMAGE_JPEG_VALUE;
            case "png":
                return MediaType.IMAGE_PNG_VALUE;
            case "gif":
                return MediaType.IMAGE_GIF_VALUE;
            case "json":
                return MediaType.APPLICATION_JSON_VALUE;
            case "xml":
                return MediaType.APPLICATION_XML_VALUE;
            default:
                return MediaType.APPLICATION_OCTET_STREAM_VALUE;
        }
    }

    @PostMapping("/restore")
    @Operation(summary = "恢复回收站中的文件")
    @Parameter(name = "id", description = "编号", required = true)
    public CommonResult<Boolean> restoreHadoopFile(@RequestParam("id") Long id) {
        hadoopFileService.restoreHadoopFile(id);
        return success(true);
    }

    @PostMapping("/share")
    @Operation(summary = "分享文件")
    @Parameter(name = "id", description = "编号", required = true)
    public CommonResult<Boolean> shareHadoopFile(@RequestParam("id") Long id) {
        hadoopFileService.shareHadoopFile(id);
        return success(true);
    }

    @PostMapping("/cancel-share")
    @Operation(summary = "取消分享文件")
    @Parameter(name = "id", description = "编号", required = true)
    public CommonResult<Boolean> cancelShare(@RequestParam("id") Long id) {
        hadoopFileService.cancelShare(id);
        return success(true);
    }

    @PostMapping("/batch-share")
    @Operation(summary = "批量分享文件")
    public CommonResult<Boolean> batchShareHadoopFiles(@RequestBody List<Long> ids) {
        hadoopFileService.batchShareHadoopFiles(ids);
        return success(true);
    }

    @GetMapping("/share-link/{shareKey}")
    @Operation(summary = "获取分享链接")
    @Parameter(name = "shareKey", description = "分享密钥", required = true)
    public CommonResult<List<HadoopFileRespVO>> getShareLink(@PathVariable("shareKey") String shareKey) {
        List<HadoopFileDO> files = hadoopFileService.getShareFiles(shareKey);
        return success(BeanUtils.toBean(files, HadoopFileRespVO.class));
    }

    @GetMapping("/download-shared/{shareKey}/{fileName}")
    @Operation(summary = "下载分享文件")
    @Parameter(name = "shareKey", description = "分享密钥", required = true)
    @Parameter(name = "fileName", description = "文件名", required = true)
    @ApiAccessLog(operateType = EXPORT)
    public ResponseEntity<byte[]> downloadSharedFile(
            @PathVariable("shareKey") String shareKey,
            @PathVariable("fileName") String fileName,
            @RequestHeader(value = "Range", required = false) String rangeHeader) throws IOException {
        // 1. 获取文件信息
        final HadoopFileDO file = hadoopFileService.getShareFile(shareKey, fileName);
        if (file == null) {
            throw new IllegalArgumentException("文件不存在");
        }

        // 2. 读取文件内容
        byte[] fileContent;
        try (InputStream inputStream = hadoopFileService.getFileContent(file.getId())) {
            fileContent = IOUtils.toByteArray(inputStream);
        }

        // 3. 设置响应头
        HttpHeaders headers = new HttpHeaders();

        // 设置文件名，使用 UTF-8 编码
        String encodedFileName = URLEncoder.encode(file.getName().substring(file.getName().lastIndexOf("/") + 1), StandardCharsets.UTF_8.toString())
                .replaceAll("\\+", "%20"); // 替换空格
        headers.add(HttpHeaders.CONTENT_DISPOSITION,
                "attachment; filename*=UTF-8''" + encodedFileName);

        // 设置文件类型
        String contentType = determineContentType(file.getName());
        headers.add(HttpHeaders.CONTENT_TYPE, contentType);

        // 设置文件大小
        headers.setContentLength(fileContent.length);

        // 4. 返回响应
        return ResponseEntity.ok()
                .headers(headers)
                .body(fileContent);
    }

    /**
     * 计算文件大小
     *
     * @param sizeStr 文件大小字符串（MB）
     * @return 文件大小（字节）
     */
    private long calculateFileSize(String sizeStr) {
        if (sizeStr != null) {
            try {
                return (long) (Double.parseDouble(sizeStr) * 1024 * 1024); // 转换为字节
            } catch (NumberFormatException ignored) {
                // 如果解析失败，返回0
            }
        }
        return 0;
    }

    private static class RangeInfo {
        final long startByte;
        final long endByte;

        RangeInfo(long startByte, long endByte) {
            this.startByte = startByte;
            this.endByte = endByte;
        }
    }

    /**
     * 解析 Range 请求头
     *
     * @param rangeHeader Range 请求头
     * @param fileSize 文件大小
     * @return Range 信息
     */
    private RangeInfo parseRange(String rangeHeader, long fileSize) {
        if (rangeHeader != null && rangeHeader.startsWith("bytes=")) {
            String[] ranges = rangeHeader.substring(6).split("-");
            try {
                long startByte = Long.parseLong(ranges[0]);
                long endByte;
                if (ranges.length > 1 && !ranges[1].isEmpty()) {
                    endByte = Long.parseLong(ranges[1]);
                } else {
                    endByte = fileSize - 1;
                }
                return new RangeInfo(startByte, endByte);
            } catch (NumberFormatException ignored) {
                // 如果解析失败，返回完整文件范围
            }
        }
        return new RangeInfo(0, fileSize - 1);
    }

    @PostMapping("/rename")
    @Operation(summary = "重命名文件")
    @Parameter(name = "id", description = "编号", required = true)
    @Parameter(name = "newName", description = "新文件名", required = true)
    public CommonResult<Boolean> renameHadoopFile(@RequestParam("id") Long id, @RequestParam("newName") String newName) {
        if (newName != null) {
            if (newName.startsWith("回收站（hadoop）")) {
                newName = "回收站(hadoop)" + newName.substring("回收站（hadoop）".length());
            } else if (newName.startsWith("分享（hadoop）")) {
                newName = "分享(hadoop)" + newName.substring("分享（hadoop）".length());
            }
        }
        // 1. 获取文件信息
        HadoopFileDO file = hadoopFileService.getHadoopFile(id);
        if (file == null) {
            return success(false);
        }

        // 2. 如果是文件夹，需要更新所有子文件的路径
        if (file.getType() == 6) { // 6 表示文件夹
            // 获取当前目录的完整路径
            String catalogue = file.getCatalogue();
            if (catalogue == null || catalogue.equals("/")) {
                catalogue = "";
            }
            String oldPath = catalogue + "/" + file.getName();
            String newPath = catalogue + "/" + newName;

            // 更新文件夹下所有文件的路径
            hadoopFileService.updateSubFilePaths(oldPath, newPath);
        }

        // 3. 重命名文件或文件夹
        hadoopFileService.renameHadoopFile(id, newName);
        return success(true);
    }

    @PostMapping("/move")
    @Operation(summary = "移动文件")
    @Parameter(name = "id", description = "编号", required = true)
    @Parameter(name = "targetPath", description = "目标路径", required = true)
    public CommonResult<Boolean> moveHadoopFile(@RequestParam("id") Long id, @RequestParam("targetPath") String targetPath) {
        // 1. 获取文件信息
        HadoopFileDO file = hadoopFileService.getHadoopFile(id);
        if (file == null) {
            return success(false);
        }

        // 2. 如果是文件夹，需要更新所有子文件的路径
        if (file.getType() == 6) { // 6 表示文件夹
            // 获取当前目录的完整路径
            String catalogue = file.getCatalogue();
            if (catalogue == null || catalogue.equals("/")) {
                catalogue = "";
            }
            String oldPath = catalogue + "/" + file.getName();
            String newPath = targetPath + "/" + file.getName();

            // 更新文件夹下所有文件的路径
            hadoopFileService.updateSubFilePaths(oldPath, newPath);
        }

        // 3. 移动文件或文件夹
        hadoopFileService.moveHadoopFile(id, targetPath);
        return success(true);
    }

    @PostMapping("/save-shared")
    @Operation(summary = "保存分享文件到个人文件夹")
    public CommonResult<Boolean> saveSharedFiles(@RequestBody SaveSharedFilesReqVO reqVO) {
        // 1. 获取分享文件列表
        List<HadoopFileDO> sharedFiles = hadoopFileService.getShareFiles(reqVO.getShareKey());
        if (sharedFiles.isEmpty()) {
            return success(false);
        }

        // 2. 过滤出选中的文件
        List<HadoopFileDO> selectedFiles = sharedFiles.stream()
                .filter(file -> reqVO.getFileIds().contains(file.getId().toString()))
                .collect(Collectors.toList());

        // 3. 复制文件到目标路径
        hadoopFileService.saveSharedFiles(selectedFiles, reqVO.getTargetPath());
        return success(true);
    }

}
