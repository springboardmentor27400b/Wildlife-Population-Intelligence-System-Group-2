import "./DashboardHome.css";
import {
  FaPaw,
  FaLeaf,
  FaVideo,
  FaChartLine,
} from "react-icons/fa";

import { useEffect, useState } from "react";
import API from "../services/api";

function DashboardHome() {

  const [population, setPopulation] = useState([]);
  const [species, setSpecies] = useState([]);
  const [camera, setCamera] = useState([]);

useEffect(() => {
  let cancelled = false;

  const fetchDashboard = async () => {
    try {
      const [pop, spe, cam] = await Promise.all([
        API.get("/population"),
        API.get("/species"),
        API.get("/camera"),
      ]);

      if (cancelled) return;

      setPopulation(pop.data?.data || []);
      setSpecies(spe.data?.data || []);
      setCamera(cam.data?.data || []);
    } catch (err) {
      console.log(err);
    }
  };

  fetchDashboard();

  return () => {
    cancelled = true;
  };
}, []);

  return (

    <div className="dashboard">

      <div className="dashboard-header">

        <h1>Wildlife Population Intelligence System</h1>

        <p>
          Dashboard Overview
        </p>

      </div>

      <div className="dashboard-cards">

        <div className="dashboard-card">

          <FaPaw />

          <h2>{population.length}</h2>

          <p>Total Population Records</p>

        </div>

        <div className="dashboard-card">

          <FaLeaf />

          <h2>{species.length}</h2>

          <p>Total Species</p>

        </div>

        <div className="dashboard-card">

          <FaVideo />

          <h2>{camera.length}</h2>

          <p>Camera Devices</p>

        </div>

        <div className="dashboard-card">

          <FaChartLine />

          <h2>

            {
              population.filter(
                (item) =>
                  item.status === "Critical"
              ).length
            }

          </h2>

          <p>Critical Species</p>

        </div>

      </div>

      <div className="dashboard-table">

        <h2>

          Recent Population Records

        </h2>

        <table>

          <thead>

            <tr>

              <th>No.</th>

              <th>Species</th>

              <th>Population</th>

              <th>Location</th>

              <th>Status</th>

            </tr>

          </thead>

          <tbody>

            {
              population
                .slice(0,5)
                .map((item,index)=>(

                  <tr key={item._id}>

                    <td>{index+1}</td>

                    <td>{item.species}</td>

                    <td>{item.count}</td>

                    <td>{item.location}</td>

                    <td>

                      <span
                        className={
                          item.status==="Stable"
                          ?"stable"
                          :item.status==="Endangered"
                          ?"warning"
                          :"danger"
                        }
                      >

                        {item.status}

                      </span>

                    </td>

                  </tr>

                ))
            }

          </tbody>

        </table>

      </div>
          </div>

  );

}

export default DashboardHome;