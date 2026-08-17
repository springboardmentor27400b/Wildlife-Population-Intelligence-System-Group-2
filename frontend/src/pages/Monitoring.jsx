import { useState } from "react";
import {
  Trees,
  MapPinned,
  Map,
  PlusCircle,
  Building2,
} from "lucide-react";

import api from "../api";
import Layout from "../components/Layout";

function Monitoring() {
  const [monitoring, setMonitoring] = useState({
    siteName: "",
    location: "",
    habitatType: "",
  });

  const handleChange = (e) => {
    setMonitoring({
      ...monitoring,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const monitoringData = {
      site_name: monitoring.siteName,
      location: monitoring.location,
      habitat_type: monitoring.habitatType,
    };

    try {
      await api.post("/monitoring/", monitoringData);

      alert("Monitoring Site Added Successfully!");

      setMonitoring({
        siteName: "",
        location: "",
        habitatType: "",
      });

    } catch (error) {
      console.log(error.response?.data);
      alert("Failed to add monitoring site.");
    }
  };

  return (
    <Layout>

      {/* Header */}

      <div className="mb-8">

        <h1 className="text-4xl font-bold text-slate-800">
          Wildlife Monitoring
        </h1>

        <p className="text-gray-500 mt-2">
          Manage wildlife monitoring sites across protected forest regions.
        </p>

      </div>

      {/* Form Card */}

      <div className="bg-white rounded-2xl shadow-lg p-8">

        <div className="flex items-center gap-3 mb-8">

          <div className="bg-green-100 p-3 rounded-xl">

            <Trees
              className="text-green-700"
              size={28}
            />

          </div>

          <div>

            <h2 className="text-2xl font-bold">
              Add Monitoring Site
            </h2>

            <p className="text-gray-500">
              Register a new wildlife monitoring location.
            </p>

          </div>

        </div>

        <form onSubmit={handleSubmit}>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Site Name */}

            <div>

              <label className="font-medium mb-2 block">
                Site Name
              </label>

              <div className="relative">

                <Building2
                  className="absolute left-3 top-3 text-gray-400"
                  size={20}
                />

                <input
                  type="text"
                  name="siteName"
                  value={monitoring.siteName}
                  onChange={handleChange}
                  placeholder="Monitoring Site"
                  required
                  className="w-full pl-11 border rounded-xl p-3 focus:ring-2 focus:ring-green-500 outline-none"
                />

              </div>

            </div>

            {/* Habitat */}

            <div>

              <label className="font-medium mb-2 block">
                Habitat Type
              </label>

              <div className="relative">

                <Trees
                  className="absolute left-3 top-3 text-gray-400"
                  size={20}
                />

                <input
                  type="text"
                  name="habitatType"
                  value={monitoring.habitatType}
                  onChange={handleChange}
                  placeholder="Grassland / Wetland / Forest"
                  required
                  className="w-full pl-11 border rounded-xl p-3 focus:ring-2 focus:ring-green-500 outline-none"
                />

              </div>

            </div>

          </div>

          {/* Location */}

          <div className="mt-6">

            <label className="font-medium mb-2 block">
              Location
            </label>

            <div className="relative">

              <MapPinned
                className="absolute left-3 top-3 text-gray-400"
                size={20}
              />

              <input
                type="text"
                name="location"
                value={monitoring.location}
                onChange={handleChange}
                placeholder="Forest Division / GPS Location"
                required
                className="w-full pl-11 border rounded-xl p-3 focus:ring-2 focus:ring-green-500 outline-none"
              />

            </div>

          </div>

          {/* Button */}

          <div className="mt-8">

            <button
              type="submit"
              className="flex items-center gap-2 bg-green-700 hover:bg-green-800 text-white px-8 py-3 rounded-xl transition"
            >

              <PlusCircle size={20} />

              Add Monitoring Site

            </button>

          </div>

        </form>

      </div>

      {/* Existing Sites */}

      <div className="bg-white rounded-2xl shadow-lg p-8 mt-10">

        <div className="flex justify-between items-center mb-6">

          <h2 className="text-2xl font-bold">
            Existing Monitoring Sites
          </h2>

          <span className="bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-medium">
            Active Sites
          </span>

        </div>

        <div className="overflow-x-auto">

          <table className="w-full">

            <thead>

              <tr className="border-b">

                <th className="text-left py-3">Site Name</th>

                <th className="text-left py-3">Location</th>

                <th className="text-left py-3">Habitat</th>

                <th className="text-left py-3">Status</th>

              </tr>

            </thead>

            <tbody>

              <tr>

                <td
                  colSpan="4"
                  className="text-center py-10 text-gray-500"
                >
                   Monitoring records will be displayed here after retrieval from the database.
                </td>

              </tr>

            </tbody>

          </table>

        </div>

      </div>

    </Layout>
  );
}

export default Monitoring;