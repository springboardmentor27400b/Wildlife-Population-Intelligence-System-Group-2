import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Trees,
  User,
  Mail,
  Lock,
  Shield,
  UserPlus,
  ArrowRight,
} from "lucide-react";

import api from "../api";

function Register() {
  const navigate = useNavigate();

  const [user, setUser] = useState({
    full_name: "",
    email: "",
    password: "",
    role: "Researcher",
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
      await api.post("/users/register", user);

      alert("Registration Successful!");

      navigate("/login");
    } catch (error) {
      console.error(error);
      console.log(error.response?.data);
      alert(JSON.stringify(error.response?.data));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-950 via-green-800 to-green-600 flex items-center justify-center p-6">

      <div className="grid lg:grid-cols-2 bg-white/10 backdrop-blur-xl rounded-3xl overflow-hidden shadow-2xl max-w-6xl w-full">

        {/* Left Section */}

        <div className="hidden lg:flex flex-col justify-center items-center bg-green-900/40 text-white p-12">

          <div className="bg-green-500 p-6 rounded-full mb-8">

            <Trees size={90} />

          </div>

          <h1 className="text-5xl font-bold text-center">

            Wildlife AI

          </h1>

          <p className="mt-6 text-lg text-center text-green-100 leading-8">

            Wildlife Population Intelligence System

            <br />

            Join the digital wildlife conservation platform.

          </p>

        </div>

        {/* Right Section */}

        <div className="bg-white p-10 lg:p-14">

          <h2 className="text-4xl font-bold text-slate-800">

            Create Account

          </h2>

          <p className="text-gray-500 mt-2 mb-8">

            Register to access the Wildlife Intelligence System.

          </p>

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Full Name */}

            <div>

              <label className="font-semibold text-slate-700">

                Full Name

              </label>

              <div className="relative mt-2">

                <User
                  size={20}
                  className="absolute left-4 top-4 text-gray-400"
                />

                <input
                  type="text"
                  name="full_name"
                  value={user.full_name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  required
                  className="w-full pl-12 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
                />

              </div>

            </div>

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

            {/* Role */}

            <div>

              <label className="font-semibold text-slate-700">

                Select Role

              </label>

              <div className="relative mt-2">

                <Shield
                  size={20}
                  className="absolute left-4 top-4 text-gray-400"
                />

                <select
                  name="role"
                  value={user.role}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
                >

                  <option value="Researcher">
                    Researcher
                  </option>

                  <option value="Forest Officer">
                    Forest Officer
                  </option>

                  <option value="Admin">
                    Admin
                  </option>

                </select>

              </div>

            </div>

            {/* Register Button */}

            <button
              type="submit"
              className="w-full bg-green-700 hover:bg-green-800 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition duration-300 hover:scale-[1.02]"
            >

              <UserPlus size={20} />

              Create Account

            </button>

          </form>

          {/* Login Link */}

          <div className="mt-8 text-center">

            <p className="text-gray-600">

              Already have an account?

            </p>

            <Link
              to="/login"
              className="inline-flex items-center gap-2 mt-3 text-green-700 font-bold hover:text-green-900"
            >

              Login Here

              <ArrowRight size={18} />

            </Link>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Register;