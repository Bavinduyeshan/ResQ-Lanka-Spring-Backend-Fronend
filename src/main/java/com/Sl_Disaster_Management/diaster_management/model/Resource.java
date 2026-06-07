package com.Sl_Disaster_Management.diaster_management.model;



import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "resources")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Resource {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "type", nullable = false)
    @Enumerated(EnumType.STRING)
    private ResourceType type;

    @Column(name = "status")
    @Enumerated(EnumType.STRING)
    private ResourceStatus status = ResourceStatus.AVAILABLE;

    @Column(name = "district")
    private String district;

    @Column(name = "quantity")
    private Integer quantity = 1;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_incident_id")
    private Incident assignedIncident;

    @Column(name = "notes")
    private String notes;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public enum ResourceType {
        AMBULANCE, FIRE_TRUCK, RESCUE_BOAT, MEDICAL_TEAM, HELICOPTER, FOOD_SUPPLY, WATER_SUPPLY, SHELTER_KIT
    }

    public enum ResourceStatus {
        AVAILABLE, ASSIGNED, MAINTENANCE, OUT_OF_SERVICE
    }
}