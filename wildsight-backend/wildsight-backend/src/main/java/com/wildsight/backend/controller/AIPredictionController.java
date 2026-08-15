package com.wildsight.backend.controller;

import com.wildsight.backend.dto.AIPredictionDashboardResponse;
import com.wildsight.backend.service.AIPredictionDashboardService;

import lombok.RequiredArgsConstructor;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ai-predictions")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AIPredictionController {

    private final AIPredictionDashboardService service;

    @GetMapping
    public List<AIPredictionDashboardResponse> getPredictions(
            @RequestParam(defaultValue = "6") int limit) {

        return service.getRecentPredictions();
    }
}