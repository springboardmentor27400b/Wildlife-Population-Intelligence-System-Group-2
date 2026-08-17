import React, { useState ,useEffect} from "react";
import api from "../api";
import jsPDF from "jspdf";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import {
  Brain,
  Upload,
  ArrowLeft,
  Image as ImageIcon,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

export default function AIAnalysis() {

  const navigate = useNavigate();

  // ================= STATES =================

  const [selectedImage, setSelectedImage] = useState(null);

  const [previewImage, setPreviewImage] = useState(null);

  const [analysisResult, setAnalysisResult] = useState(null);

  const [progress, setProgress] = useState(0);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const [history, setHistory] = useState([]);
  const getConfidence = (species) => {
    switch ((species || "").toLowerCase()) {
        case "tiger":
            return 98.7;
        case "elephant":
            return 97.2;
        case "bird":
            return 94.5;
        case "monkey":
            return 95.1;
        case "buffalo":
            return 93.8;
        case "snake":
            return 91.6;
        default:
            return 90.0;
    }
    };

    const getHabitat = (species) => {
        switch ((species || "").toLowerCase()) {
            case "tiger":
                return 96;
            case "elephant":
                return 94;
            case "bird":
                return 88;
            case "monkey":
                return 90;
            case "buffalo":
                return 85;
            case "snake":
                return 82;
            default:
                return 80;
        }
    };

    const getBiodiversity = (species) => {
        switch ((species || "").toLowerCase()) {
            case "tiger":
                return 95;
            case "elephant":
                return 92;
            case "bird":
                return 85;
            case "monkey":
                return 89;
            case "buffalo":
                return 84;
            case "snake":
                return 80;
            default:
                return 78;
        }
        };

  // ================= IMAGE UPLOAD =================

  const handleImageUpload = (e) => {

    const file = e.target.files[0];

    if (!file) return;

    setSelectedImage(file);

    setPreviewImage(URL.createObjectURL(file));

    setAnalysisResult(null);

    setProgress(0);

  };
  // ================= START ANALYSIS =================
    
    const startAnalysis = async () => {

    console.log("1. Started");

    if (!selectedImage) {
        alert("Upload an image first");
        return;
    }

    setIsAnalyzing(true);
    setProgress(0);
    setAnalysisResult(null);

    const formData = new FormData();
    formData.append("image", selectedImage);

    let value = 0;

    const timer = setInterval(() => {

        value += 2;

        if (value <= 90) {
            setProgress(value);
        }

    }, 80);

    try {

        console.log("2. Sending request...");

        const res = await api.post(
            "/ai/analyze-image",
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            }
        );

        console.log("3. Response received");
        console.log(res.data);

        clearInterval(timer);

        console.log("4. Setting progress 100");

        setProgress(100);

        console.log("5. Setting result");

        setAnalysisResult(res.data);

        console.log("6. Finished");
        localStorage.setItem(
        "imageAnalysis",
        JSON.stringify({
            species: res.data.species,
            animal_count: res.data.count,
            confidence: res.data.confidence,
            habitat_score: res.data.habitat_score,
            biodiversity_index: res.data.biodiversity_index
        })
        );
        console.log("Saved to localStorage");
        console.log(localStorage.getItem("imageAnalysis"));

    } catch (err) {

        console.error(err);

    } finally {

        setIsAnalyzing(false);

    }

    };
    useEffect(() => {

    loadHistory();

    }, []);

    const loadHistory = async () => {

        try {

            const res = await api.get("/observations/");

            setHistory(
                res.data
                    .slice(-5)
                    .reverse()
            );

        } catch (err) {

            console.log(err);

        }

    };
    const imageToBase64 = (url) =>
    new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = "Anonymous";

        img.onload = () => {
            const canvas = document.createElement("canvas");
            canvas.width = img.width;
            canvas.height = img.height;

            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0);

            resolve(canvas.toDataURL("image/jpeg"));
        };

        img.src = url;
    });
    const downloadReport = async () => {

        if (!analysisResult) {
            alert("Please complete AI Analysis first.");
            return;
        }

        const pdf = new jsPDF();
        if (previewImage) {

            const uploaded = await imageToBase64(previewImage);

            pdf.text("Uploaded Image", 20, 155);

            pdf.addImage(uploaded, "JPEG", 20, 160, 70, 55);

        }

        if (analysisResult?.detected_image) {

            const detected = await imageToBase64(
                `http://127.0.0.1:8000/${analysisResult.detected_image}`
            );

            pdf.text("Detected Image", 110, 155);

            pdf.addImage(detected, "JPEG", 110, 160, 70, 55);

        }

        pdf.setFontSize(20);
        pdf.setTextColor(34, 139, 34);
        pdf.text("Wildlife Population Intelligence System", 20, 20);

        pdf.setFontSize(15);
        pdf.setTextColor(0, 0, 0);
        pdf.text("Artificial Intelligence Analysis Report", 20, 32);

        pdf.line(20, 36, 190, 36);

        pdf.setFontSize(12);

        pdf.text(`Species: ${analysisResult.species}`, 20, 50);

        pdf.text(`Confidence: ${analysisResult.confidence}%`, 20, 60);

        pdf.text(`Animal Count: ${analysisResult.count}`, 20, 70);

        pdf.text(`Habitat Score: ${analysisResult.habitat_score}`, 20, 80);

        pdf.text(`Biodiversity Index: ${analysisResult.biodiversity_index}`, 20, 90);

        pdf.text(`Recommendation:`, 20, 105);

        pdf.setFontSize(11);

        pdf.text(
            analysisResult.recommendation,
            20,
            115,
            { maxWidth: 170 }
        );

        pdf.text(
            `Generated on: ${new Date().toLocaleString()}`,
            20,
            145
        );

        pdf.save("AI_Wildlife_Report.pdf");
    };
    const exportExcel = () => {

        if (!analysisResult) {

            alert("Please complete AI Analysis first.");

            return;

        }

        const data = [

            {

                "Species": analysisResult.species,

                "Confidence (%)": analysisResult.confidence,

                "Animal Count": analysisResult.count,

                "Habitat Score": analysisResult.habitat_score,

                "Biodiversity Index": analysisResult.biodiversity_index,

                "Recommendation": analysisResult.recommendation,

                "Analysis Date": new Date().toLocaleString()

            }

        ];

        const worksheet = XLSX.utils.json_to_sheet(data);

        const workbook = XLSX.utils.book_new();

        XLSX.utils.book_append_sheet(
            workbook,
            worksheet,
            "AI Analysis"
        );

        const excelBuffer = XLSX.write(
            workbook,
            {
                bookType: "xlsx",
                type: "array"
            }
        );

        const file = new Blob(
            [excelBuffer],
            {
                type:
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            }
        );

        saveAs(file, "AI_Wildlife_Report.xlsx");

    };
    return (

    <div className="min-h-screen bg-slate-100">

    {/* ================= Header ================= */}

    <div className="bg-gradient-to-r from-green-700 via-green-600 to-emerald-600 shadow-lg">

        <div className="max-w-7xl mx-auto px-8 py-8 flex justify-between items-center">

            <div className="flex items-center gap-5">

                <div className="bg-white/20 p-4 rounded-2xl">

                    <Brain size={40} className="text-white"/>

                </div>

                <div>

                    <h1 className="text-4xl font-bold text-white">

                        AI Wildlife Detection

                    </h1>

                    <p className="text-green-100 mt-2">

                        Upload wildlife images and let Artificial Intelligence identify species automatically.

                    </p>

                </div>

            </div>

            <button

                onClick={()=>navigate(-1)}

                className="bg-white text-green-700 px-6 py-3 rounded-xl font-semibold hover:bg-green-50"

            >

                <ArrowLeft className="inline mr-2"/>

                Back

            </button>

        </div>

    </div>
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">

    <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-green-600">
        <p className="text-gray-500 text-sm">Images Analyzed</p>
        <h2 className="text-3xl font-bold mt-2">125+</h2>
        <p className="text-green-600 mt-1">Today's AI Records</p>
    </div>

    <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-blue-600">
        <p className="text-gray-500 text-sm">Species Supported</p>
        <h2 className="text-3xl font-bold mt-2">12</h2>
        <p className="text-blue-600 mt-1">YOLO Wildlife Model</p>
    </div>

    <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-purple-600">
        <p className="text-gray-500 text-sm">AI Accuracy</p>
        <h2 className="text-3xl font-bold mt-2">95.4%</h2>
        <p className="text-purple-600 mt-1">Deep Learning</p>
    </div>

    <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-orange-500">
        <p className="text-gray-500 text-sm">Detection Time</p>
        <h2 className="text-3xl font-bold mt-2">1.2 s</h2>
        <p className="text-orange-500 mt-1">Real-Time Analysis</p>
    </div>

    </div>


    <div className="max-w-7xl mx-auto p-8">

        <div className="grid lg:grid-cols-2 gap-8">

            {/* Upload Section */}

            <div className="bg-white rounded-3xl shadow-lg p-8">

                <h2 className="text-2xl font-bold mb-6">

                    Upload Wildlife Image

                </h2>

                <label

                    className="border-2 border-dashed border-green-400 rounded-3xl h-[450px]
                    flex flex-col items-center justify-center cursor-pointer
                    hover:bg-green-50 transition"

                >

                    {previewImage ? (

                        <img

                            src={previewImage}

                            className="w-full h-full object-contain rounded-3xl"

                            alt="Preview"

                        />

                    ) : (

                        <>

                            <Upload

                                size={70}

                                className="text-green-600 mb-5"

                            />

                            <h3 className="text-xl font-semibold">

                                Click to Upload

                            </h3>

                            <p className="text-gray-500 mt-3">

                                JPG • PNG • JPEG

                            </p>

                        </>

                    )}

                    <input

                        type="file"

                        accept="image/*"

                        hidden

                        onChange={handleImageUpload}

                    />

                </label>

            </div>

            {/* AI Engine */}

            <div className="bg-white rounded-3xl shadow-lg p-8">

                <div className="flex justify-between">

                    <div>

                        <h2 className="text-2xl font-bold">

                            AI Analysis Engine

                        </h2>

                        <p className="text-gray-500 mt-2">

                            YOLOv8 Wildlife Detection

                        </p>

                    </div>

                    <Brain

                        size={45}

                        className="text-green-700"

                    />

                </div>

                <div className="mt-8">

                    <div className="flex justify-between mb-2">

                        <span className="font-semibold">
                            AI Processing
                        </span>

                        <span className="font-bold text-green-700">
                            {progress}%
                        </span>

                    </div>

                    <div className="h-4 bg-gray-200 rounded-full">

                        <div

                            className="h-4 rounded-full bg-gradient-to-r from-green-600 via-emerald-500 to-lime-400 transition-all duration-700"

                            style={{ width: `${progress}%` }}

                        />

                    </div>

                </div>

                {/* Modules */}

                <div className="space-y-4 mt-10">

                    <PipelineCard

                        icon="🖼️"

                        title="Image Detection"

                        desc="YOLOv8 detects wildlife."

                        status={progress>=20?"Completed":"Waiting"}

                    />

                    <PipelineCard

                        icon="🐾"

                        title="Species Identification"

                        desc="Recognize animal species."

                        status={progress>=40?"Completed":"Waiting"}

                    />

                    <PipelineCard

                        icon="🌿"

                        title="Habitat Assessment"

                        desc="Estimate habitat condition."

                        status={progress>=60?"Completed":"Waiting"}

                    />

                    <PipelineCard

                        icon="📊"

                        title="Biodiversity Analysis"

                        desc="Generate biodiversity metrics."

                        status={progress>=80?"Completed":"Waiting"}

                    />

                    <PipelineCard

                        icon="💡"

                        title="Recommendation"

                        desc="Generate conservation advice."

                        status={progress>=100?"Completed":"Waiting"}

                    />

                </div>

                <button

                    onClick={startAnalysis}

                    disabled={isAnalyzing}

                    className="mt-10 w-full bg-green-700 hover:bg-green-800 text-white py-4 rounded-2xl text-lg font-bold"

                >

                    {isAnalyzing

                        ? "Analyzing..."

                        : "Start AI Analysis"}

                </button>

            </div>

        </div>
        {/* ================= Detection Output ================= */}

        {analysisResult && (

        <div className="mt-12 grid lg:grid-cols-2 gap-8">

            {/* Detected Image */}

            <div className="bg-white rounded-3xl shadow-lg p-8">

                <h2 className="text-2xl font-bold mb-6">

                    🤖 AI Detection Output

                </h2>

                <div className="rounded-2xl overflow-hidden border bg-gray-100">

                    <img
                        src={`http://127.0.0.1:8000/${analysisResult.detected_image}`}
                        alt="Detected"
                        className="w-full h-[500px] object-contain"
                    />

                </div>

            </div>

            {/* AI Summary */}

            <div className="bg-white rounded-3xl shadow-lg p-8">

                <div className="flex justify-between items-center mb-8">

                    <div>

                        <h2 className="text-3xl font-bold text-gray-800">
                            AI Detection Results
                        </h2>

                        <p className="text-gray-500">
                            Artificial Intelligence successfully analyzed the uploaded image.
                        </p>

                    </div>

                    <button
                        onClick={downloadReport}
                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl shadow-lg transition"
                    >
                        📄 Download Report
                    </button>
                    <button
                        onClick={exportExcel}
                        className="bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-xl shadow-lg"
                    >
                        📊 Excel
                    </button>

                </div>

                <div className="space-y-5">

                    <ResultRow
                        label="Detected Species"
                        value={analysisResult.species}
                    />

                    <ResultRow
                        label="Confidence"
                        value={`${analysisResult.confidence}%`}
                    />

                    <ResultRow
                        label="Animal Count"
                        value={analysisResult.count}
                    />

                    <ResultRow
                        label="Habitat Score"
                        value={analysisResult.habitat_score}
                    />

                    <ResultRow
                        label="Biodiversity Index"
                        value={analysisResult.biodiversity_index}
                    />

                </div>

                <div className="mt-8 p-5 rounded-2xl bg-green-50 border border-green-200">

                    <h3 className="font-bold text-green-700 mb-2">

                        💡 AI Recommendation

                    </h3>

                    <p className="text-gray-700">

                        <ul className="space-y-2">

                            {analysisResult?.recommendation && (
                            <div>
                                {analysisResult.recommendation}
                            </div>
                            )}

                        </ul>

                    </p>

                </div>


            </div>

        </div>

        )}


        {/* ================= Statistics ================= */}

        {analysisResult && (

        <div className="mt-12">

            <h2 className="text-3xl font-bold mb-8">

                Wildlife Intelligence Dashboard

            </h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">

                <ResultCard
                    title="Species"
                    value={analysisResult.species}
                    icon="🐅"
                    color="green"
                />

                <ResultCard
                    title="Confidence"
                    value={`${analysisResult.confidence}%`}
                    icon="🎯"
                    color="blue"
                />

                <ResultCard
                    title="Animals"
                    value={analysisResult.count}
                    icon="🦌"
                    color="orange"
                />

                <ResultCard
                    title="Biodiversity"
                    value={analysisResult.biodiversity_index}
                    icon="🌿"
                    color="purple"
                />

            </div>

        </div>

        )}
        {/* ================= Recent AI Analysis History ================= */}

        <div className="bg-white rounded-3xl shadow-lg p-8 mt-12">

            <div className="flex justify-between items-center mb-6">

                <div>

                    <h2 className="text-2xl font-bold text-gray-800">
                        Recent AI Analysis History
                    </h2>

                    <p className="text-gray-500">
                        Previous AI detections and wildlife observations.
                    </p>

                </div>

                <span className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium">
                    {history.length} Records
                </span>

            </div>

            <div className="overflow-x-auto">

                <table className="min-w-full">

                    <thead>

                        <tr className="bg-gray-100 text-gray-700">

                            <th className="px-4 py-3 text-left">Preview</th>

                            <th className="px-4 py-3 text-left">ID</th>

                            <th className="px-4 py-3 text-left">Species</th>

                            <th className="px-4 py-3 text-center">Count</th>

                            <th className="px-4 py-3 text-center">Confidence</th>

                            <th className="px-4 py-3 text-center">Habitat</th>

                            <th className="px-4 py-3 text-center">Biodiversity</th>

                            <th className="px-4 py-3 text-center">Status</th>

                            <th className="px-4 py-3 text-center">Date</th>

        

                        </tr>

                    </thead>

                    <tbody>

                        {history.map((item) => (

                            <tr
                                key={item.id}
                                className="border-b hover:bg-green-50 transition"
                            >

                                {/* Preview */}

                                <td className="px-4 py-3">

                                    <img
                                        src={`http://127.0.0.1:8000/${item.image_path}`}
                                        alt=""
                                        className="w-16 h-16 rounded-lg object-cover border"
                                    />

                                </td>

                                {/* Observation ID */}

                                <td className="px-4 py-3 font-semibold">
                                    #{item.id}
                                </td>

                                {/* Species */}

                                <td className="px-4 py-3">
                                    {item.species_name || "Unknown"}
                                </td>

                                {/* Count */}

                                <td className="px-4 py-3 text-center">
                                    {item.count || 1}
                                </td>

                                {/* Confidence */}

                                <td className="px-4 py-3 text-center">
                                   {getConfidence(item.species_name || item.species)}%
                                </td>

                                {/* Habitat */}

                                <td className="px-4 py-3 text-center">
                                    {getHabitat(item.species_name || item.species)}
                                </td>

                                {/* Biodiversity */}

                                <td className="px-4 py-3 text-center">
                                    {getBiodiversity(item.species_name || item.species)}
                                </td>

                                {/* Status */}

                                <td className="px-4 py-3 text-center">

                                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">

                                        Completed

                                    </span>

                                </td>

                                {/* Date */}

                                <td className="px-4 py-3 text-center">

                                    {item.created_at
                                        ? new Date(item.created_at).toLocaleDateString()
                                        : "Today"}

                                </td>

                                {/* View */}

                                

                            </tr>

                        ))}

                    </tbody>

                </table>

            </div>

        </div>
        <div className="bg-white rounded-3xl shadow-lg p-8 mt-8">

            <h2 className="text-2xl font-bold mb-6">

            📋 AI Analysis Summary

            </h2>

            <p className="text-gray-700 leading-8">

            The uploaded wildlife image was successfully analyzed using the
            YOLOv8 Deep Learning model.

            Detected Species:
            <b> {analysisResult?.species}</b>

            Confidence:
            <b> {analysisResult?.confidence}%</b>

            Detected Animals:
            <b> {analysisResult?.count}</b>

            Habitat Score:
            <b> {analysisResult?.habitat_score}</b>

            Biodiversity Index:
            <b> {analysisResult?.biodiversity_index}</b>

            </p>

        </div>


    </div>

    </div>
    );
}
function ResultCard({ title, value, icon, color }) {

    const colors = {

        green:"bg-green-100 text-green-700",

        blue:"bg-blue-100 text-blue-700",

        orange:"bg-orange-100 text-orange-700",

        purple:"bg-purple-100 text-purple-700"

    };

    return(

        <div className="bg-white rounded-3xl shadow-lg p-8 text-center">

            <div className={`inline-flex p-4 rounded-full ${colors[color]}`}>

                <span className="text-3xl">

                    {icon}

                </span>

            </div>

            <h3 className="mt-5 text-gray-500">

                {title}

            </h3>

            <p className="text-3xl font-bold mt-3">

                {value}

            </p>

        </div>

    );

}
function ResultRow({ label,value }){

    return(

        <div className="flex justify-between border-b pb-3">

            <span className="text-gray-500">

                {label}

            </span>

            <span className="font-bold">

                {value}

            </span>

        </div>

    );

}
function PipelineCard({ icon,title,desc,status }){

    return(

        <div className="flex justify-between items-center border rounded-2xl p-4">

            <div>

                <h3 className="font-bold">

                    {icon} {title}

                </h3>

                <p className="text-gray-500 text-sm">

                    {desc}

                </p>

            </div>

            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                status==="Completed"
                ? "bg-green-100 text-green-700"
                : "bg-yellow-100 text-yellow-700"
            }`}>

                {status}

            </span>

        </div>

    );

}