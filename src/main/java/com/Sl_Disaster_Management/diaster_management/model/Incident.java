package com.Sl_Disaster_Management.diaster_management.model;



import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "incidents")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Incident {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "disaster_type", nullable = false)
    private String disasterType;

    @Column(name = "district", nullable = false)
    private String district;

    @Column(name = "severity", nullable = false)
    private Integer severity; // 1-10

    @Column(name = "affected_people")
    private Integer affectedPeople;

    @Column(name = "priority_score")
    private Double priorityScore; // severity * affectedPeople

    @Column(name = "status")
    @Enumerated(EnumType.STRING)
    private Status status = Status.ACTIVE;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "location")
    private String location;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        this.priorityScore = (this.severity != null && this.affectedPeople != null)
                ? (double) (this.severity * this.affectedPeople)
                : 0.0;
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
        this.priorityScore = (this.severity != null && this.affectedPeople != null)
                ? (double) (this.severity * this.affectedPeople)
                : 0.0;
    }

    public enum Status {
        ACTIVE, RESOLVED, PENDING, CLOSED
    }
}