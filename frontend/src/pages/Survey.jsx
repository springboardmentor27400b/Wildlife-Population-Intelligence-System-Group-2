import { useEffect, useState } from "react";
import api from "../api/api";

function Survey() {
  const emptyForm = {
  survey_id: "",
  title: "",
  survey_date: "",
  protected_area: "",
  habitat_type: "",
  monitoring_location: "",
  gps_latitude: "",
  gps_longitude: "",
  monitoring_device: "",
  researcher_name: "",
  status: "Planned",
  notes: "",
};

  const [form, setForm] = useState(emptyForm);
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    loadSurveys();
  }, []);

  const loadSurveys = async () => {
    try {
      setLoading(true);

      const res = await api.get("/surveys/");
      setSurveys(res.data);

    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const clearForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    if (isEditing) {
      await api.put(`/surveys/${editingId}`, form);

      alert("Survey Updated Successfully");
    } else {
      await api.post("/surveys/", form);

      alert("Survey Added Successfully");
    }

    

    setEditingId(null);
    setIsEditing(false);

    loadSurveys();

  } catch (err) {
    console.log(err);

alert(
  JSON.stringify(err.response?.data) ||
  err.message ||
  "Something went wrong"
);
  }
};

  const handleDelete = async (id) => {
      const confirmDelete = window.confirm(
        "Are you sure you want to delete this survey?"
      );

      if (!confirmDelete) return;

      try {
        await api.delete(`/surveys/${id}`);

        alert("Survey deleted successfully");

        loadSurveys();
      } catch (err) {
        alert(err.response?.data?.detail || "Failed to delete survey");
      }
    };

  const handleEdit = (survey) => {
    setEditingId(survey.id);

    setForm({
      survey_id: survey.survey_id,
      title: survey.title,
      survey_date: survey.survey_date || "",
      protected_area: survey.protected_area || "",
      habitat_type: survey.habitat_type || "",
      monitoring_location: survey.monitoring_location || "",
      gps_latitude: survey.gps_latitude || "",
      gps_longitude: survey.gps_longitude || "",
      status: survey.status,
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  

  return (
    <div className="container-fluid p-4">

      <h2 className="mb-4">
        Wildlife Survey Management
      </h2>

      <form onSubmit={handleSubmit}>

        <div className="row">

          <div className="col-md-4 mb-3">
            <input
              className="form-control"
              placeholder="Survey ID"
              name="survey_id"
              value={form.survey_id}
              onChange={handleChange}
              required
            />
          </div>

          <div className="col-md-4 mb-3">
            <input
              className="form-control"
              placeholder="Survey Title"
              name="title"
              value={form.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="col-md-4 mb-3">
            <input
              type="date"
              className="form-control"
              name="survey_date"
              value={form.survey_date}
              onChange={handleChange}
            />
          </div>

          <div className="col-md-4 mb-3">
            <input
              className="form-control"
              placeholder="Protected Area"
              name="protected_area"
              value={form.protected_area}
              onChange={handleChange}
            />
          </div>

          <div className="col-md-4 mb-3">
            <input
              className="form-control"
              placeholder="Habitat Type"
              name="habitat_type"
              value={form.habitat_type}
              onChange={handleChange}
            />
          </div>

          <div className="col-md-4 mb-3">
            <input
              className="form-control"
              placeholder="Monitoring Location"
              name="monitoring_location"
              value={form.monitoring_location}
              onChange={handleChange}
            />
          </div>

          <div className="col-md-4 mb-3">
            <input
              className="form-control"
              placeholder="Monitoring Device"
              name="monitoring_device"
              value={form.monitoring_device}
              onChange={handleChange}
            />
          </div>

          <div className="col-md-4 mb-3">
            <input
              className="form-control"
              placeholder="Researcher Name"
              name="researcher_name"
              value={form.researcher_name}
              onChange={handleChange}
            />
          </div>

          <div className="col-md-3 mb-3">
            <input
              type="number"
              step="0.000001"
              className="form-control"
              placeholder="Latitude"
              name="gps_latitude"
              value={form.gps_latitude}
              onChange={handleChange}
            />
          </div>

          <div className="col-md-3 mb-3">
            <input
              type="number"
              step="0.000001"
              className="form-control"
              placeholder="Longitude"
              name="gps_longitude"
              value={form.gps_longitude}
              onChange={handleChange}
            />
          </div>

          <div className="col-md-3 mb-3">
            <select
              className="form-select"
              name="status"
              value={form.status}
              onChange={handleChange}
            >
              <option>Planned</option>
              <option>Ongoing</option>
              <option>Completed</option>
            </select>
          </div>

          <div className="col-md-12 mb-3">
            <textarea
              className="form-control"
              rows="3"
              placeholder="Survey Notes"
              name="notes"
              value={form.notes}
              onChange={handleChange}
            />
          </div>

          <div className="col-md-3 d-grid gap-2">

            <button
                type="submit"
                className="btn btn-success w-100"
              >
                {isEditing ? "Update Survey" : "Add Survey"}
              </button>

            {editingId !== null && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={clearForm}
              >
                Cancel
              </button>
            )}

          </div>

        </div>

      </form>

      <hr />

      <table className="table table-bordered table-hover">

        <thead>

          <tr>
            <th>ID</th>
            <th>Survey ID</th>
            <th>Title</th>
            <th>Location</th>
            <th>Date</th>
            <th>Status</th>
            <th width="170">Actions</th>
          </tr>

        </thead>

        <tbody>

          {loading ? (

            <tr>
              <td colSpan="7" className="text-center">
                Loading...
              </td>
            </tr>

          ) : surveys.length === 0 ? (

            <tr>
              <td colSpan="7" className="text-center">
                No Surveys Found
              </td>
            </tr>

          ) : (

            surveys.map((survey) => (

              <tr key={survey.id}>

                <td>{survey.id}</td>

                <td>{survey.survey_id}</td>

                <td>{survey.title}</td>

                <td>{survey.monitoring_location}</td>

                <td>{survey.survey_date}</td>

                <td>{survey.status}</td>

                <td>

                  <button
                    className="btn btn-warning btn-sm me-2"
                    onClick={() => {
                      setForm({
                        survey_id: survey.survey_id,
                        title: survey.title,
                        survey_date: survey.survey_date,
                        protected_area: survey.protected_area,
                        habitat_type: survey.habitat_type,
                        monitoring_location: survey.monitoring_location,
                        gps_latitude: survey.gps_latitude,
                        gps_longitude: survey.gps_longitude,
                        monitoring_device: survey.monitoring_device || "",
                        researcher_name: survey.researcher_name || "",
                        status: survey.status,
                        notes: survey.notes || "",
                      });

                      setEditingId(survey.id);
                      setIsEditing(true);
                    }}
                  >
                    Edit
                  </button>

                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDelete(survey.id)}
                  >
                    Delete
                  </button>

                </td>

              </tr>

            ))

          )}

        </tbody>

      </table>

    </div>
  );
}

export default Survey;