package com.wildsight.backend.dataset;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/datasets")
@CrossOrigin(origins = "*")
public class DatasetController {

    @Autowired
    private DatasetService datasetService;

    @GetMapping("/status")
    public DatasetStatusResponse getDatasetStatus() {
        return datasetService.getDatasetStatus();
    }
}