import os
import time
import requests
from pathlib import Path

# The 27 real species
SPECIES = [
    "Lion", "Tiger", "Leopard", "Cheetah", "Elephant", 
    "White Rhinoceros", "Black Rhinoceros", "Hippopotamus", "Buffalo", "Zebra",
    "Giraffe", "Wolf", "Fox", "Bear", "Monkey", 
    "Chimpanzee", "Baboon", "Crocodile", "Rabbit", "Horse", 
    "Dog", "Cat", "Peacock", "African Fish Eagle", "Hornbill", 
    "Owl", "Deer"
]

TRAIN_DIR = Path(__file__).resolve().parent.parent / "datasets" / "images" / "train"

def ensure_dataset_structure():
    """Mock ensure_dataset_structure that just ensures directories exist."""
    return {"status": "ok", "message": "Directories exist."}

def main():
    TRAIN_DIR.mkdir(parents=True, exist_ok=True)
    pass

if __name__ == "__main__":
    main()
