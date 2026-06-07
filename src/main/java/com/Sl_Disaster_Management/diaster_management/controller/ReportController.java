package com.Sl_Disaster_Management.diaster_management.controller;


import com.Sl_Disaster_Management.diaster_management.service.ReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin(origins = "*", maxAge = 3600)
public class ReportController {

    @Autowired
    private ReportService reportService;

    // ===== INCIDENT REPORTS =====

    @GetMapping("/incidents/pdf")
    public ResponseEntity<byte[]> incidentPdf() throws Exception {
        byte[] pdf = reportService.generateIncidentPdf();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=incidents_" + LocalDate.now() + ".pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }

    @GetMapping("/incidents/csv")
    public ResponseEntity<byte[]> incidentCsv() throws Exception {
        String csv = reportService.generateIncidentCsv();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=incidents_" + LocalDate.now() + ".csv")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(csv.getBytes());
    }

    @GetMapping("/incidents/json")
    public ResponseEntity<String> incidentJson() throws Exception {
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_JSON)
                .body(reportService.generateIncidentJson());
    }

    // ===== RESOURCE REPORTS =====

    @GetMapping("/resources/pdf")
    public ResponseEntity<byte[]> resourcePdf() throws Exception {
        byte[] pdf = reportService.generateResourcePdf();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=resources_" + LocalDate.now() + ".pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }

    @GetMapping("/resources/csv")
    public ResponseEntity<byte[]> resourceCsv() throws Exception {
        String csv = reportService.generateResourceCsv();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=resources_" + LocalDate.now() + ".csv")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(csv.getBytes());
    }

    // ===== SHELTER REPORTS =====

    @GetMapping("/shelters/pdf")
    public ResponseEntity<byte[]> shelterPdf() throws Exception {
        byte[] pdf = reportService.generateShelterPdf();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=shelters_" + LocalDate.now() + ".pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }

    @GetMapping("/shelters/csv")
    public ResponseEntity<byte[]> shelterCsv() throws Exception {
        String csv = reportService.generateShelterCsv();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=shelters_" + LocalDate.now() + ".csv")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(csv.getBytes());
    }
}