package cn.iocoder.yudao.server.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfiguration implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**") // 所有接口
            .allowedOriginPatterns("*") // 允许所有来源
            .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS") // 允许所有方法
            .allowedHeaders("*") // 允许所有请求头
            .allowCredentials(true) // 允许发送cookie
            .maxAge(3600L); // 预检请求的有效期
    }
}
