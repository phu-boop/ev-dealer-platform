package com.ev.sales_service.service.Implementation;

import com.ev.common_lib.exception.AppException;
import com.ev.common_lib.exception.ErrorCode;
import com.ev.sales_service.dto.response.CustomerResponse;
import com.ev.sales_service.entity.Quotation;
import com.ev.sales_service.entity.SalesOrder;
import com.ev.sales_service.service.Interface.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;
import org.thymeleaf.exceptions.TemplateInputException;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

import java.time.format.DateTimeFormatter;
import java.util.Locale;

@Service
@Slf4j
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {
    // Thêm vào EmailServiceImpl
    @Value("${app.base-url:http://localhost:8080}")
    private String baseUrl;

    @Value("${app.frontend-url:http://localhost:3000}")
    private String frontendUrl;
    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;

    @Override
    public void sendQuotationEmail(Quotation quotation, CustomerResponse customer) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(customer.getEmail());
            helper.setSubject(String.format("Báo Giá Xe - %s", quotation.getQuotationId()));
            helper.setText(buildQuotationEmailContent(quotation, customer), true);

            mailSender.send(message);
            log.info("Quotation email sent successfully to: {}", customer.getEmail());
        } catch (MessagingException e) {
            log.error("Failed to send quotation email to: {}", customer.getEmail(), e);
            throw new AppException(ErrorCode.EMAIL_SENDING_FAILED);
        }
    }

    @Override
    public void sendQuotationAcceptedEmail(Quotation quotation, CustomerResponse customer) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(customer.getEmail());
            helper.setSubject(String.format("Xác Nhận Chấp Nhận Báo Giá - %s", quotation.getQuotationId()));
            helper.setText(buildQuotationAcceptedEmailContent(quotation, customer), true);

            mailSender.send(message);
            log.info("Quotation accepted email sent successfully to: {}", customer.getEmail());
        } catch (MessagingException e) {
            log.error("Failed to send quotation accepted email to: {}", customer.getEmail(), e);
            throw new AppException(ErrorCode.EMAIL_SENDING_FAILED);
        }
    }

    @Override
    public void sendQuotationRejectedEmail(Quotation quotation, CustomerResponse customer) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(customer.getEmail());
            helper.setSubject(String.format("Thông Báo Từ Chối Báo Giá - %s", quotation.getQuotationId()));
            helper.setText(buildQuotationRejectedEmailContent(quotation, customer), true);

            mailSender.send(message);
            log.info("Quotation rejected email sent successfully to: {}", customer.getEmail());
        } catch (MessagingException e) {
            log.error("Failed to send quotation rejected email to: {}", customer.getEmail(), e);
            throw new AppException(ErrorCode.EMAIL_SENDING_FAILED);
        }
    }

    // =================== Build Email Content ===================

    private String buildQuotationEmailContent(Quotation quotation, CustomerResponse customer) {
        try {
            Context context = new Context(new Locale("vi"));
            context.setVariable("customer", customer);
            context.setVariable("quotation", quotation);
            context.setVariable("validUntil",
                    quotation.getValidUntil().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")));
            context.setVariable("quotationDate",
                    quotation.getQuotationDate().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")));

            // Add URLs for action buttons
            context.setVariable("baseUrl", baseUrl);
            context.setVariable("frontendUrl", frontendUrl);

            return templateEngine.process("quotation-email", context);
        } catch (TemplateInputException e) {
            log.warn("Template 'quotation-email' not found, using fallback content");
            return buildFallbackQuotationEmailContent(quotation, customer);
        }
    }

    private String buildQuotationAcceptedEmailContent(Quotation quotation, CustomerResponse customer) {
        try {
            Context context = new Context(new Locale("vi"));
            context.setVariable("customer", customer);
            context.setVariable("quotation", quotation);
            return templateEngine.process("quotation-accepted-email", context);
        } catch (TemplateInputException e) {
            log.warn("Template 'quotation-accepted-email' not found, using fallback content");
            return String.format(
                    "Kính gửi Quý khách %s,\n\n" +
                            "Quý khách đã chấp nhận báo giá %s.\n\n" +
                            "Chúng tôi sẽ liên hệ với Quý khách trong thời gian sớm nhất.\n\n" +
                            "Trân trọng,\nĐội ngũ EV Automotive",
                    customer.getFullName(),
                    quotation.getQuotationId()
            );
        }
    }

    private String buildQuotationRejectedEmailContent(Quotation quotation, CustomerResponse customer) {
        try {
            Context context = new Context(new Locale("vi"));
            context.setVariable("customer", customer);
            context.setVariable("quotation", quotation);
            return templateEngine.process("quotation-rejected-email", context);
        } catch (TemplateInputException e) {
            log.warn("Template 'quotation-rejected-email' not found, using fallback content");
            return String.format(
                    "Kính gửi Quý khách %s,\n\n" +
                            "Quý khách đã từ chối báo giá %s.\n\n" +
                            "Nếu có thắc mắc, xin vui lòng liên hệ chúng tôi.\n\n" +
                            "Trân trọng,\nĐội ngũ EV Automotive",
                    customer.getFullName(),
                    quotation.getQuotationId()
            );
        }
    }

    private String buildFallbackQuotationEmailContent(Quotation quotation, CustomerResponse customer) {
        return String.format(
                "Kính gửi Quý khách %s,\n\n" +
                        "Cảm ơn Quý khách đã quan tâm đến sản phẩm của EV Automotive.\n\n" +
                        "Thông tin báo giá:\n" +
                        "- Mã báo giá: %s\n" +
                        "- Ngày báo giá: %s\n" +
                        "- Hiệu lực đến: %s\n" +
                        "- Giá cơ bản: %s VND\n" +
                        "- Giảm giá: %s VND\n" +
                        "- Giá cuối cùng: %s VND\n\n" +
                        "Điều khoản và điều kiện:\n%s\n\n" +
                        "Trân trọng,\nĐội ngũ EV Automotive",
                customer.getFullName(),
                quotation.getQuotationId(),
                quotation.getQuotationDate().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")),
                quotation.getValidUntil().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")),
                quotation.getBasePrice(),
                quotation.getDiscountAmount(),
                quotation.getFinalPrice(),
                quotation.getTermsConditions()
        );
    }





    //







    // Sale Order
    @Override
    public void sendOrderConfirmedEmail(SalesOrder salesOrder, CustomerResponse customer) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            String confirmLink = "http://localhost:8080/sendmail/customer-response/order/" + salesOrder.getOrderId() + "/confirm";

            // Set thông tin email
            helper.setTo(customer.getEmail());
            helper.setSubject("Xác nhận đơn hàng #" + salesOrder.getOrderId());
            helper.setText(buildOrderConfirmedEmailContent(salesOrder, customer, confirmLink), true);

            // Gửi email
            mailSender.send(message);
            log.info("Order confirmed email sent to: {}", customer.getEmail());
        } catch (MessagingException e) {
            log.error("Failed to send order confirmed email to: {}", customer.getEmail(), e);
            throw new AppException(ErrorCode.EMAIL_SENDING_FAILED);
        }
    }

    private String buildOrderConfirmedEmailContent(SalesOrder salesOrder, CustomerResponse customer, String confirmLink) {
        return "<!DOCTYPE html>" +
                "<html lang='vi'>" +
                "<head><meta charset='UTF-8'><title>Xác Nhận Đơn Hàng</title></head>" +
                "<body>" +
                "<p>Kính gửi <strong>" + customer.getFullName() + "</strong>,</p>" +
                "<p>Đơn hàng <strong>#" + salesOrder.getOrderId() + "</strong> của Quý khách đang chờ xác nhận.</p>" +
                "<p>Chi tiết đơn hàng:</p>" +
                "<ul>" +
                "<li>Ngày tạo: " + salesOrder.getOrderDate().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")) + "</li>" +
                "<li>Tổng tiền: " + salesOrder.getTotalAmount() + " VND</li>" +
                "</ul>" +
                "<p>Vui lòng nhấn nút dưới đây để xác nhận đơn hàng:</p>" +
                "<p><a href='" + confirmLink + "' style='padding:10px 20px; background-color:#4CAF50; color:white; text-decoration:none;'>Xác nhận đơn hàng</a></p>" +
                "<p>Trân trọng,<br/>Đội ngũ EV Automotive</p>" +
                "</body>" +
                "</html>";
    }

}
