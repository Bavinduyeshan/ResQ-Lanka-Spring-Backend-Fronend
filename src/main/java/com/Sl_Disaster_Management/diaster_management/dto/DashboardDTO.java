package com.Sl_Disaster_Management.diaster_management.dto;


import lombok.Data;
import java.util.List;
import java.util.Map;

public class DashboardDTO {

    @Data
    public static class DashboardStats {
        private long totalIncidents;
        private long activeIncidents;
        private long highPriorityIncidents;
        private long resolvedIncidents;
        private long availableResources;
        private long totalResources;
        private long totalShelterCapacity;
        private long totalShelterOccupancy;
        private double shelterOccupancyRate;
        private Map<String, Long> incidentsByDistrict;
        private Map<String, Long> incidentsByType;
        private Map<String, Long> resourcesByType;
        private List<IncidentDTOs.IncidentResponse> topPriorityIncidents;
    }
}