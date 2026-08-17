import "../styles/Register.css";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import API from "../services/api";

function Register() {

  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {

    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });

  };

  const registerUser = async () => {

    if (
      !form.name ||
      !form.email ||
      !form.password ||
      !form.confirmPassword
    ) {

      alert("Please Fill All Fields");

      return;

    }

    if (
      form.password !==
      form.confirmPassword
    ) {

      alert("Passwords Do Not Match");

      return;

    }

    try {

      await API.post(
        "/auth/register",
        {
          name: form.name,
          email: form.email,
          password: form.password,
        }
      );

      alert("Registration Successful");

      navigate("/login");

    } catch (err) {

      alert(
        err.response?.data?.message ||
        "Registration Failed"
      );

    }

  };

  return (

    <div className="login-container">

      <div className="login-box">

        <h1>🦌 WPIS</h1>

        <h2>Register</h2>

        <input
          type="text"
          name="name"
          placeholder="Full Name"
          value={form.name}
          onChange={handleChange}
        />

        <input
          type="email"
          name="email"
          placeholder="Email Address"
          value={form.email}
          onChange={handleChange}
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
        />

        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirm Password"
          value={form.confirmPassword}
          onChange={handleChange}
        />

        <button
          onClick={registerUser}
        >

          Register

        </button>

        <p>

          Already have an account?

          <Link to="/login">

            Login

          </Link>

        </p>

      </div>

    </div>

  );

}

export default Register;