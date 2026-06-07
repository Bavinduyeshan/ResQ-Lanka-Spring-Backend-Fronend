package com.Sl_Disaster_Management.diaster_management.repository;


import com.Sl_Disaster_Management.diaster_management.model.Shelter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ShelterRepository extends JpaRepository<Shelter, Long> {

    List<Shelter> findByDistrict(String district);

    List<Shelter> findByStatus(Shelter.ShelterStatus status);

    @Query("SELECT s FROM Shelter s WHERE s.occupancy < s.capacity AND s.status = 'OPEN'")
    List<Shelter> findAvailableShelters();

    @Query("SELECT SUM(s.capacity) FROM Shelter s WHERE s.status = 'OPEN'")
    Long getTotalCapacity();

    @Query("SELECT SUM(s.occupancy) FROM Shelter s")
    Long getTotalOccupancy();

    @Query("SELECT s.district, SUM(s.capacity), SUM(s.occupancy) FROM Shelter s GROUP BY s.district")
    List<Object[]> getShelterStatsByDistrict();
}