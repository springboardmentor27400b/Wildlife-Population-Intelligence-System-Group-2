import asyncio
import os
import sys

# add backend dir to sys path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    import numpy as np
    import soundfile as sf
    from app.ml.audio_predictor import predict_audio_species, validate_audio_file

    def test_predictor():
        print("Testing audio predictor...")
        # Create valid dummy wav
        sf.write('dummy_valid.wav', np.random.randn(10000), 22050)
        
        # Test valid
        result = predict_audio_species('dummy_valid.wav')
        print(f"Valid result: {result}")
        assert 'error' not in result
        assert 'predicted_category' in result
        assert 'confidence' in result
        
        # Create invalid dummy file
        with open('dummy_invalid.wav', 'w') as f:
            f.write("This is not a wav file")
            
        # Test invalid
        result_inv = predict_audio_species('dummy_invalid.wav')
        print(f"Invalid result: {result_inv}")
        assert 'error' in result_inv
        
        # Cleanup
        os.remove('dummy_valid.wav')
        os.remove('dummy_invalid.wav')
        
        print("Predictor tests passed.")
        
    test_predictor()
    
except Exception as e:
    print(f"Test failed with error: {e}")
