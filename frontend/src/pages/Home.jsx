import hero from "../assets/hero.png";
import { useState } from "react";
import api from "../api/api";
import { useNavigate } from "react-router-dom";

function Home() {

  const navigate = useNavigate();

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  

  const handleImage = (e) => {
    const file = e.target.files[0];
    setImage(file);

    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleUpload = async () => {
    if (!image) {
      alert("Please select an image.");
      return;
    }

    const formData = new FormData();
    formData.append("file", image);

    try {
      const response = await api.post("/upload/image", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      alert("Image Uploaded Successfully!");
      console.log(response.data);
    } catch (error) {
      alert("Upload Failed!");
    }
  };

  return (
    <>
      <section
        className="d-flex align-items-center text-white"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,.45),rgba(0,0,0,.45)),url(${hero})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          minHeight: "100vh",
        }}
      >
        <div className="container">

          <div className="row align-items-center">

            {/* LEFT SIDE */}

            <div className="col-lg-5">

              <div
                style={{
                  width: "320px",
                  background: "rgba(255,255,255,.12)",
                  backdropFilter: "blur(20px)",
                  WebkitBackdropFilter: "blur(20px)",
                  border: "1px solid rgba(255,255,255,.25)",
                  borderRadius: "20px",
                  padding: "25px",
                  boxShadow: "0 8px 30px rgba(0,0,0,.3)",
                }}
              >

                <h4 className="text-center text-white mb-3">
                  📷 Upload Wildlife Image
                </h4>

                <input
                  type="file"
                  className="form-control mb-3"
                  accept="image/*"
                  onChange={handleImage}
                />

                {preview && (
                  <img
                    src={preview}
                    alt="Preview"
                    className="img-fluid rounded mb-3"
                    style={{
                      height: "180px",
                      width: "100%",
                      objectFit: "cover",
                    }}
                  />
                )}

                <button
                  className="btn btn-success w-100"
                  onClick={handleUpload}
                >
                  Upload Image
                </button>

              </div>

            </div>

            {/* RIGHT SIDE */}

            <div className="col-lg-7">

              <h1
                className="fw-bold"
                style={{
                  fontSize: "4rem",
                  lineHeight: "1.2",
                }}
              >
                Wildlife Population
                <br />
                Intelligence System
              </h1>

              <p className="lead mt-4">
                AI-powered platform for wildlife monitoring,
                species identification, population estimation
                and biodiversity conservation.
              </p>

              <div className="mt-4">

                <div className="mt-4">

                  <button
                    className="btn btn-success btn-lg me-3"
                    onClick={() => {
                      const user = localStorage.getItem("user");

                      if (user) {
                        navigate("/dashboard");
                      } else {
                        navigate("/login");
                      }
                    }}
                  >
                    Get Started
                  </button>

                  <button className="btn btn-outline-light btn-lg">
                    Learn More
                  </button>

                  </div>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* FEATURES */}

      <section
        className="py-5"
        style={{
          background: "var(--surface-strong)",
          borderTop: "1px solid var(--glass-border)",
          borderBottom: "1px solid var(--glass-border)",
        }}
      >

        <div className="container">

          <div className="text-center mb-5">

            <h2 className="fw-bold text-success">
              Our Features
            </h2>

            <p className="text-muted">
              Intelligent solutions for wildlife conservation.
            </p>

          </div>

          <div className="row g-4">

            <div className="col-md-3">
              <div className="card border-0 shadow-lg h-100 text-center p-4">
                <h3>🦁</h3>
                <h5>Species Detection</h5>
                <p>Identify wildlife using AI image recognition.</p>
              </div>
            </div>

            <div className="col-md-3">
              <div className="card border-0 shadow-lg h-100 text-center p-4">
                <h3>📊</h3>
                <h5>Population Analysis</h5>
                <p>Estimate animal populations accurately.</p>
              </div>
            </div>

            <div className="col-md-3">
              <div className="card border-0 shadow-lg h-100 text-center p-4">
                <h3>🌿</h3>
                <h5>Biodiversity</h5>
                <p>Monitor biodiversity trends in forests.</p>
              </div>
            </div>

            <div className="col-md-3">
              <div className="card border-0 shadow-lg h-100 text-center p-4">
                <h3>🛡</h3>
                <h5>Conservation</h5>
                <p>Protect endangered wildlife habitats.</p>
              </div>
            </div>

          </div>

        </div>

      </section>

    </>
  );
}

export default Home;