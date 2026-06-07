package com.Sl_Disaster_Management.diaster_management.service;


import com.Sl_Disaster_Management.diaster_management.dto.ShelterDTOs;
import com.Sl_Disaster_Management.diaster_management.model.ActionHistory;
import com.Sl_Disaster_Management.diaster_management.algorithms.ActionStack;
import com.Sl_Disaster_Management.diaster_management.model.Shelter;
import com.Sl_Disaster_Management.diaster_management.repository.ActionHistoryRepository;
import com.Sl_Disaster_Management.diaster_management.repository.ShelterRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ShelterService {

    @Autowired private ShelterRepository shelterRepository;
    @Autowired private ActionHistoryRepository actionHistoryRepository;
    @Autowired private ActionStack actionStack;

    public List<ShelterDTOs.ShelterResponse> getAllShelters() {
        return shelterRepository.findAll()
                .stream().map(ShelterDTOs.ShelterResponse::fromEntity).collect(Collectors.toList());
    }

    public ShelterDTOs.ShelterResponse getById(Long id) {
        Shelter shelter = shelterRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Shelter not found: " + id));
        return ShelterDTOs.ShelterResponse.fromEntity(shelter);
    }

    @Transactional
    public ShelterDTOs.ShelterResponse createShelter(ShelterDTOs.ShelterRequest request) {
        Shelter shelter = Shelter.builder()
                .shelterName(request.getShelterName())
                .district(request.getDistrict())
                .address(request.getAddress())
                .capacity(request.getCapacity())
                .occupancy(request.getOccupancy() != null ? request.getOccupancy() : 0)
                .status(request.getStatus() != null ? request.getStatus() : Shelter.ShelterStatus.OPEN)
                .contactPerson(request.getContactPerson())
                .contactPhone(request.getContactPhone())
                .build();

        Shelter saved = shelterRepository.save(shelter);
        logAction(ActionHistory.ActionType.SHELTER_CREATE, saved.getId(),
                "Created shelter: " + saved.getShelterName() + " in " + saved.getDistrict());
        return ShelterDTOs.ShelterResponse.fromEntity(saved);
    }

    @Transactional
    public ShelterDTOs.ShelterResponse updateShelter(Long id, ShelterDTOs.ShelterRequest request) {
        Shelter shelter = shelterRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Shelter not found: " + id));

        shelter.setShelterName(request.getShelterName());
        shelter.setDistrict(request.getDistrict());
        shelter.setAddress(request.getAddress());
        shelter.setCapacity(request.getCapacity());
        if (request.getOccupancy() != null) shelter.setOccupancy(request.getOccupancy());
        if (request.getStatus() != null) shelter.setStatus(request.getStatus());
        shelter.setContactPerson(request.getContactPerson());
        shelter.setContactPhone(request.getContactPhone());

        Shelter updated = shelterRepository.save(shelter);
        logAction(ActionHistory.ActionType.SHELTER_UPDATE, id,
                "Updated shelter: " + updated.getShelterName());
        return ShelterDTOs.ShelterResponse.fromEntity(updated);
    }

    @Transactional
    public void deleteShelter(Long id) {
        Shelter shelter = shelterRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Shelter not found: " + id));
        shelterRepository.deleteById(id);
        logAction(ActionHistory.ActionType.SHELTER_DELETE, id,
                "Deleted shelter: " + shelter.getShelterName());
    }

    @Transactional
    public ShelterDTOs.ShelterResponse updateOccupancy(Long id, int newOccupancy) {
        Shelter shelter = shelterRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Shelter not found: " + id));

        if (newOccupancy > shelter.getCapacity()) {
            throw new RuntimeException("Occupancy cannot exceed capacity of " + shelter.getCapacity());
        }

        shelter.setOccupancy(newOccupancy);
        if (newOccupancy >= shelter.getCapacity()) {
            shelter.setStatus(Shelter.ShelterStatus.FULL);
        } else {
            shelter.setStatus(Shelter.ShelterStatus.OPEN);
        }

        return ShelterDTOs.ShelterResponse.fromEntity(shelterRepository.save(shelter));
    }

    public List<ShelterDTOs.ShelterResponse> getByDistrict(String district) {
        return shelterRepository.findByDistrict(district)
                .stream().map(ShelterDTOs.ShelterResponse::fromEntity).collect(Collectors.toList());
    }

    public List<ShelterDTOs.ShelterResponse> getAvailableShelters() {
        return shelterRepository.findAvailableShelters()
                .stream().map(ShelterDTOs.ShelterResponse::fromEntity).collect(Collectors.toList());
    }

    private void logAction(ActionHistory.ActionType type, Long entityId, String description) {
        String username = "system";
        try { username = SecurityContextHolder.getContext().getAuthentication().getName(); } catch (Exception ignored) {}
        ActionHistory action = ActionHistory.builder()
                .actionType(type).entityType("Shelter").entityId(entityId)
                .description(description).performedBy(username).undone(false).build();
        actionHistoryRepository.save(action);
        actionStack.push(action);
    }
}