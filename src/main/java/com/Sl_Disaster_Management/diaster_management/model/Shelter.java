package com.Sl_Disaster_Management.diaster_management.model;



import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "shelters")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Shelter {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "shelter_name", nullable = false)
    private String shelterName;

    @Column(name = "district", nullable = false)
    private String district;

    @Column(name = "address")
    private String address;

    @Column(name = "capacity", nullable = false)
    private Integer capacity;

    @Column(name = "occupancy")
    private Integer occupancy = 0;

    @Column(name = "status")
    @Enumerated(EnumType.STRING)
    private ShelterStatus status = ShelterStatus.OPEN;

    @Column(name = "contact_person")
    private String contactPerson;

    @Column(name = "contact_phone")
    private String contactPhone;

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

    public double getOccupancyRate() {
        if (capacity == null || capacity == 0) return 0;
        return (double) occupancy / capacity * 100;
    }

    public enum ShelterStatus {
        OPEN, FULL, CLOSED, UNDER_MAINTENANCE
    }
}