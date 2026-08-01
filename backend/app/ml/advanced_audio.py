import random
import numpy as np
from typing import Tuple, List, Dict, Any, Optional

class AdvancedAudioAnalysisEngine:
    def __init__(self, model_type: str = "Estimated"):
        self.model_type = model_type

    def analyze_environmental_noise(self, y: np.ndarray, sr: int) -> Tuple[str, float, bool, float]:
        """
        Analyzes audio quality and environmental noise using Librosa.
        Returns: (audio_quality, snr_db, clipping_detected, silence_percentage)
        """
        try:
            import librosa
        except ImportError:
            return "Unknown", 0.0, False, 0.0

        # 1. Clipping detection
        # If a significant number of samples are at max/min possible values
        max_val = np.max(np.abs(y))
        clipping_detected = bool(max_val > 0.99)

        # 2. Silence percentage
        # Use librosa.effects.split to find non-silent intervals
        non_silent_intervals = librosa.effects.split(y, top_db=40)
        total_samples = len(y)
        if total_samples > 0:
            non_silent_samples = sum(end - start for start, end in non_silent_intervals)
            silence_percentage = 100.0 * (1.0 - (non_silent_samples / total_samples))
        else:
            silence_percentage = 100.0

        # 3. SNR Calculation (Simplified estimation)
        # Assume the non-silent parts contain signal + noise, and the silent parts contain noise.
        if len(non_silent_intervals) > 0 and silence_percentage > 5:
            # Create a mask for noise (silent regions)
            noise_mask = np.ones(total_samples, dtype=bool)
            for start, end in non_silent_intervals:
                noise_mask[start:end] = False
            
            noise_rms = np.sqrt(np.mean(y[noise_mask] ** 2)) + 1e-10
            signal_rms = np.sqrt(np.mean(y[~noise_mask] ** 2)) + 1e-10
            
            snr_db = 20 * np.log10(signal_rms / noise_rms)
        else:
            # If there's no clear silence or all silence
            snr_db = 15.0 if silence_percentage < 90 else 0.0

        # 4. Audio Quality Classification
        # Rules: High SNR is Good. High clipping or high silence is bad.
        if clipping_detected and snr_db < 10:
            audio_quality = "Poor"
        elif snr_db > 20 and not clipping_detected and silence_percentage < 50:
            audio_quality = "Excellent"
        elif snr_db > 10 and silence_percentage < 80:
            audio_quality = "Good"
        elif snr_db > 5:
            audio_quality = "Fair"
        else:
            audio_quality = "Poor"

        return audio_quality, round(float(snr_db), 2), clipping_detected, round(float(silence_percentage), 2)

    def detect_acoustic_events(self, duration: float, base_species: str, base_confidence: float, y: Optional[np.ndarray] = None, sr: Optional[int] = None) -> Tuple[int, List[Dict[str, Any]], str]:
        """
        Modular Acoustic Event Detection.
        Routes to the appropriate ML backend or falls back to estimates.
        """
        if self.model_type == "BirdNET":
            return self._detect_birdnet(y, sr)
        elif self.model_type == "YAMNet":
            return self._detect_yamnet(y, sr)
        elif self.model_type == "Custom TensorFlow":
            return self._detect_custom_tf(y, sr)
        else:
            return self._detect_estimated(duration, base_species, base_confidence)

    def _detect_birdnet(self, y: Optional[np.ndarray], sr: Optional[int]) -> Tuple[int, List[Dict[str, Any]], str]:
        # Placeholder for real BirdNET implementation
        return 0, [], "BirdNET"

    def _detect_yamnet(self, y: Optional[np.ndarray], sr: Optional[int]) -> Tuple[int, List[Dict[str, Any]], str]:
        # Placeholder for real YAMNet implementation
        return 0, [], "YAMNet"

    def _detect_custom_tf(self, y: Optional[np.ndarray], sr: Optional[int]) -> Tuple[int, List[Dict[str, Any]], str]:
        # Placeholder for custom TF implementation
        return 0, [], "Custom TensorFlow"

    def _detect_estimated(self, duration: float, base_species: str, base_confidence: float) -> Tuple[int, List[Dict[str, Any]], str]:
        """
        Mock Acoustic Event Detection.
        Uses estimated events as a temporary fallback.
        """
        events = []
        
        # Determine general category based on species
        bird_species = ["Bird of Prey", "Eagle", "Hawk", "Parrot"]
        mammal_species = ["Wolf Pack", "Elephant", "Tiger", "Chimpanzee", "Lion", "Howler Monkey", "Whale"]
        amphibian_species = ["Frog", "Toad"]
        
        if base_species in bird_species:
            category = "Bird Call"
        elif base_species in mammal_species:
            category = "Mammal Vocalization"
        elif base_species in amphibian_species:
            category = "Amphibian Call"
        else:
            category = "Unknown"

        seed = int(duration * 100) if duration else random.randint(0, 1000)
        rng = random.Random(seed)
        
        # Generate 1 to 4 events
        event_count = rng.randint(1, 4)
        if duration and duration > 0:
            segment_duration = duration / event_count
            
            for i in range(event_count):
                # 70% chance of being the primary species, 30% environmental or other
                if rng.random() > 0.3:
                    label = category
                    conf = round(rng.uniform(base_confidence - 10, min(100.0, base_confidence + 10)), 2)
                else:
                    label = rng.choice(["Environmental Sound", "Insect Sound", "Multiple Calls"])
                    conf = round(rng.uniform(40.0, 85.0), 2)
                
                # Start somewhere in its segment
                start = (i * segment_duration) + rng.uniform(0, segment_duration * 0.4)
                evt_dur = rng.uniform(0.5, min(3.0, segment_duration * 0.5))
                end = start + evt_dur
                
                # Ensure it doesn't exceed total duration
                if end > duration:
                    end = duration
                    evt_dur = end - start
                    
                if evt_dur > 0.1:
                    events.append({
                        "start_time": round(start, 2),
                        "end_time": round(end, 2),
                        "duration": round(evt_dur, 2),
                        "label": f"[Estimated] {label}",
                        "confidence": conf
                    })
        else:
            # Fallback if duration is unknown or 0
            event_count = 1
            events.append({
                "start_time": 0.0,
                "end_time": 1.0,
                "duration": 1.0,
                "label": f"[Estimated] {category}",
                "confidence": round(base_confidence, 2)
            })

        return len(events), events, "Estimated"


# Backward compatibility wrappers for older modules
def analyze_environmental_noise(y: np.ndarray, sr: int) -> Tuple[str, float, bool, float]:
    engine = AdvancedAudioAnalysisEngine()
    return engine.analyze_environmental_noise(y, sr)

def detect_acoustic_events(duration: float, base_species: str, base_confidence: float) -> Tuple[int, List[Dict[str, Any]], str]:
    engine = AdvancedAudioAnalysisEngine()
    return engine.detect_acoustic_events(duration, base_species, base_confidence)
