package com.ev.vehicle_service;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication(scanBasePackages = {
    "com.ev.vehicle_service", 
    "com.ev.common_lib"       
})

public class VehicleServiceApplication {

	public static void main(String[] args) {
        SpringApplication.run(VehicleServiceApplication.class, args);
    }

}
