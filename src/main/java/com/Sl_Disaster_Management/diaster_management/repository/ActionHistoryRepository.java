package com.Sl_Disaster_Management.diaster_management.repository;


import com.Sl_Disaster_Management.diaster_management.model.ActionHistory;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ActionHistoryRepository extends JpaRepository<ActionHistory, Long> {

    List<ActionHistory> findByEntityTypeAndEntityId(String entityType, Long entityId);

    List<ActionHistory> findByActionType(ActionHistory.ActionType actionType);

    @Query("SELECT a FROM ActionHistory a ORDER BY a.timestamp DESC")
    List<ActionHistory> findRecentActions(Pageable pageable);

    List<ActionHistory> findByUndone(Boolean undone);

    @Query("SELECT a FROM ActionHistory a WHERE a.undone = false ORDER BY a.timestamp DESC")
    List<ActionHistory> findUndoableActions(Pageable pageable);
}