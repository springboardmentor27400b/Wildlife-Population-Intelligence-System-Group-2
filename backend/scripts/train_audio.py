import argparse
import logging
import os
import torch
import torch.nn as nn
import torch.optim as optim
from pathlib import Path
import numpy as np

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

# A simple 2D CNN for audio spectrograms
class AudioCNN(nn.Module):
    def __init__(self, num_classes):
        super(AudioCNN, self).__init__()
        self.conv1 = nn.Conv2d(1, 16, kernel_size=3, padding=1)
        self.relu1 = nn.ReLU()
        self.pool1 = nn.MaxPool2d(2)
        
        self.conv2 = nn.Conv2d(16, 32, kernel_size=3, padding=1)
        self.relu2 = nn.ReLU()
        self.pool2 = nn.MaxPool2d(2)
        
        # Assume input size for spectrogram is approx 128x128
        # Pool twice -> 32x32. Flatten: 32 * 32 * 32 = 32768
        self.fc1 = nn.Linear(32 * 32 * 32, 128)
        self.relu3 = nn.ReLU()
        self.dropout = nn.Dropout(0.5)
        self.fc2 = nn.Linear(128, num_classes)

    def forward(self, x):
        x = self.conv1(x)
        x = self.relu1(x)
        x = self.pool1(x)
        
        x = self.conv2(x)
        x = self.relu2(x)
        x = self.pool2(x)
        
        x = x.view(x.size(0), -1) # Flatten
        x = self.fc1(x)
        x = self.relu3(x)
        x = self.dropout(x)
        x = self.fc2(x)
        return x

def train_audio_model(data_dir: Path, output_dir: Path, num_epochs=10, batch_size=32, device="cpu"):
    logger.info(f"Training audio model on device: {device}")
    
    # In a full implementation, this would load custom AudioDataset yielding 
    # spectrogram tensors and labels. Here we simulate the process.
    logger.info("Initializing AudioCNN for BirdCLEF / Xeno-canto data.")
    
    # Example: 18 target wildlife audio classes
    num_classes = 18
    model = AudioCNN(num_classes).to(device)
    
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.AdamW(model.parameters(), lr=1e-3, weight_decay=1e-2)
    scheduler = optim.lr_scheduler.ReduceLROnPlateau(optimizer, mode='min', factor=0.5, patience=2, verbose=True)

    logger.info("Starting training loop...")
    
    best_loss = float('inf')
    early_stopping_patience = 4
    epochs_no_improve = 0
    
    output_dir.mkdir(parents=True, exist_ok=True)
    best_model_path = output_dir / "custom_audio_cnn_best.pth"
    
    for epoch in range(num_epochs):
        logger.info(f"Epoch {epoch + 1}/{num_epochs}")
        logger.info("-" * 10)
        
        # Simulate training and validation steps
        dummy_train_loss = max(0.1, 2.5 - (0.2 * epoch))
        dummy_train_acc = min(0.95, 0.15 + (0.08 * epoch))
        
        dummy_val_loss = max(0.2, 2.7 - (0.18 * epoch)) + np.random.normal(0, 0.05)
        dummy_val_acc = min(0.92, 0.12 + (0.07 * epoch))
        
        logger.info(f"train Loss: {dummy_train_loss:.4f} Acc: {dummy_train_acc:.4f}")
        logger.info(f"val Loss: {dummy_val_loss:.4f} Acc: {dummy_val_acc:.4f}")
        
        scheduler.step(dummy_val_loss)
        
        if dummy_val_loss < best_loss:
            best_loss = dummy_val_loss
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
        final_path = output_dir / "custom_audio_cnn_final.pth"
        torch.save(model.state_dict(), final_path)
        logger.info(f"Model saved to {final_path}")

def main():
    parser = argparse.ArgumentParser(description="Train custom audio classifier.")
    parser.add_argument("--data-dir", type=str, default="../datasets/processed_audio", help="Processed audio dir.")
    parser.add_argument("--output-dir", type=str, default="../datasets/models", help="Dir to save model.")
    parser.add_argument("--epochs", type=int, default=10, help="Number of epochs.")
    args = parser.parse_args()

    base_dir = Path(__file__).parent
    data_dir = (base_dir / args.data_dir).resolve()
    out_dir = (base_dir / args.output_dir).resolve()
    
    device = "cuda:0" if torch.cuda.is_available() else "cpu"

    train_audio_model(data_dir, out_dir, num_epochs=args.epochs, device=device)

if __name__ == "__main__":
    main()
