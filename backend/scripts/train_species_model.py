from pathlib import Path
import json
import random

import numpy as np
import pandas as pd
import tensorflow as tf

from sklearn.model_selection import GroupShuffleSplit
from sklearn.metrics import classification_report, confusion_matrix

from tensorflow.keras import layers, models
from tensorflow.keras.applications import EfficientNetB0
from tensorflow.keras.callbacks import (
    EarlyStopping,
    ModelCheckpoint,
    ReduceLROnPlateau,
)


# ============================================================
# PATHS
# ============================================================

BASE_DIR = Path(__file__).resolve().parents[2]

DATASET_DIR = (
    BASE_DIR
    / "datasets"
    / "species_identification"
)

IMAGE_DIR = DATASET_DIR / "images"

MANIFEST_FILE = (
    DATASET_DIR
    / "training_manifest.csv"
)

MODEL_DIR = (
    BASE_DIR
    / "ai_models"
    / "species_classifier"
)

MODEL_DIR.mkdir(
    parents=True,
    exist_ok=True,
)


# ============================================================
# CONFIGURATION
# ============================================================

SEED = 42

IMAGE_SIZE = (224, 224)

BATCH_SIZE = 32

INITIAL_EPOCHS = 20

FINE_TUNE_EPOCHS = 15

TRAIN_RATIO = 0.70

VALIDATION_RATIO = 0.15

TEST_RATIO = 0.15


# ============================================================
# REPRODUCIBILITY
# ============================================================

random.seed(SEED)
np.random.seed(SEED)
tf.random.set_seed(SEED)


# ============================================================
# LOAD MANIFEST
# ============================================================

print("=" * 70)
print("WILDLIFE SPECIES CLASSIFIER TRAINING")
print("=" * 70)

print()
print("Loading training manifest...")

df = pd.read_csv(MANIFEST_FILE)

required_columns = {
    "CaptureEventID",
    "URL_Info",
    "Species",
}

missing = required_columns - set(df.columns)

if missing:
    raise ValueError(
        f"Missing required columns: {sorted(missing)}"
    )


print(f"Images in manifest: {len(df):,}")
print(f"Species: {df['Species'].nunique()}")
print(
    f"Capture events: "
    f"{df['CaptureEventID'].nunique():,}"
)


# ============================================================
# BUILD IMAGE PATHS
# ============================================================

def find_image(url_info: str) -> Path | None:

    relative = Path(url_info)

    candidates = [
        IMAGE_DIR / relative,
        IMAGE_DIR / relative.name,
    ]

    for candidate in candidates:

        if candidate.exists():
            return candidate

    return None


print()
print("Resolving image paths...")


df["image_path"] = df["URL_Info"].apply(find_image)


missing_images = df["image_path"].isna().sum()

if missing_images:
    print(
        f"WARNING: {missing_images:,} images "
        f"could not be resolved."
    )

    df = df.dropna(
        subset=["image_path"]
    ).reset_index(drop=True)


print(
    f"Usable images: {len(df):,}"
)


# ============================================================
# SPECIES CLASSES
# ============================================================

classes = sorted(
    df["Species"].unique()
)

class_to_index = {
    species: index
    for index, species in enumerate(classes)
}

index_to_class = {
    str(index): species
    for species, index in class_to_index.items()
}

df["label"] = df["Species"].map(
    class_to_index
)


print()
print("Classes:")

for index, species in enumerate(classes):
    count = (
        df["Species"]
        .eq(species)
        .sum()
    )

    print(
        f"{index:2d}  {species:20s} "
        f"{count:4d} images"
    )


# ============================================================
# GROUP SPLIT
# ============================================================

print()
print("Splitting by CaptureEventID...")


# First: 70% train, 30% temporary
splitter_1 = GroupShuffleSplit(
    n_splits=1,
    test_size=0.30,
    random_state=SEED,
)

train_idx, temp_idx = next(
    splitter_1.split(
        df,
        groups=df["CaptureEventID"],
    )
)

train_df = df.iloc[train_idx].copy()

temp_df = df.iloc[temp_idx].copy()


# Second: split temporary into validation/test
# 50% validation / 50% test
splitter_2 = GroupShuffleSplit(
    n_splits=1,
    test_size=0.50,
    random_state=SEED,
)

val_idx, test_idx = next(
    splitter_2.split(
        temp_df,
        groups=temp_df["CaptureEventID"],
    )
)

val_df = temp_df.iloc[val_idx].copy()

test_df = temp_df.iloc[test_idx].copy()


# ============================================================
# CHECK EVENT LEAKAGE
# ============================================================

train_events = set(
    train_df["CaptureEventID"]
)

val_events = set(
    val_df["CaptureEventID"]
)

test_events = set(
    test_df["CaptureEventID"]
)


if train_events & val_events:
    raise RuntimeError(
        "Capture-event leakage detected "
        "between train and validation."
    )

if train_events & test_events:
    raise RuntimeError(
        "Capture-event leakage detected "
        "between train and test."
    )

if val_events & test_events:
    raise RuntimeError(
        "Capture-event leakage detected "
        "between validation and test."
    )


print()
print("Dataset split:")
print(
    f"Train:      {len(train_df):,} images"
)
print(
    f"Validation: {len(val_df):,} images"
)
print(
    f"Test:       {len(test_df):,} images"
)

print()
print(
    f"Train events:      {len(train_events):,}"
)

print(
    f"Validation events: {len(val_events):,}"
)

print(
    f"Test events:       {len(test_events):,}"
)


# ============================================================
# TF.DATA PIPELINE
# ============================================================

def load_image(path, label):

    image = tf.io.read_file(path)

    image = tf.image.decode_jpeg(
        image,
        channels=3,
    )

    image = tf.image.resize(
        image,
        IMAGE_SIZE,
    )

    image = tf.cast(
        image,
        tf.float32,
    )

    return image, label


def make_dataset(
    frame,
    shuffle=False,
):

    paths = frame["image_path"].astype(str).values

    labels = frame["label"].astype(np.int32).values

    dataset = tf.data.Dataset.from_tensor_slices(
        (paths, labels)
    )

    dataset = dataset.map(
        load_image,
        num_parallel_calls=tf.data.AUTOTUNE,
    )

    if shuffle:
        dataset = dataset.shuffle(
            buffer_size=len(frame),
            seed=SEED,
        )

    dataset = dataset.batch(
        BATCH_SIZE
    )

    dataset = dataset.prefetch(
        tf.data.AUTOTUNE
    )

    return dataset


train_ds = make_dataset(
    train_df,
    shuffle=True,
)

val_ds = make_dataset(
    val_df
)

test_ds = make_dataset(
    test_df
)


# ============================================================
# DATA AUGMENTATION
# ============================================================

augmentation = tf.keras.Sequential(
    [
        layers.RandomFlip(
            "horizontal"
        ),

        layers.RandomRotation(
            0.08
        ),

        layers.RandomZoom(
            0.15
        ),

        layers.RandomContrast(
            0.10
        ),
    ],
    name="augmentation",
)


# ============================================================
# MODEL
# ============================================================

print()
print("Building EfficientNetB0 classifier...")


base_model = EfficientNetB0(
    include_top=False,
    weights="imagenet",
    input_shape=(
        IMAGE_SIZE[0],
        IMAGE_SIZE[1],
        3,
    ),
)

base_model.trainable = False


inputs = layers.Input(
    shape=(
        IMAGE_SIZE[0],
        IMAGE_SIZE[1],
        3,
    )
)


x = augmentation(inputs)

x = base_model(
    x,
    training=False,
)

x = layers.GlobalAveragePooling2D()(x)

x = layers.Dropout(
    0.30
)(x)

outputs = layers.Dense(
    len(classes),
    activation="softmax",
)(x)


model = models.Model(
    inputs,
    outputs,
)


# ============================================================
# COMPILE
# ============================================================

model.compile(
    optimizer=tf.keras.optimizers.Adam(
        learning_rate=1e-3
    ),
    loss="sparse_categorical_crossentropy",
    metrics=[
        "accuracy"
    ],
)


model.summary()


# ============================================================
# CALLBACKS
# ============================================================

best_model_file = (
    MODEL_DIR
    / "best_species_classifier.keras"
)

callbacks = [

    ModelCheckpoint(
        filepath=str(
            best_model_file
        ),
        monitor="val_accuracy",
        save_best_only=True,
        mode="max",
        verbose=1,
    ),

    EarlyStopping(
        monitor="val_accuracy",
        patience=5,
        mode="max",
        restore_best_weights=True,
        verbose=1,
    ),

    ReduceLROnPlateau(
        monitor="val_loss",
        factor=0.3,
        patience=2,
        min_lr=1e-7,
        verbose=1,
    ),
]


# ============================================================
# INITIAL TRAINING
# ============================================================

print()
print("=" * 70)
print("PHASE 1 — TRANSFER LEARNING")
print("=" * 70)


history = model.fit(
    train_ds,
    validation_data=val_ds,
    epochs=INITIAL_EPOCHS,
    callbacks=callbacks,
)


# ============================================================
# FINE-TUNING
# ============================================================

print()
print("=" * 70)
print("PHASE 2 — FINE TUNING")
print("=" * 70)


base_model.trainable = True


# Keep early layers frozen.
for layer in base_model.layers[:-30]:
    layer.trainable = False


model.compile(
    optimizer=tf.keras.optimizers.Adam(
        learning_rate=1e-5
    ),
    loss="sparse_categorical_crossentropy",
    metrics=[
        "accuracy"
    ],
)


model.fit(
    train_ds,
    validation_data=val_ds,
    epochs=FINE_TUNE_EPOCHS,
    callbacks=callbacks,
)


# ============================================================
# LOAD BEST MODEL
# ============================================================

print()
print("Loading best model...")

model = tf.keras.models.load_model(
    best_model_file
)


# ============================================================
# TEST EVALUATION
# ============================================================

print()
print("=" * 70)
print("FINAL TEST EVALUATION")
print("=" * 70)


test_loss, test_accuracy = model.evaluate(
    test_ds,
    verbose=1,
)


print()
print(
    f"Test loss:     {test_loss:.4f}"
)

print(
    f"Test accuracy: {test_accuracy:.4f}"
)

print(
    f"Test accuracy: "
    f"{test_accuracy * 100:.2f}%"
)


# ============================================================
# CLASSIFICATION REPORT
# ============================================================

y_true = []
y_pred = []


for images, labels in test_ds:

    predictions = model.predict(
        images,
        verbose=0,
    )

    predictions = np.argmax(
        predictions,
        axis=1,
    )

    y_true.extend(
        labels.numpy().tolist()
    )

    y_pred.extend(
        predictions.tolist()
    )


print()
print("Classification report:")
print()

print(
    classification_report(
        y_true,
        y_pred,
        target_names=classes,
        digits=4,
        zero_division=0,
    )
)


# ============================================================
# CONFUSION MATRIX
# ============================================================

cm = confusion_matrix(
    y_true,
    y_pred,
)


cm_file = (
    MODEL_DIR
    / "confusion_matrix.npy"
)

np.save(
    cm_file,
    cm,
)


# ============================================================
# SAVE CLASS LABELS
# ============================================================

classes_file = (
    MODEL_DIR
    / "classes.json"
)


with open(
    classes_file,
    "w",
    encoding="utf-8",
) as file:

    json.dump(
        index_to_class,
        file,
        indent=2,
    )


# ============================================================
# SAVE DATASET INFORMATION
# ============================================================

metadata = {

    "image_size": list(
        IMAGE_SIZE
    ),

    "num_classes": len(classes),

    "classes": classes,

    "total_images": int(
        len(df)
    ),

    "train_images": int(
        len(train_df)
    ),

    "validation_images": int(
        len(val_df)
    ),

    "test_images": int(
        len(test_df)
    ),

    "train_capture_events": int(
        len(train_events)
    ),

    "validation_capture_events": int(
        len(val_events)
    ),

    "test_capture_events": int(
        len(test_events)
    ),

    "test_accuracy": float(
        test_accuracy
    ),
}


metadata_file = (
    MODEL_DIR
    / "metadata.json"
)


with open(
    metadata_file,
    "w",
    encoding="utf-8",
) as file:

    json.dump(
        metadata,
        file,
        indent=2,
    )


# ============================================================
# COMPLETE
# ============================================================

print()
print("=" * 70)
print("TRAINING COMPLETE")
print("=" * 70)

print()
print("Model:")
print(best_model_file)

print()
print("Classes:")
print(classes_file)

print()
print("Metadata:")
print(metadata_file)

print()
print(
    f"Final test accuracy: "
    f"{test_accuracy * 100:.2f}%"
)

print("=" * 70)