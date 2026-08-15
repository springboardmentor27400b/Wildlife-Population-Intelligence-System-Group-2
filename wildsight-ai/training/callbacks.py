from pathlib import Path
import tensorflow as tf

BASE_DIR = Path(__file__).resolve().parent.parent

MODEL_DIR = BASE_DIR / "models"
LOG_DIR = BASE_DIR / "logs"

MODEL_DIR.mkdir(exist_ok=True)
LOG_DIR.mkdir(exist_ok=True)


def get_callbacks():

    checkpoint = tf.keras.callbacks.ModelCheckpoint(
        filepath=str(MODEL_DIR / "wildlife_classifier.keras"),
        monitor="val_accuracy",
        save_best_only=True,
        verbose=1
    )

    early_stop = tf.keras.callbacks.EarlyStopping(
        monitor="val_loss",
        patience=3,
        restore_best_weights=True
    )

    reduce_lr = tf.keras.callbacks.ReduceLROnPlateau(
        monitor="val_loss",
        factor=0.2,
        patience=2,
        verbose=1
    )

    tensorboard = tf.keras.callbacks.TensorBoard(
        log_dir=str(LOG_DIR)
    )

    return [
        checkpoint,
        early_stop,
        reduce_lr,
        tensorboard
    ]