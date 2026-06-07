package com.Sl_Disaster_Management.diaster_management.controller;



import com.Sl_Disaster_Management.diaster_management.model.ActionHistory;
import com.Sl_Disaster_Management.diaster_management.service.ActionHistoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/actions")
@CrossOrigin(origins = "*", maxAge = 3600)
public class ActionHistoryController {

    @Autowired
    private ActionHistoryService actionHistoryService;

    @GetMapping("/recent")
    public ResponseEntity<List<ActionHistory>> getRecentActions(
            @RequestParam(defaultValue = "20") int limit) {
        return ResponseEntity.ok(actionHistoryService.getRecentActions(limit));
    }

    @GetMapping("/stack")
    public ResponseEntity<Map<String, Object>> getStackInfo() {
        return ResponseEntity.ok(actionHistoryService.getStackInfo());
    }

    @GetMapping("/stack/history")
    public ResponseEntity<List<ActionHistory>> getStackHistory() {
        return ResponseEntity.ok(actionHistoryService.getStackHistory());
    }

    @GetMapping("/stack/peek")
    public ResponseEntity<?> peekLastAction() {
        ActionHistory top = actionHistoryService.peekLastAction();
        if (top == null) return ResponseEntity.ok(Map.of("message", "No actions in stack"));
        return ResponseEntity.ok(top);
    }

    @PostMapping("/undo")
    public ResponseEntity<?> undoLastAction() {
        ActionHistory undone = actionHistoryService.undoLastAction();
        if (undone == null) return ResponseEntity.ok(Map.of("message", "Nothing to undo"));
        return ResponseEntity.ok(undone);
    }

    @GetMapping("/stack/size")
    public ResponseEntity<Map<String, Integer>> getStackSize() {
        return ResponseEntity.ok(Map.of("size", actionHistoryService.getStackSize()));
    }
}