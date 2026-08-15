package com.wildsight.backend.serviceImpl;

import com.wildsight.backend.dto.AudioDetectionRequest;
import com.wildsight.backend.dto.AudioDetectionResponse;
import com.wildsight.backend.entity.AudioDetection;
import com.wildsight.backend.entity.Species;
import com.wildsight.backend.entity.UploadedAudio;
import com.wildsight.backend.repository.AudioDetectionRepository;
import com.wildsight.backend.repository.SpeciesRepository;
import com.wildsight.backend.repository.UploadedAudioRepository;
import com.wildsight.backend.service.AudioDetectionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AudioDetectionServiceImpl implements AudioDetectionService {

    private final AudioDetectionRepository audioDetectionRepository;
    private final UploadedAudioRepository uploadedAudioRepository;
    private final SpeciesRepository speciesRepository;

    @Override
    public AudioDetectionResponse createDetection(AudioDetectionRequest request) {

        UploadedAudio audio = uploadedAudioRepository.findById(request.getAudioId())
                .orElseThrow(() -> new RuntimeException("Uploaded Audio not found"));

        Species species = speciesRepository.findById(request.getSpeciesId())
                .orElseThrow(() -> new RuntimeException("Species not found"));

        AudioDetection detection = AudioDetection.builder()
                .audio(audio)
                .species(species)
                .confidence(request.getConfidence())
                .detectedCall(request.getDetectedCall())
                .noiseLevel(request.getNoiseLevel())
                .build();

        detection = audioDetectionRepository.save(detection);

        return mapToResponse(detection);
    }

    @Override
    public List<AudioDetectionResponse> getAllDetections() {

        return audioDetectionRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public AudioDetectionResponse getDetectionById(Long id) {

        AudioDetection detection = audioDetectionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Detection not found"));

        return mapToResponse(detection);
    }

    @Override
    public AudioDetectionResponse updateDetection(Long id,
                                                  AudioDetectionRequest request) {

        AudioDetection detection = audioDetectionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Detection not found"));

        UploadedAudio audio = uploadedAudioRepository.findById(request.getAudioId())
                .orElseThrow(() -> new RuntimeException("Uploaded Audio not found"));

        Species species = speciesRepository.findById(request.getSpeciesId())
                .orElseThrow(() -> new RuntimeException("Species not found"));

        detection.setAudio(audio);
        detection.setSpecies(species);
        detection.setConfidence(request.getConfidence());
        detection.setDetectedCall(request.getDetectedCall());
        detection.setNoiseLevel(request.getNoiseLevel());

        detection = audioDetectionRepository.save(detection);

        return mapToResponse(detection);
    }

    @Override
    public void deleteDetection(Long id) {

        AudioDetection detection = audioDetectionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Detection not found"));

        audioDetectionRepository.delete(detection);
    }

    private AudioDetectionResponse mapToResponse(AudioDetection detection) {

        return AudioDetectionResponse.builder()
                .audioDetectionId(detection.getAudioDetectionId())
                .audioId(detection.getAudio().getAudioId())
                .speciesId(detection.getSpecies().getSpeciesId())
                .speciesName(detection.getSpecies().getCommonName())
                .confidence(detection.getConfidence())
                .detectedCall(detection.getDetectedCall())
                .noiseLevel(detection.getNoiseLevel())
                .processedAt(detection.getProcessedAt())
                .build();
    }
}