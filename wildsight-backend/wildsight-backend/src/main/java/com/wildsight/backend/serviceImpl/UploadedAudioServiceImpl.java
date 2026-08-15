package com.wildsight.backend.serviceImpl;

import com.wildsight.backend.dto.UploadedAudioRequest;
import com.wildsight.backend.dto.UploadedAudioResponse;
import com.wildsight.backend.dto.ai.AudioPredictionResult;
import com.wildsight.backend.entity.Observation;
import com.wildsight.backend.entity.UploadedAudio;
import com.wildsight.backend.entity.User;
import com.wildsight.backend.repository.ObservationRepository;
import com.wildsight.backend.repository.UploadedAudioRepository;
import com.wildsight.backend.repository.UserRepository;
import com.wildsight.backend.service.AIService;
import com.wildsight.backend.service.UploadedAudioService;
import com.wildsight.backend.entity.DetectionResult;
import com.wildsight.backend.repository.DetectionResultRepository;
import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import com.wildsight.backend.service.AIService;
import java.io.IOException;
import java.math.BigDecimal;
import java.nio.file.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;


@Service
@RequiredArgsConstructor
public class UploadedAudioServiceImpl implements UploadedAudioService {
    private final AIService aiService;

    private final UploadedAudioRepository uploadedAudioRepository;

    private final ObservationRepository observationRepository;

    private final UserRepository userRepository;

    private final DetectionResultRepository detectionResultRepository;

    @Override
    public UploadedAudioResponse uploadAudio(
            UploadedAudioRequest request) {


        Observation observation =
                observationRepository.findById(
                        request.getObservationId()
                )
                .orElseThrow(
                        () -> new RuntimeException("Observation not found")
                );


        User user =
                userRepository.findById(
                        request.getUploadedBy()
                )
                .orElseThrow(
                        () -> new RuntimeException("User not found")
                );


        UploadedAudio audio =
                UploadedAudio.builder()

                .observation(observation)

                .fileName(request.getFileName())

                .filePath(request.getFilePath())

                .capturedAt(request.getCapturedAt())

                .fileSize(request.getFileSize())

                .uploadedBy(user)

                .durationSeconds(request.getDurationSeconds())

                .build();



        audio =
                uploadedAudioRepository.save(audio);



        return mapToResponse(audio);

    }





    @Override
    public List<UploadedAudioResponse> getAllAudio() {


        return uploadedAudioRepository.findAll()

                .stream()

                .map(this::mapToResponse)

                .toList();

    }






    @Override
    public UploadedAudioResponse getAudioById(Long id) {


        UploadedAudio audio =
                uploadedAudioRepository.findById(id)

                .orElseThrow(
                        () -> new RuntimeException("Audio not found")
                );


        return mapToResponse(audio);

    }







    @Override
    public UploadedAudioResponse updateAudio(
            Long id,
            UploadedAudioRequest request) {



        UploadedAudio audio =
                uploadedAudioRepository.findById(id)

                .orElseThrow(
                        () -> new RuntimeException("Audio not found")
                );



        Observation observation =
                observationRepository.findById(
                        request.getObservationId()
                )

                .orElseThrow(
                        () -> new RuntimeException("Observation not found")
                );



        User user =
                userRepository.findById(
                        request.getUploadedBy()
                )

                .orElseThrow(
                        () -> new RuntimeException("User not found")
                );



        audio.setObservation(observation);

        audio.setFileName(request.getFileName());

        audio.setFilePath(request.getFilePath());

        audio.setCapturedAt(request.getCapturedAt());

        audio.setFileSize(request.getFileSize());

        audio.setUploadedBy(user);

        audio.setDurationSeconds(
                request.getDurationSeconds()
        );



        audio =
                uploadedAudioRepository.save(audio);



        return mapToResponse(audio);

    }







    @Override
    public void deleteAudio(Long id) {


        UploadedAudio audio =
                uploadedAudioRepository.findById(id)

                .orElseThrow(
                        () -> new RuntimeException("Audio not found")
                );


        uploadedAudioRepository.delete(audio);

    }









    @Override
    public UploadedAudioResponse uploadAudio(

            MultipartFile file,

            Long observationId,

            Long uploadedBy,

            LocalDateTime capturedAt,

            BigDecimal durationSeconds

    ) throws IOException {



        Observation observation =
                observationRepository.findById(observationId)

                .orElseThrow(
                        () -> new RuntimeException("Observation not found")
                );



        User user =
                userRepository.findById(uploadedBy)

                .orElseThrow(
                        () -> new RuntimeException("User not found")
                );



        String uploadDir =
                "uploads/audio/";



        Files.createDirectories(
                Paths.get(uploadDir)
        );



        String uniqueFileName =

                UUID.randomUUID()
                + "_"
                + file.getOriginalFilename();




        Path path =
                Paths.get(
                        uploadDir,
                        uniqueFileName
                );



        Files.copy(

                file.getInputStream(),

                path,

                StandardCopyOption.REPLACE_EXISTING

        );




        UploadedAudio audio =

                UploadedAudio.builder()

                .observation(observation)

                .uploadedBy(user)

                .fileName(
                        file.getOriginalFilename()
                )

                .filePath(
                        path.toString()
                )

                .capturedAt(capturedAt)

                .fileSize(
                        file.getSize()
                )

                .durationSeconds(
                        durationSeconds
                )

                .build();




        audio =
uploadedAudioRepository.save(audio);


// ================= BIRDNET AI =================

AudioPredictionResult prediction =
        aiService.predictAudio(
                path.toFile()
        );
// ================= SAVE DETECTION RESULT =================

DetectionResult result =
        DetectionResult.builder()

        .observation(observation)

        .sourceType("AUDIO")

        .species(
                prediction.getSpecies()
        )

        .scientificName(
                prediction.getScientificName()
        )

        .category(
                prediction.getCategory()
        )

        .confidence(
                prediction.getConfidence()
        )

        .conservationStatus(
                prediction.getConservationStatus()
        )

        .kingdom(
                prediction.getKingdom()
        )

        .phylum(
                prediction.getPhylum()
        )

        .className(
                prediction.getClassName()
        )

        .order(
                prediction.getOrder()
        )

        .family(
                prediction.getFamily()
        )

        .genus(
                prediction.getGenus()
        )

        .build();

detectionResultRepository.save(result);



// ================= RESPONSE =================

return UploadedAudioResponse.builder()

.audioId(
        audio.getAudioId()
)

.observationId(
        observation.getObservationId()
)

.uploadedBy(
        user.getUserId()
)

.uploaderName(
        user.getFullName()
)

.fileName(
        audio.getFileName()
)

.filePath(
        audio.getFilePath()
)

.capturedAt(
        audio.getCapturedAt()
)

.fileSize(
        audio.getFileSize()
)

.durationSeconds(
        audio.getDurationSeconds()
)


// AI RESULT

.species(
        prediction.getSpecies()
)

.scientificName(
        prediction.getScientificName()
)

.confidence(
        prediction.getConfidence()
)

.category(
        prediction.getCategory()
)

.soundType(
        prediction.getSoundType()
)

.conservationStatus(
        prediction.getConservationStatus()
)

.environmentNoise(
        prediction.getEnvironmentNoise()
)

.noiseFiltered(
        prediction.getNoiseFiltered()
)


// TAXONOMY

.kingdom(
        prediction.getKingdom()
)

.phylum(
        prediction.getPhylum()
)

.className(
        prediction.getClassName()
)

.order(
        prediction.getOrder()
)

.family(
        prediction.getFamily()
)

.genus(
        prediction.getGenus()
)


.model(
        "BirdNET Analyzer"
)

.status(
        "SUCCESS"
)

.build();




        

    }









    private UploadedAudioResponse mapToResponse(
            UploadedAudio audio) {



        return UploadedAudioResponse.builder()


                .audioId(
                        audio.getAudioId()
                )


                .observationId(
                        audio.getObservation()
                        .getObservationId()
                )


                .uploadedBy(
                        audio.getUploadedBy()
                        .getUserId()
                )


                .uploaderName(
                        audio.getUploadedBy()
                        .getFullName()
                )


                .fileName(
                        audio.getFileName()
                )


                .filePath(
                        audio.getFilePath()
                )


                .capturedAt(
                        audio.getCapturedAt()
                )


                .uploadTime(
                        audio.getUploadTime()
                )


                .fileSize(
                        audio.getFileSize()
                )


                .durationSeconds(
                        audio.getDurationSeconds()
                )


                // Temporary AI Response

                .species(
                        "Unknown"
                )


                .scientificName(
                        "Not Available"
                )


                .confidence(
                        0.0
                )


                .category(
                        "Unknown"
                )


                .soundType(
                        "Unknown"
                )


                .conservationStatus(
                        "Unknown"
                )


                .noiseFiltered(
                        false
                )


                .model(
                        "BirdNET Analyzer"
                )


                .status(
                        "uploaded"
                )


                .build();

    }

}