package com.wildsight.backend.service;

import com.wildsight.backend.dto.EnvironmentConditionRequest;
import com.wildsight.backend.dto.EnvironmentConditionResponse;

import java.util.List;

public interface EnvironmentConditionService {

    EnvironmentConditionResponse createCondition(EnvironmentConditionRequest request);

    List<EnvironmentConditionResponse> getAllConditions();

    EnvironmentConditionResponse getConditionById(Long id);

    EnvironmentConditionResponse updateCondition(
            Long id,
            EnvironmentConditionRequest request);

    void deleteCondition(Long id);
}