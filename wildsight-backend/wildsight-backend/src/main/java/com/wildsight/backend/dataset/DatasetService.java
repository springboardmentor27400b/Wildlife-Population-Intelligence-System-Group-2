package com.wildsight.backend.dataset;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.File;

@Service
public class DatasetService {

    @Value("${dataset.animals.path}")
    private String animalDatasetPath;

    @Value("${dataset.birds.audio.path}")
    private String birdAudioPath;

    @Value("${dataset.birds.csv.path}")
    private String trainCsvPath;

    @Value("${dataset.birds.taxonomy.path}")
    private String taxonomyCsvPath;

    public DatasetStatusResponse getDatasetStatus() {

        DatasetStatusResponse response = new DatasetStatusResponse();

        File animalFolder = new File(animalDatasetPath);
        File birdFolder = new File(birdAudioPath);
        File trainCsv = new File(trainCsvPath);
        File taxonomyCsv = new File(taxonomyCsvPath);

        response.setAnimalDataset(animalFolder.exists() ? "Available" : "Not Available");
        response.setBirdDataset(birdFolder.exists() ? "Available" : "Not Available");

        response.setTrainCsv(trainCsv.exists() ? "Available" : "Not Available");
        response.setTaxonomyCsv(taxonomyCsv.exists() ? "Available" : "Not Available");

        response.setAnimalImages(countFiles(animalFolder));
        response.setBirdAudioFiles(countFiles(birdFolder));

        boolean ready =
                animalFolder.exists() &&
                birdFolder.exists() &&
                trainCsv.exists() &&
                taxonomyCsv.exists();

        response.setReadyForTraining(ready);

        return response;
    }

    private int countFiles(File folder) {

        if (!folder.exists())
            return 0;

        File[] files = folder.listFiles();

        if (files == null)
            return 0;

        int count = 0;

        for (File file : files) {

            if (file.isDirectory()) {
                count += countFiles(file);
            } else {
                count++;
            }
        }

        return count;
    }
}