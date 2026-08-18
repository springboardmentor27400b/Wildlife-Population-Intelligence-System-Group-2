import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Eye,
  Radio,
  Layers,
  Shield,
  Workflow,
  ArrowRight,
  TrendingUp,
  Activity,
  Award,
  Users
} from 'lucide-react';

export default function Landing() {
  const { user } = useAuth();

  const features = [
    { title: 'Wildlife Detection', desc: 'Computer vision engine optimized to detect, track, and count species in field images.', icon: Eye },
    { title: 'Bioacoustic Recognition', desc: 'Acoustic monitoring processing audio recordings to identify calls, signals, and bird calls.', icon: Radio },
    { title: 'Habitat Intelligence', desc: 'Combine remote sensing and ground telemetry to map ecosystem vegetation types.', icon: Layers },
    { title: 'Population Analytics', desc: 'Statistically estimate population densities, dispersion rates, and tracking trends.', icon: TrendingUp },
    { title: 'Monitoring Sites', desc: 'Spatially register and locate field camera traps and research sectors.', icon: Activity },
    { title: 'Secure Research Platform', desc: 'Standardized and encrypted database platform for collaborative conservation.', icon: Shield }
  ];

  const intendedUsers = [
    { role: 'Wildlife Researchers', desc: 'Submit surveys, analyze bioacoustic/image files, and evaluate ecosystem population statistics.' },
    { role: 'Conservation Officers', desc: 'Receive real-time threat warnings and telemetry activity logs across protected area networks.' },
    { role: 'Forest Departments', desc: 'Track ecological inventory status, manage field cameras, and review geographic zones.' },
    { role: 'System Administrators', desc: 'Manage role assignments, device registrations, and secure database infrastructures.' }
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-black">

      {/* Sticky Header Navigation */}
      <header className="sticky top-0 bg-zinc-900/80 backdrop-blur-md border-b border-zinc-800/80 z-50 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-9 w-9 rounded-lg bg-emerald-600 flex items-center justify-center font-black text-white text-lg">W</div>
            <span className="font-extrabold text-emerald-500 tracking-tight">WildlifeIntel</span>
          </div>

          <nav className="hidden md:flex items-center space-x-8 text-sm font-semibold text-zinc-400">
            <a href="#about" className="hover:text-zinc-200 transition">About</a>
            <a href="#features" className="hover:text-zinc-200 transition">Features</a>
            <a href="#users" className="hover:text-zinc-200 transition">Intended Users</a>
            <a href="#workflow" className="hover:text-zinc-200 transition">Workflow</a>
          </nav>

          <div className="flex items-center space-x-4">
            {user ? (
              <Link
                to="/dashboard"
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition shadow-lg shadow-emerald-900/20"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" className="text-zinc-400 hover:text-zinc-200 text-sm font-semibold transition">
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition shadow-lg shadow-emerald-900/20"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden border-b border-zinc-900 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-emerald-950/20 via-zinc-950 to-zinc-950">
        {/* Decorative Grid backdrop */}
        <div className="absolute inset-0 bg-[radial-gradient(#18181b_1px,transparent_1px)] bg-size-[24px_24px] opacity-40 z-0"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center space-x-2 bg-emerald-950/50 border border-emerald-900/30 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider text-emerald-400">
              <Award size={14} />
              <span>Milestone 1 Platform Live</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-zinc-100 leading-none">
              AI Wildlife <br />
              <span className="bg-linear-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">Population Intelligence</span>
            </h1>
            <p className="text-lg text-zinc-400 leading-relaxed max-w-xl">
              An AI-powered wildlife monitoring and biodiversity intelligence platform designed for researchers, conservation organizations, and forest departments.
            </p>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
              {user ? (
                <Link
                  to="/dashboard"
                  className="flex items-center justify-center space-x-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-base transition shadow-xl shadow-emerald-900/30"
                >
                  <span>Go to Dashboard</span>
                  <ArrowRight size={18} />
                </Link>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="flex items-center justify-center space-x-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-base transition shadow-xl shadow-emerald-900/30"
                  >
                    <span>Get Started</span>
                    <ArrowRight size={18} />
                  </Link>
                  <Link
                    to="/login"
                    className="flex items-center justify-center px-6 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 font-bold text-base transition"
                  >
                    Sign In
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Hero Illustration Graphic Placeholder */}
          <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-3xl p-6 lg:p-8 h-[380px] flex flex-col justify-between backdrop-blur-xs relative overflow-hidden">
            <div className="absolute inset-0 bg-linear-to-br from-emerald-500/5 to-transparent"></div>
            <div className="flex justify-between items-center relative z-10">
              <span className="text-xs uppercase tracking-wider text-zinc-500 font-bold">Field Station Telemetry</span>
              <span className="h-2.5 w-2.5 bg-emerald-500 rounded-full animate-ping"></span>
            </div>

            <div className="space-y-4 my-auto relative z-10 text-center">
              <div className="h-16 w-16 bg-zinc-950 border border-zinc-850 rounded-2xl flex items-center justify-center mx-auto text-emerald-500 shadow-md">
                <Workflow size={32} />
              </div>
              <h3 className="font-bold text-zinc-300 text-lg">Integrated Monitoring Ecosystem</h3>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto leading-relaxed">
                Aggregating visual media streams, bioacoustic audio traps, and micro-climate readings from connected sensors.
              </p>
            </div>

            <div className="flex justify-between text-[10px] text-zinc-650 font-mono relative z-10 border-t border-zinc-800/40 pt-4">
              <span>LAT: -2.1523 / LNG: 34.6853</span>
              <span>SENSORS: ONLINE</span>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-zinc-950 border-b border-zinc-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <h2 className="text-xs uppercase tracking-widest text-emerald-500 font-extrabold">About the Platform</h2>
            <p className="text-2xl sm:text-3xl font-bold text-zinc-100 tracking-tight leading-snug">
              Standardizing wildlife monitoring with advanced analytical frameworks.
            </p>
            <p className="text-sm text-zinc-450 leading-relaxed">
              WildlifeIntel bridge the gap between field research and computational intelligence. By providing tools to schedule surveys, track sites, map telemetry devices, and manage test media uploads, we enable researchers and forest departments to run standardized audits and establish reliable baselines for biodiversity conservation.
            </p>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 bg-zinc-900/30 border-b border-zinc-900 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-2">
            <h2 className="text-xs uppercase tracking-widest text-emerald-500 font-extrabold">System Features</h2>
            <h3 className="text-2xl font-bold text-zinc-100">Milestone 1 Capabilities</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <div key={i} className="bg-zinc-900 border border-zinc-850 p-6 rounded-2xl space-y-4 hover:border-zinc-700/60 transition duration-200">
                  <div className="h-10 w-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-400">
                    <Icon size={20} />
                  </div>
                  <h4 className="font-bold text-zinc-200 text-base">{f.title}</h4>
                  <p className="text-xs text-zinc-450 leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Who Uses It */}
      <section id="users" className="py-20 bg-zinc-950 border-b border-zinc-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-2">
            <h2 className="text-xs uppercase tracking-widest text-emerald-500 font-extrabold flex items-center justify-center space-x-1.5">
              <Users size={14} />
              <span>Intended Users</span>
            </h2>
            <h3 className="text-2xl font-bold text-zinc-100">Designed for Collaborative Teams</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {intendedUsers.map((user, i) => (
              <div key={i} className="bg-zinc-900/40 border border-zinc-850 p-6 rounded-2xl flex flex-col justify-between">
                <div className="space-y-3">
                  <h4 className="font-bold text-emerald-400 text-sm">{user.role}</h4>
                  <p className="text-xs text-zinc-450 leading-relaxed">{user.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* System Workflow */}
      <section id="workflow" className="py-20 bg-zinc-900/30 border-b border-zinc-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-2">
            <h2 className="text-xs uppercase tracking-widest text-emerald-500 font-extrabold flex items-center justify-center space-x-1.5">
              <Workflow size={14} />
              <span>System Workflow</span>
            </h2>
            <h3 className="text-2xl font-bold text-zinc-100">Telemetry Data Progression</h3>
          </div>

          {/* Workflow Steps Line Graphic */}
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-6 text-center max-w-4xl mx-auto">

            <div className="bg-zinc-900 border border-zinc-850 p-4 rounded-xl space-y-2">
              <span className="text-[10px] font-bold text-zinc-650 block">01 / CAPTURE</span>
              <h5 className="font-bold text-zinc-200 text-xs">Image / Audio Capture</h5>
              <p className="text-[10px] text-zinc-500 leading-snug">Sensors register observations</p>
            </div>

            <div className="bg-zinc-900 border border-zinc-850 p-4 rounded-xl space-y-2 relative">
              <span className="text-[10px] font-bold text-zinc-650 block">02 / INGEST</span>
              <h5 className="font-bold text-zinc-200 text-xs">Upload Ingestion</h5>
              <p className="text-[10px] text-zinc-500 leading-snug">Media files saved to telemetry servers</p>
            </div>

            <div className="bg-zinc-900 border border-zinc-850 p-4 rounded-xl space-y-2 opacity-60">
              <span className="text-[10px] font-bold text-emerald-600 block">03 / AI ANALYSIS</span>
              <h5 className="font-bold text-zinc-400 text-xs">Acoustics & CV</h5>
              <p className="text-[10px] text-zinc-600 leading-snug">Detecting & identifying species patterns</p>
            </div>

            <div className="bg-zinc-900 border border-zinc-850 p-4 rounded-xl space-y-2 opacity-60">
              <span className="text-[10px] font-bold text-emerald-600 block">04 / MAPPING</span>
              <h5 className="font-bold text-zinc-400 text-xs">GIS Geospatial</h5>
              <p className="text-[10px] text-zinc-600 leading-snug">Plotting species movement and densities</p>
            </div>

            <div className="bg-zinc-900 border border-zinc-850 p-4 rounded-xl space-y-2 opacity-60">
              <span className="text-[10px] font-bold text-emerald-600 block">05 / PORTALS</span>
              <h5 className="font-bold text-zinc-400 text-xs">Dashboard Visuals</h5>
              <p className="text-[10px] text-zinc-600 leading-snug">Telemetry scoring & PDF logs generation</p>
            </div>

          </div>
          <div className="text-center">
            <span className="text-[10px] uppercase font-bold text-purple-400 bg-purple-950/50 border border-purple-900/30 px-3 py-1 rounded-full">
              Informational Only: Stage 3 to 5 AI processing will be enabled in later milestones.
            </span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-zinc-950 py-12 border-t border-zinc-900 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center space-x-3">
            <div className="h-7 w-7 rounded bg-emerald-600 flex items-center justify-center font-bold text-white text-sm">W</div>
            <span className="font-bold text-zinc-300 text-sm">WildlifeIntel Population Intelligence</span>
          </div>
          <div className="text-xs text-zinc-600 text-center md:text-right space-y-1">
            <p>&copy; {new Date().getFullYear()} WildlifeIntel. All Rights Reserved.</p>
            <p>Milestone 1 Version 1.0.0 | Collaborative Biodiversity Conservation</p>
          </div>
        </div>
      </footer>

    </div>
  );
}
