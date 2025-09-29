package com.freelancehub.user_service.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import com.freelancehub.user_service.service.PaymentService;

import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("/payment")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    @GetMapping("/pay")
    public void pay(HttpServletResponse response,
                    @RequestParam String orderId,
                    @RequestParam Long amount,
                    HttpServletRequest request) throws IOException {
        String url = paymentService.createPaymentUrl(orderId, amount, request);
        response.sendRedirect(url);
    }

    @GetMapping("/return")
    public String paymentReturn(@RequestParam Map<String, String> params) {
        String vnp_ResponseCode = params.get("vnp_ResponseCode");
        String vnp_Amount = params.get("vnp_Amount");

        // ✅ chia lại cho 100 để hiển thị đúng số tiền
        long amount = Long.parseLong(vnp_Amount) / 100;

        if ("00".equals(vnp_ResponseCode)) {
            return "Thanh toán thành công! Số tiền: " + amount + " VND";
        } else {
            return "Thanh toán thất bại!";
        }
    }
}
