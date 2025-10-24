package com.ev.sales_service.service;

import com.ev.sales_service.entity.Outbox;
import com.ev.sales_service.repository.OutboxRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OutboxProcessor {

    private final OutboxRepository outboxRepository;
    private final KafkaTemplate<String, String> kafkaTemplate;
    private static final String TOPIC = "promotion-events";

    @Transactional
    public void dispatchTransactional() {
        List<Outbox> items = outboxRepository.findByStatusOrderByCreatedAtAsc("NEW", PageRequest.of(0, 100));
        if (items.isEmpty()) return;

        for (Outbox o : items) {
            try {
                int updated = outboxRepository.markStatusIfCurrent(o.getId(), "SENDING", "NEW");
                if (updated == 0) continue;

                kafkaTemplate.send(TOPIC, o.getAggregateId(), o.getPayload()).get();
                markSent(o.getId());
            } catch (Exception ex) {
                handleSendFailure(o);
            }
        }
    }

    @Transactional
    protected void markSent(String id) {
        Outbox o = outboxRepository.findById(id).orElseThrow();
        o.setStatus("SENT");
        o.setSentAt(LocalDateTime.now());
        o.setLastAttemptAt(LocalDateTime.now());
        outboxRepository.save(o);
    }

    @Transactional
    protected void handleSendFailure(Outbox o) {
        Outbox current = outboxRepository.findById(o.getId()).orElse(null);
        if (current == null) return;

        int newAttempts = current.getAttempts() + 1;
        current.setAttempts(newAttempts);
        current.setLastAttemptAt(LocalDateTime.now());
        current.setStatus(newAttempts >= 5 ? "FAILED" : "NEW");
        outboxRepository.save(current);
    }
}

