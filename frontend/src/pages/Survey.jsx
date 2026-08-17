import { useState,useEffect} from "react";
import {
  ClipboardList,
  MapPinned,
  CalendarDays,
  User,
  FileText,
  Trees,
  PlusCircle,
  Pencil,
  Trash2,
  Search,
} from "lucide-react";

import api from "../api";
import Layout from "../components/Layout";

function Survey() {
  const [survey, setSurvey] = useState({
    surveyName: "",
    location: "",
    surveyDate: "",
    surveyLeader: "",
    description: "",
  });
  const [surveys, setSurveys] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  useEffect(() => {
  fetchSurveys();
  }, []);
  const handleChange = (e) => {
    setSurvey({
      ...survey,
      [e.target.name]: e.target.value,
    });
  };
  const fetchSurveys = async () => {
    try {
      const response = await api.get("/surveys/");
      setSurveys(response.data);
    }
    catch (error) {
      console.log(error);
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    const surveyData = {
      survey_name: survey.surveyName,
      location: survey.location,
      survey_date: survey.surveyDate,
      survey_leader: survey.surveyLeader,
      description: survey.description,
    };

    try {
      if (editingId) {

        await api.put(`/surveys/${editingId}`, surveyData);

        alert("Survey updated successfully!");

      }

      else {

        await api.post("/surveys/", surveyData);
        alert("Survey created successfully!");

      }
      fetchSurveys();
      setEditingId(null);

      setSurvey({
        surveyName: "",
        location: "",
        surveyDate: "",
        surveyLeader: "",
        description: "",
      });
    } catch (error) {
      console.log(error.response?.data);
      alert("Failed to save survey.");
    }
  };
  const handleEdit = (item) => {

    setSurvey({
      surveyName: item.survey_name,
      location: item.location,
      surveyDate: item.survey_date,
      surveyLeader: item.survey_leader,
      description: item.description,

    });
    setEditingId(item.id);
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this survey?"))
      return;
    try {
      await api.delete(`/surveys/${id}`);
      fetchSurveys();
    }
    catch (error) {
      console.log(error);
    }
  };
  return (
    <Layout>
      {/* Page Header */}

      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-800">
          Survey Management
        </h1>

        <p className="text-gray-500 mt-2">
          Create and manage wildlife ecological surveys.
        </p>
      </div>

      {/* Form Card */}

      <div className="bg-white rounded-2xl shadow-lg p-8">

        <div className="flex items-center gap-3 mb-8">

          <div className="bg-green-100 p-3 rounded-xl">

            <Trees className="text-green-700" size={28} />

          </div>

          <div>

            <h2 className="text-2xl font-bold">
              Create New Survey
            </h2>

            <p className="text-gray-500">
              Enter survey information below.
            </p>

          </div>

        </div>

        <form onSubmit={handleSubmit}>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Survey Name */}

            <div>

              <label className="font-medium mb-2 block">
                Survey Name
              </label>

              <div className="relative">

                <ClipboardList
                  className="absolute left-3 top-3 text-gray-400"
                  size={20}
                />

                <input
                  type="text"
                  name="surveyName"
                  value={survey.surveyName}
                  onChange={handleChange}
                  placeholder="Wildlife Population Survey"
                  required
                  className="w-full pl-11 border rounded-xl p-3 focus:ring-2 focus:ring-green-500 outline-none"
                />

              </div>

            </div>

            {/* Date */}

            <div>

              <label className="font-medium mb-2 block">
                Survey Date
              </label>

              <div className="relative">

                <CalendarDays
                  className="absolute left-3 top-3 text-gray-400"
                  size={20}
                />

                <input
                  type="date"
                  name="surveyDate"
                  value={survey.surveyDate}
                  onChange={handleChange}
                  required
                  className="w-full pl-11 border rounded-xl p-3 focus:ring-2 focus:ring-green-500 outline-none"
                />

              </div>

            </div>

            {/* Location */}

            <div>

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
                  value={survey.location}
                  onChange={handleChange}
                  placeholder="Forest Location"
                  required
                  className="w-full pl-11 border rounded-xl p-3 focus:ring-2 focus:ring-green-500 outline-none"
                />

              </div>

            </div>

            {/* Survey Leader */}

            <div>

              <label className="font-medium mb-2 block">
                Survey Leader
              </label>

              <div className="relative">

                <User
                  className="absolute left-3 top-3 text-gray-400"
                  size={20}
                />

                <input
                  type="text"
                  name="surveyLeader"
                  value={survey.surveyLeader}
                  onChange={handleChange}
                  placeholder="Officer Name"
                  required
                  className="w-full pl-11 border rounded-xl p-3 focus:ring-2 focus:ring-green-500 outline-none"
                />

              </div>

            </div>

          </div>

          {/* Description */}

          <div className="mt-6">

            <label className="font-medium mb-2 block">
              Description
            </label>

            <div className="relative">

              <FileText
                className="absolute left-3 top-3 text-gray-400"
                size={20}
              />

              <textarea
                name="description"
                rows="5"
                value={survey.description}
                onChange={handleChange}
                placeholder="Enter survey objectives, observations and notes..."
                className="w-full pl-11 pt-3 border rounded-xl p-3 focus:ring-2 focus:ring-green-500 outline-none"
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
              {editingId ? "Update Survey" : "Create Survey"}
            </button>

          </div>

        </form>

      </div>

      {/* Placeholder for future survey list */}

      {/* Survey Records */}

      <div className="bg-white rounded-2xl shadow-lg p-8 mt-10">

        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold">
              Existing Surveys
            </h2>
            <p className="text-gray-500 mt-1">
              Total Records : {surveys.length}
            </p>
          </div>

          <div className="relative w-72">

            <Search
              className="absolute left-3 top-3 text-gray-400"
              size={18}
            />

            <input
              type="text"
              placeholder="Search survey..."
              value={search}
              onChange={(e)=>setSearch(e.target.value)}
              className="w-full pl-10 border rounded-xl p-3"
            />

          </div>

        </div>

        <div className="overflow-x-auto">

          <table className="w-full">

            <thead>

              <tr className="bg-green-100">

                <th className="p-4 text-left">#</th>
                <th className="p-4 text-left">Survey</th>
                <th className="p-4 text-left">Location</th>
                <th className="p-4 text-left">Date</th>
                <th className="p-4 text-left">Leader</th>
                <th className="p-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>

            {
              surveys
              .filter((item)=>

                item.survey_name
                .toLowerCase()
                .includes(search.toLowerCase())

              )
              .map((item,index)=>(

                <tr
                  key={item.id}
                  className="border-b hover:bg-green-50 transition duration-200"
                >
                  <td className="p-4 font-semibold text-gray-600">
                    {index + 1}
                  </td>
                  <td className="p-4">
                    {item.survey_name}
                  </td>

                  <td className="p-4">

                    {item.location}

                  </td>

                  <td className="p-4">

                    {new Date(item.survey_date).toLocaleDateString()}

                  </td>

                  <td className="p-4">

                    {item.survey_leader}

                  </td>

                  <td className="p-4">

                    <div className="flex items-centergap-3">

                      <button
                        title="Edit Survey"
                        onClick={() => handleEdit(item)}
                        className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-lg transition"
                      >
                        <Pencil size={18} />
                      </button>
                      <button
                        title="Delete Survey"
                        onClick={() => handleDelete(item.id)}
                        className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg transition"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>

                  </td>

                </tr>

              ))
            }

            {
              surveys.length===0 &&

              <tr>

                <td
                  colSpan="5"
                  className="text-center py-10 text-gray-500"
                >

                  No surveys available. Create your first wildlife survey.

                </td>

              </tr>

            }

            </tbody>

          </table>

        </div>

      </div>
    </Layout>
  );
}

export default Survey;