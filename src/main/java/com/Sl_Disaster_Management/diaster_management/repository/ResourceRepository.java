package com.Sl_Disaster_Management.diaster_management.repository;


import com.Sl_Disaster_Management.diaster_management.model.Resource;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ResourceRepository extends JpaRepository<Resource, Long> {

    List<Resource> findByStatus(Resource.ResourceStatus status);

    List<Resource> findByType(Resource.ResourceType type);

    List<Resource> findByDistrict(String district);

    List<Resource> findByStatusAndType(Resource.ResourceStatus status, Resource.ResourceType type);

    List<Resource> findByAssignedIncidentId(Long incidentId);

    @Query("SELECT COUNT(r) FROM Resource r WHERE r.status = 'AVAILABLE'")
    long countAvailableResources();

    @Query("SELECT r.type, COUNT(r) FROM Resource r WHERE r.status = 'AVAILABLE' GROUP BY r.type")
    List<Object[]> countAvailableByType();

    @Query("SELECT r.type, COUNT(r) FROM Resource r GROUP BY r.type")
    List<Object[]> countByType();
}