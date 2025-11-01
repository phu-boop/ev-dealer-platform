package com.ev.vehicle_service;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ContextConfiguration; 
import com.ev.vehicle_service.util.DotenvTestInitializer; 


@SpringBootTest
@ContextConfiguration(initializers = DotenvTestInitializer.class) 
class VehicleServiceApplicationTests {

	@Test
	void contextLoads() {
	}

}
