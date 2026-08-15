package com.wildsight.backend.serviceImpl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.wildsight.backend.dto.AIPredictionResponse;
import com.wildsight.backend.dto.ai.AnimalDetection;
import com.wildsight.backend.dto.ai.AudioPredictionResult;
import com.wildsight.backend.service.AIService;
import lombok.RequiredArgsConstructor;

import org.springframework.core.io.FileSystemResource;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.io.File;

@Service
@RequiredArgsConstructor
public class AIServiceImpl implements AIService {

    private final RestTemplate restTemplate;

    private static final String DETECTION_URL =
           "http://host.docker.internal:8000/detect-animals";

    private static final String AI_URL =
            "http://host.docker.internal:8000/predict-image";

    private static final String AUDIO_URL =
            "http://host.docker.internal:8000/predict-audio";

    @Override
    public String predictImage(File imageFile) {

        System.out.println("====================================");
        System.out.println("Calling WildSight AI...");
        System.out.println("Image : " + imageFile.getAbsolutePath());

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);

        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("file", new FileSystemResource(imageFile));

        HttpEntity<MultiValueMap<String, Object>> request =
                new HttpEntity<>(body, headers);

        ResponseEntity<AIPredictionResponse> response =
                restTemplate.postForEntity(
                        AI_URL,
                        request,
                        AIPredictionResponse.class
                );

        System.out.println("HTTP Status : " + response.getStatusCode());

        AIPredictionResponse ai = response.getBody();

        if (ai == null) {
            throw new RuntimeException(
                    "AI Service returned an empty response."
            );
        }

        System.out.println("Species : " + ai.getPredictedSpecies());
        System.out.println("Confidence : " + ai.getConfidence());
        System.out.println("Model : " + ai.getModel());
        System.out.println("====================================");

        return ai.getPredictedSpecies();
    }

    @Override
    public AnimalDetection detectAnimals(File imageFile) {

        System.out.println("====================================");
        System.out.println("Calling Animal Detection API...");
        System.out.println("Image : " + imageFile.getAbsolutePath());

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);

        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("file", new FileSystemResource(imageFile));

        HttpEntity<MultiValueMap<String, Object>> request =
                new HttpEntity<>(body, headers);

        ResponseEntity<AnimalDetection> response =
                restTemplate.postForEntity(
                        DETECTION_URL,
                        request,
                        AnimalDetection.class
                );

        System.out.println("HTTP Status : " + response.getStatusCode());

        AnimalDetection detection = response.getBody();

        if (detection == null) {
            throw new RuntimeException(
                    "Animal Detection API returned empty response."
            );
        }

        System.out.println(
                "Animals Found : " + detection.getAnimalCount()
        );

        if (detection.getDetections() != null) {

            detection.getDetections().forEach(d -> {

                System.out.println("-------------------------");
                System.out.println("Species : " + d.getSpecies());
                System.out.println("Confidence : " + d.getConfidence());
                System.out.println("Bounding Box : " + d.getBoundingBox());

            });
        }

        System.out.println("====================================");

        return detection;
    }

    @Override
    public AudioPredictionResult predictAudio(File audioFile) {

        System.out.println("====================================");
        System.out.println("Calling BirdNET...");
        System.out.println(audioFile.getAbsolutePath());

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);

        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("file", new FileSystemResource(audioFile));

        HttpEntity<MultiValueMap<String, Object>> request =
                new HttpEntity<>(body, headers);

        ResponseEntity<AudioPredictionResult> response =
                restTemplate.postForEntity(
                        AUDIO_URL,
                        request,
                        AudioPredictionResult.class
                );

        AudioPredictionResult result = response.getBody();

        if (result == null) {
            throw new RuntimeException(
                    "BirdNET returned empty response."
            );
        }

        System.out.println("Species : " + result.getSpecies());
        System.out.println("Confidence : " + result.getConfidence());

        return result;
    }
}