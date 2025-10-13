package com.campus.EventInClubs.controller;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/upload")
@CrossOrigin(origins = "http://localhost:5173")
@Slf4j
public class UploadController {

    @PostMapping("/poster")
    public ResponseEntity<Map<String, String>> uploadPoster(@RequestParam("file") MultipartFile file) {
        try {
            // Create uploads directory if it doesn't exist
            String uploadDir = System.getProperty("user.dir") + "/uploads/posters/";
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // Generate unique filename
            String originalFilename = file.getOriginalFilename();
            String fileExtension = originalFilename != null ? 
                originalFilename.substring(originalFilename.lastIndexOf(".")) : ".jpg";
            String uniqueFilename = UUID.randomUUID().toString() + fileExtension;

            // Save file
            Path filePath = uploadPath.resolve(uniqueFilename);
            file.transferTo(filePath.toFile());

            // Return URL
            String fileUrl = "/uploads/posters/" + uniqueFilename;
            
            log.info("Poster uploaded successfully: {}", fileUrl);
            
            Map<String, String> response = new HashMap<>();
            response.put("url", fileUrl);
            response.put("message", "File uploaded successfully");
            
            return ResponseEntity.ok(response);
            
        } catch (IOException e) {
            log.error("Error uploading poster: {}", e.getMessage(), e);
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to upload file: " + e.getMessage());
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }
    
    @PostMapping("/ppt")
    public ResponseEntity<Map<String, String>> uploadPpt(@RequestParam("file") MultipartFile file) {
        try {
            // Validate file type
            String originalFilename = file.getOriginalFilename();
            if (originalFilename == null || (!originalFilename.toLowerCase().endsWith(".ppt") && 
                !originalFilename.toLowerCase().endsWith(".pptx"))) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("error", "Only PPT and PPTX files are allowed");
                return ResponseEntity.badRequest().body(errorResponse);
            }
            
            // Validate file size (max 10MB)
            if (file.getSize() > 10 * 1024 * 1024) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("error", "File size must be less than 10MB");
                return ResponseEntity.badRequest().body(errorResponse);
            }
            
            // Create uploads directory if it doesn't exist
            String uploadDir = System.getProperty("user.dir") + "/uploads/ppt/";
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // Generate unique filename
            String fileExtension = originalFilename.substring(originalFilename.lastIndexOf("."));
            String uniqueFilename = UUID.randomUUID().toString() + fileExtension;

            // Save file
            Path filePath = uploadPath.resolve(uniqueFilename);
            file.transferTo(filePath.toFile());

            // Return URL
            String fileUrl = "/uploads/ppt/" + uniqueFilename;
            
            log.info("PPT uploaded successfully: {}", fileUrl);
            
            Map<String, String> response = new HashMap<>();
            response.put("url", fileUrl);
            response.put("message", "PPT file uploaded successfully");
            
            return ResponseEntity.ok(response);
            
        } catch (IOException e) {
            log.error("Error uploading PPT: {}", e.getMessage(), e);
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to upload file: " + e.getMessage());
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }
}
