const API_URL = "http://127.0.0.1:8000";

export async function analyzeImage(imagePath: string) {
  const response = await fetch(`${API_URL}/image-analysis/predict`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      image_path: imagePath,
    }),
  });

  if (!response.ok) {
    throw new Error("Image analysis failed");
  }

  return response.json();
}