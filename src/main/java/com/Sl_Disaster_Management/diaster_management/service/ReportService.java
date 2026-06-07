package com.Sl_Disaster_Management.diaster_management.service;


import com.Sl_Disaster_Management.diaster_management.model.Incident;
import com.Sl_Disaster_Management.diaster_management.model.Resource;
import com.Sl_Disaster_Management.diaster_management.model.Shelter;
import com.Sl_Disaster_Management.diaster_management.repository.IncidentRepository;
import com.Sl_Disaster_Management.diaster_management.repository.ResourceRepository;
import com.Sl_Disaster_Management.diaster_management.repository.ShelterRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.itextpdf.text.*;
import com.itextpdf.text.pdf.*;
import com.opencsv.CSVWriter;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.*;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.List;

@Service
public class ReportService {

    @Autowired private IncidentRepository incidentRepository;
    @Autowired private ResourceRepository resourceRepository;
    @Autowired private ShelterRepository shelterRepository;

    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    // ===== INCIDENT REPORTS =====

    public byte[] generateIncidentPdf() throws DocumentException {
        Document document = new Document(PageSize.A4);
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        PdfWriter.getInstance(document, out);
        document.open();

        Font titleFont = new Font(Font.FontFamily.HELVETICA, 18, Font.BOLD);
        Font headerFont = new Font(Font.FontFamily.HELVETICA, 10, Font.BOLD);
        Font cellFont = new Font(Font.FontFamily.HELVETICA, 9, Font.NORMAL);

        Paragraph title = new Paragraph("Sri Lanka Disaster Response - Incident Report", titleFont);
        title.setAlignment(Element.ALIGN_CENTER);
        document.add(title);
        document.add(new Paragraph("Generated: " + LocalDateTime.now().format(FORMATTER)));
        document.add(Chunk.NEWLINE);

        PdfPTable table = new PdfPTable(7);
        table.setWidthPercentage(100);
        table.setWidths(new float[]{1f, 2f, 2f, 1f, 1.5f, 1.5f, 2f});

        String[] headers = {"ID", "Type", "District", "Severity", "Affected", "Status", "Created At"};
        for (String h : headers) {
            PdfPCell cell = new PdfPCell(new Phrase(h, headerFont));
            cell.setBackgroundColor(BaseColor.LIGHT_GRAY);
            cell.setPadding(5);
            table.addCell(cell);
        }

        List<Incident> incidents = incidentRepository.findAll();
        for (Incident i : incidents) {
            table.addCell(new PdfPCell(new Phrase(String.valueOf(i.getId()), cellFont)));
            table.addCell(new PdfPCell(new Phrase(i.getDisasterType(), cellFont)));
            table.addCell(new PdfPCell(new Phrase(i.getDistrict(), cellFont)));
            table.addCell(new PdfPCell(new Phrase(String.valueOf(i.getSeverity()), cellFont)));
            table.addCell(new PdfPCell(new Phrase(String.valueOf(i.getAffectedPeople()), cellFont)));
            table.addCell(new PdfPCell(new Phrase(i.getStatus().name(), cellFont)));
            table.addCell(new PdfPCell(new Phrase(i.getCreatedAt() != null ? i.getCreatedAt().format(FORMATTER) : "", cellFont)));
        }

        document.add(table);
        document.close();
        return out.toByteArray();
    }

    public String generateIncidentCsv() throws IOException {
        StringWriter sw = new StringWriter();
        CSVWriter writer = new CSVWriter(sw);
        writer.writeNext(new String[]{"ID", "DisasterType", "District", "Severity", "AffectedPeople", "PriorityScore", "Status", "Description", "CreatedAt"});
        for (Incident i : incidentRepository.findAll()) {
            writer.writeNext(new String[]{
                    String.valueOf(i.getId()), i.getDisasterType(), i.getDistrict(),
                    String.valueOf(i.getSeverity()), String.valueOf(i.getAffectedPeople()),
                    String.valueOf(i.getPriorityScore()), i.getStatus().name(),
                    i.getDescription() != null ? i.getDescription() : "",
                    i.getCreatedAt() != null ? i.getCreatedAt().format(FORMATTER) : ""
            });
        }
        writer.close();
        return sw.toString();
    }

    public String generateIncidentJson() throws IOException {
        ObjectMapper mapper = new ObjectMapper();
        mapper.registerModule(new JavaTimeModule());
        List<Incident> incidents = incidentRepository.findAll();
        Map<String, Object> report = new LinkedHashMap<>();
        report.put("reportType", "Incidents");
        report.put("generatedAt", LocalDateTime.now().toString());
        report.put("totalCount", incidents.size());
        report.put("data", incidents);
        return mapper.writerWithDefaultPrettyPrinter().writeValueAsString(report);
    }

    // ===== RESOURCE REPORTS =====

    public byte[] generateResourcePdf() throws DocumentException {
        Document document = new Document(PageSize.A4);
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        PdfWriter.getInstance(document, out);
        document.open();

        Font titleFont = new Font(Font.FontFamily.HELVETICA, 18, Font.BOLD);
        Font headerFont = new Font(Font.FontFamily.HELVETICA, 10, Font.BOLD);
        Font cellFont = new Font(Font.FontFamily.HELVETICA, 9, Font.NORMAL);

        Paragraph title = new Paragraph("Sri Lanka Disaster Response - Resource Report", titleFont);
        title.setAlignment(Element.ALIGN_CENTER);
        document.add(title);
        document.add(new Paragraph("Generated: " + LocalDateTime.now().format(FORMATTER)));
        document.add(Chunk.NEWLINE);

        PdfPTable table = new PdfPTable(5);
        table.setWidthPercentage(100);

        for (String h : new String[]{"ID", "Name", "Type", "Status", "District"}) {
            PdfPCell cell = new PdfPCell(new Phrase(h, headerFont));
            cell.setBackgroundColor(BaseColor.LIGHT_GRAY);
            cell.setPadding(5);
            table.addCell(cell);
        }

        for (Resource r : resourceRepository.findAll()) {
            table.addCell(new PdfPCell(new Phrase(String.valueOf(r.getId()), cellFont)));
            table.addCell(new PdfPCell(new Phrase(r.getName(), cellFont)));
            table.addCell(new PdfPCell(new Phrase(r.getType().name(), cellFont)));
            table.addCell(new PdfPCell(new Phrase(r.getStatus().name(), cellFont)));
            table.addCell(new PdfPCell(new Phrase(r.getDistrict() != null ? r.getDistrict() : "", cellFont)));
        }

        document.add(table);
        document.close();
        return out.toByteArray();
    }

    public String generateResourceCsv() throws IOException {
        StringWriter sw = new StringWriter();
        CSVWriter writer = new CSVWriter(sw);
        writer.writeNext(new String[]{"ID", "Name", "Type", "Status", "District", "Quantity"});
        for (Resource r : resourceRepository.findAll()) {
            writer.writeNext(new String[]{
                    String.valueOf(r.getId()), r.getName(), r.getType().name(),
                    r.getStatus().name(), r.getDistrict() != null ? r.getDistrict() : "",
                    String.valueOf(r.getQuantity())
            });
        }
        writer.close();
        return sw.toString();
    }

    // ===== SHELTER REPORTS =====

    public byte[] generateShelterPdf() throws DocumentException {
        Document document = new Document(PageSize.A4);
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        PdfWriter.getInstance(document, out);
        document.open();

        Font titleFont = new Font(Font.FontFamily.HELVETICA, 18, Font.BOLD);
        Font headerFont = new Font(Font.FontFamily.HELVETICA, 10, Font.BOLD);
        Font cellFont = new Font(Font.FontFamily.HELVETICA, 9, Font.NORMAL);

        Paragraph title = new Paragraph("Sri Lanka Disaster Response - Shelter Report", titleFont);
        title.setAlignment(Element.ALIGN_CENTER);
        document.add(title);
        document.add(new Paragraph("Generated: " + LocalDateTime.now().format(FORMATTER)));
        document.add(Chunk.NEWLINE);

        PdfPTable table = new PdfPTable(6);
        table.setWidthPercentage(100);

        for (String h : new String[]{"ID", "Name", "District", "Capacity", "Occupancy", "Status"}) {
            PdfPCell cell = new PdfPCell(new Phrase(h, headerFont));
            cell.setBackgroundColor(BaseColor.LIGHT_GRAY);
            cell.setPadding(5);
            table.addCell(cell);
        }

        for (Shelter s : shelterRepository.findAll()) {
            table.addCell(new PdfPCell(new Phrase(String.valueOf(s.getId()), cellFont)));
            table.addCell(new PdfPCell(new Phrase(s.getShelterName(), cellFont)));
            table.addCell(new PdfPCell(new Phrase(s.getDistrict(), cellFont)));
            table.addCell(new PdfPCell(new Phrase(String.valueOf(s.getCapacity()), cellFont)));
            table.addCell(new PdfPCell(new Phrase(String.valueOf(s.getOccupancy()), cellFont)));
            table.addCell(new PdfPCell(new Phrase(s.getStatus().name(), cellFont)));
        }

        document.add(table);
        document.close();
        return out.toByteArray();
    }

    public String generateShelterCsv() throws IOException {
        StringWriter sw = new StringWriter();
        CSVWriter writer = new CSVWriter(sw);
        writer.writeNext(new String[]{"ID", "Name", "District", "Capacity", "Occupancy", "OccupancyRate", "Status"});
        for (Shelter s : shelterRepository.findAll()) {
            writer.writeNext(new String[]{
                    String.valueOf(s.getId()), s.getShelterName(), s.getDistrict(),
                    String.valueOf(s.getCapacity()), String.valueOf(s.getOccupancy()),
                    String.format("%.1f%%", s.getOccupancyRate()), s.getStatus().name()
            });
        }
        writer.close();
        return sw.toString();
    }
}