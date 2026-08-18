import os
import sys
import json
try:
    import torch
    import torch.nn as nn
    import torchaudio
    from torchaudio.functional import resample
except ImportError:
    torch = None
    nn = None
    torchaudio = None
    resample = None
try:
    import librosa
except ImportError:
    librosa = None
import numpy as np
import pandas as pd

# 1. Force local cache paths inside project directory
MODEL_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "models", "animalclap"))
try:
    os.makedirs(MODEL_DIR, exist_ok=True)
except Exception:
    pass

os.environ["HF_HOME"] = MODEL_DIR
os.environ["HUGGINGFACE_HUB_CACHE"] = os.path.join(MODEL_DIR, "hub")
os.environ["TRANSFORMERS_CACHE"] = MODEL_DIR
os.environ["TORCH_HOME"] = MODEL_DIR
os.environ["XDG_CACHE_HOME"] = MODEL_DIR

try:
    from transformers import ClapModel, ClapProcessor
except ImportError:
    ClapModel = None
    ClapProcessor = None

CKPT_PATH = os.path.join(MODEL_DIR, "animalclap_epoch020.pth")
TRAITS_CSV_PATH = os.path.join(MODEL_DIR, "species_traits.csv")

SAMPLE_RATE = 48000
CLIP_LEN = 10.0
N_SAMPLES = int(SAMPLE_RATE * CLIP_LEN)

_NN_Base = nn.Module if nn is not None else object

class ProjectionMLP(_NN_Base):
    def __init__(self, in_dim=512, hidden_dim=512, out_dim=512):
        super().__init__()
        if nn is not None:
            self.net = nn.Sequential(
                nn.Linear(in_dim, hidden_dim), nn.ReLU(inplace=True),
                nn.Linear(hidden_dim, out_dim),
            )
        else:
            self.net = None
    def forward(self, x): return self.net(x)

class HFCLAPContrastive(_NN_Base):
    def __init__(self, model_id="laion/clap-htsat-unfused",
                 proj_hidden_dim=512, proj_out_dim=512):
        super().__init__()
        self.processor = ClapProcessor.from_pretrained(model_id, cache_dir=MODEL_DIR, local_files_only=True)
        self.backbone  = ClapModel.from_pretrained(model_id, cache_dir=MODEL_DIR, local_files_only=True, use_safetensors=True)
        self.logit_scale = nn.Parameter(torch.tensor(np.log(1/0.07), dtype=torch.float32))
        feat_dim = getattr(getattr(self.backbone, "config", object()), "projection_dim", 512)
        self.audio_head = ProjectionMLP(feat_dim, proj_hidden_dim, proj_out_dim)
        self.text_head  = ProjectionMLP(feat_dim, proj_hidden_dim, proj_out_dim)
        self.processor.feature_extractor.do_resample = False
        self.processor.feature_extractor.return_attention_mask = False

    def _dev(self): return next(self.parameters()).device

    @staticmethod
    def _as_tensor(output):
        if torch.is_tensor(output):
            return output
        if hasattr(output, "pooler_output"):
            return output.pooler_output
        if isinstance(output, (tuple, list)):
            return output[0]
        raise TypeError(f"Unexpected feature output type: {type(output)}")

    def encode_audio(self, audio, sample_rate=48000):
        audio_list = [a.cpu().numpy() for a in audio]
        try:
            inputs = self.processor(audios=audio_list, sampling_rate=sample_rate,
                                    return_tensors="pt", padding=True)
        except (TypeError, ValueError):
            inputs = self.processor(audio=audio_list, sampling_rate=sample_rate,
                                    return_tensors="pt", padding=True)
        inputs = {k: v.to(self._dev()) for k, v in inputs.items()}
        return self._as_tensor(self.backbone.get_audio_features(**inputs))

    def encode_text(self, texts):
        inputs = self.processor(text=texts, return_tensors="pt", padding=True)
        inputs = {k: v.to(self._dev()) for k, v in inputs.items()}
        return self._as_tensor(self.backbone.get_text_features(**inputs))

def load_audio(path: str):
    try:
        wf, sr = torchaudio.load(path)
        if wf.dim() == 2:
            wf = wf.mean(dim=0)
    except Exception:
        y, sr = librosa.load(path, sr=None, mono=True)
        wf = torch.from_numpy(y)

    wf = wf.to(torch.float32)
    sr = int(sr) if sr and int(sr) > 0 else SAMPLE_RATE
    if sr != SAMPLE_RATE and wf.numel() > 1:
        wf = resample(wf, sr, SAMPLE_RATE)

    if wf.numel() >= N_SAMPLES:
        return wf[:N_SAMPLES]
    return torch.nn.functional.pad(wf, (0, N_SAMPLES - wf.numel()))

# Singleton state for model and pre-computed text embeddings
_model = None
_class_texts = None
_text_proj = None
_device = None

def get_animalclap_resources():
    global _model, _class_texts, _text_proj, _device
    if _model is not None:
        return _model, _class_texts, _text_proj, _device

    print("Initializing AnimalCLAP Model (HFCLAPContrastive)...")
    _device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    _model = HFCLAPContrastive().to(_device)

    print(f"Loading checkpoint from {CKPT_PATH}...")
    sd = torch.load(CKPT_PATH, map_location="cpu")
    if isinstance(sd, dict) and "state_dict" in sd:
        sd = sd["state_dict"]
    sd = {k.replace("module.", ""): v for k, v in sd.items()}
    missing, unexpected = _model.load_state_dict(sd, strict=False)
    print(f"AnimalCLAP weights loaded. Missing keys: {len(missing)}, Unexpected keys: {len(unexpected)}")
    _model.eval()

    # Load candidate species list
    print(f"Loading candidate species from {TRAITS_CSV_PATH}...")
    traits_df = pd.read_csv(TRAITS_CSV_PATH)
    name_col = None
    for c in ["common_name", "common", "name", "scientific_name"]:
        if c in traits_df.columns:
            name_col = c
            break
    if name_col is None:
        raise ValueError(f"Couldn't find a name column in species_traits.csv. Columns: {list(traits_df.columns)}")

    _class_texts = sorted(set(traits_df[name_col].dropna().astype(str).str.strip()))
    _class_texts = [c for c in _class_texts if c]
    print(f"Loaded {len(_class_texts)} candidate species texts.")

    # Encode all candidate species names (batched)
    print("Pre-computing text embeddings with text_head ProjectionMLP...")
    text_feats = []
    B = 256
    with torch.no_grad():
        for i in range(0, len(_class_texts), B):
            batch = _class_texts[i:i+B]
            feat = _model.encode_text(batch)
            text_feats.append(_model.text_head(feat))
        _text_proj = torch.cat(text_feats, dim=0)
        _text_proj = nn.functional.normalize(_text_proj, dim=-1)
    print("Candidate text projections computed successfully.")

    return _model, _class_texts, _text_proj, _device

def run_animalclap_inference(audio_path: str) -> dict:
    """
    Executes zero-shot species classification using AnimalCLAP.
    Follows reference notebook pipeline line-by-line.
    """
    model, class_texts, text_proj, device = get_animalclap_resources()

    # Load and preprocess audio using notebook pipeline
    wf = load_audio(audio_path).unsqueeze(0).to(device)

    with torch.no_grad():
        a_feat = model.encode_audio(wf, sample_rate=SAMPLE_RATE)
        a_proj = model.audio_head(a_feat)
        a_proj = nn.functional.normalize(a_proj, dim=-1)

        logits = (a_proj @ text_proj.t()).squeeze(0)
        scaled_logits = logits * model.logit_scale.exp().clamp(max=100)
        softmax_probs = torch.softmax(scaled_logits, dim=0)

        TOP_K = 5
        topk_probs, topk_idx = torch.topk(softmax_probs, k=min(TOP_K, len(class_texts)))

    top5_predictions = []
    for p, idx in zip(topk_probs.tolist(), topk_idx.tolist()):
        lbl = class_texts[idx]
        parts = lbl.split(' ')
        genus = parts[0] if len(parts) > 0 else ""
        species_name = parts[1] if len(parts) > 1 else ""

        top5_predictions.append({
            "species": lbl,
            "scientific_name": lbl,
            "common_name": lbl,
            "confidence": float(p)
        })

    primary_prediction = top5_predictions[0] if top5_predictions else {
        "species": "Unknown", "scientific_name": "Unknown", "common_name": "Unknown", "confidence": 0.0
    }

    # Audio quality report
    from app.services.ai.audio_quality_service import analyze_audio_quality
    quality_report = analyze_audio_quality(audio_path)

    # Compute total audio duration for detected events
    y, sr = librosa.load(audio_path, sr=None, mono=True)
    duration = float(len(y) / sr) if sr else 10.0

    detected_events = [{
        "start_time": 0.0,
        "end_time": duration,
        "species": primary_prediction["common_name"],
        "scientific_name": primary_prediction["scientific_name"],
        "common_name": primary_prediction["common_name"],
        "confidence": primary_prediction["confidence"]
    }]

    lbl = primary_prediction["scientific_name"]
    parts = lbl.split(' ')
    genus = parts[0] if len(parts) > 0 else ""
    species_name = parts[1] if len(parts) > 1 else ""

    taxonomy = {
        "genus": genus,
        "species": species_name,
        "scientific_name": lbl,
        "common_name": lbl
    }

    return {
        "detected_species": primary_prediction["common_name"],
        "scientific_name": primary_prediction["scientific_name"],
        "common_name": primary_prediction["common_name"],
        "confidence": primary_prediction["confidence"],
        "top5_predictions": top5_predictions,
        "detected_events": detected_events,
        "audio_quality": quality_report,
        "taxonomy": taxonomy
    }
