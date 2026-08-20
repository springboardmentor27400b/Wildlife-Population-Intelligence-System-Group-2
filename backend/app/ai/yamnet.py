import csv
import tensorflow as tf
import tensorflow_hub as hub

# Load the model only once
model = hub.load("https://tfhub.dev/google/yamnet/1")

# Download the class map from TensorFlow
class_map_path = model.class_map_path().numpy().decode("utf-8")

with tf.io.gfile.GFile(class_map_path) as csv_file:
    reader = csv.DictReader(csv_file)
    class_names = [row["display_name"] for row in reader]


def predict(audio_waveform):
    """
    Predict audio classes using YAMNet.

    Returns:
        class_name (str)
        confidence (float)
    """

    scores, embeddings, spectrogram = model(audio_waveform)

    mean_scores = tf.reduce_mean(scores, axis=0)

    class_index = tf.argmax(mean_scores)

    confidence = float(mean_scores[class_index])

    return class_names[class_index], confidence