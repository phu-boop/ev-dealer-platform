package com.ev.user_service.controller;

import com.ev.user_service.service.RedisService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/users/redis")
public class RedisTestController {

    private final RedisService redisService;

    public RedisTestController(RedisService redisService) {
        this.redisService = redisService;
    }

    @GetMapping("/test")
    public String test() {
        redisService.saveOtp("test@mail.com", "1234", 1);
        boolean valid = redisService.validateOtp("test@mail.com", "1234");
        return valid ? "OK" : "FAIL";
    }
}
