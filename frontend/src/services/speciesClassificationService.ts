const API_BASE_URL = "http://127.0.0.1:8000";

export type SpeciesPrediction = {
  species: string;
  confidence: number;
};

export type SpeciesClassification = {
  species: string;
  confidence: number;
  predictions: SpeciesPrediction[];
};

export type SpeciesClassificationResponse = {
  success: boolean;
  species_classification: SpeciesClassification;
};

export async function classifySpecies(
  imagePath: string,
): Promise<SpeciesClassification> {
  const response = await fetch(
    `${API_BASE_URL}/species-classification/predict`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        image_path: imagePath,
      }),
    },
  );

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(
      `Species classification failed: ${response.status} ${errorText}`,
    );
  }

  const data: SpeciesClassificationResponse =
    await response.json();

  if (!data.success || !data.species_classification) {
    throw new Error("Species classification returned no result");
  }

  return data.species_classification;
}

