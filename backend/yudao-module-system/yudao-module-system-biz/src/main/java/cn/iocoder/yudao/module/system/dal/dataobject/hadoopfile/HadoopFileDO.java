package cn.iocoder.yudao.module.system.dal.dataobject.hadoopfile;

import com.sun.xml.bind.v2.TODO;
import lombok.*;
import java.util.*;
import java.time.LocalDateTime;
import java.time.LocalDateTime;
import com.baomidou.mybatisplus.annotation.*;
import cn.iocoder.yudao.framework.mybatis.core.dataobject.BaseDO;

/**
 * hadoop文件 DO
 *
 * @author 管理员1
 */
@TableName("system_hadoop_file")
@KeySequence("system_hadoop_file_seq") // 用于 Oracle、PostgreSQL、Kingbase、DB2、H2 数据库的主键自增。如果是 MySQL 等数据库，可不写。
@Data
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HadoopFileDO extends BaseDO {

    /**
     * 用户ID
     */
    @TableId
    private Long id;
    /**
     * 文件类型
     *
     * 枚举 {@link TODO file_type 对应的类}
     */
    private Integer type;
    /**
     * 文件名
     */
    private String name;
    /**
     * 父级目录
     */
    private String catalogue;
    /**
     * 大小(MB)
     */
    private String size;
}
