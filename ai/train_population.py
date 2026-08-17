import pandas as pd
from sklearn.ensemble import RandomForestRegressor
import joblib

# Load dataset
data = pd.read_csv("data/population_history.csv")

# Convert species to numeric
species_map = {
    "Tiger": 0,
    "Dog": 1,
    "Chicken": 2,
    "Crow": 3,
    "Sparrow": 4
}

data["species"] = data["species"].map(species_map)

# Features
X = data[["species", "month", "temperature", "rainfall", "habitat_score"]]

# Target
y = data["population"]

# Train model
model = RandomForestRegressor(
    n_estimators=100,
    random_state=42
)

model.fit(X, y)

# Save model
joblib.dump(model, "population_model.pkl")

print("✅ Population AI Model Trained Successfully!")