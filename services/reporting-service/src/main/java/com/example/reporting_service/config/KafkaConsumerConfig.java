package com.example.reporting_service.config;

import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.apache.kafka.common.serialization.StringDeserializer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.annotation.EnableKafka;
import org.springframework.kafka.config.ConcurrentKafkaListenerContainerFactory;
import org.springframework.kafka.core.ConsumerFactory;
import org.springframework.kafka.core.DefaultKafkaConsumerFactory;
import org.springframework.beans.factory.annotation.Value;

import java.util.HashMap;
import java.util.Map;

@EnableKafka
@Configuration
public class KafkaConsumerConfig {
    
    // Lấy giá trị từ application.properties
    @Value("${spring.kafka.bootstrap-servers}") 
    private String bootstrapServers;
    
    // Lấy giá trị từ application.properties
    @Value("${spring.kafka.consumer.group-id}")
    private String groupId;
    
    // Lấy giá trị từ application.properties
    @Value("${spring.kafka.consumer.auto-offset-reset}")
    private String offsetReset;

    /**
     * Định nghĩa ConsumerFactory với String Deserializer BẮT BUỘC.
     * Consumer này sẽ nhận Key/Value là String.
     */
    @Bean
    public ConsumerFactory<String, String> consumerFactory() {
        Map<String, Object> props = new HashMap<>();
        props.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);
        props.put(ConsumerConfig.GROUP_ID_CONFIG, groupId);
        // BẮT BUỘC: ÉP BUỘC Consumer phải dùng String Deserializer
        props.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class);
        props.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class);
        props.put(ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, offsetReset);
        
        return new DefaultKafkaConsumerFactory<>(props);
    }

    /**
     * Định nghĩa ContainerFactory để cho phép @KafkaListener hoạt động 
     * với ConsumerFactory đã được cấu hình cứng.
     */
    @Bean
    public ConcurrentKafkaListenerContainerFactory<String, String> kafkaListenerContainerFactory() {
        ConcurrentKafkaListenerContainerFactory<String, String> factory = new ConcurrentKafkaListenerContainerFactory<>();
        factory.setConsumerFactory(consumerFactory());
        return factory;
    }
}