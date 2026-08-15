package com.wildsight.backend.dataset;

public class DatasetStatusResponse {

    private String animalDataset;
    private int animalImages;

    private String birdDataset;
    private int birdAudioFiles;

    private String trainCsv;
    private String taxonomyCsv;

    private boolean readyForTraining;

    public String getAnimalDataset() {
        return animalDataset;
    }

    public void setAnimalDataset(String animalDataset) {
        this.animalDataset = animalDataset;
    }

    public int getAnimalImages() {
        return animalImages;
    }

    public void setAnimalImages(int animalImages) {
        this.animalImages = animalImages;
    }

    public String getBirdDataset() {
        return birdDataset;
    }

    public void setBirdDataset(String birdDataset) {
        this.birdDataset = birdDataset;
    }

    public int getBirdAudioFiles() {
        return birdAudioFiles;
    }

    public void setBirdAudioFiles(int birdAudioFiles) {
        this.birdAudioFiles = birdAudioFiles;
    }

    public String getTrainCsv() {
        return trainCsv;
    }

    public void setTrainCsv(String trainCsv) {
        this.trainCsv = trainCsv;
    }

    public String getTaxonomyCsv() {
        return taxonomyCsv;
    }

    public void setTaxonomyCsv(String taxonomyCsv) {
        this.taxonomyCsv = taxonomyCsv;
    }

    public boolean isReadyForTraining() {
        return readyForTraining;
    }

    public void setReadyForTraining(boolean readyForTraining) {
        this.readyForTraining = readyForTraining;
    }
}