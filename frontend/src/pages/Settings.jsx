import "./Settings.css";
import {
  FaUserCog,
  FaSave,
  FaLock,
  FaEnvelope,
  FaUser,
} from "react-icons/fa";

import { useState } from "react";

function Settings() {

  const [settings, setSettings] = useState({
    name: "Forest Officer",
    email: "admin@wpis.com",
    password: "",
    theme: "Light",
    notifications: true,
  });

  const handleChange = (e) => {

    const { name, value, type, checked } = e.target;

    setSettings({
      ...settings,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    });

  };

  const saveSettings = () => {

    alert("Settings Saved Successfully");

  };

  return (

    <div className="settings">

      <div className="settings-header">

        <h1>System Settings</h1>

        <button
          className="save-btn"
          onClick={saveSettings}
        >

          <FaSave />

          Save Settings

        </button>

      </div>

      <div className="settings-card">

        <div className="input-group">

          <label>

            <FaUser />

            Full Name

          </label>

          <input
            type="text"
            name="name"
            value={settings.name}
            onChange={handleChange}
          />

        </div>

        <div className="input-group">

          <label>

            <FaEnvelope />

            Email Address

          </label>

          <input
            type="email"
            name="email"
            value={settings.email}
            onChange={handleChange}
          />

        </div>

        <div className="input-group">

          <label>

            <FaLock />

            Password

          </label>

          <input
            type="password"
            name="password"
            placeholder="Enter New Password"
            value={settings.password}
            onChange={handleChange}
          />

        </div>

        <div className="input-group">

          <label>

            <FaUserCog />

            Theme

          </label>

          <select
            name="theme"
            value={settings.theme}
            onChange={handleChange}
          >

            <option>Light</option>

            <option>Dark</option>

          </select>

        </div>
                <div className="input-group checkbox-group">

          <label>

            <input
              type="checkbox"
              name="notifications"
              checked={settings.notifications}
              onChange={handleChange}
            />

            Enable Email Notifications

          </label>

        </div>

      </div>

      <div className="settings-info">

        <div className="info-card">

          <h3>System Information</h3>

          <p><strong>Project:</strong> Wildlife Population Intelligence System</p>

          <p><strong>Version:</strong> 1.0.0</p>

          <p><strong>Database:</strong> MongoDB</p>

          <p><strong>Backend:</strong> Node.js + Express</p>

          <p><strong>Frontend:</strong> React + Vite</p>

          <p><strong>Status:</strong>
            <span className="active-status">
              Active
            </span>
          </p>

        </div>

      </div>

    </div>

  );

}

export default Settings;