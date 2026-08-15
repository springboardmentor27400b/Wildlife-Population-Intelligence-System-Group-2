package com.wildsight.backend.service;


import java.io.File;

import com.wildsight.backend.dto.ai.AnimalDetection;
import com.wildsight.backend.dto.ai.AudioPredictionResult;


public interface AIService {


    // ================= IMAGE AI =================

    String predictImage(File imageFile);


    AnimalDetection detectAnimals(File imageFile);



    // ================= AUDIO AI (BirdNET) =================

    AudioPredictionResult predictAudio(File audioFile);


}