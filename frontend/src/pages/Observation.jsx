import { useState, useEffect } from "react";

import {
  PawPrint,
  CalendarDays,
  MapPinned,
  User,
  Hash,
  PlusCircle,
  Pencil,
  Trash2,
  Search,
}from "lucide-react";

import api from "../api";
import Layout from "../components/Layout";
import { useNavigate } from "react-router-dom";



function Observation() {
  const [observation, setObservation] = useState({
    speciesName: "",
    observationDate: "",
    location: "",
    observerName: "",
    count: "",
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedAudio, setSelectedAudio] = useState(null);
  const [observations, setObservations] = useState([]);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);
  const navigate = useNavigate();

  const [savedObservationId, setSavedObservationId] = useState(null);
  const handleChange = (e) => {
    setObservation({
      ...observation,
      [e.target.name]: e.target.value,
    });
  };
  const fetchObservations = async () => {
    try {
      const response = await api.get("/observations/");
      setObservations(response.data);
    } catch (error) {
      console.log(error);
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();

    formData.append("species_name", observation.speciesName);
    formData.append("observation_date", observation.observationDate);
    formData.append("location", observation.location);
    formData.append("observer_name", observation.observerName);
    formData.append("count", observation.count);

    if (selectedImage) {
      formData.append("image", selectedImage);
    }

    if (selectedAudio) {
      formData.append("audio", selectedAudio);
    }

    try {
      const response = await api.post("/observations/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setSavedObservationId(response.data.id);
      fetchObservations();
      alert("Observation recorded successfully!");
      

      setObservation({
        speciesName: "",
        observationDate: "",
        location: "",
        observerName: "",
        count: "",
      });

      setSelectedImage(null);
      setSelectedAudio(null);

    } catch (error) {
      console.log(error.response?.data);
      alert("Failed to record observation.");
    }
  };
  useEffect(() => {
    fetchObservations();
  }, []);
  return (
    <Layout>

      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-800">
          Wildlife Observation
        </h1>

        <p className="text-gray-500 mt-2">
          Record wildlife sightings and population observations.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-8">

        <div className="flex items-center gap-3 mb-8">

          <div className="bg-green-100 p-3 rounded-xl">
            <PawPrint className="text-green-700" size={28} />
          </div>

          <div>
            <h2 className="text-2xl font-bold">
              Record Observation
            </h2>

            <p className="text-gray-500">
              Add wildlife observation details.
            </p>
          </div>

        </div>

        <form onSubmit={handleSubmit}>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            <div>
              <label className="font-medium mb-2 block">
                Species Name
              </label>

              <div className="relative">
                <PawPrint className="absolute left-3 top-3 text-gray-400" size={20} />

                <input
                  type="text"
                  name="speciesName"
                  value={observation.speciesName}
                  onChange={handleChange}
                  placeholder="Elephant"
                  required
                  className="w-full pl-11 border rounded-xl p-3 focus:ring-2 focus:ring-green-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="font-medium mb-2 block">
                Observation Date
              </label>

              <div className="relative">
                <CalendarDays className="absolute left-3 top-3 text-gray-400" size={20} />

                <input
                  type="date"
                  name="observationDate"
                  value={observation.observationDate}
                  onChange={handleChange}
                  required
                  className="w-full pl-11 border rounded-xl p-3 focus:ring-2 focus:ring-green-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="font-medium mb-2 block">
                Location
              </label>

              <div className="relative">
                <MapPinned className="absolute left-3 top-3 text-gray-400" size={20} />

                <input
                  type="text"
                  name="location"
                  value={observation.location}
                  onChange={handleChange}
                  placeholder="Forest Zone"
                  required
                  className="w-full pl-11 border rounded-xl p-3 focus:ring-2 focus:ring-green-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="font-medium mb-2 block">
                Observer Name
              </label>

              <div className="relative">
                <User className="absolute left-3 top-3 text-gray-400" size={20} />

                <input
                  type="text"
                  name="observerName"
                  value={observation.observerName}
                  onChange={handleChange}
                  placeholder="Officer Name"
                  required
                  className="w-full pl-11 border rounded-xl p-3 focus:ring-2 focus:ring-green-500 outline-none"
                />
              </div>
            </div>

          </div>

          <div className="mt-6">

            <label className="font-medium mb-2 block">
              Animal Count
            </label>

            <div className="relative">

              <Hash className="absolute left-3 top-3 text-gray-400" size={20} />

              <input
                type="number"
                name="count"
                value={observation.count}
                onChange={handleChange}
                placeholder="25"
                required
                className="w-full pl-11 border rounded-xl p-3 focus:ring-2 focus:ring-green-500 outline-none"
              />

            </div>

          </div>
          {/* Evidence Upload */}

          <div className="mt-6">

            <h3 className="text-lg font-semibold mb-4">
              Upload Wildlife Evidence
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Image Upload */}

              <div>

                <label className="block font-medium mb-2">
                  Animal Image
                </label>

                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setSelectedImage(e.target.files[0])}
                  className="w-full border rounded-xl p-3 cursor-pointer"
                />
                {selectedImage && (
                  <img
                    src={URL.createObjectURL(selectedImage)}
                    alt="Preview"
                    className="mt-3 h-32 rounded-xl border object-cover"
                  />
                )}
                <p className="text-xs text-gray-500 mt-2">
                  Upload animal photograph (.jpg, .png)
                </p>

              </div>

              {/* Audio Upload */}

              <div>

                <label className="block font-medium mb-2">
                  Animal Audio
                </label>

                <input
                  type="file"
                  accept="audio/*"
                  onChange={(e) => setSelectedAudio(e.target.files[0])}
                  className="w-full border rounded-xl p-3 cursor-pointer"
                />
                 {selectedAudio && (
                  <p className="mt-2 text-sm text-green-700">
                    Selected: {selectedAudio.name}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-2">
                  Upload bird calls or wildlife sounds (.mp3, .wav)
                </p>

              </div>

            </div>

          </div>

          <div className="mt-8 flex gap-4">

            <button
                type="submit"
                className="flex items-center gap-2 bg-green-700 hover:bg-green-800 text-white px-8 py-3 rounded-xl transition"
            >
                <PlusCircle size={20} />
                Save Observation
            </button>

            {savedObservationId && (
                <button
                    type="button"
                    onClick={() => navigate(`/ai-analysis/${savedObservationId}`)}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl transition"
                >
                    🧠 Analyze with AI
                </button>
            )}

        </div>

        </form>

      </div>

      <div className="bg-white rounded-2xl shadow-lg p-8 mt-10">

        <div className="flex justify-between items-center mb-6">

          <h2 className="text-2xl font-bold">
            Recent Observations
          </h2>

          <span className="bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-medium">
            Latest Records
          </span>

        </div>

        <div className="overflow-x-auto">

          <table className="w-full">

            <thead>
              <tr className="border-b bg-green-50">
                <th className="text-left py-3">Species</th>
                <th className="text-left py-3">Location</th>
                <th className="text-left py-3">Observer</th>
                <th className="text-left py-3">Count</th>
                <th className="text-left py-3">Image</th>
                <th className="text-left py-3">Audio</th>
                <th className="text-left py-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {observations.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-10 text-gray-500">
                    No observations found.
                  </td>
                </tr>
              ) : (
                observations.map((item) => (
                  <tr key={item.id} className="border-b hover:bg-gray-50">

                    <td className="py-4">{item.species_name}</td>

                    <td>{item.location}</td>

                    <td>{item.observer_name}</td>

                    <td>{item.count}</td>

                    <td>
                      {item.image_path ? (
                        <img
                          src={`http://127.0.0.1:8000/${item.image_path}`}
                          alt="Animal"
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                      ) : (
                        "-"
                      )}
                    </td>

                    <td>
                      {item.audio_path ? (
                        <audio controls className="w-40">
                          <source
                            src={`http://127.0.0.1:8000/${item.audio_path}`}
                          />
                        </audio>
                      ) : (
                        "-"
                      )}
                    </td>

                    <td>{item.observation_date}</td>

                  </tr>
                ))
              )}
            </tbody>

          </table>

        </div>

      </div>

    </Layout>
  );
}

export default Observation;