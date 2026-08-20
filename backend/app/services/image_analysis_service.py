from app.ai.species_classifier import classify_species


def analyze_image(image_path: str):
    """
    Analyze an image using the trained wildlife species classifier.

    Returns the predicted wildlife species and top-5 predictions.
    """
    return classify_species(image_path)