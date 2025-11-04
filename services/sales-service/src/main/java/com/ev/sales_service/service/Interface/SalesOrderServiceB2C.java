package com.ev.sales_service.service.Interface;

import com.ev.sales_service.dto.request.SalesOrderB2CCreateRequest;
import com.ev.sales_service.dto.response.SalesOrderB2CResponse;

import java.util.List;
import java.util.UUID;

public interface SalesOrderServiceB2C {
    SalesOrderB2CResponse createSalesOrderFromQuotation(UUID quotationId);
    SalesOrderB2CResponse createSalesOrder(SalesOrderB2CCreateRequest request);
    SalesOrderB2CResponse getSalesOrderById(UUID orderId);
    List<SalesOrderB2CResponse> getSalesOrdersByDealer(UUID dealerId);
    List<SalesOrderB2CResponse> getSalesOrdersByCustomer(UUID customerId);
    SalesOrderB2CResponse updateSalesOrderStatus(UUID orderId, String status);
    SalesOrderB2CResponse approveSalesOrder(UUID orderId, UUID managerId);
    // TODO: Add more methods as needed
}