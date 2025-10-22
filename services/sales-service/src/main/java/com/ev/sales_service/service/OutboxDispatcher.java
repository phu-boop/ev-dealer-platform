package com.ev.sales_service.service;

import com.ev.sales_service.entity.Outbox;
import com.ev.sales_service.repository.OutboxRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.domain.PageRequest;

@Service
@RequiredArgsConstructor
public class OutboxDispatcher {

    private final OutboxRepository outboxRepository;
    private final KafkaTemplate<String, String> kafkaTemplate;

    private static final String TOPIC = "promotion-events";

    // every 5s, pick up to 100 events
    @Scheduled(fixedDelayString = "${outbox.dispatch.delay:5000}")
    public void dispatch() {
        List<Outbox> items = outboxRepository.findByStatusOrderByCreatedAtAsc("NEW", PageRequest.of(0, 100));
        for (Outbox o : items) {
            try {
                // mark SENDING (optimistic)
                int updated = outboxRepository.markStatusIfCurrent(o.getId(), "SENDING", "NEW");
                if (updated == 0) continue; // someone else took it

                // send synchronously (simpler): block until send completes
                kafkaTemplate.send(TOPIC, o.getAggregateId(), o.getPayload()).get();

                // on success
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
        current.setAttempts(current.getAttempts() + 1);
        current.setLastAttemptAt(LocalDateTime.now());
        current.setStatus(current.getAttempts() >= 5 ? "FAILED" : "NEW"); // or leave NEW to retry, or SCHEDULED
        outboxRepository.save(current);
        // optional: log, alerting, dead-letter logic
    }
}
