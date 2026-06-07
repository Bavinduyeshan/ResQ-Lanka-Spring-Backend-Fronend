package com.Sl_Disaster_Management.diaster_management.controller;



import com.Sl_Disaster_Management.diaster_management.dto.ShelterDTOs;
import com.Sl_Disaster_Management.diaster_management.service.ShelterService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/shelters")
@CrossOrigin(origins = "*", maxAge = 3600)
public class ShelterController {

    @Autowired
    private ShelterService shelterService;

    @GetMapping
    public ResponseEntity<List<ShelterDTOs.ShelterResponse>> getAll() {
        return ResponseEntity.ok(shelterService.getAllShelters());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ShelterDTOs.ShelterResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(shelterService.getById(id));
    }

    @PostMapping
    public ResponseEntity<ShelterDTOs.ShelterResponse> create(
            @Valid @RequestBody ShelterDTOs.ShelterRequest request) {
        return ResponseEntity.ok(shelterService.createShelter(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ShelterDTOs.ShelterResponse> update(
            @PathVariable Long id, @Valid @RequestBody ShelterDTOs.ShelterRequest request) {
        return ResponseEntity.ok(shelterService.updateShelter(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> delete(@PathVariable Long id) {
        shelterService.deleteShelter(id);
        return ResponseEntity.ok(Map.of("message", "Shelter deleted successfully"));
    }

    @PatchMapping("/{id}/occupancy")
    public ResponseEntity<ShelterDTOs.ShelterResponse> updateOccupancy(
            @PathVariable Long id, @Valid @RequestBody ShelterDTOs.UpdateOccupancyRequest request) {
        return ResponseEntity.ok(shelterService.updateOccupancy(id, request.getOccupancy()));
    }

    @GetMapping("/district/{district}")
    public ResponseEntity<List<ShelterDTOs.ShelterResponse>> getByDistrict(@PathVariable String district) {
        return ResponseEntity.ok(shelterService.getByDistrict(district));
    }

    @GetMapping("/available")
    public ResponseEntity<List<ShelterDTOs.ShelterResponse>> getAvailable() {
        return ResponseEntity.ok(shelterService.getAvailableShelters());
    }
}