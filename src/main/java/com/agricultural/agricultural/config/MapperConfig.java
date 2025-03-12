package com.agricultural.agricultural.config;

import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;

@Configuration
@ComponentScan(basePackages = "com.agricultural.agricultural.mapper")
public class MapperConfig {
//    @Bean
//    public ModelMapper modelMapper(){
//        return  new ModelMapper();
//    }
}
