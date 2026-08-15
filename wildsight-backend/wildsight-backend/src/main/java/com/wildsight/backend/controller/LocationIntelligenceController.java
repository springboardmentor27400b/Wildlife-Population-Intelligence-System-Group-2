package com.wildsight.backend.controller;


import com.wildsight.backend.dto.LocationIntelligenceResponse;

import com.wildsight.backend.service.LocationIntelligenceService;


import lombok.RequiredArgsConstructor;


import org.springframework.http.ResponseEntity;

import org.springframework.security.access.prepost.PreAuthorize;

import org.springframework.web.bind.annotation.*;



@RestController
@RequestMapping("/api/dashboard")

@RequiredArgsConstructor

@CrossOrigin(origins = "http://localhost:8081")
public class LocationIntelligenceController {



    private final LocationIntelligenceService locationService;




    @GetMapping("/location/{id}")

    @PreAuthorize("isAuthenticated()")

    public ResponseEntity<LocationIntelligenceResponse> 
    getLocationDetails(
            @PathVariable Long id
    ){


        return ResponseEntity.ok(

                locationService
                .getLocationDetails(id)

        );

    }


}