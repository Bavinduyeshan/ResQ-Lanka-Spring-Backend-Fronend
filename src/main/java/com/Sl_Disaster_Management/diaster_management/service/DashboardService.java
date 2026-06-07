package com.Sl_Disaster_Management.diaster_management.service;


import com.Sl_Disaster_Management.diaster_management.model.Incident;
import com.Sl_Disaster_Management.diaster_management.dto.DashboardDTO;
import com.Sl_Disaster_Management.diaster_management.dto.IncidentDTOs;
import com.Sl_Disaster_Management.diaster_management.repository.IncidentRepository;
import com.Sl_Disaster_Management.diaster_management.repository.ResourceRepository;
import com.Sl_Disaster_Management.diaster_management.repository.ShelterRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    @Autowired private IncidentRepository incidentRepository;
    @Autowired private ResourceRepository resourceRepository;
    @Autowired private ShelterRepository shelterRepository;

    public DashboardDTO.DashboardStats getStats() {
        DashboardDTO.DashboardStats stats = new DashboardDTO.DashboardStats();

        // Incident counts
        stats.setTotalIncidents(incidentRepository.count());
        stats.setActiveIncidents(incidentRepository.countActiveIncidents());
        stats.setHighPriorityIncidents(incidentRepository.countHighPriorityIncidents());
        long resolved = incidentRepository.countByStatus(Incident.Status.RESOLVED);
        stats.setResolvedIncidents(resolved);

        // Resources
        stats.setAvailableResources(resourceRepository.countAvailableResources());
        stats.setTotalResources(resourceRepository.count());

        // Shelter
        Long totalCapacity = shelterRepository.getTotalCapacity();
        Long totalOccupancy = shelterRepository.getTotalOccupancy();
        stats.setTotalShelterCapacity(totalCapacity != null ? totalCapacity : 0);
        stats.setTotalShelterOccupancy(totalOccupancy != null ? totalOccupancy : 0);
        if (totalCapacity != null && totalCapacity > 0) {
            stats.setShelterOccupancyRate((double) (totalOccupancy != null ? totalOccupancy : 0) / totalCapacity * 100);
        }

        // District analytics
        Map<String, Long> incidentsByDistrict = new HashMap<>();
        for (Object[] row : incidentRepository.countByDistrict()) {
            incidentsByDistrict.put((String) row[0], (Long) row[1]);
        }
        stats.setIncidentsByDistrict(incidentsByDistrict);

        // Disaster type breakdown
        Map<String, Long> incidentsByType = new HashMap<>();
        for (Object[] row : incidentRepository.countByDisasterType()) {
            incidentsByType.put((String) row[0], (Long) row[1]);
        }
        stats.setIncidentsByType(incidentsByType);

        // Resources by type
        Map<String, Long> resourcesByType = new HashMap<>();
        for (Object[] row : resourceRepository.countByType()) {
            resourcesByType.put(row[0].toString(), (Long) row[1]);
        }
        stats.setResourcesByType(resourcesByType);

        // Top priority incidents (top 5)
        List<IncidentDTOs.IncidentResponse> topPriority = incidentRepository.findActiveIncidentsByPriority()
                .stream()
                .limit(5)
                .map(IncidentDTOs.IncidentResponse::fromEntity)
                .collect(Collectors.toList());
        stats.setTopPriorityIncidents(topPriority);

        return stats;
    }
}