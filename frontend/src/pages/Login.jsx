import "../styles/Login.css";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import API from "../services/api";

function Login() {

  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {

    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });

  };

  const loginUser = async () => {

    if (!form.email || !form.password) {

      alert("Please Fill All Fields");

      return;

    }

    try {

      const res = await API.post(
        "/auth/login",
        form
      );

      localStorage.setItem(
        "token",
        res.data.token
      );

      localStorage.setItem(
        "user",
        JSON.stringify(res.data.user)
      );

      alert("Login Successful");

      navigate("/dashboard");

    } catch (err) {

      alert(
        err.response?.data?.message ||
        "Login Failed"
      );

    }

  };

  return (

    <div className="login-container">

      <div className="login-box">

        <h1>🦌 WPIS</h1>

        <h2>Login</h2>

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

        <button onClick={loginUser}>

          Login

        </button>

        <p>

          Don't have an account?

          <Link to="/register">

            Register

          </Link>

        </p>

      </div>

    </div>

  );

}

export default Login;