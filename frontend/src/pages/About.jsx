import aboutBg from "../assets/about-bg.jpg";

function About() {
  return (
    <div
      className="container-fluid py-5"
      style={{
        minHeight: "100vh",
        backgroundImage: `linear-gradient(rgba(0,0,0,.55), rgba(0,0,0,.65)), url(${aboutBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="container">

        <h1 className="text-center text-white fw-bold mb-5">
          About Wildlife AI
        </h1>

        <div
          className="mx-auto"
          style={{
            maxWidth: "850px",
            background: "rgba(255,255,255,.12)",
            backdropFilter: "blur(18px)",
            WebkitBackdropFilter: "blur(18px)",
            borderRadius: "25px",
            padding: "45px",
            color: "white",
            boxShadow: "0 8px 32px rgba(0,0,0,.35)",
          }}
        >
          <h3 className="text-success mb-4">
            🌿 Wildlife Population Intelligence System
          </h3>

          <p className="fs-5">
            The Wildlife Population Intelligence System is an AI-powered
            platform developed to monitor wildlife, estimate animal
            populations, identify different species, and support biodiversity
            conservation.
          </p>

          <p className="fs-5">
            Our system enables researchers, forest departments, and
            conservationists to upload wildlife images, manage species data,
            record observations, and analyze wildlife populations using modern
            Artificial Intelligence techniques.
          </p>

          <hr className="text-light my-4" />

          <div className="row text-center">

            <div className="col-md-4 mb-3">
              <h1>🦁</h1>
              <h5>Species Detection</h5>
              <p>
                AI-based wildlife identification.
              </p>
            </div>

            <div className="col-md-4 mb-3">
              <h1>📊</h1>
              <h5>Population Analysis</h5>
              <p>
                Accurate wildlife population monitoring.
              </p>
            </div>

            <div className="col-md-4 mb-3">
              <h1>🌎</h1>
              <h5>Conservation</h5>
              <p>
                Protect biodiversity and endangered species.
              </p>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}

export default About;