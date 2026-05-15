package com.weight.weight_management;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication(scanBasePackages = "com.weight.weight_management")
public class WeightManagementApplication {

    public static void main(String[] args) {
        SpringApplication.run(WeightManagementApplication.class, args);
    }
}