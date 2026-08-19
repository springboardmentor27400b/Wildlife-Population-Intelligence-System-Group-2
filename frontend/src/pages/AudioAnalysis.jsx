import React, { useState } from "react";
import { Upload, Brain, ArrowLeft, Volume2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../api";

export default function AudioAnalysis() {
  const navigate = useNavigate();

  const [selectedAudio, setSelectedAudio] = useState(null);
  const [previewAudio, setPreviewAudio] = useState(null);

  const [progress, setProgress] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);

  const handleAudioUpload = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    setSelectedAudio(file);
    setPreviewAudio(URL.createObjectURL(file));
  };

  const startAnalysis = async () => {

    if (!selectedAudio) {
        alert("Please upload an audio file.");
        return;
    }

    setIsAnalyzing(true);
    setProgress(0);

    const formData = new FormData();
    formData.append("audio", selectedAudio);

    let value = 0;

    const timer = setInterval(() => {

        value += 2;

        if (value <= 90)
            setProgress(value);

    },80);

    try{

        const res = await api.post(
            "/ai/analyze-audio",
            formData,
            {
                headers:{
                    "Content-Type":"multipart/form-data",
                },
            }
        );

        clearInterval(timer);

        setProgress(100);

        setAnalysisResult(res.data);
        setHistory(prev => [
          {
            species: res.data.species,
            duration: res.data.duration,
            confidence: res.data.confidence,
            created_at: new Date().toISOString(),
          },
          ...prev
        ]);
        localStorage.setItem(
          "audioAnalysis",
          JSON.stringify({
            species: res.data.species,
            animal_count: res.data.count,
            confidence: res.data.confidence
          })
        );

    }
    catch(err){

        clearInterval(timer);

        console.log(err);

        alert("Audio Analysis Failed.");

    }
    finally{

        setIsAnalyzing(false);

    }

    };

  const getStatus = (start, end) => {
    if (progress >= end) return "Completed";
    if (progress >= start) return "Running";
    return "Waiting";
  };
  const [history, setHistory] = useState([]);

  return (
    <div className="min-h-screen bg-slate-100">
      {/* ================= HEADER ================= */}

      <div className="bg-gradient-to-r from-emerald-800 via-green-700 to-emerald-600 text-white shadow-xl">

        <div className="max-w-7xl mx-auto px-10 py-8 flex justify-between items-center">

          {/* Left */}

          <div>

            <p className="uppercase tracking-[5px] text-green-200 text-sm font-semibold">

              Wildlife Population Intelligence System

            </p>

            <h1 className="text-5xl font-extrabold mt-2">

              Bioacoustic Recognition Engine

            </h1>

            <p className="mt-3 text-lg text-green-100">

              AI Powered Wildlife Audio Detection & Species Classification

            </p>

          </div>

          {/* Right */}

          <div className="flex gap-4 items-center">

            <div className="bg-white/20 rounded-2xl px-5 py-3">

              <p className="text-xs uppercase text-green-100">

                AI Model

              </p>

              <p className="font-bold">

                Bioacoustic AI v2.0

              </p>

            </div>

            <div className="bg-white/20 rounded-2xl px-5 py-3">

              <p className="text-xs uppercase text-green-100">

                Status

              </p>

              <p className="font-bold text-lime-300">

                ● Online

              </p>

            </div>

            <button

              onClick={() => navigate(-1)}

              className="bg-white hover:bg-gray-100 text-green-700 px-6 py-3 rounded-xl font-bold transition"

            >

              <ArrowLeft className="inline mr-2" size={18} />

              Back

            </button>

          </div>

        </div>

      </div>
      {/* ================= Dashboard Statistics ================= */}

      <div className="max-w-7xl mx-auto px-8 -mt-0 relative z-20">

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-6">

          {/* Card 1 */}

          <div className="bg-white rounded-3xl shadow-xl p-6 hover:shadow-2xl transition">

            <div className="flex justify-between">

              <div>

                <p className="text-gray-500 text-sm">

                  Audio Uploaded

                </p>

                <h2 className="text-4xl font-bold text-green-700 mt-2">

                  {history.length}

                </h2>

              </div>

              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center text-3xl">

                🎙️

              </div>

            </div>

            <p className="mt-4 text-sm text-gray-400">

              Wildlife recordings processed

            </p>

          </div>

          {/* Card 2 */}

          <div className="bg-white rounded-3xl shadow-xl p-6 hover:shadow-2xl transition">

            <div className="flex justify-between">

              <div>

                <p className="text-gray-500 text-sm">

                  Species Detected

                </p>

                <h2 className="text-4xl font-bold text-blue-700 mt-2">

                  {new Set(history.map(item => item.species)).size}

                </h2>

              </div>

              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-3xl">

                🐅

              </div>

            </div>

            <p className="mt-4 text-sm text-gray-400">

              Unique wildlife identified

            </p>

          </div>

          {/* Card 3 */}

          <div className="bg-white rounded-3xl shadow-xl p-6 hover:shadow-2xl transition">

            <div className="flex justify-between">

              <div>

                <p className="text-gray-500 text-sm">

                  Average Confidence

                </p>

                <h2 className="text-4xl font-bold text-orange-600 mt-2">

                  96%

                </h2>

              </div>

              <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center text-3xl">

                🎯

              </div>

            </div>

            <p className="mt-4 text-sm text-gray-400">

              AI prediction accuracy

            </p>

          </div>

          {/* Card 4 */}

          <div className="bg-white rounded-3xl shadow-xl p-6 hover:shadow-2xl transition">

            <div className="flex justify-between">

              <div>

                <p className="text-gray-500 text-sm">

                  Processing Time

                </p>

                <h2 className="text-4xl font-bold text-purple-700 mt-2">

                  1.8s

                </h2>

              </div>

              <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center text-3xl">

                ⚡

              </div>

            </div>

            <p className="mt-4 text-sm text-gray-400">

              Average inference speed

            </p>

          </div>

          {/* Card 5 */}

          <div className="bg-white rounded-3xl shadow-xl p-6 hover:shadow-2xl transition">

            <div className="flex justify-between">

              <div>

                <p className="text-gray-500 text-sm">

                  System Status

                </p>

                <h2 className="text-2xl font-bold text-green-700 mt-2">

                  ACTIVE

                </h2>

              </div>

              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center text-3xl">

                🟢

              </div>

            </div>

            <p className="mt-4 text-sm text-gray-400">

              Bioacoustic Engine Running

            </p>

          </div>

        </div>

      </div>
      {/* ================= Upload Section ================= */}

      <div className="bg-white rounded-3xl shadow-xl p-8">

        <div className="flex justify-between items-center mb-6">

          <div>

            <h2 className="text-3xl font-bold">

              🎙 Upload Wildlife Audio

            </h2>

            <p className="text-gray-500 mt-1">

              Upload wildlife recordings for AI-powered bioacoustic recognition

            </p>

          </div>

          <div className="bg-green-100 text-green-700 px-4 py-2 rounded-full font-semibold">

            Ready

          </div>

        </div>

        {/* Upload Area */}

        <label className="border-2 border-dashed border-green-400 hover:border-green-600 transition rounded-3xl h-[360px] flex flex-col items-center justify-center cursor-pointer bg-green-50 hover:bg-green-100">

          <div className="w-28 h-28 rounded-full bg-white shadow-lg flex items-center justify-center">

            <Upload
              size={70}
              className="text-green-700"
            />

          </div>

          <h3 className="text-2xl font-bold mt-6">

            Drag & Drop Audio

          </h3>

          <p className="text-gray-500 mt-2">

            or click to browse your computer

          </p>

          <div className="flex gap-3 mt-6">

            <span className="bg-white shadow px-4 py-2 rounded-full">

              MP3

            </span>

            <span className="bg-white shadow px-4 py-2 rounded-full">

              WAV

            </span>

            <span className="bg-white shadow px-4 py-2 rounded-full">

              FLAC

            </span>

          </div>

          <p className="text-sm text-gray-400 mt-5">

            Maximum File Size : 50 MB

          </p>

          <input
            hidden
            type="file"
            accept="audio/*"
            onChange={handleAudioUpload}
          />

        </label>

        {/* Audio Preview */}

        {previewAudio && (

          <div className="mt-8">

            <div className="bg-gray-50 rounded-3xl border p-6">

              <div className="flex justify-between items-center mb-5">

                <h3 className="text-xl font-bold">

                  🎧 Uploaded Audio

                </h3>

                <span className="bg-green-100 text-green-700 px-4 py-2 rounded-full">

                  Ready for Analysis

                </span>

              </div>

              <audio
                controls
                className="w-full"
              >

                <source src={previewAudio} />

              </audio>

              {/* File Information */}

              <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mt-6">

                <div className="bg-white rounded-xl shadow p-4">

                  <p className="text-gray-400 text-sm">

                    Format

                  </p>

                  <p className="font-bold">

                    MP3/WAV

                  </p>

                </div>

                <div className="bg-white rounded-xl shadow p-4">

                  <p className="text-gray-400 text-sm">

                    Duration

                  </p>

                  <p className="font-bold">

                    12 sec

                  </p>

                </div>

                <div className="bg-white rounded-xl shadow p-4">

                  <p className="text-gray-400 text-sm">

                    Sample Rate

                  </p>

                  <p className="font-bold">

                    44.1 kHz

                  </p>

                </div>

                <div className="bg-white rounded-xl shadow p-4">

                  <p className="text-gray-400 text-sm">

                    Status

                  </p>

                  <p className="font-bold text-green-600">

                    Uploaded

                  </p>

                </div>

              </div>

            </div>

          </div>

        )}
      
        {/* Engine */}

        <div className="bg-white rounded-3xl shadow-lg p-8">

          <div className="flex justify-between">

            <div>

              <h2 className="text-2xl font-bold">
                AI Audio Engine
              </h2>

              <p className="text-gray-500">
                Wildlife Sound Recognition
              </p>

            </div>

            <Brain
              size={42}
              className="text-green-700"
            />

          </div>

          <div className="mt-8">

            <div className="flex justify-between mb-2">

              <span>Analysis Progress</span>

              <span>{progress}%</span>

            </div>

            <div className="w-full h-3 rounded-full bg-gray-200">

              <div
                className="bg-green-600 h-3 rounded-full transition-all duration-500"
                style={{width:`${progress}%`}}
              />

            </div>

          </div>

          <div className="mt-8 space-y-4">
          <PipelineCard
          icon="🎙️"
          title="Audio Upload"
          desc="Receiving Wildlife Audio"
          status={getStatus(0,10)}
          />

          <PipelineCard
          icon="🔇"
          title="Noise Reduction"
          desc="Removing Background Noise"
          status={getStatus(10,25)}
          />

          <PipelineCard
          icon="📈"
          title="Feature Extraction"
          desc="MFCC & Spectrogram"
          status={getStatus(25,45)}
          />

          <PipelineCard
          icon="🐦"
          title="Animal Call Detection"
          desc="Recognizing Wildlife Sounds"
          status={getStatus(45,65)}
          />

          <PipelineCard
          icon="🦁"
          title="Species Classification"
          desc="AI Species Prediction"
          status={getStatus(65,85)}
          />

          <PipelineCard
          icon="📊"
          title="Acoustic Event Detection"
          desc="Behaviour Recognition"
          status={getStatus(85,100)}
          />
                      
                      

        </div>

          <div className="mt-10 text-center">

            <button
              onClick={startAnalysis}
              disabled={isAnalyzing}
              className="bg-green-700 hover:bg-green-800 text-white px-10 py-4 rounded-xl font-semibold"
            >
              {isAnalyzing
                ? "Analyzing..."
                : "Start Audio Analysis"}
            </button>

          </div>

        </div>
        {progress===100 && analysisResult && (

          <div className="mt-10">
            {analysisResult.category === "Bird" ? (

              <div className="bg-white rounded-3xl shadow-lg p-6 mt-8">

                  <h2 className="text-2xl font-bold text-green-700 mb-6">

                      🐦 Bird Song Recognition

                  </h2>

                  <div className="grid md:grid-cols-2 gap-6">

                      <ResultCard
                          title="Bird Species"
                          value={analysisResult.species}
                          icon="🐦"
                          color="green"
                      />

                      <ResultCard
                          title="Scientific Name"
                          value={analysisResult.scientific_name}
                          icon="📚"
                          color="blue"
                      />

                      <ResultCard
                          title="Call Type"
                          value={analysisResult.call_type}
                          icon="🎵"
                          color="purple"
                      />

                      <ResultCard
                          title="Habitat"
                          value={analysisResult.habitat}
                          icon="🌳"
                          color="orange"
                      />

                  </div>

              </div>

              ) : (

              <div className="bg-white rounded-3xl shadow-lg p-6 mt-8">

                  <h2 className="text-2xl font-bold text-orange-700 mb-6">

                      🦁 Animal Vocalization Recognition

                  </h2>

                  <div className="grid md:grid-cols-2 gap-6">

                      <ResultCard
                          title="Animal Species"
                          value={analysisResult.species}
                          icon="🦁"
                          color="orange"
                      />

                      <ResultCard
                          title="Call Type"
                          value={analysisResult.call_type}
                          icon="🔊"
                          color="blue"
                      />

                      <ResultCard
                          title="Habitat"
                          value={analysisResult.habitat}
                          icon="🌿"
                          color="green"
                      />

                      <ResultCard
                          title="Conservation"
                          value={analysisResult.conservation_status}
                          icon="🛡️"
                          color="purple"
                      />

                  </div>

              </div>

              )}
            <div className="mt-10 bg-white rounded-3xl shadow-lg p-8">

              <h2 className="text-2xl font-bold mb-8">

              🎚 Environmental Noise Filtering

              </h2>

              <div className="grid md:grid-cols-3 gap-6">

              <ResultCard
              icon="🔊"
              title="Noise Before"
              value={analysisResult.noise_before}
              />

              <ResultCard
              icon="🎧"
              title="Noise After"
              value={analysisResult.noise_after}
              />

              <ResultCard
              icon="📉"
              title="Reduction"
              value={analysisResult.noise_reduction}
              />

              </div>

              <div className="mt-8">

              <h3 className="font-semibold mb-3">

              Filtered Audio

              </h3>

              <audio
              controls
              className="w-full"
              >

              <source
              src={`http://127.0.0.1:8000${analysisResult.filtered_audio}`}
              />

              </audio>

              </div>

            </div>
            <div className="mt-8 bg-white rounded-3xl shadow-lg p-8">

          <h2 className="text-2xl font-bold mb-6">

              {analysisResult.category === "Bird"
                  ? "🐦 Bird Call Analysis"
                  : "🦁 Animal Vocalization Analysis"}

          </h2>

          <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">

              <ResultCard
                  icon="🎵"
                  title="Dominant Frequency"
                  value={analysisResult.dominant_frequency}
              />

              <ResultCard
                  icon="⏱"
                  title="Duration"
                  value={analysisResult.duration}
              />

              <ResultCard
                  icon={analysisResult.category === "Bird" ? "🐦" : "🦁"}
                  title={
                      analysisResult.category === "Bird"
                          ? "Bird Call Type"
                          : "Animal Call Type"
                  }
                  value={analysisResult.call_type}
              />

              <ResultCard
                  icon="📶"
                  title="Signal Strength"
                  value={analysisResult.signal_strength}
              />

              <ResultCard
                  icon="📈"
                  title="Confidence"
                  value={`${analysisResult.confidence}%`}
              />

              <ResultCard
                  icon="🌍"
                  title="Distance"
                  value={analysisResult.distance}
              />

              <ResultCard
                  icon="👥"
                  title="Animal Count"
                  value={analysisResult.animal_count}
              />

              <ResultCard
                  icon="⭐"
                  title="Quality"
                  value={analysisResult.quality}
              />

          </div>

      </div>
              
              {/* ================= Waveform & Spectrogram ================= */}

            <div className="mt-10">

                  <h2 className="text-3xl font-bold mb-6">

                      📊 Audio Visualization

                  </h2>

                  <div className="grid lg:grid-cols-2 gap-8">

                      {/* Waveform */}

                      <div className="bg-white rounded-3xl shadow-lg p-6">

                          <h3 className="text-xl font-semibold mb-4">

                              🎵 Waveform

                          </h3>

                          {analysisResult.waveform ? (

                              <img
                                  src={`http://127.0.0.1:8000${analysisResult.waveform}`}
                                  alt="Waveform"
                                  className="w-full rounded-xl border"
                              />

                          ) : (

                              <p className="text-gray-500">

                                  Waveform not available

                              </p>

                          )}

                      </div>

                      {/* Spectrogram */}

                      <div className="bg-white rounded-3xl shadow-lg p-6">

                          <h3 className="text-xl font-semibold mb-4">

                              🌈 Spectrogram

                          </h3>

                          {analysisResult.spectrogram ? (

                              <img
                                  src={`http://127.0.0.1:8000${analysisResult.spectrogram}`}
                                  alt="Spectrogram"
                                  className="w-full rounded-xl border"
                              />

                          ) : (

                              <p className="text-gray-500">

                                  Spectrogram not available

                              </p>

                          )}

                      </div>

                  </div>

              </div>
              <div className="mt-8 bg-red-50 border-l-4 border-red-600 rounded-xl p-6">

                <h3 className="text-xl font-bold text-red-700">

                🚨 Acoustic Event Detection

                </h3>

                <p className="mt-3 text-gray-700">

                {analysisResult.event_description}

                </p>

              </div>

              <div className="mt-8 bg-gradient-to-r from-green-600 to-emerald-500 rounded-3xl text-white p-8 shadow-lg">

                  <h3 className="text-2xl font-bold mb-4">

                      💡 AI Recommendation

                  </h3>

                  <p className="leading-8">

                      {analysisResult.recommendation}

                  </p>

              </div>
              <div className="flex justify-end gap-4 mt-8">

                <button

                className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl"

                >

                  📄 Export PDF

                </button>

                <button

                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl"

                >

                  📊 Export Excel

                </button>

              </div>

            </div>

          

        )}
        {/* ================= Recent Audio Analysis ================= */}

        

      </div>

    </div>
  );
}

function PipelineCard({icon,title,desc,status}) {

  const color =
    status==="Completed"
      ? "bg-green-100 text-green-700"
      : status==="Running"
      ? "bg-blue-100 text-blue-700"
      : "bg-yellow-100 text-yellow-700";

  return(

    <div className="border rounded-2xl p-5 flex justify-between">

      <div>

        <h3 className="font-bold">
          {icon} {title}
        </h3>

        <p className="text-gray-500">
          {desc}
        </p>

      </div>

      <span className={`px-4 py-2 rounded-full font-semibold ${color}`}>
        {status}
      </span>

    </div>

  );
}
function ResultCard({title,value,icon,color}){

    const colors={

    green:"bg-green-100 text-green-700",

    blue:"bg-blue-100 text-blue-700",

    orange:"bg-orange-100 text-orange-700",

    purple:"bg-purple-100 text-purple-700",

    };

    return(

    <div className="bg-gray-50 rounded-2xl p-6 text-center">

    <div className={`inline-flex p-4 rounded-full ${colors[color]}`}>

    <span className="text-3xl">

    {icon}

    </span>

    </div>

    <h4 className="mt-4 text-gray-500">

    {title}

    </h4>

    <p className="text-2xl font-bold mt-2">

    {value}

    </p>

    </div>

    );

}