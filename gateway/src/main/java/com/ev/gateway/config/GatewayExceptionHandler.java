package com.ev.gateway.config;

import com.ev.common_lib.dto.respond.ApiRespond;
import com.ev.common_lib.exception.ErrorCode;
import org.springframework.boot.web.reactive.error.ErrorWebExceptionHandler;
import org.springframework.core.annotation.Order;
import org.springframework.core.io.buffer.DataBufferFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.nio.charset.StandardCharsets;

@Component
@Order(-2)
public class GatewayExceptionHandler implements ErrorWebExceptionHandler {

    @Override
    public Mono<Void> handle(ServerWebExchange exchange, Throwable ex) {
        var response = exchange.getResponse();

        if (response.isCommitted()) {
            return Mono.error(ex);
        }

        response.getHeaders().setContentType(MediaType.APPLICATION_JSON);

        ErrorCode errorCode = ErrorCode.DOWNSTREAM_SERVICE_UNAVAILABLE;
        String message = ex.getMessage();

        if (message != null && message.contains("Connection refused")) {
            errorCode = ErrorCode.SERVICE_UNAVAILABLE;
        } else if (message != null && message.contains("timeout")) {
            errorCode = ErrorCode.TIMEOUT;
        }


        HttpStatus status = errorCode.getHttpStatus();
        response.setStatusCode(status);

        ApiRespond<Object> apiRespond = new ApiRespond<>();
        apiRespond.setCode(errorCode.getCode());
        apiRespond.setMessage(errorCode.getMessage());
        apiRespond.setData(null);

        String json = String.format(
                "{\"code\":\"%s\",\"message\":\"%s\",\"data\":null}",
                apiRespond.getCode(),
                apiRespond.getMessage()
        );


        DataBufferFactory bufferFactory = response.bufferFactory();
        return response.writeWith(Mono.just(bufferFactory.wrap(json.getBytes(StandardCharsets.UTF_8))));
    }
}
