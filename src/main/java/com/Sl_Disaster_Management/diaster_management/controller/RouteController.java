package com.Sl_Disaster_Management.diaster_management.controller;



import com.Sl_Disaster_Management.diaster_management.dto.RouteDTOs;
import com.Sl_Disaster_Management.diaster_management.service.RouteService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/route")
@CrossOrigin(origins = "*", maxAge = 3600)
public class RouteController {

    @Autowired
    private RouteService routeService;

    @PostMapping("/shortest-path")
    public ResponseEntity<RouteDTOs.RouteResponse> findShortestPath(
            @Valid @RequestBody RouteDTOs.RouteRequest request) {
        return ResponseEntity.ok(routeService.findShortestPath(request.getSource(), request.getDestination()));
    }

    @GetMapping("/districts")
    public ResponseEntity<List<String>> getAllDistricts() {
        return ResponseEntity.ok(routeService.getAllDistricts());
    }

    @GetMapping("/neighbors/{district}")
    public ResponseEntity<List<RouteDTOs.RouteSegment>> getNeighbors(@PathVariable String district) {
        return ResponseEntity.ok(routeService.getNeighbors(district));
    }
}