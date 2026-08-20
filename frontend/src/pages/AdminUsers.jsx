import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

import {
  FaUsers,
  FaTrash,
  FaEdit,
  FaArrowLeft,
} from "react-icons/fa";

function AdminUsers() {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // ==========================================
  // FETCH USERS
  // ==========================================

  const fetchUsers = async () => {
    try {
      setLoading(true);

      const response = await api.get("/admin/users");

      setUsers(response.data || []);
    } catch (error) {
      console.error("Error fetching users:", error);

      alert(
        error.response?.data?.detail ||
          "Failed to fetch users"
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // LOAD USERS
  // ==========================================

  useEffect(() => {
    fetchUsers();
  }, []);

  // ==========================================
  // UPDATE ROLE
  // ==========================================

  const handleRoleChange = async (userId, role) => {
    try {
      await api.put(
        `/admin/users/${userId}/role`,
        {
          role: role,
        }
      );

      alert("User role updated successfully!");

      fetchUsers();
    } catch (error) {
      console.error(
        "Error updating user role:",
        error
      );

      alert(
        error.response?.data?.detail ||
          "Failed to update user role"
      );
    }
  };

  // ==========================================
  // DELETE USER
  // ==========================================

  const handleDelete = async (userId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this user?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      await api.delete(
        `/admin/users/${userId}`
      );

      alert("User deleted successfully!");

      fetchUsers();
    } catch (error) {
      console.error(
        "Error deleting user:",
        error
      );

      alert(
        error.response?.data?.detail ||
          "Failed to delete user"
      );
    }
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div
          className="spinner-border text-success"
          role="status"
        ></div>

        <p className="mt-3 text-muted">
          Loading users...
        </p>
      </div>
    );
  }

  // ==========================================
  // MAIN UI
  // ==========================================

  return (
    <div
      className="container-fluid py-4"
      style={{
        background: "var(--bg)",
        minHeight: "100vh",
      }}
    >

      {/* ======================================
          HEADER
      ====================================== */}

      <div className="d-flex justify-content-between align-items-center mb-4">

        <div>
          <h2 className="fw-bold text-success">
            <FaUsers className="me-2" />
            User Management
          </h2>

          <p className="text-muted mb-0">
            Manage registered users and their roles.
          </p>
        </div>

        <button
          className="btn btn-outline-success"
          onClick={() =>
            navigate("/dashboard")
          }
        >
          <FaArrowLeft className="me-2" />
          Back to Dashboard
        </button>

      </div>

      {/* ======================================
          USER COUNT
      ====================================== */}

      <div className="row mb-4">

        <div className="col-md-4">

          <div
            className="card border-0 shadow-sm"
            style={{
              borderRadius: "18px",
            }}
          >

            <div className="card-body">

              <div className="d-flex align-items-center">

                <div
                  className="me-3"
                  style={{
                    width: "55px",
                    height: "55px",
                    borderRadius: "50%",
                    background: "#198754",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <FaUsers size={25} />
                </div>

                <div>
                  <h3 className="fw-bold mb-0">
                    {users.length}
                  </h3>

                  <small className="text-muted">
                    Registered Users
                  </small>
                </div>

              </div>

            </div>

          </div>

        </div>

      </div>

      {/* ======================================
          USERS TABLE
      ====================================== */}

      <div
        className="card border-0 shadow-lg"
        style={{
          borderRadius: "20px",
        }}
      >

        <div className="card-body p-4">

          <div className="table-responsive">

            <table className="table align-middle">

              <thead
                style={{
                  background: "#198754",
                  color: "white",
                }}
              >

                <tr>

                  <th>ID</th>

                  <th>Full Name</th>

                  <th>Email</th>

                  <th>Role</th>

                  <th className="text-center">
                    Actions
                  </th>

                </tr>

              </thead>

              <tbody>

                {users.length > 0 ? (

                  users.map((user) => (

                    <tr key={user.id}>

                      <td>
                        {user.id}
                      </td>

                      <td className="fw-semibold">
                        {user.full_name}
                      </td>

                      <td>
                        {user.email}
                      </td>

                      {/* ROLE */}

                      <td>

                        <select
                          className="form-select"
                          value={user.role}
                          onChange={(e) =>
                            handleRoleChange(
                              user.id,
                              e.target.value
                            )
                          }
                          style={{
                            maxWidth: "220px",
                          }}
                        >

                          <option value="Administrator">
                            Administrator
                          </option>

                          <option value="Researcher">
                            Researcher
                          </option>

                          <option value="Conservation Officer">
                            Conservation Officer
                          </option>

                          <option value="Forest Department">
                            Forest Department
                          </option>

                        </select>

                      </td>

                      {/* ACTIONS */}

                      <td className="text-center">

                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() =>
                            handleDelete(
                              user.id
                            )
                          }
                        >

                          <FaTrash className="me-1" />

                          Delete

                        </button>

                      </td>

                    </tr>

                  ))

                ) : (

                  <tr>

                    <td
                      colSpan="5"
                      className="text-center py-5 text-muted"
                    >
                      No users found.
                    </td>

                  </tr>

                )}

              </tbody>

            </table>

          </div>

        </div>

      </div>

    </div>
  );
}

export default AdminUsers;