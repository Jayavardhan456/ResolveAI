import { useMemo, useState } from "react";
import axios from "axios";
import "./App.css";

const API_URL = "https://resolveai-bry0.onrender.com";

function App() {
  // =====================================
  // NAVIGATION
  // =====================================

  const [page, setPage] = useState("login");
  const [activeTab, setActiveTab] = useState("submit");

  // =====================================
  // LOGIN
  // =====================================

  const [role, setRole] = useState("");
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");

  // =====================================
  // COMPLAINT
  // =====================================

  const [complaintText, setComplaintText] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [locationName, setLocationName] = useState("");
  const [locationLoading, setLocationLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  // =====================================
  // TRACKING
  // =====================================

  const [myComplaints, setMyComplaints] = useState([]);
  const [trackingLoading, setTrackingLoading] = useState(false);

  // =====================================
  // PROCUREMENT
  // =====================================

  const [centres, setCentres] = useState([]);
  const [centresLoading, setCentresLoading] = useState(false);
  const [cropType, setCropType] = useState("Paddy");
  const [quantity, setQuantity] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookings, setBookings] = useState([]);

  // =====================================
  // OFFICER DASHBOARD
  // =====================================

  const [complaints, setComplaints] = useState([]);
  const [dashboardLoading, setDashboardLoading] = useState(false);

  // =====================================
  // OFFICER UPDATE
  // =====================================

  const [officerName, setOfficerName] = useState("");
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [progress, setProgress] = useState(0);
  const [progressNote, setProgressNote] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("In Progress");

  // =====================================
  // INCIDENT / MAP DETAILS
  // =====================================

  const [incidentDetails, setIncidentDetails] = useState(null);
  const [mapComplaint, setMapComplaint] = useState(null);
  const [mapView, setMapView] = useState("complaints");

  // =====================================
  // LOGIN
  // =====================================

  const handleLogin = (e) => {
    e.preventDefault();

    if (!name.trim() || !mobile.trim() || !password.trim()) {
      alert("Please enter all login details.");
      return;
    }

    if (mobile.length !== 10 || !/^\d+$/.test(mobile)) {
      alert("Mobile number must contain exactly 10 digits.");
      return;
    }

    setPage("role");
  };

  // =====================================
  // ROLE
  // =====================================

  const selectRole = (selectedRole) => {
    setRole(selectedRole);

    if (selectedRole === "Officer") {
      setPage("officer");
      loadAllComplaints();
    } else {
      setPage("user");
      setActiveTab("submit");
    }
  };

  // =====================================
  // LOGOUT
  // =====================================

  const logout = () => {
    setPage("login");
    setRole("");
    setActiveTab("submit");
    setName("");
    setMobile("");
    setPassword("");
    setComplaints([]);
    setMyComplaints([]);
    setResult(null);
  };

  // =====================================
  // LOCATION
  // =====================================

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by this browser.");
      return;
    }

    setLocationLoading(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        setLatitude(lat);
        setLongitude(lon);

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`
          );

          const data = await response.json();

          setLocationName(
            data.display_name || "Current Location"
          );
        } catch {
          setLocationName("Current Location");
        }

        setLocationLoading(false);
      },

      () => {
        alert(
          "Unable to get your location. Please allow location permission."
        );

        setLocationLoading(false);
      }
    );
  };

  // =====================================
  // IMAGE
  // =====================================

  const handleImageUpload = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    setImagePreview(URL.createObjectURL(file));
  };

  // =====================================
  // SUBMIT COMPLAINT
  // =====================================

  const submitComplaint = async (e) => {
    e.preventDefault();

    if (!complaintText.trim()) {
      alert("Please describe your grievance.");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        `${API_URL}/complaints`,
        {
          name,
          role,
          complaint_text: complaintText,
          latitude: latitude ? parseFloat(latitude) : null,
          longitude: longitude ? parseFloat(longitude) : null,
          location_name: locationName || null,
        }
      );

      setResult(response.data);

      setComplaintText("");
      setImagePreview(null);

      alert("Grievance submitted successfully!");
    } catch (error) {
      console.error(error);

      alert(
        error.response?.data?.detail ||
          "Unable to submit grievance. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================
  // LOAD USER COMPLAINTS
  // =====================================

  const loadMyComplaints = async () => {
    setTrackingLoading(true);

    try {
      const response = await axios.get(
        `${API_URL}/complaints`,
        {
          params: {
            name,
          },
        }
      );

      setMyComplaints(response.data);
    } catch (error) {
      console.error(error);
      alert("Unable to load tracking information.");
    } finally {
      setTrackingLoading(false);
    }
  };

  // =====================================
  // LOAD PROCUREMENT CENTRES
  // =====================================

  const loadCentres = async () => {
    setCentresLoading(true);

    try {
      const response = await axios.get(
        `${API_URL}/procurement/centres`
      );

      setCentres(response.data);
    } catch (error) {
      console.error(error);
      alert("Unable to load procurement centres.");
    } finally {
      setCentresLoading(false);
    }
  };

  // =====================================
  // LOAD BOOKINGS
  // =====================================

  const loadBookings = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/procurement/bookings/${name}`
      );

      setBookings(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  // =====================================
  // BOOK SLOT
  // =====================================

  const bookSlot = async (centre, slot) => {
    if (!quantity.trim()) {
      alert(
        "Please enter crop quantity before booking."
      );

      return;
    }

    setBookingLoading(true);

    try {
      await axios.post(
        `${API_URL}/procurement/bookings`,
        {
          farmer_name: name,
          centre_id: centre.id,
          slot_date: slot.date,
          slot_time: slot.time,
          crop_type: cropType,
          quantity,
        }
      );

      alert("Procurement slot booked successfully!");

      loadCentres();
      loadBookings();
    } catch (error) {
      alert(
        error.response?.data?.detail ||
          "Unable to book slot."
      );
    } finally {
      setBookingLoading(false);
    }
  };

  // =====================================
  // LOAD ALL COMPLAINTS
  // =====================================

  const loadAllComplaints = async () => {
    setDashboardLoading(true);

    try {
      const response = await axios.get(
        `${API_URL}/complaints`
      );

      setComplaints(response.data);
    } catch (error) {
      console.error(error);
      alert("Unable to load complaints.");
    } finally {
      setDashboardLoading(false);
    }
  };

  // =====================================
  // OFFICER UPDATE
  // =====================================

  const openOfficerUpdate = (complaint) => {
    setSelectedComplaint(complaint);

    setOfficerName(
      complaint.assigned_officer || ""
    );

    setProgress(
      complaint.officer_progress || 0
    );

    setProgressNote(
      complaint.progress_note || ""
    );

    setSelectedStatus(
      complaint.status || "In Progress"
    );
  };

  const updateOfficerProgress = async () => {
    if (!selectedComplaint) return;

    try {
      await axios.put(
        `${API_URL}/complaints/${selectedComplaint.id}/officer`,
        {
          assigned_officer:
            officerName || null,

          officer_progress:
            Number(progress),

          progress_note:
            progressNote,

          status:
            selectedStatus,
        }
      );

      alert(
        "Officer progress updated successfully!"
      );

      setSelectedComplaint(null);

      loadAllComplaints();
    } catch (error) {
      console.error(error);

      alert(
        "Unable to update officer progress."
      );
    }
  };

  // =====================================
  // MASTER INCIDENT
  // =====================================

  const openIncident = async (incidentId) => {
    if (!incidentId) {
      alert(
        "This complaint is not currently linked to a master incident."
      );

      return;
    }

    try {
      const response = await axios.get(
        `${API_URL}/incidents/${incidentId}`
      );

      setIncidentDetails(response.data);
      setMapComplaint(null);
    } catch (error) {
      console.error(error);

      alert(
        "Unable to load master incident details."
      );
    }
  };

  // =====================================
  // STATUS
  // =====================================

  const getStatusClass = (status) => {
    if (!status) return "";

    return status
      .toLowerCase()
      .replace(/\s+/g, "-");
  };

  // =====================================
  // PRIORITY
  // =====================================

  const getPriorityClass = (severity) => {
    const value = String(
      severity || ""
    ).toLowerCase();

    if (value.includes("high")) {
      return "priority-high";
    }

    if (value.includes("medium")) {
      return "priority-medium";
    }

    if (value.includes("low")) {
      return "priority-low";
    }

    return "priority-normal";
  };

  const getPriorityIcon = (severity) => {
    const value = String(
      severity || ""
    ).toLowerCase();

    if (value.includes("high")) return "🔴";
    if (value.includes("medium")) return "🟠";
    if (value.includes("low")) return "🟢";

    return "🔵";
  };

  // =====================================
  // ANALYTICS
  // =====================================

  const analytics = useMemo(() => {
    const total = complaints.length;

    const resolved =
      complaints.filter(
        (c) =>
          String(c.status || "")
            .toLowerCase()
            .includes("resolved")
      ).length;

    const assigned =
      complaints.filter(
        (c) =>
          c.assigned_officer ||
          String(c.status || "")
            .toLowerCase()
            .includes("assigned")
      ).length;

    const inProgress =
      complaints.filter(
        (c) =>
          String(c.status || "")
            .toLowerCase()
            .includes("progress")
      ).length;

    const pending = Math.max(
      total - resolved - inProgress,
      0
    );

    const high =
      complaints.filter((c) =>
        String(c.severity || "")
          .toLowerCase()
          .includes("high")
      ).length;

    const medium =
      complaints.filter((c) =>
        String(c.severity || "")
          .toLowerCase()
          .includes("medium")
      ).length;

    const low =
      complaints.filter((c) =>
        String(c.severity || "")
          .toLowerCase()
          .includes("low")
      ).length;

    const progressAverage =
      total === 0
        ? 0
        : Math.round(
            complaints.reduce(
              (sum, c) =>
                sum +
                Number(
                  c.officer_progress || 0
                ),
              0
            ) / total
          );

    return {
      total,
      resolved,
      assigned,
      inProgress,
      pending,
      high,
      medium,
      low,
      progressAverage,
    };
  }, [complaints]);

  // =====================================
  // MAP POSITION
  // =====================================

  const getMapPosition = (
    complaint,
    index
  ) => {
    const lat = Number(
      complaint.latitude
    );

    const lon = Number(
      complaint.longitude
    );

    // If actual coordinates are available,
    // place the marker using them.

    if (!Number.isNaN(lat) && !Number.isNaN(lon)) {
      const top =
        Math.min(
          82,
          Math.max(
            12,
            48 - (lat % 18) * 2.2
          )
        );

      const left =
        Math.min(
          88,
          Math.max(
            8,
            50 + (lon % 20) * 2.5
          )
        );

      return {
        top: `${top}%`,
        left: `${left}%`,
      };
    }

    // Fallback positions for complaints
    // without coordinates.

    const positions = [
      { top: "26%", left: "42%" },
      { top: "42%", left: "58%" },
      { top: "62%", left: "47%" },
      { top: "35%", left: "68%" },
      { top: "55%", left: "30%" },
      { top: "72%", left: "65%" },
      { top: "20%", left: "28%" },
      { top: "48%", left: "76%" },
    ];

    return positions[
      index % positions.length
    ];
  };

  // =====================================
  // LOGIN PAGE
  // =====================================

  if (page === "login") {
    return (
      <div className="app-shell">
        <div className="login-card">
          <div className="logo-circle">
            R
          </div>

          <h1>ResolveAI</h1>

          <p className="subtitle">
            Smart Complaint Prioritization
            & Resolution System
          </p>

          <form onSubmit={handleLogin}>
            <label>Full Name</label>

            <input
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
            />

            <label>
              Mobile Number
            </label>

            <input
              type="tel"
              placeholder="Enter 10 digit mobile number"
              value={mobile}
              onChange={(e) =>
                setMobile(e.target.value)
              }
            />

            <label>Password</label>

            <input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
            />

            <button
              className="primary-button"
              type="submit"
            >
              Continue →
            </button>
          </form>

          <p className="prototype-text">
            AI-powered grievance
            management prototype
          </p>
        </div>
      </div>
    );
  }

  // =====================================
  // ROLE PAGE
  // =====================================

  if (page === "role") {
    return (
      <div className="app-shell">
        <div className="role-card">
          <div className="logo-circle">
            R
          </div>

          <h1>Welcome, {name}</h1>

          <p>
            Select how you want to use
            ResolveAI
          </p>

          <div className="role-grid">
            <button
              className="role-option"
              onClick={() =>
                selectRole("Citizen")
              }
            >
              <span className="role-icon">
                👤
              </span>

              <h2>Citizen</h2>

              <p>
                Submit and track public
                grievances
              </p>
            </button>

            <button
              className="role-option"
              onClick={() =>
                selectRole("Farmer")
              }
            >
              <span className="role-icon">
                🌾
              </span>

              <h2>Farmer</h2>

              <p>
                Submit grievances and book
                procurement slots
              </p>
            </button>

            <button
              className="role-option"
              onClick={() =>
                selectRole("Officer")
              }
            >
              <span className="role-icon">
                🏢
              </span>

              <h2>Government Officer</h2>

              <p>
                Monitor complaints,
                incidents and progress
              </p>
            </button>
          </div>

          <button
            className="secondary-button"
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

  // =====================================
  // USER / FARMER DASHBOARD
  // =====================================

  if (page === "user") {
    return (
      <div className="dashboard">
        <header className="header">
          <div>
            <h1>ResolveAI</h1>

            <p>
              Smart Complaint Prioritization
              & Resolution System
            </p>
          </div>

          <div className="header-user">
            <span>
              👋 {name}
            </span>

            <span className="role-tag">
              {role}
            </span>

            <button onClick={logout}>
              Logout
            </button>
          </div>
        </header>

        <main className="content">
          <div className="tabs">
            <button
              className={
                activeTab === "submit"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setActiveTab("submit")
              }
            >
              📝 Submit Complaint
            </button>

            <button
              className={
                activeTab === "tracking"
                  ? "active"
                  : ""
              }
              onClick={() => {
                setActiveTab("tracking");
                loadMyComplaints();
              }}
            >
              📍 Track Complaints
            </button>

            {role === "Farmer" && (
              <button
                className={
                  activeTab === "procurement"
                    ? "active"
                    : ""
                }
                onClick={() => {
                  setActiveTab(
                    "procurement"
                  );

                  loadCentres();
                  loadBookings();
                }}
              >
                🌾 Procurement Slots
              </button>
            )}
          </div>

          {/* ==========================
              SUBMIT COMPLAINT
          =========================== */}

          {activeTab === "submit" && (
            <div className="panel">
              <div className="panel-heading">
                <div>
                  <h2>
                    Submit a Grievance
                  </h2>

                  <p>
                    Describe your problem.
                    ResolveAI will prioritize
                    and route it.
                  </p>
                </div>

                <span className="ai-badge">
                  ✨ AI Prioritization
                </span>
              </div>

              <form
                onSubmit={submitComplaint}
              >
                <label>
                  Describe the Problem
                </label>

                <textarea
                  rows="6"
                  placeholder="Explain the issue in detail..."
                  value={complaintText}
                  onChange={(e) =>
                    setComplaintText(
                      e.target.value
                    )
                  }
                />

                <div className="section-card">
                  <h3>
                    📍 Complaint Location
                  </h3>

                  <p>
                    Use your current location
                    or enter it manually.
                  </p>

                  <div className="location-choice">
                    <button
                      type="button"
                      className="location-button"
                      onClick={
                        getCurrentLocation
                      }
                    >
                      {locationLoading
                        ? "Getting Location..."
                        : "📡 Use Current Location"}
                    </button>
                  </div>

                  <div className="manual-location">
                    <label>
                      Enter Location Manually
                    </label>

                    <input
                      placeholder="Example: Guntur, Andhra Pradesh"
                      value={locationName}
                      onChange={(e) =>
                        setLocationName(
                          e.target.value
                        )
                      }
                    />

                    <div className="manual-coordinate-grid">
                      <input
                        type="number"
                        placeholder="Latitude (optional)"
                        value={latitude}
                        onChange={(e) =>
                          setLatitude(
                            e.target.value
                          )
                        }
                      />

                      <input
                        type="number"
                        placeholder="Longitude (optional)"
                        value={longitude}
                        onChange={(e) =>
                          setLongitude(
                            e.target.value
                          )
                        }
                      />
                    </div>
                  </div>

                  {locationName && (
                    <div className="location-result">
                      <strong>
                        📍 Selected Location
                      </strong>

                      <p>
                        {locationName}
                      </p>
                    </div>
                  )}
                </div>

                <div className="section-card">
                  <h3>
                    📷 Supporting Image
                  </h3>

                  <p>
                    Upload an image of the
                    problem if available.
                  </p>

                  <label className="upload-area">
                    📤 Click to upload image

                    <input
                      type="file"
                      accept="image/*"
                      onChange={
                        handleImageUpload
                      }
                    />
                  </label>

                  {imagePreview && (
                    <img
                      src={imagePreview}
                      alt="Complaint preview"
                      className="image-preview"
                    />
                  )}
                </div>

                <button
                  className="primary-button"
                  type="submit"
                  disabled={loading}
                >
                  {loading
                    ? "Submitting..."
                    : "🚀 Submit Complaint"}
                </button>
              </form>

              {result && (
                <div className="success-result">
                  <h3>
                    ✅ Complaint Submitted
                  </h3>

                  <div className="result-grid">
                    <div>
                      <span>
                        Complaint ID
                      </span>

                      <strong>
                        #
                        {result.id ||
                          result.complaint_id ||
                          "Generated"}
                      </strong>
                    </div>

                    <div>
                      <span>
                        Priority
                      </span>

                      <strong>
                        {result.severity ||
                          result.priority ||
                          "AI Classified"}
                      </strong>
                    </div>

                    <div>
                      <span>
                        Department
                      </span>

                      <strong>
                        {result.department ||
                          "Assigned Automatically"}
                      </strong>
                    </div>

                    <div>
                      <span>
                        Status
                      </span>

                      <strong>
                        {result.status ||
                          "Submitted"}
                      </strong>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ==========================
              TRACKING
          =========================== */}

          {activeTab === "tracking" && (
            <div className="panel">
              <div className="panel-heading">
                <div>
                  <h2>
                    📍 Complaint Tracking
                  </h2>

                  <p>
                    Track officer assignment
                    and resolution progress.
                  </p>
                </div>

                <button
                  className="secondary-button"
                  onClick={
                    loadMyComplaints
                  }
                >
                  🔄 Refresh
                </button>
              </div>

              {trackingLoading ? (
                <p>
                  Loading your complaints...
                </p>
              ) : myComplaints.length ===
                0 ? (
                <div className="empty-state">
                  <h3>
                    No Complaints Found
                  </h3>

                  <p>
                    Submit a grievance to
                    start tracking it.
                  </p>
                </div>
              ) : (
                <div className="tracking-list">
                  {myComplaints.map(
                    (complaint) => (
                      <div
                        className="tracking-card"
                        key={complaint.id}
                      >
                        <div className="tracking-top">
                          <div>
                            <h3>
                              Complaint #
                              {complaint.id}
                            </h3>

                            <p>
                              {
                                complaint.complaint_text
                              }
                            </p>
                          </div>

                          <span
                            className={`status ${getStatusClass(
                              complaint.status
                            )}`}
                          >
                            {complaint.status ||
                              "Submitted"}
                          </span>
                        </div>

                        <div className="tracking-grid">
                          <div>
                            <span>
                              📍 Location
                            </span>

                            <strong>
                              {complaint.location_name ||
                                "Not specified"}
                            </strong>
                          </div>

                          <div>
                            <span>
                              👨‍💼 Officer
                            </span>

                            <strong>
                              {complaint.assigned_officer ||
                                "Not Assigned Yet"}
                            </strong>
                          </div>

                          <div>
                            <span>
                              🎯 Priority
                            </span>

                            <strong>
                              {complaint.severity ||
                                "Under Review"}
                            </strong>
                          </div>

                          <div>
                            <span>
                              🏢 Department
                            </span>

                            <strong>
                              {complaint.department ||
                                "Pending Routing"}
                            </strong>
                          </div>
                        </div>

                        <div className="progress-section">
                          <div className="progress-label">
                            <strong>
                              Officer Progress
                            </strong>

                            <span>
                              {complaint.officer_progress ||
                                0}
                              %
                            </span>
                          </div>

                          <div className="progress-bar">
                            <div
                              className="progress-fill"
                              style={{
                                width: `${
                                  complaint.officer_progress ||
                                  0
                                }%`,
                              }}
                            />
                          </div>

                          <p className="progress-note">
                            <strong>
                              Latest Update:
                            </strong>{" "}
                            {complaint.progress_note ||
                              "Waiting for officer update."}
                          </p>
                        </div>

                        <div className="timeline">
                          <span
                            className={`timeline-step ${
                              complaint.status
                                ? "completed"
                                : ""
                            }`}
                          >
                            ✓ Submitted
                          </span>

                          <span
                            className={`timeline-step ${
                              complaint.assigned_officer
                                ? "completed"
                                : ""
                            }`}
                          >
                            👨‍💼 Assigned
                          </span>

                          <span
                            className={`timeline-step ${
                              Number(
                                complaint.officer_progress ||
                                  0
                              ) > 0
                                ? "completed"
                                : ""
                            }`}
                          >
                            🔧 Work Started
                          </span>

                          <span
                            className={`timeline-step ${
                              String(
                                complaint.status || ""
                              )
                                .toLowerCase()
                                .includes(
                                  "resolved"
                                )
                                ? "completed"
                                : ""
                            }`}
                          >
                            ✅ Resolved
                          </span>
                        </div>

                        {complaint.master_incident_id && (
                          <button
                            className="incident-link-button"
                            onClick={() =>
                              openIncident(
                                complaint.master_incident_id
                              )
                            }
                          >
                            🔗 View Master Incident
                          </button>
                        )}
                      </div>
                    )
                  )}
                </div>
              )}
            </div>
          )}

          {/* ==========================
              PROCUREMENT
          =========================== */}

          {activeTab === "procurement" &&
            role === "Farmer" && (
              <div className="panel">
                <div className="panel-heading">
                  <div>
                    <h2>
                      🌾 Farmer Procurement
                    </h2>

                    <p>
                      Find available centres
                      and book a convenient
                      procurement slot.
                    </p>
                  </div>

                  <button
                    className="secondary-button"
                    onClick={() => {
                      loadCentres();
                      loadBookings();
                    }}
                  >
                    🔄 Refresh
                  </button>
                </div>

                <div className="booking-form">
                  <div>
                    <label>
                      Crop Type
                    </label>

                    <select
                      value={cropType}
                      onChange={(e) =>
                        setCropType(
                          e.target.value
                        )
                      }
                    >
                      <option>
                        Paddy
                      </option>

                      <option>
                        Wheat
                      </option>

                      <option>
                        Maize
                      </option>

                      <option>
                        Cotton
                      </option>

                      <option>
                        Other
                      </option>
                    </select>
                  </div>

                  <div>
                    <label>
                      Quantity
                    </label>

                    <input
                      placeholder="Example: 50 Quintals"
                      value={quantity}
                      onChange={(e) =>
                        setQuantity(
                          e.target.value
                        )
                      }
                    />
                  </div>
                </div>

                <h2 className="section-title">
                  🏢 Available Centres
                </h2>

                {centresLoading ? (
                  <p>
                    Loading centres...
                  </p>
                ) : centres.length === 0 ? (
                  <div className="empty-state">
                    <p>
                      No procurement centres
                      available.
                    </p>
                  </div>
                ) : (
                  <div className="centres-grid">
                    {centres.map(
                      (centre) => (
                        <div
                          className="centre-card"
                          key={centre.id}
                        >
                          <h3>
                            {centre.name}
                          </h3>

                          <p>
                            📍{" "}
                            {centre.location ||
                              centre.address ||
                              "Location details available at centre"}
                          </p>

                          <p>
                            📞{" "}
                            {centre.contact ||
                              "Contact at centre"}
                          </p>

                          <div className="slots-list">
                            <h4>
                              Available Slots
                            </h4>

                            {(centre.slots ||
                              []).length ===
                            0 ? (
                              <p>
                                No slots available.
                              </p>
                            ) : (
                              centre.slots.map(
                                (
                                  slot,
                                  index
                                ) => (
                                  <div
                                    className="slot-row"
                                    key={index}
                                  >
                                    <div>
                                      <strong>
                                        📅{" "}
                                        {slot.date}
                                      </strong>

                                      <p>
                                        ⏰{" "}
                                        {slot.time}
                                      </p>
                                    </div>

                                    <div className="slot-action">
                                      <span
                                        className={
                                          Number(
                                            slot.available_capacity ??
                                              slot.capacity ??
                                              1
                                          ) > 0
                                            ? "available"
                                            : "full"
                                        }
                                      >
                                        {Number(
                                          slot.available_capacity ??
                                            slot.capacity ??
                                            1
                                        ) > 0
                                          ? "Available"
                                          : "Full"}
                                      </span>

                                      <button
                                        disabled={
                                          bookingLoading ||
                                          Number(
                                            slot.available_capacity ??
                                              slot.capacity ??
                                              1
                                          ) <= 0
                                        }
                                        onClick={() =>
                                          bookSlot(
                                            centre,
                                            slot
                                          )
                                        }
                                      >
                                        Book
                                      </button>
                                    </div>
                                  </div>
                                )
                              )
                            )}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                )}

                <h2 className="section-title">
                  📋 My Bookings
                </h2>

                {bookings.length === 0 ? (
                  <div className="empty-state">
                    <p>
                      You have not booked any
                      procurement slots yet.
                    </p>
                  </div>
                ) : (
                  <div className="booking-list">
                    {bookings.map(
                      (booking) => (
                        <div
                          className="booking-card"
                          key={
                            booking.id ||
                            `${booking.slot_date}-${booking.slot_time}`
                          }
                        >
                          <div>
                            <h3>
                              {booking.centre_name ||
                                "Procurement Centre"}
                            </h3>

                            <p>
                              🌾{" "}
                              {booking.crop_type}
                            </p>

                            <p>
                              📅{" "}
                              {booking.slot_date}{" "}
                              ⏰{" "}
                              {booking.slot_time}
                            </p>
                          </div>

                          <span className="status booked">
                            Booked
                          </span>
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>
            )}
        </main>

        {/* ==========================
            MASTER INCIDENT MODAL
        =========================== */}

        {incidentDetails && (
          <div className="modal-overlay">
            <div className="modal incident-modal">
              <button
                className="close-button"
                onClick={() =>
                  setIncidentDetails(null)
                }
              >
                ×
              </button>

              <div className="incident-header">
                <div>
                  <span className="incident-label">
                    MASTER INCIDENT
                  </span>

                  <h2>
                    🔗 Incident #
                    {
                      incidentDetails.master_incident_id
                    }
                  </h2>
                </div>

                <span className="incident-count">
                  {
                    incidentDetails.total_related_complaints
                  }{" "}
                  Related Complaints
                </span>
              </div>

              <div className="incident-explanation">
                <h3>
                  What does this indicate?
                </h3>

                <p>
                  A Master Incident represents
                  multiple citizen complaints
                  related to the same major
                  issue or affected area.
                  ResolveAI groups them so
                  officers can resolve the
                  common root problem instead
                  of handling every complaint
                  independently.
                </p>
              </div>

              <div className="related-list">
                {(
                  incidentDetails.complaints ||
                  []
                ).map((complaint) => (
                  <div
                    className="related-item"
                    key={complaint.id}
                  >
                    <div className="related-item-top">
                      <strong>
                        Complaint #
                        {complaint.id}
                      </strong>

                      <span
                        className={`status ${getStatusClass(
                          complaint.status
                        )}`}
                      >
                        {complaint.status ||
                          "Submitted"}
                      </span>
                    </div>

                    <p>
                      {
                        complaint.complaint_text
                      }
                    </p>

                    <div className="related-meta">
                      <span>
                        📍{" "}
                        {complaint.location_name ||
                          "Location not specified"}
                      </span>

                      <span>
                        🎯{" "}
                        {complaint.severity ||
                          "Normal"}
                      </span>

                      <span>
                        👨‍💼{" "}
                        {complaint.assigned_officer ||
                          "Not Assigned"}
                      </span>
                    </div>

                    <div className="progress-bar small-progress">
                      <div
                        className="progress-fill"
                        style={{
                          width: `${
                            complaint.officer_progress ||
                            0
                          }%`,
                        }}
                      />
                    </div>

                    <small>
                      Progress:{" "}
                      {
                        complaint.officer_progress ||
                        0
                      }
                      %
                    </small>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // =====================================
  // OFFICER DASHBOARD
  // =====================================

  if (page === "officer") {
    return (
      <div className="dashboard officer-dashboard">
        <header className="header">
          <div>
            <h1>
              ResolveAI Officer Command
              Centre
            </h1>

            <p>
              AI-powered complaint monitoring,
              incident management and
              resolution tracking
            </p>
          </div>

          <div className="header-user">
            <span>
              👨‍💼 {name}
            </span>

            <span className="role-tag">
              Government Officer
            </span>

            <button onClick={logout}>
              Logout
            </button>
          </div>
        </header>

        <main className="content">
          <div className="officer-actions">
            <button
              className="primary-button"
              onClick={
                loadAllComplaints
              }
            >
              🔄 Refresh Dashboard
            </button>

            <button
              className="secondary-button"
              onClick={() =>
                setMapView(
                  mapView === "complaints"
                    ? "incidents"
                    : "complaints"
                )
              }
            >
              🗺️ Map View:{" "}
              {mapView === "complaints"
                ? "Complaints"
                : "Incidents"}
            </button>
          </div>

          {/* ==========================
              STATISTICS
          =========================== */}

          <div className="stats-grid">
            <div className="stat-card">
              <span>
                Total Complaints
              </span>

              <h2>
                {analytics.total}
              </h2>
            </div>

            <div className="stat-card">
              <span>
                High Priority
              </span>

              <h2>
                {analytics.high}
              </h2>
            </div>

            <div className="stat-card">
              <span>
                In Progress
              </span>

              <h2>
                {analytics.inProgress}
              </h2>
            </div>

            <div className="stat-card">
              <span>
                Resolved
              </span>

              <h2>
                {analytics.resolved}
              </h2>
            </div>
          </div>

          {/* ==========================
              INTERACTIVE MAP
          =========================== */}

          <div className="analytics-card full-map-card">
            <div className="panel-heading">
              <div>
                <h2>
                  🗺️ Live Complaint Map
                </h2>

                <p>
                  Click any complaint marker
                  to view the problem,
                  officer assignment, progress
                  and Master Incident details.
                </p>
              </div>

              <span className="map-live-badge">
                ● LIVE COMPLAINT DATA
              </span>
            </div>

            <div className="realistic-map">
              {/* Decorative roads */}

              <div className="road road-one" />
              <div className="road road-two" />
              <div className="road road-three" />
              <div className="road road-four" />

              {/* Decorative water */}

              <div className="map-river" />

              {/* Decorative locations */}

              <span className="map-city city-one">
                Vijayawada
              </span>

              <span className="map-city city-two">
                Guntur
              </span>

              <span className="map-city city-three">
                Amaravati
              </span>

              <span className="map-city city-four">
                Tenali
              </span>

              {complaints.map(
                (complaint, index) => {
                  const position =
                    getMapPosition(
                      complaint,
                      index
                    );

                  return (
                    <button
                      key={complaint.id}
                      className={`map-marker ${getPriorityClass(
                        complaint.severity
                      )}`}
                      style={position}
                      onClick={() =>
                        setMapComplaint(
                          complaint
                        )
                      }
                      title={`Complaint #${complaint.id}`}
                    >
                      📍

                      <span className="marker-number">
                        {complaint.id}
                      </span>
                    </button>
                  );
                }
              )}

              {complaints.length === 0 && (
                <div className="map-empty">
                  {dashboardLoading
                    ? "Loading complaints..."
                    : "No complaint locations available."}
                </div>
              )}

              <div className="map-legend-box">
                <strong>
                  Complaint Priority
                </strong>

                <span>
                  🔴 High
                </span>

                <span>
                  🟠 Medium
                </span>

                <span>
                  🟢 Low
                </span>

                <span>
                  🔵 Normal
                </span>
              </div>
            </div>
          </div>

          {/* ==========================
              ANALYTICS
          =========================== */}

          <div className="analytics-grid">
            <div className="analytics-card">
              <h2>
                📊 Priority Distribution
              </h2>

              <p>
                Complaint priority classified
                by ResolveAI.
              </p>

              <div className="bar-chart">
                <div className="bar-row">
                  <span>
                    🔴 High
                  </span>

                  <div className="bar-track">
                    <div
                      className="bar-fill priority-fill high-bar"
                      style={{
                        width: `${
                          analytics.total
                            ? (analytics.high /
                                analytics.total) *
                              100
                            : 0
                        }%`,
                      }}
                    />
                  </div>

                  <strong>
                    {analytics.high}
                  </strong>
                </div>

                <div className="bar-row">
                  <span>
                    🟠 Medium
                  </span>

                  <div className="bar-track">
                    <div
                      className="bar-fill medium-bar"
                      style={{
                        width: `${
                          analytics.total
                            ? (analytics.medium /
                                analytics.total) *
                              100
                            : 0
                        }%`,
                      }}
                    />
                  </div>

                  <strong>
                    {analytics.medium}
                  </strong>
                </div>

                <div className="bar-row">
                  <span>
                    🟢 Low
                  </span>

                  <div className="bar-track">
                    <div
                      className="bar-fill low-bar"
                      style={{
                        width: `${
                          analytics.total
                            ? (analytics.low /
                                analytics.total) *
                              100
                            : 0
                        }%`,
                      }}
                    />
                  </div>

                  <strong>
                    {analytics.low}
                  </strong>
                </div>
              </div>
            </div>

            <div className="analytics-card resolution-card">
              <h2>
                ⏳ Resolution Overview
              </h2>

              <p>
                Current complaint resolution
                performance.
              </p>

              <div className="donut-placeholder">
                <strong>
                  {analytics.total
                    ? Math.round(
                        (analytics.resolved /
                          analytics.total) *
                          100
                      )
                    : 0}
                  %
                </strong>

                <span>
                  Resolved
                </span>
              </div>

              <div className="resolution-summary">
                <div>
                  <span>
                    Resolved
                  </span>

                  <strong>
                    {analytics.resolved}
                  </strong>
                </div>

                <div>
                  <span>
                    Pending
                  </span>

                  <strong>
                    {analytics.pending}
                  </strong>
                </div>

                <div>
                  <span>
                    Assigned
                  </span>

                  <strong>
                    {analytics.assigned}
                  </strong>
                </div>

                <div>
                  <span>
                    Avg Progress
                  </span>

                  <strong>
                    {
                      analytics.progressAverage
                    }
                    %
                  </strong>
                </div>
              </div>
            </div>
          </div>

          {/* ==========================
              COMPLAINT MANAGEMENT
          =========================== */}

          <div className="panel">
            <div className="panel-heading">
              <div>
                <h2>
                  📋 Complaint Management
                </h2>

                <p>
                  Assign officers, update
                  progress and investigate
                  Master Incidents.
                </p>
              </div>

              <span className="ai-badge">
                ✨ AI Prioritized
              </span>
            </div>

            {dashboardLoading ? (
              <p>
                Loading complaints...
              </p>
            ) : complaints.length === 0 ? (
              <div className="empty-state">
                <h3>
                  No Complaints Available
                </h3>

                <p>
                  Complaints submitted by
                  citizens will appear here.
                </p>
              </div>
            ) : (
              <div className="complaints-table">
                {complaints.map(
                  (complaint) => (
                    <div
                      className="officer-complaint-card"
                      key={complaint.id}
                    >
                      <div className="complaint-info">
                        <div className="complaint-title-row">
                          <h3>
                            Complaint #
                            {complaint.id}
                          </h3>

                          <span
                            className={`status ${getStatusClass(
                              complaint.status
                            )}`}
                          >
                            {complaint.status ||
                              "Submitted"}
                          </span>
                        </div>

                        <p>
                          {
                            complaint.complaint_text
                          }
                        </p>

                        <div className="complaint-meta">
                          <span>
                            📍{" "}
                            {complaint.location_name ||
                              "No location"}
                          </span>

                          <span>
                            {getPriorityIcon(
                              complaint.severity
                            )}{" "}
                            {complaint.severity ||
                              "Normal"}
                          </span>

                          <span>
                            🏢{" "}
                            {complaint.department ||
                              "Not Assigned"}
                          </span>

                          {complaint.master_incident_id && (
                            <span className="incident-meta">
                              🔗 Incident #
                              {
                                complaint.master_incident_id
                              }
                            </span>
                          )}
                        </div>

                        <div className="mini-progress">
                          <span>
                            Officer:{" "}
                            {complaint.assigned_officer ||
                              "Not Assigned"}
                          </span>

                          <div className="progress-bar">
                            <div
                              className="progress-fill"
                              style={{
                                width: `${
                                  complaint.officer_progress ||
                                  0
                                }%`,
                              }}
                            />
                          </div>

                          <strong>
                            {complaint.officer_progress ||
                              0}
                            %
                          </strong>
                        </div>
                      </div>

                      <div className="complaint-actions">
                        <button
                          className="primary-button small"
                          onClick={() =>
                            openOfficerUpdate(
                              complaint
                            )
                          }
                        >
                          👨‍💼 Assign / Update
                        </button>

                        <button
                          className="secondary-button small"
                          onClick={() =>
                            setMapComplaint(
                              complaint
                            )
                          }
                        >
                          📍 View Details
                        </button>

                        {complaint.master_incident_id && (
                          <button
                            className="secondary-button small"
                            onClick={() =>
                              openIncident(
                                complaint.master_incident_id
                              )
                            }
                          >
                            🔗 Master Incident
                          </button>
                        )}
                      </div>
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        </main>

        {/* ==========================
            MAP COMPLAINT DETAILS
        =========================== */}

        {mapComplaint && (
          <div className="modal-overlay">
            <div className="modal complaint-detail-modal">
              <button
                className="close-button"
                onClick={() =>
                  setMapComplaint(null)
                }
              >
                ×
              </button>

              <div className="map-detail-header">
                <div>
                  <span className="detail-label">
                    COMPLAINT DETAILS
                  </span>

                  <h2>
                    📍 Complaint #
                    {mapComplaint.id}
                  </h2>
                </div>

                <span
                  className={`status ${getStatusClass(
                    mapComplaint.status
                  )}`}
                >
                  {mapComplaint.status ||
                    "Submitted"}
                </span>
              </div>

              <div className="map-problem-box">
                <h3>
                  🚨 Reported Problem
                </h3>

                <p>
                  {
                    mapComplaint.complaint_text
                  }
                </p>
              </div>

              <div className="detail-grid">
                <div>
                  <span>
                    📍 Location
                  </span>

                  <strong>
                    {mapComplaint.location_name ||
                      "Not specified"}
                  </strong>
                </div>

                <div>
                  <span>
                    🎯 AI Priority
                  </span>

                  <strong>
                    {getPriorityIcon(
                      mapComplaint.severity
                    )}{" "}
                    {mapComplaint.severity ||
                      "Normal"}
                  </strong>
                </div>

                <div>
                  <span>
                    🏢 Department
                  </span>

                  <strong>
                    {mapComplaint.department ||
                      "Pending Routing"}
                  </strong>
                </div>

                <div>
                  <span>
                    👨‍💼 Assigned Officer
                  </span>

                  <strong>
                    {mapComplaint.assigned_officer ||
                      "Not Assigned"}
                  </strong>
                </div>
              </div>

              <div className="detail-progress-section">
                <div className="progress-label">
                  <strong>
                    Officer Work Progress
                  </strong>

                  <span>
                    {mapComplaint.officer_progress ||
                      0}
                    %
                  </span>
                </div>

                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${
                        mapComplaint.officer_progress ||
                        0
                      }%`,
                    }}
                  />
                </div>

                <p>
                  <strong>
                    Latest Officer Update:
                  </strong>{" "}
                  {mapComplaint.progress_note ||
                    "No progress update available yet."}
                </p>
              </div>

              <div className="detail-actions">
                <button
                  className="primary-button"
                  onClick={() => {
                    setMapComplaint(null);
                    openOfficerUpdate(
                      mapComplaint
                    );
                  }}
                >
                  👨‍💼 Update Complaint
                </button>

                {mapComplaint.master_incident_id && (
                  <button
                    className="incident-detail-button"
                    onClick={() =>
                      openIncident(
                        mapComplaint.master_incident_id
                      )
                    }
                  >
                    🔗 View Master Incident #
                    {
                      mapComplaint.master_incident_id
                    }
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ==========================
            OFFICER UPDATE MODAL
        =========================== */}

        {selectedComplaint && (
          <div className="modal-overlay">
            <div className="modal">
              <button
                className="close-button"
                onClick={() =>
                  setSelectedComplaint(
                    null
                  )
                }
              >
                ×
              </button>

              <h2>
                Update Complaint #
                {selectedComplaint.id}
              </h2>

              <div className="modal-complaint-preview">
                <strong>
                  Reported Problem
                </strong>

                <p>
                  {
                    selectedComplaint.complaint_text
                  }
                </p>
              </div>

              <label>
                Assigned Officer
              </label>

              <input
                placeholder="Enter officer name"
                value={officerName}
                onChange={(e) =>
                  setOfficerName(
                    e.target.value
                  )
                }
              />

              <label>
                Work Progress: {progress}%
              </label>

              <input
                type="range"
                min="0"
                max="100"
                value={progress}
                onChange={(e) =>
                  setProgress(
                    e.target.value
                  )
                }
              />

              <label>
                Progress Status
              </label>

              <select
                value={selectedStatus}
                onChange={(e) =>
                  setSelectedStatus(
                    e.target.value
                  )
                }
              >
                <option>
                  Submitted
                </option>

                <option>
                  Assigned
                </option>

                <option>
                  In Progress
                </option>

                <option>
                  Resolved
                </option>

                <option>
                  Reopened
                </option>
              </select>

              <label>
                Progress Update
              </label>

              <textarea
                rows="4"
                placeholder="Example: Field officer visited the location and repair work has started."
                value={progressNote}
                onChange={(e) =>
                  setProgressNote(
                    e.target.value
                  )
                }
              />

              <button
                className="primary-button"
                onClick={
                  updateOfficerProgress
                }
              >
                💾 Save Update
              </button>
            </div>
          </div>
        )}

        {/* ==========================
            MASTER INCIDENT MODAL
        =========================== */}

        {incidentDetails && (
          <div className="modal-overlay">
            <div className="modal incident-modal">
              <button
                className="close-button"
                onClick={() =>
                  setIncidentDetails(null)
                }
              >
                ×
              </button>

              <div className="incident-header">
                <div>
                  <span className="incident-label">
                    MASTER INCIDENT
                  </span>

                  <h2>
                    🔗 Master Incident #
                    {
                      incidentDetails.master_incident_id
                    }
                  </h2>
                </div>

                <span className="incident-count">
                  {
                    incidentDetails.total_related_complaints
                  }{" "}
                  Complaints
                </span>
              </div>

              <div className="incident-explanation">
                <h3>
                  🌐 Common Issue Detection
                </h3>

                <p>
                  ResolveAI has identified
                  that these complaints are
                  related to a common incident
                  or larger problem. Officers
                  can investigate the root
                  cause and resolve multiple
                  citizen complaints together.
                </p>
              </div>

              <h3 className="related-heading">
                👥 Related Citizen Complaints
              </h3>

              <div className="related-list">
                {(
                  incidentDetails.complaints ||
                  []
                ).map((complaint) => (
                  <div
                    className="related-item"
                    key={complaint.id}
                  >
                    <div className="related-item-top">
                      <strong>
                        Complaint #
                        {complaint.id}
                      </strong>

                      <span
                        className={`status ${getStatusClass(
                          complaint.status
                        )}`}
                      >
                        {complaint.status ||
                          "Submitted"}
                      </span>
                    </div>

                    <p>
                      {
                        complaint.complaint_text
                      }
                    </p>

                    <div className="related-meta">
                      <span>
                        📍{" "}
                        {complaint.location_name ||
                          "Location unavailable"}
                      </span>

                      <span>
                        🎯{" "}
                        {complaint.severity ||
                          "Normal"}
                      </span>
                    </div>

                    <div className="progress-label">
                      <span>
                        Officer Progress
                      </span>

                      <strong>
                        {
                          complaint.officer_progress ||
                          0
                        }
                        %
                      </strong>
                    </div>

                    <div className="progress-bar small-progress">
                      <div
                        className="progress-fill"
                        style={{
                          width: `${
                            complaint.officer_progress ||
                            0
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
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