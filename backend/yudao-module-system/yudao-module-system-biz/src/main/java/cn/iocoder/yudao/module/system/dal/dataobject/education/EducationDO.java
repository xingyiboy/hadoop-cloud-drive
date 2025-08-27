package cn.iocoder.yudao.module.system.dal.dataobject.education;

import lombok.*;
import java.util.*;
import java.time.LocalDateTime;
import java.time.LocalDateTime;
import com.baomidou.mybatisplus.annotation.*;
import cn.iocoder.yudao.framework.mybatis.core.dataobject.BaseDO;

/**
 * 教育 DO
 *
 * @author 芋道源码
 */
@TableName("system_education")
@KeySequence("system_education_seq") // 用于 Oracle、PostgreSQL、Kingbase、DB2、H2 数据库的主键自增。如果是 MySQL 等数据库，可不写。
@Data
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EducationDO extends BaseDO {

    /**
     * 用户ID
     */
    @TableId
    private Long id;
    /**
     * 视频
     */
    private String vidio;
    /**
     * 视频标题
     */
    private String title;
    /**
     * 首页图片
     */
    private String picture;
    /**
     * 观看量
     */
    private Integer views;
    /**
     * 评论量
     */
    private Integer comment;
    /**
     * 点赞量
     */
    private Integer likes;

}