package com.ev.dealerservice.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DealerResponse {

    private Long dealerId;
    private String dealerCode;
    private String dealerName;
    private String address;
    private String city;
    private String region;
    private String phone;
    private String email;
    private String taxNumber;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
