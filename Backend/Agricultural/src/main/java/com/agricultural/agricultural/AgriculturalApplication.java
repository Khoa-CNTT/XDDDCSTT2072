package com.agricultural.agricultural;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication(scanBasePackages = "com.agricultural.agricultural")
@EnableScheduling
public class AgriculturalApplication {

	public static void main(String[] args) {
		SpringApplication.run(AgriculturalApplication.class, args);
	}

}
