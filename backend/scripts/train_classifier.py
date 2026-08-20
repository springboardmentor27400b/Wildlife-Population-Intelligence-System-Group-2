import argparse
import logging
import os
import torch
import torch.nn as nn
import torch.optim as optim
from pathlib import Path
from torchvision import datasets, models, transforms
from torch.utils.data import DataLoader

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

def get_dataloaders(data_dir: Path, batch_size=32):
    train_dir = data_dir / "train"
    val_dir = data_dir / "val"

    # Preprocessing transforms
    data_transforms = {
        "train": transforms.Compose([
            transforms.RandomResizedCrop(224),
            transforms.RandomHorizontalFlip(),
            transforms.ToTensor(),
            transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
        ]),
        "val": transforms.Compose([
            transforms.Resize(256),
            transforms.CenterCrop(224),
            transforms.ToTensor(),
            transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
        ]),
    }

    image_datasets = {}
    if train_dir.exists() and any(train_dir.iterdir()):
        image_datasets["train"] = datasets.ImageFolder(train_dir, data_transforms["train"])
    if val_dir.exists() and any(val_dir.iterdir()):
        image_datasets["val"] = datasets.ImageFolder(val_dir, data_transforms["val"])

    if not image_datasets:
        raise ValueError(f"No training or validation data found in {data_dir}")

    dataloaders = {x: DataLoader(image_datasets[x], batch_size=batch_size, shuffle=True, num_workers=2) 
                   for x in image_datasets}
    dataset_sizes = {x: len(image_datasets[x]) for x in image_datasets}
    class_names = image_datasets["train"].classes if "train" in image_datasets else []

    return dataloaders, dataset_sizes, class_names

def train_model(data_dir: Path, output_dir: Path, num_epochs=10, batch_size=32, device="cpu"):
    logger.info(f"Using device: {device}")
    
    try:
        dataloaders, dataset_sizes, class_names = get_dataloaders(data_dir, batch_size)
    except ValueError as e:
        logger.error(str(e))
        return

    logger.info(f"Classes: {class_names}")
    
    # Load ResNet50
    model = models.resnet50(weights=models.ResNet50_Weights.IMAGENET1K_V1)
    num_ftrs = model.fc.in_features
    model.fc = nn.Linear(num_ftrs, len(class_names))
    model = model.to(device)

    criterion = nn.CrossEntropyLoss()
    optimizer = optim.AdamW(model.parameters(), lr=1e-4, weight_decay=1e-2)
    scheduler = optim.lr_scheduler.ReduceLROnPlateau(optimizer, mode='min', factor=0.1, patience=3, verbose=True)
    
    scaler = torch.cuda.amp.GradScaler(enabled=device.startswith("cuda"))

    best_loss = float('inf')
    early_stopping_patience = 5
    epochs_no_improve = 0

    output_dir.mkdir(parents=True, exist_ok=True)
    best_model_path = output_dir / "custom_resnet50_wildlife_best.pth"

    for epoch in range(num_epochs):
        logger.info(f"Epoch {epoch + 1}/{num_epochs}")
        logger.info("-" * 10)

        for phase in ["train", "val"]:
            if phase not in dataloaders:
                continue
                
            if phase == "train":
                model.train()
            else:
                model.eval()

            running_loss = 0.0
            running_corrects = 0

            for inputs, labels in dataloaders[phase]:
                inputs = inputs.to(device)
                labels = labels.to(device)

                optimizer.zero_grad()

                with torch.set_grad_enabled(phase == "train"):
                    with torch.cuda.amp.autocast(enabled=device.startswith("cuda")):
                        outputs = model(inputs)
                        _, preds = torch.max(outputs, 1)
                        loss = criterion(outputs, labels)

                    if phase == "train":
                        scaler.scale(loss).backward()
                        scaler.step(optimizer)
                        scaler.update()

                running_loss += loss.item() * inputs.size(0)
                running_corrects += torch.sum(preds == labels.data)

            epoch_loss = running_loss / dataset_sizes[phase]
            epoch_acc = running_corrects.double() / dataset_sizes[phase]

            logger.info(f"{phase} Loss: {epoch_loss:.4f} Acc: {epoch_acc:.4f}")

            if phase == "val":
                scheduler.step(epoch_loss)
                if epoch_loss < best_loss:
                    best_loss = epoch_loss
                    epochs_no_improve = 0
                    torch.save(model.state_dict(), best_model_path)
                    logger.info(f"Validation loss improved. Saved checkpoint to {best_model_path.name}")
                else:
                    epochs_no_improve += 1
                    
        if epochs_no_improve >= early_stopping_patience:
            logger.info(f"Early stopping triggered after {epoch + 1} epochs!")
            break

    logger.info("Training complete")
    if best_model_path.exists():
        logger.info(f"Best model available at {best_model_path}")
    else:
        final_path = output_dir / "custom_resnet50_wildlife_final.pth"
        torch.save(model.state_dict(), final_path)
        logger.info(f"Model saved to {final_path}")

def main():
    parser = argparse.ArgumentParser(description="Train custom image classifier.")
    parser.add_argument("--data-dir", type=str, default="../datasets/processed", help="Processed images dir.")
    parser.add_argument("--output-dir", type=str, default="../datasets/models", help="Dir to save model.")
    parser.add_argument("--epochs", type=int, default=5, help="Number of epochs.")
    args = parser.parse_args()

    base_dir = Path(__file__).parent
    data_dir = (base_dir / args.data_dir).resolve()
    out_dir = (base_dir / args.output_dir).resolve()
    
    device = "cuda:0" if torch.cuda.is_available() else "cpu"

    train_model(data_dir, out_dir, num_epochs=args.epochs, device=device)

if __name__ == "__main__":
    main()
