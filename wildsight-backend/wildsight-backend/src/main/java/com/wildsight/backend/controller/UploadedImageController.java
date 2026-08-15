package com.wildsight.backend.controller;

import com.wildsight.backend.dto.UploadedImageRequest;
import com.wildsight.backend.dto.UploadedImageResponse;
import com.wildsight.backend.service.UploadedImageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.security.access.prepost.PreAuthorize;
import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
@RestController
@RequestMapping("/api/uploaded-images")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Tag(
    name = "Uploaded Image Management",
    description = "APIs for managing uploaded images"
)
@SecurityRequirement(name = "Bearer Authentication")
public class UploadedImageController {

    private final UploadedImageService uploadedImageService;

    // ---------------- CRUD ----------------

    @Operation(summary = "Create uploaded image")
    @PreAuthorize("hasAnyRole('ADMIN','RESEARCHER','FOREST_OFFICER','VOLUNTEER')")
    @PostMapping
    public UploadedImageResponse createImage(
            @Valid @RequestBody UploadedImageRequest request) {

        return uploadedImageService.uploadImage(request);
    }

    @Operation(summary = "Get all uploaded images")
    @PreAuthorize("isAuthenticated()")
    @GetMapping
    public List<UploadedImageResponse> getAllImages() {
        return uploadedImageService.getAllImages();
    }

    @Operation(summary = "Get uploaded image by ID")
    @PreAuthorize("isAuthenticated()")
    @GetMapping("/{id}")
    public UploadedImageResponse getImageById(@PathVariable Long id) {
        return uploadedImageService.getImageById(id);
    }

    @Operation(summary = "Update uploaded image")
    @PreAuthorize("hasAnyRole('ADMIN','RESEARCHER')")
    @PutMapping("/{id}")
    public UploadedImageResponse updateImage(
            @PathVariable Long id,
            @Valid @RequestBody UploadedImageRequest request) {

        return uploadedImageService.updateImage(id, request);
    }

    @Operation(summary = "Delete uploaded image")
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public String deleteImage(@PathVariable Long id) {

        uploadedImageService.deleteImage(id);

        return "Uploaded Image deleted successfully";
    }

    // ---------------- REAL IMAGE UPLOAD ----------------
    @Operation(summary = "Upload real image")

@PreAuthorize(
"hasAnyRole('ADMIN','RESEARCHER','FOREST_OFFICER','VOLUNTEER')"
)

@PostMapping(
        value = "/upload",
        consumes = MediaType.MULTIPART_FORM_DATA_VALUE,
        produces = MediaType.APPLICATION_JSON_VALUE
)

public UploadedImageResponse uploadImage(

        @RequestParam("file")
        MultipartFile file,

        @RequestParam
        Long observationId,

        @RequestParam
        Long uploadedBy,

        @RequestParam
        @DateTimeFormat(
        iso = DateTimeFormat.ISO.DATE_TIME)
        LocalDateTime capturedAt,

        @RequestParam
        BigDecimal imageQuality

) throws IOException {


    return uploadedImageService.uploadImage(
            file,
            observationId,
            uploadedBy,
            capturedAt,
            imageQuality
    );

}
    // ---------------- TEST API ----------------

    @Operation(summary = "Test image upload")
    @PreAuthorize("hasAnyRole('ADMIN')")
    @PostMapping(
            value = "/test-upload",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public String testUpload(
            @RequestParam("file") MultipartFile file) {

        System.out.println("TEST API HIT");
        System.out.println(file.getOriginalFilename());
        System.out.println(file.getSize());

        return "SUCCESS";
    }
}