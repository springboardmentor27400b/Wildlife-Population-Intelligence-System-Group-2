import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Trees,
  Mail,
  Lock,
  LogIn,
  ArrowRight,
} from "lucide-react";

import api from "../api";

function Login() {
  const navigate = useNavigate();

  const [user, setUser] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setUser({
      ...user,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const formData = new URLSearchParams();

      formData.append("username", user.email);
      formData.append("password", user.password);

      const response = await api.post(
          "/users/login",
          formData,
          {
              headers: {
                  "Content-Type":
                      "application/x-www-form-urlencoded"
              }
          }
      );

      localStorage.setItem("token", response.data.access_token);
      localStorage.setItem("full_name", response.data.full_name);
      localStorage.setItem("role", response.data.role);

      alert("Login Successful!");

      navigate("/dashboard");

    } catch (error) {

      console.error(error);

      if (error.response) {
        alert(error.response.data.detail);
      } else {
        alert("Unable to connect to the server.");
      }

    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-950 via-green-800 to-green-600 flex items-center justify-center p-6">

      <div className="grid lg:grid-cols-2 bg-white/10 backdrop-blur-xl rounded-3xl overflow-hidden shadow-2xl max-w-6xl w-full">

        {/* Left Side */}

        <div className="hidden lg:flex flex-col justify-center items-center p-12 text-white bg-green-900/40">

          <div className="bg-green-500 p-6 rounded-full mb-8">

            <Trees size={90} />

          </div>

          <h1 className="text-5xl font-bold text-center">

            Wildlife AI

          </h1>

          <p className="mt-6 text-lg text-center text-green-100 leading-8">

            Wildlife Population Intelligence System

            <br />

            Secure • Intelligent • Reliable

          </p>

        </div>

        {/* Right Side */}

        <div className="bg-white p-10 lg:p-14">

          <h2 className="text-4xl font-bold text-slate-800">

            Welcome Back 👋

          </h2>

          <p className="text-gray-500 mt-2 mb-8">

            Login to continue your wildlife management system.

          </p>

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Email */}

            <div>

              <label className="font-semibold text-slate-700">

                Email

              </label>

              <div className="relative mt-2">

                <Mail
                  size={20}
                  className="absolute left-4 top-4 text-gray-400"
                />

                <input
                  type="email"
                  name="email"
                  value={user.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  required
                  className="w-full pl-12 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
                />

              </div>

            </div>

            {/* Password */}

            <div>

              <label className="font-semibold text-slate-700">

                Password

              </label>

              <div className="relative mt-2">

                <Lock
                  size={20}
                  className="absolute left-4 top-4 text-gray-400"
                />

                <input
                  type="password"
                  name="password"
                  value={user.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  required
                  className="w-full pl-12 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
                />

              </div>

            </div>

            {/* Login Button */}

            <button
              type="submit"
              className="w-full bg-green-700 hover:bg-green-800 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition duration-300 hover:scale-[1.02]"
            >

              <LogIn size={20} />

              Login

            </button>

          </form>

          {/* Register */}

          <div className="mt-8 text-center">

            <p className="text-gray-600">

              Don't have an account?

            </p>

            <Link
              to="/register"
              className="inline-flex items-center gap-2 mt-3 text-green-700 font-bold hover:text-green-900"
            >

              Create Account

              <ArrowRight size={18} />

            </Link>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Login;