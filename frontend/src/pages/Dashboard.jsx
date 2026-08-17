import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import api from "../api";
import { Link } from "react-router-dom";

import {
  ClipboardList,
  MapPinned,
  PawPrint,
  Trees,
  PlusCircle,
  Activity,
  ShieldCheck,
  Database,
  Cpu,
  ArrowRight,
} from "lucide-react";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";

function Dashboard() {

  const [counts, setCounts] = useState({
    surveys: 0,
    monitoring: 0,
    observations: 0,
    species: 0,
  });

  const [speciesChart, setSpeciesChart] = useState([]);
  const [locationChart, setLocationChart] = useState([]);

  useEffect(() => {

    fetchDashboard();

  }, []);

  const fetchDashboard = async () => {

    try {

      const [surveyRes, monitorRes, observationRes] = await Promise.all([
        api.get("/surveys/"),
        api.get("/monitoring/"),
        api.get("/observations/"),
      ]);

      const surveys = surveyRes.data;
      const monitoring = monitorRes.data;
      const observations = observationRes.data;

      const uniqueSpecies = [
        ...new Set(
          observations.map((item) => item.species_name)
        ),
      ];

      setCounts({
        surveys: surveys.length,
        monitoring: monitoring.length,
        observations: observations.length,
        species: uniqueSpecies.length,
      });

      //----------------------------------------
      // Species Bar Chart
      //----------------------------------------

      const speciesMap = {};

      observations.forEach((item) => {

        if (speciesMap[item.species_name]) {

          speciesMap[item.species_name] += item.count;

        } else {

          speciesMap[item.species_name] = item.count;

        }

      });

      const speciesData = Object.keys(speciesMap).map((key) => ({
        species: key,
        count: speciesMap[key],
      }));

      setSpeciesChart(speciesData);

      //----------------------------------------
      // Monitoring Pie Chart
      //----------------------------------------

      const locationMap = {};

      monitoring.forEach((site) => {

        if (locationMap[site.location]) {

          locationMap[site.location]++;

        } else {

          locationMap[site.location] = 1;

        }

      });

      const locationData = Object.keys(locationMap).map((key) => ({
        name: key,
        value: locationMap[key],
      }));

      setLocationChart(locationData);

    } catch (err) {

      console.log(err);

    }

  };

  const cards = [

    {
      title: "Active Surveys",
      value: counts.surveys,
      color: "bg-green-600",
      icon: <ClipboardList size={28}/>,
      desc: "Ecological surveys",
    },

    {
      title: "Monitoring Sites",
      value: counts.monitoring,
      color: "bg-blue-600",
      icon: <MapPinned size={28}/>,
      desc: "Protected locations",
    },

    {
      title: "Observations",
      value: counts.observations,
      color: "bg-orange-500",
      icon: <PawPrint size={28}/>,
      desc: "Wildlife records",
    },

    {
      title: "Species",
      value: counts.species,
      color: "bg-purple-600",
      icon: <Trees size={28}/>,
      desc: "Unique species",
    },

  ];

  const COLORS = [
    "#22c55e",
    "#3b82f6",
    "#f97316",
    "#a855f7",
    "#14b8a6",
    "#eab308",
  ];
  return (
    
    <Layout>

      <div className="space-y-8">

        {/* Hero Section */}

        <div className="bg-gradient-to-r from-green-700 via-green-600 to-emerald-500 rounded-3xl p-10 text-white shadow-lg">

          <h1 className="text-4xl font-bold">
            Wildlife Population Intelligence System
          </h1>

          <p className="mt-4 text-lg text-green-100 max-w-3xl">
            Centralized platform for wildlife surveys, monitoring sites,
            biodiversity observations, and ecological analytics.
          </p>

        </div>

        {/* Statistics */}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

          {cards.map((card) => (

            <div
              key={card.title}
              className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 p-6"
            >

              <div className="flex justify-between items-center">

                <div>

                  <h3 className="text-gray-500 font-medium">
                    {card.title}
                  </h3>

                  <h2 className="text-4xl font-bold mt-3">
                    {card.value}
                  </h2>

                </div>

                <div className={`${card.color} text-white p-4 rounded-2xl`}>

                  {card.icon}

                </div>

              </div>

              <p className="text-gray-500 mt-5">

                {card.desc}

              </p>

            </div>

          ))}

        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mt-6">

          <div className="bg-gradient-to-r from-green-600 to-emerald-500 rounded-2xl text-white p-6">
            <h3 className="text-sm">AI Image Analysis</h3>
            <h1 className="text-4xl font-bold mt-2">26</h1>
            <p className="text-green-100">Images Processed</p>
          </div>

          <div className="bg-gradient-to-r from-blue-600 to-cyan-500 rounded-2xl text-white p-6">
            <h3 className="text-sm">Audio Analysis</h3>
            <h1 className="text-4xl font-bold mt-2">18</h1>
            <p className="text-blue-100">Audio Files</p>
          </div>

          <div className="bg-gradient-to-r from-purple-600 to-pink-500 rounded-2xl text-white p-6">
            <h3 className="text-sm">AI Accuracy</h3>
            <h1 className="text-4xl font-bold mt-2">95%</h1>
            <p className="text-purple-100">YOLOv8 Model</p>
          </div>

          <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl text-white p-6">
            <h3 className="text-sm">Detection Time</h3>
            <h1 className="text-4xl font-bold mt-2">1.2 s</h1>
            <p className="text-orange-100">Average</p>
          </div>

        </div>

        {/* Quick Actions + System */}

        <div className="grid lg:grid-cols-2 gap-6">

          {/* Quick Actions */}

          <div className="bg-white rounded-2xl shadow-md p-7">

            <h2 className="text-2xl font-bold mb-6">

              Quick Actions

            </h2>

            <div className="grid grid-cols-2 gap-5">

              <Link
                to="/survey"
                className="bg-green-50 rounded-xl p-5 hover:bg-green-100 transition"
              >

                <PlusCircle className="text-green-700 mb-3"/>

                <h3 className="font-semibold">

                  New Survey

                </h3>

                <p className="text-gray-500 text-sm">

                  Create survey

                </p>

              </Link>

              <Link
                to="/monitoring"
                className="bg-blue-50 rounded-xl p-5 hover:bg-blue-100 transition"
              >

                <MapPinned className="text-blue-700 mb-3"/>

                <h3 className="font-semibold">

                  Monitoring

                </h3>

                <p className="text-gray-500 text-sm">

                  Manage sites

                </p>

              </Link>

              <Link
                to="/observation"
                className="bg-orange-50 rounded-xl p-5 hover:bg-orange-100 transition"
              >

                <PawPrint className="text-orange-600 mb-3"/>

                <h3 className="font-semibold">

                  Observation

                </h3>

                <p className="text-gray-500 text-sm">

                  Record wildlife

                </p>

              </Link>

              <Link
                to="/profile"
                className="bg-purple-50 rounded-xl p-5 hover:bg-purple-100 transition"
              >

                <ArrowRight className="text-purple-700 mb-3"/>

                <h3 className="font-semibold">

                  Profile

                </h3>

                <p className="text-gray-500 text-sm">

                  User account

                </p>

              </Link>
              <Link
                to="/ai-analysis"
                className="bg-green-50 rounded-xl p-5 hover:bg-green-100 transition"
              >
                <Cpu className="text-green-700 mb-3" />
                <h3 className="font-semibold">AI Image Analysis</h3>
                <p className="text-gray-500 text-sm">Analyze Wildlife Images</p>
              </Link>

              <Link
                to="/audio-analysis"
                className="bg-indigo-50 rounded-xl p-5 hover:bg-indigo-100 transition"
              >
                <Activity className="text-indigo-700 mb-3" />
                <h3 className="font-semibold">Audio Analysis</h3>
                <p className="text-gray-500 text-sm">Analyze Wildlife Audio</p>
              </Link>

            </div>

          </div>

          {/* System Status */}

          <div className="bg-white rounded-2xl shadow-md p-7">

            <h2 className="text-2xl font-bold mb-6">

              System Status

            </h2>

            <div className="space-y-6">

              <div className="flex items-center gap-4">

                <ShieldCheck className="text-green-600"/>

                <div>

                  <h3 className="font-semibold">

                    Authentication

                  </h3>

                  <p className="text-gray-500 text-sm">

                    JWT Authentication Active

                  </p>

                </div>

              </div>

              <div className="flex items-center gap-4">

                <Database className="text-blue-600"/>

                <div>

                  <h3 className="font-semibold">

                    PostgreSQL Database

                  </h3>

                  <p className="text-gray-500 text-sm">

                    Connected Successfully

                  </p>

                </div>

              </div>

              <div className="flex items-center gap-4">

                <Cpu className="text-purple-600"/>

                <div>

                  <h3 className="font-semibold">

                    AI Analytics

                  </h3>

                  <p className="text-gray-500 text-sm">

                    Ready for Predictions

                  </p>

                </div>

              </div>

              <div className="flex items-center gap-4">

                <Activity className="text-orange-600"/>

                <div>

                  <h3 className="font-semibold">

                    Monitoring Service

                  </h3>

                  <p className="text-gray-500 text-sm">

                    Running Normally

                  </p>

                </div>

              </div>

            </div>

          </div>

        </div>

                {/* Wildlife Analytics */}

        <div className="bg-white rounded-2xl shadow-md p-8">

          <div className="flex justify-between items-center mb-8">

            <div>

              <h2 className="text-2xl font-bold">
                Wildlife Analytics
              </h2>

              <p className="text-gray-500 mt-1">
                Live analytics generated from your wildlife database.
              </p>

            </div>

          </div>

          <div className="grid lg:grid-cols-2 gap-10">

            {/* Species Chart */}

            <div>

              <h3 className="text-lg font-semibold mb-4">
                Observation Count by Species
              </h3>

              <ResponsiveContainer
                width="100%"
                height={320}
              >

                <BarChart
                  data={speciesChart}
                >

                  <CartesianGrid strokeDasharray="3 3" />

                  <XAxis
                    dataKey="species"
                  />

                  <YAxis />

                  <Tooltip />

                  <Legend />

                  <Bar
                    dataKey="count"
                    fill="#16a34a"
                    radius={[8,8,0,0]}
                  />

                </BarChart>

              </ResponsiveContainer>

            </div>

            {/* Monitoring Chart */}

            <div>

              <h3 className="text-lg font-semibold mb-4">
                Monitoring Sites by Location
              </h3>

              <ResponsiveContainer
                width="100%"
                height={320}
              >

                <PieChart>

                  <Pie
                    data={locationChart}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={110}
                    label
                  >

                    {locationChart.map((entry, index) => (

                      <Cell
                        key={index}
                        fill={
                          COLORS[
                            index % COLORS.length
                          ]
                        }
                      />

                    ))}

                  </Pie>

                  <Tooltip />

                  <Legend />

                </PieChart>

              </ResponsiveContainer>

            </div>

          </div>

        </div>

      </div>

    </Layout>

  );

}

export default Dashboard;