import { Link } from "react-router-dom";
import {
  Trees,
  ClipboardList,
  MapPinned,
  PawPrint,
  ShieldCheck,
  BrainCircuit,
  ArrowRight,
  LogIn,
  UserPlus,
} from "lucide-react";

function Home() {
  const features = [
    {
      title: "Survey Management",
      icon: <ClipboardList size={36} />,
      description:
        "Create and manage wildlife surveys across protected forest regions.",
    },
    {
      title: "Monitoring",
      icon: <MapPinned size={36} />,
      description:
        "Monitor wildlife habitats and conservation zones efficiently.",
    },
    {
      title: "Wildlife Observation",
      icon: <PawPrint size={36} />,
      description:
        "Record wildlife sightings and maintain observation history.",
    },
    {
      title: "Secure Access",
      icon: <ShieldCheck size={36} />,
      description:
        "Role-based authentication for administrators and researchers.",
    },
    {
      title: "AI Ready",
      icon: <BrainCircuit size={36} />,
      description:
        "Prepared for future AI-powered wildlife prediction modules.",
    },
    {
      title: "Forest Intelligence",
      icon: <Trees size={36} />,
      description:
        "Centralized platform for wildlife conservation management.",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-100">

      {/* Navbar */}

      <nav className="bg-green-900 text-white shadow-lg">

        <div className="max-w-7xl mx-auto flex justify-between items-center px-8 py-5">

          <div className="flex items-center gap-3">

            <div className="bg-green-600 p-3 rounded-xl">

              <Trees size={30} />

            </div>

            <div>

              <h1 className="text-2xl font-bold">
                Wildlife AI
              </h1>

              <p className="text-sm text-green-300">
                Population Intelligence System
              </p>

            </div>

          </div>

          <div className="flex gap-4">

            <Link
              to="/login"
              className="flex items-center gap-2 bg-white text-green-800 px-5 py-2 rounded-xl font-semibold hover:bg-green-100 transition"
            >
              <LogIn size={18} />
              Login
            </Link>

            <Link
              to="/register"
              className="flex items-center gap-2 bg-green-600 px-5 py-2 rounded-xl font-semibold hover:bg-green-500 transition"
            >
              <UserPlus size={18} />
              Register
            </Link>

          </div>

        </div>

      </nav>

      {/* Hero Section */}

      <section className="bg-gradient-to-r from-green-900 via-green-800 to-green-700 text-white">

        <div className="max-w-7xl mx-auto px-8 py-24 grid lg:grid-cols-2 gap-16 items-center">

          <div>

            <h1 className="text-6xl font-extrabold leading-tight">

              Wildlife Population

              <span className="block text-green-300">
                Intelligence System
              </span>

            </h1>

            <p className="mt-8 text-lg text-green-100 leading-8">

              An intelligent digital platform for wildlife conservation,
              biodiversity monitoring, ecological surveys, and forest
              management.

            </p>

            <div className="mt-10 flex gap-5">

              <Link
                to="/register"
                className="flex items-center gap-2 bg-white text-green-900 px-7 py-4 rounded-xl font-bold hover:scale-105 transition"
              >
                Get Started
                <ArrowRight size={18} />
              </Link>

              <Link
                to="/login"
                className="border-2 border-white px-7 py-4 rounded-xl font-semibold hover:bg-white hover:text-green-900 transition"
              >
                Login
              </Link>

            </div>

          </div>

          <div className="flex justify-center">

            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-10 shadow-2xl">

              <Trees size={180} className="text-green-300 mx-auto" />

              <h2 className="text-3xl font-bold text-center mt-6">

                AI Powered Wildlife Monitoring

              </h2>

              <p className="text-center mt-4 text-green-100">

                Survey • Monitoring • Observation • Analytics

              </p>

            </div>

          </div>

        </div>

      </section>

      {/* Features */}

      <section className="max-w-7xl mx-auto px-8 py-20">

        <div className="text-center mb-14">

          <h2 className="text-4xl font-bold text-slate-800">

            Platform Features

          </h2>

          <p className="text-gray-600 mt-3">

            Everything required for wildlife conservation in one platform.

          </p>

        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">

          {features.map((feature, index) => (

            <div
              key={index}
              className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300"
            >

              <div className="bg-green-100 text-green-700 w-fit p-4 rounded-xl mb-6">

                {feature.icon}

              </div>

              <h3 className="text-2xl font-bold mb-3">

                {feature.title}

              </h3>

              <p className="text-gray-600 leading-7">

                {feature.description}

              </p>

            </div>

          ))}

        </div>

      </section>

      {/* Footer */}

      <footer className="bg-green-900 text-white mt-20">

        <div className="max-w-7xl mx-auto py-10 px-8 flex flex-col md:flex-row justify-between items-center">

          <div>

            <h2 className="font-bold text-xl">
              Wildlife Population Intelligence System
            </h2>

            <p className="text-green-300 mt-2">
              Protecting biodiversity through intelligent technology.
            </p>

          </div>

          <p className="mt-5 md:mt-0 text-green-300">

            © 2026 Wildlife AI. All Rights Reserved.

          </p>

        </div>

      </footer>

    </div>
  );
}

export default Home;