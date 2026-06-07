package com.Sl_Disaster_Management.diaster_management.repository;



import com.Sl_Disaster_Management.diaster_management.model.Incident;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IncidentRepository extends JpaRepository<Incident, Long> {

    List<Incident> findByDistrict(String district);

    List<Incident> findByStatus(Incident.Status status);

    List<Incident> findBySeverityGreaterThanEqual(Integer severity);

    List<Incident> findByDistrictAndStatus(String district, Incident.Status status);

    List<Incident> findByDisasterTypeContainingIgnoreCase(String disasterType);

    @Query("SELECT i FROM Incident i WHERE i.status = 'ACTIVE' ORDER BY i.priorityScore DESC")
    List<Incident> findActiveIncidentsByPriority();

    @Query("SELECT i FROM Incident i WHERE i.severity >= :minSeverity AND i.status = :status")
    List<Incident> findBySeverityAndStatus(@Param("minSeverity") Integer minSeverity,
                                           @Param("status") Incident.Status status);

    @Query("SELECT COUNT(i) FROM Incident i WHERE i.status = 'RESOLVED'")
    long countByStatus(Incident.Status status);

    @Query("SELECT COUNT(i) FROM Incident i WHERE i.status = 'ACTIVE'")
    long countActiveIncidents();

    @Query("SELECT COUNT(i) FROM Incident i WHERE i.severity >= 7 AND i.status = 'ACTIVE'")
    long countHighPriorityIncidents();

    @Query("SELECT i.district, COUNT(i) FROM Incident i GROUP BY i.district")
    List<Object[]> countByDistrict();

    @Query("SELECT i.disasterType, COUNT(i) FROM Incident i GROUP BY i.disasterType")
    List<Object[]> countByDisasterType();

    @Query("SELECT i FROM Incident i WHERE " +
            "(:district IS NULL OR i.district = :district) AND " +
            "(:status IS NULL OR i.status = :status) AND " +
            "(:severity IS NULL OR i.severity >= :severity)")
    List<Incident> filterIncidents(@Param("district") String district,
                                   @Param("status") Incident.Status status,
                                   @Param("severity") Integer severity);
}