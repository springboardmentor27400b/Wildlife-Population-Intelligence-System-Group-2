# Milestone 1 Status Summary

- Wildlife species model trained using MobileNetV2 transfer learning.
- Dataset used: 5,400 wildlife images across 11 categories.
- Saved model: wildlife_species_model.keras.
- Saved class labels: class_names.json.
- FastAPI endpoint implemented: POST /api/v1/predictions/species.
- Endpoint supports JPG, JPEG, PNG, and WEBP image uploads.
- JWT authentication, file validation, and secure temporary-file cleanup are implemented.
- Final live API testing is pending TensorFlow installation in the backend virtual environment.
