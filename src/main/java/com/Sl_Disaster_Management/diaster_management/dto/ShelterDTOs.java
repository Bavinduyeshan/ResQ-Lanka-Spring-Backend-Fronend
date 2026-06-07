package com.Sl_Disaster_Management.diaster_management.dto;


import com.Sl_Disaster_Management.diaster_management.model.Shelter;
import jakarta.validation.constraints.*;
import lombok.Data;
import java.time.LocalDateTime;

public class ShelterDTOs {

    @Data
    public static class ShelterRequest {
        @NotBlank(message = "Shelter name is required")
        private String shelterName;

        @NotBlank(message = "District is required")
        private String district;

        private String address;

        @NotNull(message = "Capacity is required")
        @Min(value = 1, message = "Capacity must be at least 1")
        private Integer capacity;

        @Min(value = 0)
        private Integer occupancy = 0;

        private Shelter.ShelterStatus status = Shelter.ShelterStatus.OPEN;
        private String contactPerson;
        private String contactPhone;
    }

    @Data
    public static class ShelterResponse {
        private Long id;
        private String shelterName;
        private String district;
        private String address;
        private Integer capacity;
        private Integer occupancy;
        private Double occupancyRate;
        private Shelter.ShelterStatus status;
        private String contactPerson;
        private String contactPhone;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        public static ShelterResponse fromEntity(Shelter shelter) {
            ShelterResponse dto = new ShelterResponse();
            dto.id = shelter.getId();
            dto.shelterName = shelter.getShelterName();
            dto.district = shelter.getDistrict();
            dto.address = shelter.getAddress();
            dto.capacity = shelter.getCapacity();
            dto.occupancy = shelter.getOccupancy();
            dto.occupancyRate = shelter.getOccupancyRate();
            dto.status = shelter.getStatus();
            dto.contactPerson = shelter.getContactPerson();
            dto.contactPhone = shelter.getContactPhone();
            dto.createdAt = shelter.getCreatedAt();
            dto.updatedAt = shelter.getUpdatedAt();
            return dto;
        }
    }

    @Data
    public static class UpdateOccupancyRequest {
        @NotNull
        @Min(0)
        private Integer occupancy;
    }
}