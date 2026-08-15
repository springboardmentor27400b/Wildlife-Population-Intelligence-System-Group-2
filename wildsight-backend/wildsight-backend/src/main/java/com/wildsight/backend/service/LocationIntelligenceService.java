package com.wildsight.backend.service;


import com.wildsight.backend.dto.LocationIntelligenceResponse;


public interface LocationIntelligenceService {


    LocationIntelligenceResponse getLocationDetails(Long id);

}
