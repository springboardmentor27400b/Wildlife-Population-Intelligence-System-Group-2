package com.wildsight.backend.controller;


import com.wildsight.backend.dto.HealthScoreResponse;
import com.wildsight.backend.service.WildlifeHealthScoreService;

import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;



@RestController
@RequestMapping("/api/wildlife-health")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class WildlifeHealthScoreController {


    private final WildlifeHealthScoreService healthScoreService;



    @GetMapping("/score")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<HealthScoreResponse> getHealthScore(){


        System.out.println("🔥 HEALTH SCORE CONTROLLER HIT 🔥");


        return ResponseEntity.ok(
                healthScoreService.calculateHealthScore()
        );

    }

}