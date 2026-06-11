package com.Sl_Disaster_Management.diaster_management.controller;

import com.Sl_Disaster_Management.diaster_management.dto.IncidentDTOs;
import com.Sl_Disaster_Management.diaster_management.model.Incident;
import com.Sl_Disaster_Management.diaster_management.service.IncidentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@CrossOrigin(origins = "*", maxAge = 3600)
public class PublicReportController {

    @Autowired
    private IncidentService incidentService;

    @PostMapping("/api/reports/emergency")
    public ResponseEntity<IncidentDTOs.IncidentResponse> submitPublicReport(
            @RequestBody Map<String, Object> payload) {

        IncidentDTOs.IncidentRequest req = new IncidentDTOs.IncidentRequest();
        req.setDisasterType((String) payload.get("disasterType"));
        req.setDistrict((String) payload.get("district"));
        req.setSeverity((Integer) payload.get("severity"));
        req.setAffectedPeople((Integer) payload.get("affectedPeople"));
        req.setDescription((String) payload.get("description"));
        req.setLocation("Citizen-reported");
        req.setStatus(Incident.Status.PENDING);

        return ResponseEntity.ok(incidentService.createIncident(req));
    }
}