package com.wildsight.backend.serviceImpl;

import com.wildsight.backend.dto.UploadedImageRequest;
import com.wildsight.backend.dto.UploadedImageResponse;
import com.wildsight.backend.dto.ai.AnimalDetection;

import com.wildsight.backend.entity.*;
import com.wildsight.backend.repository.*;
import com.wildsight.backend.service.AIService;
import com.wildsight.backend.service.UploadedImageService;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.nio.file.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;


@Service
@RequiredArgsConstructor
public class UploadedImageServiceImpl implements UploadedImageService {


    private final SpeciesRepository speciesRepository;

    private final UploadedImageRepository uploadedImageRepository;

    private final ObservationRepository observationRepository;

    private final UserRepository userRepository;

    private final AIService aiService;

    private final DetectionResultRepository detectionResultRepository;



    // ================= REAL UPLOAD + AI =================


    @Override
    public UploadedImageResponse uploadImage(

            MultipartFile file,

            Long observationId,

            Long uploadedBy,

            LocalDateTime capturedAt,

            BigDecimal imageQuality

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



        Path uploadPath =
                Paths.get(
                        "uploads",
                        "images"
                );


        Files.createDirectories(uploadPath);



        String fileName =
                UUID.randomUUID()
                + "_"
                + file.getOriginalFilename();



        Path path =
                uploadPath.resolve(fileName);



        Files.copy(
                file.getInputStream(),
                path,
                StandardCopyOption.REPLACE_EXISTING
        );



        UploadedImage image =
                UploadedImage.builder()

                .observation(observation)

                .uploadedBy(user)

                .fileName(
                        file.getOriginalFilename()
                )

                .filePath(
                        path.toString()
                )

                .fileSize(
                        file.getSize()
                )

                .capturedAt(
                        capturedAt
                )

                .imageQuality(
                        imageQuality
                )

                .build();



        image =
        uploadedImageRepository.save(image);



        // ================= AI DETECTION =================


        AnimalDetection detection =
                aiService.detectAnimals(
                        path.toFile()
                );



        if(detection == null)
        {
            throw new RuntimeException(
                    "AI detection failed"
            );
        }



        // ================= SAVE SPECIES =================


        if(detection.getDetections()!=null)
        {

            detection.getDetections()
            .forEach(animal -> {



                boolean exists =
                        speciesRepository
                        .existsByCommonNameIgnoreCase(
                                animal.getSpecies()
                        );



                if(!exists)
                {


                    Species species =
                            Species.builder()

                            .categoryId(
                                    getCategoryId(
                                    animal.getSpecies()
                                    )
                            )

                            .commonName(
                                    animal.getSpecies()
                            )

                            .scientificName(
                                    animal.getScientificName()
                            )

                            .conservationStatus(
                                    animal.getSpeciesStatus()
                            )

                            .iucnStatus(
                                    animal.getSpeciesStatus()
                            )

                            .description(
                                    "Automatically identified by AI image analysis"
                            )

                            .build();



                    speciesRepository.save(species);

                }



            });

        }




        // ================= SAVE DETECTION RESULT =================


        if(detection.getDetections()!=null)
        {


            detection.getDetections()
            .forEach(animal -> {



                DetectionResult result =
                        DetectionResult.builder()

                        .observation(
                                observation
                        )

                        .sourceType(
                                "IMAGE"
                        )

                        .species(
                                animal.getSpecies()
                        )

                        .scientificName(
                                animal.getScientificName()
                        )

                        .category(
                                animal.getCategory()
                        )

                        .confidence(
                                animal.getConfidence()
                        )

                        .conservationStatus(
                                animal.getSpeciesStatus()
                        )

                        .kingdom(
                                animal.getKingdom()
                        )

                        .phylum(
                                animal.getPhylum()
                        )

                        .className(
                                animal.getClassName()
                        )

                        .order(
                                animal.getOrder()
                        )

                        .family(
                                animal.getFamily()
                        )

                        .genus(
                                animal.getGenus()
                        )

                        .build();



                detectionResultRepository.save(result);


            });


        }




        return UploadedImageResponse.builder()


                .imageId(
                        image.getImageId()
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
                        image.getFileName()
                )

                .filePath(
                        image.getFilePath()
                )

                .capturedAt(
                        image.getCapturedAt()
                )

                .fileSize(
                        image.getFileSize()
                )

                .imageQuality(
                        image.getImageQuality()
                )

                .animalCount(
                        detection.getAnimalCount()
                )

                .detections(
                        detection.getDetections()
                )

                .annotatedImage(
                        detection.getAnnotatedImage()
                )

                .model(
                        "YOLO + MobileNetV2"
                )

                .build();

    }




    // ================= CATEGORY MAPPING =================


    private Long getCategoryId(String species)
    {

        if(species==null)
            return 11L;


        species =
                species.toLowerCase();



        if(
            species.contains("flamingo") ||
            species.contains("owl") ||
            species.contains("hornbill") ||
            species.contains("woodpecker") ||
            species.contains("hummingbird") ||
            species.contains("sandpiper") ||
            species.contains("bird")
        )
        {
            return 2L;
        }



        if(
            species.contains("tiger") ||
            species.contains("lion") ||
            species.contains("elephant") ||
            species.contains("leopard") ||
            species.contains("bear")
        )
        {
            return 1L;
        }



        if(
            species.contains("snake") ||
            species.contains("lizard")
        )
        {
            return 3L;
        }



        return 11L;

    }




    @Override
    public UploadedImageResponse uploadImage(
            UploadedImageRequest request) {

        throw new UnsupportedOperationException(
                "Use multipart upload"
        );
    }



    @Override
    public List<UploadedImageResponse> getAllImages() {

        return uploadedImageRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();

    }



    private UploadedImageResponse mapToResponse(
            UploadedImage image)
    {

        return UploadedImageResponse.builder()

                .imageId(
                        image.getImageId()
                )

                .observationId(
                        image.getObservation()
                        .getObservationId()
                )

                .uploadedBy(
                        image.getUploadedBy()
                        .getUserId()
                )

                .uploaderName(
                        image.getUploadedBy()
                        .getFullName()
                )

                .fileName(
                        image.getFileName()
                )

                .filePath(
                        image.getFilePath()
                )

                .capturedAt(
                        image.getCapturedAt()
                )

                .fileSize(
                        image.getFileSize()
                )

                .imageQuality(
                        image.getImageQuality()
                )

                .build();

    }



    @Override
    public UploadedImageResponse getImageById(Long id)
    {
        UploadedImage image =
                uploadedImageRepository.findById(id)
                .orElseThrow(
                        ()->new RuntimeException(
                                "Image not found"
                        )
                );

        return mapToResponse(image);
    }



    @Override
    public void deleteImage(Long id)
    {
        uploadedImageRepository.deleteById(id);
    }



    @Override
    public UploadedImageResponse updateImage(
            Long id,
            UploadedImageRequest request)
    {
        throw new UnsupportedOperationException(
                "Not implemented"
        );
    }

}