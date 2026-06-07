package com.Sl_Disaster_Management.diaster_management.model;


import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "action_history")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ActionHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "action_type", nullable = false)
    @Enumerated(EnumType.STRING)
    private ActionType actionType;

    @Column(name = "entity_type")
    private String entityType;

    @Column(name = "entity_id")
    private Long entityId;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "performed_by")
    private String performedBy;

    @Column(name = "previous_state", columnDefinition = "TEXT")
    private String previousState;

    @Column(name = "new_state", columnDefinition = "TEXT")
    private String newState;

    @Column(name = "timestamp")
    private LocalDateTime timestamp;

    @Column(name = "undone")
    private Boolean undone = false;

    @PrePersist
    protected void onCreate() {
        this.timestamp = LocalDateTime.now();
    }

    public enum ActionType {
        INCIDENT_CREATE, INCIDENT_UPDATE, INCIDENT_DELETE,
        RESOURCE_CREATE, RESOURCE_UPDATE, RESOURCE_DELETE, RESOURCE_ASSIGN,
        SHELTER_CREATE, SHELTER_UPDATE, SHELTER_DELETE,
        USER_LOGIN, USER_LOGOUT
    }
}