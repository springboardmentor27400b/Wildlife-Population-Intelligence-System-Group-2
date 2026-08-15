import tensorflow as tf
from pathlib import Path

IMAGE_SIZE = (224, 224)
BATCH_SIZE = 32

def load_dataset(dataset_path):

    train_dataset = tf.keras.utils.image_dataset_from_directory(
        dataset_path,
        validation_split=0.2,
        subset="training",
        seed=42,
        image_size=IMAGE_SIZE,
        batch_size=BATCH_SIZE
    )

    validation_dataset = tf.keras.utils.image_dataset_from_directory(
        dataset_path,
        validation_split=0.2,
        subset="validation",
        seed=42,
        image_size=IMAGE_SIZE,
        batch_size=BATCH_SIZE
    )

    class_names = train_dataset.class_names

    AUTOTUNE = tf.data.AUTOTUNE

    train_dataset = train_dataset.cache().prefetch(AUTOTUNE)
    validation_dataset = validation_dataset.cache().prefetch(AUTOTUNE)

    return train_dataset, validation_dataset, class_names