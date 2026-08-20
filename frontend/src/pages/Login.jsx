import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/api";
import loginBg from "../assets/login-bg.jpg";

function Login() {
  const navigate = useNavigate();

  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setLoginData({
      ...loginData,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await api.post("/login", loginData);

      localStorage.setItem(
        "token",
        response.data.access_token
      );

      localStorage.setItem(
        "user",
        JSON.stringify(response.data.user)
      );

      alert("Login Successful");

      navigate("/dashboard");

    } catch (error) {

      if (error.response) {
        alert(error.response.data.detail);
      } else {
        alert("Server Error!");
      }

    }
  };

  return (
    <section
      className="d-flex align-items-center"
      style={{
        backgroundImage: `linear-gradient(rgba(0,0,0,.45),rgba(0,0,0,.45)),url(${loginBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        minHeight: "100vh",
      }}
    >
      <div className="container">

        <div className="row align-items-center">

          {/* Left Side */}

          <div className="col-lg-6 text-white">

            <h1
              className="fw-bold"
              style={{ fontSize: "3.8rem" }}
            >
              Welcome Back
            </h1>

            <p
              className="lead mt-4"
              style={{ maxWidth: "500px" }}
            >
              Login to continue exploring the Wildlife Population
              Intelligence System and monitor biodiversity with AI.
            </p>

          </div>

          {/* Right Side */}

          <div className="col-lg-6 d-flex justify-content-center">

            <div
              style={{
                width: "420px",
                background: "rgba(255,255,255,.12)",
                backdropFilter: "blur(18px)",
                WebkitBackdropFilter: "blur(18px)",
                borderRadius: "20px",
                border: "1px solid rgba(255,255,255,.2)",
                padding: "35px",
                boxShadow: "0 10px 35px rgba(0,0,0,.35)",
              }}
            >

              <h2 className="text-center text-white fw-bold">
                Login
              </h2>

              <p className="text-center text-light mb-4">
                Sign in to your account
              </p>

              <form onSubmit={handleLogin}>

                <div className="mb-3">

                  <label className="text-white">
                    Email
                  </label>

                  <input
                    type="email"
                    name="email"
                    className="form-control"
                    placeholder="Enter Email"
                    value={loginData.email}
                    onChange={handleChange}
                    required
                  />

                </div>

                <div className="mb-4">

                  <label className="text-white">
                    Password
                  </label>

                  <input
                    type="password"
                    name="password"
                    className="form-control"
                    placeholder="Enter Password"
                    value={loginData.password}
                    onChange={handleChange}
                    required
                  />

                </div>

                <button
                  className="btn btn-success w-100 py-2"
                  type="submit"
                >
                  Login
                </button>

              </form>

              <p className="text-center text-white mt-4">

                Don't have an account?{" "}

                <Link
                  to="/register"
                  className="text-warning fw-bold text-decoration-none"
                >
                  Register
                </Link>

              </p>

            </div>

          </div>

        </div>

      </div>

    </section>
  );
}

export default Login;