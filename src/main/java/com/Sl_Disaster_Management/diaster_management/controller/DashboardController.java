package com.Sl_Disaster_Management.diaster_management.controller;



import com.Sl_Disaster_Management.diaster_management.dto.DashboardDTO;
import com.Sl_Disaster_Management.diaster_management.service.DashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "*", maxAge = 3600)
public class DashboardController {

    @Autowired
    private DashboardService dashboardService;

    @GetMapping("/stats")
    public ResponseEntity<DashboardDTO.DashboardStats> getStats() {
        return ResponseEntity.ok(dashboardService.getStats());
    }
}