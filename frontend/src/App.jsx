import { useState } from "react";
import axios from "axios";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup
} from "react-leaflet";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";

import "leaflet/dist/leaflet.css";

import L from "leaflet";

import "./App.css";


const API_URL = "https://resolveai-bry0.onrender.com";


/* =========================================
   LEAFLET ICON
========================================= */

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({

  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",

  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",

  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png"

});


/* =========================================
   APP
========================================= */

function App() {

  const [page, setPage] =
    useState("login");

  const [role, setRole] =
    useState("");

  const [name, setName] =
    useState("");

  const [mobile, setMobile] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [complaintText, setComplaintText] =
    useState("");

  const [latitude, setLatitude] =
    useState("");

  const [longitude, setLongitude] =
    useState("");

  const [locationName, setLocationName] =
    useState("");

  const [locationLoading, setLocationLoading] =
    useState(false);

  const [image, setImage] =
    useState(null);

  const [imagePreview, setImagePreview] =
    useState(null);

  const [result, setResult] =
    useState(null);

  const [loading, setLoading] =
    useState(false);

  const [complaints, setComplaints] =
    useState([]);

  const [dashboardLoading, setDashboardLoading] =
    useState(false);

  const [search, setSearch] =
    useState("");

  const [priorityFilter, setPriorityFilter] =
    useState("All");

  const [statusFilter, setStatusFilter] =
    useState("All");

  const [incidentDetails, setIncidentDetails] =
    useState(null);

  const [incidentLoading, setIncidentLoading] =
    useState(false);

  const [showVerification, setShowVerification] =
    useState(null);

  const [verificationComment, setVerificationComment] =
    useState("");

  const [verificationLoading, setVerificationLoading] =
    useState(false);


  /* =========================================
     LOGIN
  ========================================= */

  const handleLogin = (e) => {

    e.preventDefault();

    if (
      !name ||
      !mobile ||
      !password
    ) {

      alert(
        "Please enter all login details."
      );

      return;
    }


    if (mobile.length !== 10) {

      alert(
        "Mobile number must contain exactly 10 digits."
      );

      return;
    }


    setPage("role");
  };


  /* =========================================
     LOCATION
  ========================================= */

  const getCurrentLocation = () => {

    if (!navigator.geolocation) {

      alert(
        "Geolocation is not supported."
      );

      return;
    }


    setLocationLoading(true);


    navigator.geolocation.getCurrentPosition(

      async (position) => {

        const lat =
          position.coords.latitude;

        const lon =
          position.coords.longitude;


        setLatitude(lat);

        setLongitude(lon);


        try {

          const response =
            await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`
            );


          const data =
            await response.json();


          setLocationName(
            data.display_name ||
            `${lat.toFixed(6)}, ${lon.toFixed(6)}`
          );

        } catch (error) {

          setLocationName(
            `${lat.toFixed(6)}, ${lon.toFixed(6)}`
          );
        }


        setLocationLoading(false);
      },


      () => {

        alert(
          "Unable to get location. Please allow location access."
        );

        setLocationLoading(false);
      },


      {
        enableHighAccuracy: true,

        timeout: 10000,

        maximumAge: 0
      }

    );
  };


  /* =========================================
     IMAGE
  ========================================= */

  const handleImageUpload = (e) => {

    const file =
      e.target.files[0];


    if (!file) {

      return;
    }


    setImage(file);

    setImagePreview(
      URL.createObjectURL(file)
    );
  };


  /* =========================================
     SUBMIT COMPLAINT
  ========================================= */

  const submitComplaint = async (e) => {

    e.preventDefault();


    if (!complaintText.trim()) {

      alert(
        "Please enter your complaint."
      );

      return;
    }


    setLoading(true);


    try {

      const response =
        await axios.post(
          `${API_URL}/complaints`,
          {

            name,

            complaint_text:
              complaintText,

            latitude:
              latitude
                ? parseFloat(latitude)
                : null,

            longitude:
              longitude
                ? parseFloat(longitude)
                : null

          }
        );


      setResult(
        response.data
      );


      setComplaintText("");


    } catch (error) {

      console.error(error);

      alert(
        "Unable to submit complaint. Make sure backend is running."
      );

    } finally {

      setLoading(false);
    }
  };


  /* =========================================
     LOAD COMPLAINTS
  ========================================= */

  const loadComplaints =
    async () => {

      setDashboardLoading(true);


      try {

        const response =
          await axios.get(
            `${API_URL}/complaints`
          );


        setComplaints(
          response.data
        );


      } catch (error) {

        console.error(error);

        alert(
          "Unable to load complaints."
        );

      } finally {

        setDashboardLoading(false);
      }
    };


  /* =========================================
     UPDATE STATUS
  ========================================= */

  const updateComplaintStatus =
    async (
      complaintId,
      newStatus
    ) => {

      try {

        await axios.put(
          `${API_URL}/complaints/${complaintId}/status`,
          null,
          {
            params: {
              status: newStatus
            }
          }
        );


        loadComplaints();


      } catch (error) {

        console.error(error);

        alert(
          "Unable to update status."
        );
      }
    };


  /* =========================================
     INCIDENT DETAILS
  ========================================= */

  const openIncident =
    async (incidentId) => {

      setIncidentLoading(true);

      setIncidentDetails(null);


      try {

        const response =
          await axios.get(
            `${API_URL}/incidents/${incidentId}`
          );


        setIncidentDetails(
          response.data
        );


      } catch (error) {

        console.error(error);

        alert(
          "Unable to load incident details."
        );

      } finally {

        setIncidentLoading(false);
      }
    };


  /* =========================================
     RESOLUTION VERIFICATION
  ========================================= */

  const verifyResolution =
    async (
      complaintId,
      verified
    ) => {

      setVerificationLoading(
        true
      );


      try {

        await axios.put(
          `${API_URL}/complaints/${complaintId}/verify`,
          {

            verified,

            comment:
              verificationComment

          }
        );


        setShowVerification(
          null
        );

        setVerificationComment(
          ""
        );


        loadComplaints();


        alert(
          verified
            ? "Resolution verified successfully."
            : "Complaint reopened for further action."
        );


      } catch (error) {

        console.error(error);

        alert(
          "Unable to verify resolution."
        );

      } finally {

        setVerificationLoading(
          false
        );
      }
    };


  /* =========================================
     SLA CHECK
  ========================================= */

  const runSlaCheck =
    async () => {

      try {

        const response =
          await axios.post(
            `${API_URL}/sla/check`
          );


        alert(
          `SLA check complete. New escalations: ${response.data.new_escalations}`
        );


        loadComplaints();


      } catch (error) {

        console.error(error);

        alert(
          "Unable to run SLA check."
        );
      }
    };


  /* =========================================
     OFFICER
  ========================================= */

  const openOfficerDashboard =
    () => {

      setRole("Officer");

      setPage("officer");

      loadComplaints();
    };


  /* =========================================
     LOGOUT
  ========================================= */

  const logout = () => {

    setPage("login");

    setRole("");

    setResult(null);

    setComplaintText("");

    setImage(null);

    setImagePreview(null);

    setLocationName("");

    setLatitude("");

    setLongitude("");

    setIncidentDetails(null);
  };


  /* =========================================
     LOGIN PAGE
  ========================================= */

  if (page === "login") {

    return (

      <div className="app-container">

        <div className="login-card">

          <div className="logo-section">

            <div className="logo-icon">
              R
            </div>

            <h1>
              ResolveAI
            </h1>

            <p>
              AI-Powered Intelligent Grievance & Resolution System
            </p>

          </div>


          <form
            onSubmit={handleLogin}
          >

            <h2>
              Login
            </h2>

            <p className="form-subtitle">
              Access the ResolveAI prototype
            </p>


            <label>
              Name
            </label>

            <input
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) =>
                setName(
                  e.target.value
                )
              }
            />


            <label>
              Mobile Number
            </label>

            <input
              type="tel"
              placeholder="10-digit mobile number"
              value={mobile}
              maxLength="10"
              inputMode="numeric"
              onChange={(e) => {

                const value =
                  e.target.value.replace(
                    /\D/g,
                    ""
                  );

                setMobile(
                  value.slice(0, 10)
                );
              }}
            />


            <label>
              Password
            </label>

            <input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) =>
                setPassword(
                  e.target.value
                )
              }
            />


            <button
              type="submit"
              className="primary-button"
            >
              Continue →
            </button>

          </form>


          <p className="demo-text">
            SIH 2026 Prototype • ResolveAI
          </p>

        </div>

      </div>
    );
  }


  /* =========================================
     ROLE PAGE
  ========================================= */

  if (page === "role") {

    return (

      <div className="app-container">

        <div className="role-card">

          <div className="brand-small">
            ResolveAI
          </div>

          <h1>
            Select your role
          </h1>

          <p>
            Choose how you want to use the platform.
          </p>


          <div className="role-options">


            <button
              className="role-option"
              onClick={() => {

                setRole("Citizen");

                setPage("complaint");

              }}
            >

              <div className="role-icon">
                👤
              </div>

              <div className="role-content">

                <h2>
                  Citizen
                </h2>

                <p>
                  Report civic issues and public grievances.
                </p>

              </div>

              <span className="arrow">
                →
              </span>

            </button>


            <button
              className="role-option"
              onClick={() => {

                setRole("Farmer");

                setPage("complaint");

              }}
            >

              <div className="role-icon">
                🌾
              </div>

              <div className="role-content">

                <h2>
                  Farmer
                </h2>

                <p>
                  Report procurement, crop, payment and mandi issues.
                </p>

              </div>

              <span className="arrow">
                →
              </span>

            </button>


            <button
              className="role-option"
              onClick={
                openOfficerDashboard
              }
            >

              <div className="role-icon">
                🏢
              </div>

              <div className="role-content">

                <h2>
                  Officer
                </h2>

                <p>
                  Prioritize, manage and resolve grievances.
                </p>

              </div>

              <span className="arrow">
                →
              </span>

            </button>

          </div>


          <button
            className="back-button"
            onClick={() =>
              setPage("login")
            }
          >
            ← Back
          </button>

        </div>

      </div>
    );
  }


  /* =========================================
     CITIZEN / FARMER
  ========================================= */

  if (page === "complaint") {

    return (

      <div className="dashboard-container">

        <header className="top-header">

          <div>

            <h1>
              ResolveAI
            </h1>

            <p>
              Intelligent Grievance Resolution
            </p>

          </div>


          <div className="user-info">

            <span className="role-badge">
              {role === "Farmer"
                ? "🌾 Farmer"
                : "👤 Citizen"}
            </span>

            <span>
              {name}
            </span>

            <button
              className="logout-button"
              onClick={logout}
            >
              Logout
            </button>

          </div>

        </header>


        <main className="main-content">


          <div className="complaint-header">

            <div>

              <h2>
                Submit a Grievance
              </h2>

              <p>
                {role === "Farmer"
                  ? "Report your agriculture or procurement-related issue."
                  : "Report an issue and let AI prioritize it."}
              </p>

            </div>


            <div className="status-badge">
              🧠 AI Enabled
            </div>

          </div>


          <form
            className="complaint-form"
            onSubmit={
              submitComplaint
            }
          >


            <div className="form-section">

              <h3>
                Complaint Details
              </h3>

              <label>
                Describe your complaint
              </label>

              <textarea
                rows="6"
                placeholder={
                  role === "Farmer"
                    ? "Example: My paddy procurement payment has been delayed for 10 days..."
                    : "Example: Water pipeline is leaking near the market..."
                }
                value={complaintText}
                onChange={(e) =>
                  setComplaintText(
                    e.target.value
                  )
                }
              />

            </div>


            <div className="form-section">

              <h3>
                Evidence
              </h3>

              <p className="section-description">
                Upload a photo related to the grievance.
              </p>


              <label className="upload-box">

                <div className="upload-icon">
                  📷
                </div>

                <strong>
                  Click to upload image
                </strong>

                <span>
                  JPG, PNG or JPEG
                </span>

                <input
                  type="file"
                  accept="image/png,image/jpeg,image/jpg"
                  onChange={
                    handleImageUpload
                  }
                />

              </label>


              {imagePreview && (

                <div className="image-preview">

                  <img
                    src={
                      imagePreview
                    }
                    alt="Evidence"
                  />

                  <div>

                    <strong>
                      {image.name}
                    </strong>

                    <p>
                      Evidence attached
                    </p>

                  </div>

                </div>

              )}

            </div>


            <div className="form-section">

              <h3>
                Location
              </h3>

              <p className="section-description">
                Location helps officers identify geographically affected incidents.
              </p>


              <button
                type="button"
                className="location-button"
                onClick={
                  getCurrentLocation
                }
                disabled={
                  locationLoading
                }
              >

                {locationLoading
                  ? "📍 Detecting..."
                  : "📍 Use My Current Location"}

              </button>


              {locationName && (

                <div className="location-result">

                  <span>
                    📍
                  </span>

                  <div>

                    <strong>
                      Detected Location
                    </strong>

                    <p>
                      {locationName}
                    </p>

                  </div>

                </div>

              )}


              <label>
                Location Name / Address
              </label>

              <input
                type="text"
                placeholder="Example: Vijayawada, Andhra Pradesh"
                value={locationName}
                onChange={(e) =>
                  setLocationName(
                    e.target.value
                  )
                }
              />

            </div>


            <button
              type="submit"
              className="submit-button"
              disabled={loading}
            >

              {loading
                ? "🧠 AI Analyzing..."
                : "Submit Complaint →"}

            </button>

          </form>


          {result && (

            <div className="result-card">

              <div className="result-header">

                <div>

                  <span className="success-label">
                    ✓ Complaint Submitted
                  </span>

                  <h2>
                    AI Analysis
                  </h2>

                </div>

                <div className="complaint-id">
                  #{result.id}
                </div>

              </div>


              <div className="result-grid">


                <div className="result-item">

                  <span>
                    Category
                  </span>

                  <strong>
                    {result.category}
                  </strong>

                </div>


                <div className="result-item">

                  <span>
                    Priority
                  </span>

                  <strong>
                    {result.severity}
                  </strong>

                </div>


                <div className="result-item">

                  <span>
                    Priority Score
                  </span>

                  <strong>
                    {result.priority_score} / 100
                  </strong>

                </div>


                <div className="result-item">

                  <span>
                    Department
                  </span>

                  <strong>
                    {result.department}
                  </strong>

                </div>


                <div className="result-item">

                  <span>
                    SLA
                  </span>

                  <strong>
                    {result.sla_hours} hours
                  </strong>

                </div>


                <div className="result-item">

                  <span>
                    Incident
                  </span>

                  <strong>
                    {result.master_incident_id
                      ? `Incident #${result.master_incident_id}`
                      : "New Incident"}
                  </strong>

                </div>

              </div>


              <div className="success-message">

                Your complaint has been analyzed and automatically routed to the appropriate department.

              </div>

            </div>

          )}

        </main>

      </div>
    );
  }


  /* =========================================
     OFFICER DASHBOARD
  ========================================= */

  if (page === "officer") {


    /* =====================================
       BASIC COUNTS
    ===================================== */

    const total =
      complaints.length;


    const critical =
      complaints.filter(
        c =>
          c.severity ===
          "CRITICAL"
      ).length;


    const high =
      complaints.filter(
        c =>
          c.severity ===
          "HIGH"
      ).length;


    const farmers =
      complaints.filter(
        c =>
          c.category ===
          "Agriculture & Procurement"
      ).length;


    const escalated =
      complaints.filter(
        c =>
          c.escalated
      ).length;


    const resolved =
      complaints.filter(
        c =>
          c.status ===
          "Resolved"
      ).length;


    const resolutionRate =
      total > 0
        ? Math.round(
            (resolved / total) *
            100
          )
        : 0;


    const incidentSet =
      new Set(
        complaints.map(
          c =>
            c.master_incident_id
              ? c.master_incident_id
              : c.id
        )
      );


    const masterIncidents =
      incidentSet.size;


    /* =====================================
       FILTER
    ===================================== */

    const filteredComplaints =
      complaints.filter(
        complaint => {

          const searchText =
            search.toLowerCase();


          const matchesSearch =

            complaint.name
              ?.toLowerCase()
              .includes(searchText)

            ||

            complaint.complaint_text
              ?.toLowerCase()
              .includes(searchText)

            ||

            complaint.category
              ?.toLowerCase()
              .includes(searchText);


          const matchesPriority =
            priorityFilter === "All"
              ||
            complaint.severity ===
              priorityFilter;


          const matchesStatus =
            statusFilter === "All"
              ||
            complaint.status ===
              statusFilter;


          return (
            matchesSearch &&
            matchesPriority &&
            matchesStatus
          );
        }
      );


    /* =====================================
       ANALYTICS DATA
    ===================================== */

    const categoryNames = [

      "Water Supply",

      "Roads & Infrastructure",

      "Electricity",

      "Agriculture & Procurement",

      "Healthcare",

      "Education",

      "General"

    ];


    const categoryData =
      categoryNames.map(
        category => ({

          name:
            category ===
            "Agriculture & Procurement"
              ? "Agriculture"
              : category,

          complaints:
            complaints.filter(
              c =>
                c.category ===
                category
            ).length

        })
      );


    const priorityData = [

      {
        name: "Critical",

        value:
          complaints.filter(
            c =>
              c.severity ===
              "CRITICAL"
          ).length
      },

      {
        name: "High",

        value:
          complaints.filter(
            c =>
              c.severity ===
              "HIGH"
          ).length
      },

      {
        name: "Medium",

        value:
          complaints.filter(
            c =>
              c.severity ===
              "MEDIUM"
          ).length
      },

      {
        name: "Low",

        value:
          complaints.filter(
            c =>
              c.severity ===
              "LOW"
          ).length
      }

    ];


    const statusData = [

      {
        name: "Submitted",

        value:
          complaints.filter(
            c =>
              c.status ===
              "Submitted"
          ).length
      },

      {
        name: "Assigned",

        value:
          complaints.filter(
            c =>
              c.status ===
              "Assigned"
          ).length
      },

      {
        name: "In Progress",

        value:
          complaints.filter(
            c =>
              c.status ===
              "In Progress"
          ).length
      },

      {
        name: "Escalated",

        value:
          complaints.filter(
            c =>
              c.status ===
              "Escalated"
          ).length
      },

      {
        name: "Resolved",

        value:
          complaints.filter(
            c =>
              c.status ===
              "Resolved"
          ).length
      }

    ];


    const priorityColors = [
      "#c62828",
      "#e67e22",
      "#d1a400",
      "#249447"
    ];


    /* =====================================
       MAP
    ===================================== */

    const mapComplaints =
      filteredComplaints.filter(
        c =>
          c.latitude !== null &&
          c.longitude !== null &&
          c.latitude !== undefined &&
          c.longitude !== undefined
      );


    const mapCenter =
      mapComplaints.length > 0
        ? [
            mapComplaints[0].latitude,
            mapComplaints[0].longitude
          ]
        : [
            16.5062,
            80.6480
          ];


    return (

      <div className="dashboard-container">


        {/* HEADER */}

        <header className="top-header">

          <div>

            <h1>
              ResolveAI
            </h1>

            <p>
              Officer Command Dashboard
            </p>

          </div>


          <div className="user-info">

            <span className="role-badge officer-badge">
              🏢 Officer
            </span>

            <span>
              {name}
            </span>

            <button
              className="logout-button"
              onClick={logout}
            >
              Logout
            </button>

          </div>

        </header>


        <main className="officer-main">


          {/* TITLE */}

          <div className="dashboard-title">

            <div>

              <h2>
                Grievance Intelligence Center
              </h2>

              <p>
                AI-powered monitoring, prioritization, incident clustering and resolution.
              </p>

            </div>


            <div className="dashboard-actions">

              <button
                className="refresh-button"
                onClick={
                  loadComplaints
                }
              >
                ↻ Refresh
              </button>


              <button
                className="sla-button"
                onClick={
                  runSlaCheck
                }
              >
                ⏱️ Run SLA Check
              </button>

            </div>

          </div>


          {/* =================================
              KPI CARDS
          ================================= */}

          <div className="stats-grid">


            <div className="stat-card blue-card">

              <span className="stat-icon">
                📋
              </span>

              <div>

                <p>
                  Total Complaints
                </p>

                <h3>
                  {total}
                </h3>

              </div>

            </div>


            <div className="stat-card critical-card">

              <span className="stat-icon">
                🚨
              </span>

              <div>

                <p>
                  Critical
                </p>

                <h3>
                  {critical}
                </h3>

              </div>

            </div>


            <div className="stat-card high-card">

              <span className="stat-icon">
                ⚠️
              </span>

              <div>

                <p>
                  High Priority
                </p>

                <h3>
                  {high}
                </h3>

              </div>

            </div>


            <div className="stat-card farmer-card">

              <span className="stat-icon">
                🌾
              </span>

              <div>

                <p>
                  Farmer Issues
                </p>

                <h3>
                  {farmers}
                </h3>

              </div>

            </div>


            <div className="stat-card incident-card">

              <span className="stat-icon">
                🔗
              </span>

              <div>

                <p>
                  Master Incidents
                </p>

                <h3>
                  {masterIncidents}
                </h3>

              </div>

            </div>


            <div className="stat-card escalation-card">

              <span className="stat-icon">
                ⏱️
              </span>

              <div>

                <p>
                  Escalated
                </p>

                <h3>
                  {escalated}
                </h3>

              </div>

            </div>


            <div className="stat-card resolved-card">

              <span className="stat-icon">
                ✅
              </span>

              <div>

                <p>
                  Resolution Rate
                </p>

                <h3>
                  {resolutionRate}%
                </h3>

              </div>

            </div>

          </div>


          {/* =================================
              ANALYTICS
          ================================= */}

          <section className="analytics-section">

            <div className="section-heading">

              <div>

                <h2>
                  📊 Analytics & Insights
                </h2>

                <p>
                  Understand complaint trends and operational performance.
                </p>

              </div>

            </div>


            <div className="analytics-grid">


              {/* CATEGORY */}

              <div className="chart-card">

                <h3>
                  Complaints by Category
                </h3>

                <ResponsiveContainer
                  width="100%"
                  height={300}
                >

                  <BarChart
                    data={
                      categoryData
                    }
                  >

                    <CartesianGrid
                      strokeDasharray="3 3"
                    />

                    <XAxis
                      dataKey="name"
                      tick={{
                        fontSize: 10
                      }}
                      angle={-20}
                      textAnchor="end"
                      height={70}
                    />

                    <YAxis
                      allowDecimals={false}
                    />

                    <Tooltip />

                    <Bar
                      dataKey="complaints"
                      fill="#1976d2"
                      radius={[
                        5,
                        5,
                        0,
                        0
                      ]}
                    />

                  </BarChart>

                </ResponsiveContainer>

              </div>


              {/* PRIORITY */}

              <div className="chart-card">

                <h3>
                  Priority Distribution
                </h3>

                <ResponsiveContainer
                  width="100%"
                  height={300}
                >

                  <PieChart>

                    <Pie
                      data={
                        priorityData
                      }
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label
                    >

                      {priorityData.map(
                        (entry, index) => (

                          <Cell
                            key={
                              index
                            }
                            fill={
                              priorityColors[
                                index
                              ]
                            }
                          />

                        )
                      )}

                    </Pie>

                    <Tooltip />

                    <Legend />

                  </PieChart>

                </ResponsiveContainer>

              </div>


              {/* STATUS */}

              <div className="chart-card">

                <h3>
                  Resolution Status
                </h3>

                <ResponsiveContainer
                  width="100%"
                  height={300}
                >

                  <BarChart
                    data={
                      statusData
                    }
                    layout="vertical"
                  >

                    <CartesianGrid
                      strokeDasharray="3 3"
                    />

                    <XAxis
                      type="number"
                      allowDecimals={false}
                    />

                    <YAxis
                      type="category"
                      dataKey="name"
                      width={90}
                    />

                    <Tooltip />

                    <Bar
                      dataKey="value"
                      fill="#249447"
                      radius={[
                        0,
                        5,
                        5,
                        0
                      ]}
                    />

                  </BarChart>

                </ResponsiveContainer>

              </div>


              {/* FARMER INSIGHT */}

              <div className="insight-card">

                <div className="insight-icon">
                  🌾
                </div>

                <h3>
                  Farmer Procurement Intelligence
                </h3>

                <p>
                  ResolveAI separately tracks agriculture and procurement grievances to help officers identify recurring farmer issues.
                </p>


                <div className="insight-number">
                  {farmers}
                </div>

                <span>
                  Farmer-related complaints
                </span>


                <div className="insight-row">

                  <div>

                    <strong>
                      {complaints.filter(
                        c =>
                          c.category ===
                          "Agriculture & Procurement" &&
                          c.status ===
                          "Resolved"
                      ).length}
                    </strong>

                    <span>
                      Resolved
                    </span>

                  </div>


                  <div>

                    <strong>
                      {complaints.filter(
                        c =>
                          c.category ===
                          "Agriculture & Procurement" &&
                          c.escalated
                      ).length}
                    </strong>

                    <span>
                      Escalated
                    </span>

                  </div>

                </div>

              </div>

            </div>

          </section>


          {/* =================================
              MAP
          ================================= */}

          <div className="map-card">

            <div className="map-header">

              <div>

                <h3>
                  🗺️ Geographic Complaint Intelligence
                </h3>

                <p>
                  Identify clusters and high-priority complaints by location.
                </p>

              </div>


              <div className="map-legend">

                <span>
                  🔴 Critical
                </span>

                <span>
                  🟠 High
                </span>

                <span>
                  🟡 Medium
                </span>

                <span>
                  🟢 Low
                </span>

              </div>

            </div>


            <div className="map-container">

              <MapContainer
                center={
                  mapCenter
                }
                zoom={12}
                scrollWheelZoom={true}
                style={{
                  height: "100%",
                  width: "100%"
                }}
              >

                <TileLayer
                  attribution='&copy; OpenStreetMap contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />


                {mapComplaints.map(
                  complaint => (

                    <Marker
                      key={
                        complaint.id
                      }
                      position={[
                        complaint.latitude,
                        complaint.longitude
                      ]}
                    >

                      <Popup>

                        <div className="popup-content">

                          <h4>
                            Complaint #
                            {complaint.id}
                          </h4>

                          <p>
                            <strong>
                              Priority:
                            </strong>{" "}
                            {complaint.severity}
                          </p>

                          <p>
                            <strong>
                              Score:
                            </strong>{" "}
                            {complaint.priority_score}
                          </p>

                          <p>
                            <strong>
                              Category:
                            </strong>{" "}
                            {complaint.category}
                          </p>

                          <p>
                            <strong>
                              Status:
                            </strong>{" "}
                            {complaint.status}
                          </p>

                          <p>
                            {complaint.complaint_text}
                          </p>

                        </div>

                      </Popup>

                    </Marker>

                  )
                )}

              </MapContainer>

            </div>

          </div>


          {/* =================================
              FILTERS
          ================================= */}

          <div className="control-panel">

            <div className="search-box">

              🔎

              <input
                type="text"
                placeholder="Search name, complaint or category..."
                value={search}
                onChange={(e) =>
                  setSearch(
                    e.target.value
                  )
                }
              />

            </div>


            <select
              value={
                priorityFilter
              }
              onChange={(e) =>
                setPriorityFilter(
                  e.target.value
                )
              }
            >

              <option value="All">
                All Priorities
              </option>

              <option value="CRITICAL">
                Critical
              </option>

              <option value="HIGH">
                High
              </option>

              <option value="MEDIUM">
                Medium
              </option>

              <option value="LOW">
                Low
              </option>

            </select>


            <select
              value={
                statusFilter
              }
              onChange={(e) =>
                setStatusFilter(
                  e.target.value
                )
              }
            >

              <option value="All">
                All Status
              </option>

              <option value="Submitted">
                Submitted
              </option>

              <option value="Assigned">
                Assigned
              </option>

              <option value="In Progress">
                In Progress
              </option>

              <option value="Escalated">
                Escalated
              </option>

              <option value="Reopened">
                Reopened
              </option>

              <option value="Resolved">
                Resolved
              </option>

            </select>

          </div>


          {/* =================================
              COMPLAINT TABLE
          ================================= */}

          <div className="table-card">

            <div className="table-header">

              <div>

                <h3>
                  AI-Prioritized Complaint Queue
                </h3>

                <p>
                  Click an incident to inspect related complaints.
                </p>

              </div>

              <span className="complaint-count">
                {filteredComplaints.length} Records
              </span>

            </div>


            {dashboardLoading ? (

              <div className="empty-state">
                Loading complaints...
              </div>

            ) : filteredComplaints.length === 0 ? (

              <div className="empty-state">

                <div className="empty-icon">
                  📭
                </div>

                <h3>
                  No complaints found
                </h3>

                <p>
                  Submit complaints through the Citizen or Farmer portal.
                </p>

              </div>

            ) : (

              <div className="table-wrapper">

                <table>

                  <thead>

                    <tr>

                      <th>
                        ID
                      </th>

                      <th>
                        Complainant
                      </th>

                      <th>
                        Complaint
                      </th>

                      <th>
                        Category
                      </th>

                      <th>
                        Priority
                      </th>

                      <th>
                        Score
                      </th>

                      <th>
                        SLA
                      </th>

                      <th>
                        Incident
                      </th>

                      <th>
                        Status
                      </th>

                      <th>
                        Verification
                      </th>

                    </tr>

                  </thead>


                  <tbody>

                    {filteredComplaints.map(
                      complaint => (

                        <tr
                          key={
                            complaint.id
                          }
                        >

                          <td>
                            <strong>
                              #
                              {complaint.id}
                            </strong>
                          </td>


                          <td>
                            {complaint.name}
                          </td>


                          <td className="complaint-text-cell">
                            {complaint.complaint_text}
                          </td>


                          <td>

                            {complaint.category ===
                            "Agriculture & Procurement"
                              ? (
                                <span className="farmer-tag">
                                  🌾 Farmer
                                </span>
                              )
                              : (
                                complaint.category
                              )}

                          </td>


                          <td>

                            <span
                              className={`priority-badge ${
                                complaint.severity ===
                                "CRITICAL"
                                  ? "priority-critical"
                                  : complaint.severity ===
                                    "HIGH"
                                    ? "priority-high"
                                    : complaint.severity ===
                                      "MEDIUM"
                                      ? "priority-medium"
                                      : "priority-low"
                              }`}
                            >
                              {complaint.severity}
                            </span>

                          </td>


                          <td>

                            <strong className="score-number">
                              {
                                complaint.priority_score
                              }
                            </strong>

                          </td>


                          <td>

                            <div className="sla-cell">

                              <strong>
                                {
                                  complaint.sla_hours
                                }h
                              </strong>


                              {complaint.escalated && (

                                <span className="escalated-badge">
                                  ⚠ Escalated
                                </span>

                              )}

                            </div>

                          </td>


                          <td>

                            <button
                              className="incident-button"
                              onClick={() =>
                                openIncident(
                                  complaint.master_incident_id
                                    ? complaint.master_incident_id
                                    : complaint.id
                                )
                              }
                            >

                              🔗 #

                              {complaint.master_incident_id
                                ? complaint.master_incident_id
                                : complaint.id}

                            </button>

                          </td>


                          <td>

                            <select
                              className="status-select"
                              value={
                                complaint.status
                              }
                              onChange={(e) =>
                                updateComplaintStatus(
                                  complaint.id,
                                  e.target.value
                                )
                              }
                            >

                              <option value="Submitted">
                                Submitted
                              </option>

                              <option value="Assigned">
                                Assigned
                              </option>

                              <option value="In Progress">
                                In Progress
                              </option>

                              <option value="Escalated">
                                Escalated
                              </option>

                              <option value="Reopened">
                                Reopened
                              </option>

                              <option value="Resolved">
                                Resolved
                              </option>

                            </select>

                          </td>


                          <td>

                            {complaint.status ===
                            "Resolved" ? (

                              complaint.verification_status ===
                              "Verified" ? (

                                <span className="verified-badge">
                                  ✓ Verified
                                </span>

                              ) : (

                                <button
                                  className="verify-button"
                                  onClick={() => {

                                    setShowVerification(
                                      complaint
                                    );

                                    setVerificationComment(
                                      ""
                                    );

                                  }}
                                >
                                  Verify
                                </button>

                              )

                            ) : (

                              <span className="pending-text">
                                Pending
                              </span>

                            )}

                          </td>

                        </tr>

                      )
                    )}

                  </tbody>

                </table>

              </div>

            )}

          </div>


          {/* =================================
              PRIORITY FORMULA
          ================================= */}

          <div className="formula-card">

            <div className="formula-icon">
              🧠
            </div>

            <div>

              <h3>
                Explainable AI Priority Score
              </h3>

              <p>
                The system combines severity, community impact, urgency, waiting time and location criticality.
              </p>

              <div className="formula">
                P = 0.30S + 0.25A + 0.20U + 0.15W + 0.10C
              </div>

            </div>

          </div>


        </main>


        {/* =================================
            INCIDENT MODAL
        ================================= */}

        {incidentDetails && (

          <div className="modal-overlay">

            <div className="modal-card">

              <button
                className="modal-close"
                onClick={() =>
                  setIncidentDetails(
                    null
                  )
                }
              >
                ×
              </button>


              <div className="modal-title">

                <span className="modal-icon">
                  🔗
                </span>

                <div>

                  <h2>
                    Master Incident #
                    {
                      incidentDetails.master_incident_id
                    }
                  </h2>

                  <p>
                    Related complaints detected by AI
                  </p>

                </div>

              </div>


              {incidentLoading ? (

                <div className="empty-state">
                  Loading incident...
                </div>

              ) : (

                <>

                  <div className="incident-summary">

                    <strong>
                      {
                        incidentDetails.total_related_complaints
                      }
                    </strong>

                    <span>
                      Related Complaints
                    </span>

                  </div>


                  <div className="incident-list">

                    {incidentDetails.complaints.map(
                      complaint => (

                        <div
                          className="incident-item"
                          key={
                            complaint.id
                          }
                        >

                          <div className="incident-item-top">

                            <strong>
                              Complaint #
                              {
                                complaint.id
                              }
                            </strong>

                            <span
                              className={`priority-badge ${
                                complaint.severity ===
                                "CRITICAL"
                                  ? "priority-critical"
                                  : complaint.severity ===
                                    "HIGH"
                                    ? "priority-high"
                                    : complaint.severity ===
                                      "MEDIUM"
                                      ? "priority-medium"
                                      : "priority-low"
                              }`}
                            >
                              {
                                complaint.severity
                              }
                            </span>

                          </div>


                          <p>
                            {
                              complaint.complaint_text
                            }
                          </p>


                          <div className="incident-meta">

                            <span>
                              {complaint.category}
                            </span>

                            <span>
                              Score:
                              {" "}
                              {
                                complaint.priority_score
                              }
                            </span>

                            <span>
                              Status:
                              {" "}
                              {
                                complaint.status
                              }
                            </span>

                          </div>

                        </div>

                      )
                    )}

                  </div>

                </>

              )}

            </div>

          </div>

        )}


        {/* =================================
            VERIFICATION MODAL
        ================================= */}

        {showVerification && (

          <div className="modal-overlay">

            <div className="verification-modal">

              <button
                className="modal-close"
                onClick={() =>
                  setShowVerification(
                    null
                  )
                }
              >
                ×
              </button>


              <div className="modal-title">

                <span className="modal-icon">
                  ✅
                </span>

                <div>

                  <h2>
                    Resolution Verification
                  </h2>

                  <p>
                    Complaint #
                    {
                      showVerification.id
                    }
                  </p>

                </div>

              </div>


              <div className="verification-complaint">

                <strong>
                  Complaint
                </strong>

                <p>
                  {
                    showVerification.complaint_text
                  }
                </p>

              </div>


              <label>
                Verification Comment
              </label>

              <textarea
                rows="4"
                placeholder="Example: Water supply has been restored."
                value={
                  verificationComment
                }
                onChange={(e) =>
                  setVerificationComment(
                    e.target.value
                  )
                }
              />


              <p className="verification-question">
                Has the complaint actually been resolved?
              </p>


              <div className="verification-actions">

                <button
                  className="reject-button"
                  disabled={
                    verificationLoading
                  }
                  onClick={() =>
                    verifyResolution(
                      showVerification.id,
                      false
                    )
                  }
                >
                  ✕ No — Reopen
                </button>


                <button
                  className="confirm-button"
                  disabled={
                    verificationLoading
                  }
                  onClick={() =>
                    verifyResolution(
                      showVerification.id,
                      true
                    )
                  }
                >
                  ✓ Yes — Verify
                </button>

              </div>

            </div>

          </div>

        )}

      </div>
    );
  }


  return null;
}


export default App;