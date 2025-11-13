package com.ev.payment_service.mapper;

import com.ev.payment_service.dto.response.TransactionResponse;
import com.ev.payment_service.entity.Transaction;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface TransactionMapper {

    @Mapping(source = "paymentMethod.methodName", target = "paymentMethodName")
    TransactionResponse toResponse(Transaction transaction);
}