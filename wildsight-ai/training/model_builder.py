from pathlib import Path
import tensorflow as tf

BASE_DIR = Path(__file__).resolve().parent.parent

MODEL_PATH = BASE_DIR / "models" / "wildlife_classifier.keras"

model = None


def load_model():

    global model

    if model is None:

        print("Loading Wildlife AI Model...")

        model = tf.keras.models.load_model(MODEL_PATH)

        print("Model Loaded Successfully.")


    return model