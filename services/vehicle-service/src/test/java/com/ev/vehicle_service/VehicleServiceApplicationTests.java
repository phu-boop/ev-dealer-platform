package com.ev.vehicle_service;

import org.junit.jupiter.api.Test;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ContextConfiguration; 
import com.ev.vehicle_service.util.DotenvTestInitializer; 


@SpringBootApplication(scanBasePackages = {
    "com.ev.vehicle_service", 
    "com.ev.common_lib"       
})
@SpringBootTest
@ContextConfiguration(initializers = DotenvTestInitializer.class) 
class VehicleServiceApplicationTests {

	@Test
	void contextLoads() {
	}

}
