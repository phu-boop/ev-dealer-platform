package com.ev.inventory_service;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ContextConfiguration; 
import com.ev.inventory_service.util.DotenvTestInitializer;


@SpringBootTest
@ContextConfiguration(initializers = DotenvTestInitializer.class) 
class InventoryServiceApplicationTests {

	@Test
	void contextLoads() {
	}

}
