import contactBg from "../assets/contact-bg.jpg";

function Contact() {
  return (
    <div
      className="container-fluid py-5"
      style={{
        minHeight: "100vh",
        backgroundImage: `linear-gradient(rgba(0,0,0,.55), rgba(0,0,0,.65)), url(${contactBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="container">

        <h1 className="text-center text-white fw-bold mb-5">
          Contact Us
        </h1>

        <div
          className="mx-auto"
          style={{
            maxWidth: "700px",
            background: "rgba(255,255,255,.12)",
            backdropFilter: "blur(18px)",
            WebkitBackdropFilter: "blur(18px)",
            borderRadius: "25px",
            padding: "40px",
            color: "white",
            boxShadow: "0 8px 32px rgba(0,0,0,.35)",
          }}
        >
          <h3 className="mb-4 text-center">
            📞 Get In Touch
          </h3>

          <hr className="text-light" />

          <p className="fs-5">
            📧 <strong>Email:</strong><br />
            wildlife@gmail.com
          </p>

          <p className="fs-5">
            📱 <strong>Phone:</strong><br />
            +91 9876543210
          </p>

          <p className="fs-5">
            📍 <strong>Address:</strong><br />
            Wildlife Population Intelligence System<br />
            Maharashtra, India
          </p>

          <hr className="text-light" />

          <div className="text-center">
            <button className="btn btn-success px-4">
              Send Message
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}

export default Contact;