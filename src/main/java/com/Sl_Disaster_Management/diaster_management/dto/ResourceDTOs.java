package com.Sl_Disaster_Management.diaster_management.dto;


import com.Sl_Disaster_Management.diaster_management.model.Resource;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDateTime;

public class ResourceDTOs {

    @Data
    public static class ResourceRequest {
        @NotBlank(message = "Name is required")
        private String name;

        @NotNull(message = "Type is required")
        private Resource.ResourceType type;

        private Resource.ResourceStatus status = Resource.ResourceStatus.AVAILABLE;
        private String district;
        private Integer quantity = 1;
        private String notes;
    }

    @Data
    public static class ResourceResponse {
        private Long id;
        private String name;
        private Resource.ResourceType type;
        private Resource.ResourceStatus status;
        private String district;
        private Integer quantity;
        private Long assignedIncidentId;
        private String assignedIncidentType;
        private String notes;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        public static ResourceResponse fromEntity(Resource resource) {
            ResourceResponse dto = new ResourceResponse();
            dto.id = resource.getId();
            dto.name = resource.getName();
            dto.type = resource.getType();
            dto.status = resource.getStatus();
            dto.district = resource.getDistrict();
            dto.quantity = resource.getQuantity();
            dto.notes = resource.getNotes();
            dto.createdAt = resource.getCreatedAt();
            dto.updatedAt = resource.getUpdatedAt();
            if (resource.getAssignedIncident() != null) {
                dto.assignedIncidentId = resource.getAssignedIncident().getId();
                dto.assignedIncidentType = resource.getAssignedIncident().getDisasterType();
            }
            return dto;
        }
    }

    @Data
    public static class ResourceAssignRequest {
        @NotNull(message = "Resource ID is required")
        private Long resourceId;

        @NotNull(message = "Incident ID is required")
        private Long incidentId;
    }
}