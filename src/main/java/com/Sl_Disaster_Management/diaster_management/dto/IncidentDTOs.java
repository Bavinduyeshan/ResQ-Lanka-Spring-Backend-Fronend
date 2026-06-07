package com.Sl_Disaster_Management.diaster_management.dto;


import com.Sl_Disaster_Management.diaster_management.model.Incident;
import jakarta.validation.constraints.*;
import lombok.Data;
import java.time.LocalDateTime;

public class IncidentDTOs {

    @Data
    public static class IncidentRequest {
        @NotBlank(message = "Disaster type is required")
        private String disasterType;

        @NotBlank(message = "District is required")
        private String district;

        @NotNull(message = "Severity is required")
        @Min(value = 1, message = "Severity must be between 1 and 10")
        @Max(value = 10, message = "Severity must be between 1 and 10")
        private Integer severity;

        @NotNull(message = "Affected people count is required")
        @Min(value = 0)
        private Integer affectedPeople;

        private String description;
        private String location;
        private Incident.Status status;
    }

    @Data
    public static class IncidentResponse {
        private Long id;
        private String disasterType;
        private String district;
        private Integer severity;
        private Integer affectedPeople;
        private Double priorityScore;
        private Incident.Status status;
        private String description;
        private String location;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        public static IncidentResponse fromEntity(Incident incident) {
            IncidentResponse dto = new IncidentResponse();
            dto.id = incident.getId();
            dto.disasterType = incident.getDisasterType();
            dto.district = incident.getDistrict();
            dto.severity = incident.getSeverity();
            dto.affectedPeople = incident.getAffectedPeople();
            dto.priorityScore = incident.getPriorityScore();
            dto.status = incident.getStatus();
            dto.description = incident.getDescription();
            dto.location = incident.getLocation();
            dto.createdAt = incident.getCreatedAt();
            dto.updatedAt = incident.getUpdatedAt();
            return dto;
        }
    }

    @Data
    public static class IncidentFilterRequest {
        private String district;
        private Incident.Status status;
        private Integer minSeverity;
    }
}