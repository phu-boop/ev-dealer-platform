package com.ev.vehicle_service.model;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.Data;
import java.io.Serializable;
import java.util.Objects;

@Embeddable
@Data
public class ModelFeatureId implements Serializable {
    @Column(name = "model_id")
    private Long modelId;

    @Column(name = "feature_id")
    private Long featureId;

    // Hibernate cần constructor mặc định, equals và hashCode
    public ModelFeatureId() {}

    public ModelFeatureId(Long modelId, Long featureId) {
        this.modelId = modelId;
        this.featureId = featureId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        ModelFeatureId that = (ModelFeatureId) o;
        return Objects.equals(modelId, that.modelId) && Objects.equals(featureId, that.featureId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(modelId, featureId);
    }
}
