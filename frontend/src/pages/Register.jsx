import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/api";
import registerBg from "../assets/register-bg.jpg";

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

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      const response = await api.post("/register", user);

      alert("Registration Successful!");

      navigate("/login");

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
        backgroundImage: `linear-gradient(rgba(0,0,0,.45),rgba(0,0,0,.45)),url(${registerBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        minHeight: "100vh",
        paddingTop: "80px",
        paddingBottom: "40px",
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
              Join Wildlife AI
            </h1>

            <p
              className="lead mt-4"
              style={{ maxWidth: "500px" }}
            >
              Create your account and become part of the Wildlife Population
              Intelligence System for smarter biodiversity conservation.
            </p>

          </div>

          {/* Right Side */}

          <div className="col-lg-6 d-flex justify-content-center">

            <div
              style={{
                width: "400px",
                background: "rgba(255,255,255,.12)",
                backdropFilter: "blur(18px)",
                WebkitBackdropFilter: "blur(18px)",
                borderRadius: "20px",
                border: "1px solid rgba(255,255,255,.2)",
                padding: "25px",
                boxShadow: "0 10px 35px rgba(0,0,0,.35)",
              }}
            >

              <h2 className="text-center text-white fw-bold">
                Register
              </h2>

              <p className="text-center text-light mb-4">
                Create your account
              </p>

              <form onSubmit={handleRegister}>

                <div className="mb-2">
                  <label className="text-white">
                    Full Name
                  </label>

                  <input
                    type="text"
                    className="form-control"
                    name="full_name"
                    placeholder="Enter Full Name"
                    value={user.full_name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="mb-2">

                  <label className="text-white">
                    Email
                  </label>

                  <input
                    type="email"
                    className="form-control"
                    name="email"
                    placeholder="Enter Email"
                    value={user.email}
                    onChange={handleChange}
                    required
                  />

                </div>

                <div className="mb-2">

                  <label className="text-white">
                    Password
                  </label>

                  <input
                    type="password"
                    className="form-control"
                    name="password"
                    placeholder="Enter Password"
                    value={user.password}
                    onChange={handleChange}
                    required
                  />

                </div>

                <div className="mb-3">

                  <label className="text-white">
                    Role
                  </label>

                  <select
                    className="form-select"
                    name="role"
                    value={user.role}
                    onChange={handleChange}
                  >
                    <option>Wildlife Researcher</option>
                    <option>Forest Department Officer</option>
                    <option>Conservation Officer</option>
                    <option>Administrator</option>
                  </select>

                </div>

                <button
                  className="btn btn-success w-100 py-2"
                  type="submit"
                >
                  Register
                </button>

              </form>

              <p className="text-center text-white mt-4">

                Already have an account?{" "}

                <Link
                  to="/login"
                  className="text-warning fw-bold text-decoration-none"
                >
                  Login
                </Link>

              </p>

            </div>

          </div>

        </div>

      </div>

    </section>
  );
}

export default Register;