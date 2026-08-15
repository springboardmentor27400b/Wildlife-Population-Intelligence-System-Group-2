from PIL import Image
import numpy as np

from app.constants import IMAGE_SIZE


def preprocess_image(image_path):
    """
    Preprocess uploaded image before prediction.
    """

    image = Image.open(image_path)

    image = image.convert("RGB")

    image = image.resize(IMAGE_SIZE)

    image_array = np.array(image)

    image_array = image_array.astype("float32")

    image_array = np.expand_dims(image_array, axis=0)

    return image_array