package com.ev.vehicle_service.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.EqualsAndHashCode;
import lombok.ToString;
// import lombok.Data;
import java.math.BigDecimal;

@Entity
@Table(name = "model_features")
@Getter // Thêm và getter để tránh vòng lặp
@Setter // Thêm và setter để tránh vòng lặp
@EqualsAndHashCode(exclude = {"vehicleModel", "vehicleFeature"}) // Thêm và loại trừ để tránh vòng lặp
@ToString(exclude = {"vehicleModel", "vehicleFeature"}) // Thêm và loại trừ để tránh vòng lặp
public class ModelFeature {
    @EmbeddedId
    private ModelFeatureId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("modelId") // Maps a part of the composite key to the association
    @JoinColumn(name = "model_id")
    private VehicleModel vehicleModel;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("featureId") // Maps a part of the composite key to the association
    @JoinColumn(name = "feature_id")
    private VehicleFeature vehicleFeature;

    @Column(name = "is_standard")
    private boolean isStandard;

    @Column(name = "additional_cost")
    private BigDecimal additionalCost;
}
