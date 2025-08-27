package cn.iocoder.yudao.module.system.dal.dataobject.news;

import lombok.*;
import java.util.*;
import java.time.LocalDateTime;
import java.time.LocalDateTime;
import com.baomidou.mybatisplus.annotation.*;
import cn.iocoder.yudao.framework.mybatis.core.dataobject.BaseDO;

/**
 * 新闻资讯 DO
 *
 * @author 芋道源码
 */
@TableName("system_news")
@KeySequence("system_news_seq") // 用于 Oracle、PostgreSQL、Kingbase、DB2、H2 数据库的主键自增。如果是 MySQL 等数据库，可不写。
@Data
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NewsDO extends BaseDO {

    /**
     * 用户ID
     */
    @TableId
    private Long id;
    /**
     * 首页图片
     */
    private String picture;
    /**
     * 首页标题
     */
    private String title;
    /**
     * 阅读量
     */
    private Integer view;
    /**
     * 内容
     */
    private String content;

}