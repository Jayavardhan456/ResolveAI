import { useMemo, useState } from "react";
import axios from "axios";
import "./App.css";

const API_URL = "https://resolveai-bry0.onrender.com";

function App() {
  const [page, setPage] = useState("login");
  const [activeTab, setActiveTab] = useState("submit");

  const [role, setRole] = useState("");
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");

  // Complaint
  const [complaintText, setComplaintText] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [locationName, setLocationName] = useState("");
  const [locationMode, setLocationMode] = useState("current");
  const [locationLoading, setLocationLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  // Citizen/Farmer tracking
  const [myComplaints, setMyComplaints] = useState([]);
  const [trackingLoading, setTrackingLoading] = useState(false);

  // Procurement
  const [centres, setCentres] = useState([]);
  const [centresLoading, setCentresLoading] = useState(false);
  const [cropType, setCropType] = useState("Paddy");
  const [quantity, setQuantity] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookings, setBookings] = useState([]);

  // Officer
  const [complaints, setComplaints] = useState([]);
  const [dashboardLoading, setDashboardLoading] = useState(false);

  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [officerName, setOfficerName] = useState("");
  const [progress, setProgress] = useState(0);
  const [progressNote, setProgressNote] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("In Progress");

  const [incidentDetails, setIncidentDetails] = useState(null);

  // LOGIN
  const handleLogin = (e) => {
    e.preventDefault();

    if (!name.trim() || !mobile.trim() || !password.trim()) {
      alert("Please enter all login details.");
      return;
    }

    if (mobile.length !== 10) {
      alert("Mobile number must contain exactly 10 digits.");
      return;
    }

    setPage("role");
  };

  // ROLE
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

  // CURRENT LOCATION
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
        } finally {
          setLocationLoading(false);
        }
      },
      () => {
        setLocationLoading(false);

        alert(
          "Unable to get your location. Please allow location permission or enter it manually."
        );
      }
    );
  };

  // IMAGE
  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];

    if (file) {
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // SUBMIT COMPLAINT
  const submitComplaint = async (e) => {
    e.preventDefault();

    if (!complaintText.trim()) {
      alert("Please describe your grievance.");
      return;
    }

    if (!locationName.trim()) {
      alert(
        "Please use current location or enter a location manually."
      );
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

  // LOAD USER COMPLAINTS
  const loadMyComplaints = async () => {
    setTrackingLoading(true);

    try {
      const response = await axios.get(
        `${API_URL}/complaints`,
        {
          params: { name },
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

  // PROCUREMENT CENTRES
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

  // BOOKINGS
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

  // BOOK PROCUREMENT SLOT
  const bookSlot = async (centre, slot) => {
    if (!quantity.trim()) {
      alert("Please enter crop quantity before booking.");
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

  // LOAD ALL COMPLAINTS FOR OFFICER
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

  // OPEN OFFICER UPDATE
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

  // UPDATE OFFICER
  const updateOfficerProgress = async () => {
    if (!selectedComplaint) return;

    try {
      await axios.put(
        `${API_URL}/complaints/${selectedComplaint.id}/officer`,
        {
          assigned_officer: officerName || null,
          officer_progress: Number(progress),
          progress_note: progressNote,
          status: selectedStatus,
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

  // MASTER INCIDENT
  const openIncident = async (incidentId) => {
    try {
      const response = await axios.get(
        `${API_URL}/incidents/${incidentId}`
      );

      setIncidentDetails(response.data);
    } catch {
      alert(
        "Unable to load master incident details."
      );
    }
  };

  // STATUS CLASS
  const getStatusClass = (status = "") => {
    return `status ${status
      .toLowerCase()
      .replaceAll(" ", "-")}`;
  };

  // ANALYTICS
  const analytics = useMemo(() => {
    const total = complaints.length;

    const assigned = complaints.filter(
      (c) => c.assigned_officer
    ).length;

    const inProgress = complaints.filter(
      (c) => c.status === "In Progress"
    ).length;

    const resolved = complaints.filter(
      (c) => c.status === "Resolved"
    ).length;

    const high = complaints.filter(
      (c) =>
        ["High", "Critical", "Urgent"].includes(
          c.severity
        )
    ).length;

    const categoryCounts = {};
    const priorityCounts = {};

    complaints.forEach((c) => {
      const category = c.category || "Other";
      const severity = c.severity || "Unknown";

      categoryCounts[category] =
        (categoryCounts[category] || 0) + 1;

      priorityCounts[severity] =
        (priorityCounts[severity] || 0) + 1;
    });

    return {
      total,
      assigned,
      inProgress,
      resolved,
      high,
      categoryCounts,
      priorityCounts,
    };
  }, [complaints]);

  // LOGOUT
  const logout = () => {
    setPage("login");

    setRole("");
    setName("");
    setMobile("");
    setPassword("");

    setComplaintText("");
    setLocationName("");
    setLatitude("");
    setLongitude("");

    setResult(null);

    setMyComplaints([]);
    setCentres([]);
    setBookings([]);
    setComplaints([]);
  };

  // LOGIN PAGE
  if (page === "login") {
    return (
      <div className="app-shell">

        <div className="login-card">

          <div className="logo-circle">
            R
          </div>

          <h1>ResolveAI</h1>

          <p className="subtitle">
            AI-Powered Intelligent Grievance &
            Resolution System
          </p>

          <form onSubmit={handleLogin}>

            <label>Name</label>

            <input
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
            />

            <label>Mobile Number</label>

            <input
              type="tel"
              maxLength="10"
              inputMode="numeric"
              placeholder="10-digit mobile number"
              value={mobile}
              onChange={(e) =>
                setMobile(
                  e.target.value
                    .replace(/\D/g, "")
                    .slice(0, 10)
                )
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
            ResolveAI Prototype
          </p>

        </div>

      </div>
    );
  }

  // ROLE SELECTION
  if (page === "role") {
    return (
      <div className="app-shell">

        <div className="role-card">

          <h1>Welcome, {name}</h1>

          <p>
            Select how you want to use ResolveAI
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
                Report and track public grievances.
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
                Report issues and book procurement slots.
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

              <h2>Officer</h2>

              <p>
                View analytics, map complaints and
                manage resolutions.
              </p>
            </button>

          </div>

          <button
            className="secondary-button"
            onClick={() => setPage("login")}
          >
            ← Back
          </button>

        </div>

      </div>
    );
  }

  // CITIZEN / FARMER PAGE
  if (page === "user") {
    return (
      <div className="dashboard">

        <header className="header">

          <div>
            <h1>ResolveAI</h1>

            <p>
              Intelligent Grievance Resolution
            </p>
          </div>

          <div className="header-user">

            <span className="role-tag">
              {role === "Farmer"
                ? "🌾 Farmer"
                : "👤 Citizen"}
            </span>

            <strong>{name}</strong>

            <button onClick={logout}>
              Logout
            </button>

          </div>

        </header>

        <div className="content">

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
              📝 Submit Grievance
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
              📍 Track Grievances
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
                🌾 Procurement Centres
              </button>
            )}

          </div>

          {/* SUBMIT COMPLAINT */}

          {activeTab === "submit" && (
            <div className="panel">

              <div className="panel-heading">

                <div>

                  <h2>
                    Submit a Grievance
                  </h2>

                  <p>
                    {role === "Farmer"
                      ? "Report procurement, crop or payment-related issues."
                      : "Report a public issue and let AI prioritize it."}
                  </p>

                </div>

                <span className="ai-badge">
                  🧠 AI Enabled
                </span>

              </div>

              <form onSubmit={submitComplaint}>

                <label>
                  Describe your grievance
                </label>

                <textarea
                  rows="7"
                  placeholder={
                    role === "Farmer"
                      ? "Example: My paddy procurement payment has been delayed..."
                      : "Example: Water pipeline is leaking near the market..."
                  }
                  value={complaintText}
                  onChange={(e) =>
                    setComplaintText(
                      e.target.value
                    )
                  }
                />

                {/* LOCATION */}

                <div className="section-card">

                  <h3>
                    📍 Location
                  </h3>

                  <p>
                    Choose current location or
                    enter the complaint location
                    manually.
                  </p>

                  <div className="location-choice">

                    <button
                      type="button"
                      className={
                        locationMode === "current"
                          ? "location-button selected"
                          : "secondary-button"
                      }
                      onClick={() => {
                        setLocationMode(
                          "current"
                        );

                        getCurrentLocation();
                      }}
                    >
                      {locationLoading
                        ? "Getting location..."
                        : "📍 Use Current Location"}
                    </button>

                    <button
                      type="button"
                      className={
                        locationMode === "manual"
                          ? "location-button selected"
                          : "secondary-button"
                      }
                      onClick={() => {
                        setLocationMode(
                          "manual"
                        );

                        setLatitude("");
                        setLongitude("");
                      }}
                    >
                      ✍️ Enter Location Manually
                    </button>

                  </div>

                  {locationMode === "manual" && (
                    <div className="manual-location">

                      <label>
                        Enter Village / Town /
                        City / District
                      </label>

                      <input
                        type="text"
                        placeholder="Example: Guntur, Andhra Pradesh"
                        value={locationName}
                        onChange={(e) =>
                          setLocationName(
                            e.target.value
                          )
                        }
                      />

                    </div>
                  )}

                  {locationName && (
                    <div className="location-result">

                      <strong>
                        Selected Location:
                      </strong>

                      <p>
                        {locationName}
                      </p>

                    </div>
                  )}

                </div>

                {/* IMAGE */}

                <div className="section-card">

                  <h3>
                    📷 Evidence
                  </h3>

                  <label className="upload-area">

                    Upload Image

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
                      className="image-preview"
                      src={imagePreview}
                      alt="Evidence"
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
                    : "Submit Grievance"}
                </button>

              </form>

              {result && (
                <div className="success-result">

                  <h3>
                    ✅ Grievance Submitted
                  </h3>

                  <div className="result-grid">

                    <div>
                      <span>
                        Complaint ID
                      </span>

                      <strong>
                        #{result.id}
                      </strong>
                    </div>

                    <div>
                      <span>
                        Category
                      </span>

                      <strong>
                        {result.category}
                      </strong>
                    </div>

                    <div>
                      <span>
                        Priority
                      </span>

                      <strong>
                        {result.severity}
                      </strong>
                    </div>

                    <div>
                      <span>
                        Department
                      </span>

                      <strong>
                        {result.department}
                      </strong>
                    </div>

                  </div>

                  <p>
                    You can now track officer
                    assignment and work progress
                    from Track Grievances.
                  </p>

                </div>
              )}

            </div>
          )}

          {/* TRACKING */}

          {activeTab === "tracking" && (
            <div className="panel">

              <div className="panel-heading">

                <div>

                  <h2>
                    Track Your Grievances
                  </h2>

                  <p>
                    See officer assignment,
                    work progress and
                    resolution status.
                  </p>

                </div>

                <button
                  className="secondary-button"
                  onClick={loadMyComplaints}
                >
                  🔄 Refresh
                </button>

              </div>

              {trackingLoading && (
                <p>
                  Loading your grievances...
                </p>
              )}

              {!trackingLoading &&
                myComplaints.length === 0 && (
                  <div className="empty-state">

                    <h3>
                      No grievances found
                    </h3>

                    <p>
                      Submit a grievance to
                      start tracking.
                    </p>

                  </div>
                )}

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
                          className={getStatusClass(
                            complaint.status
                          )}
                        >
                          {complaint.status}
                        </span>

                      </div>

                      <div className="tracking-grid">

                        <div>

                          <span>
                            Department
                          </span>

                          <strong>
                            {
                              complaint.department
                            }
                          </strong>

                        </div>

                        <div>

                          <span>
                            Priority
                          </span>

                          <strong>
                            {
                              complaint.severity
                            }
                          </strong>

                        </div>

                        <div>

                          <span>
                            Officer Assigned
                          </span>

                          <strong>
                            {complaint.assigned_officer
                              ? `👨‍💼 ${complaint.assigned_officer}`
                              : "⏳ Not Assigned Yet"}
                          </strong>

                        </div>

                        <div>

                          <span>
                            Location
                          </span>

                          <strong>
                            {complaint.location_name ||
                              "Location not provided"}
                          </strong>

                        </div>

                      </div>

                      <div className="progress-section">

                        <div className="progress-label">

                          <strong>
                            Officer Work Progress
                          </strong>

                          <strong>
                            {
                              complaint.officer_progress ||
                                0
                            }
                            %
                          </strong>

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

                          {complaint.progress_note ||
                            "No progress update has been added yet."}

                        </p>

                      </div>

                      <div className="timeline">

                        <div className="timeline-step completed">
                          ✓ Submitted
                        </div>

                        <div
                          className={
                            complaint.assigned_officer
                              ? "timeline-step completed"
                              : "timeline-step"
                          }
                        >
                          👨‍💼 Officer Assigned
                        </div>

                        <div
                          className={
                            (
                              complaint.officer_progress ||
                              0
                            ) > 0
                              ? "timeline-step completed"
                              : "timeline-step"
                          }
                        >
                          🔧 Work In Progress
                        </div>

                        <div
                          className={
                            complaint.status ===
                            "Resolved"
                              ? "timeline-step completed"
                              : "timeline-step"
                          }
                        >
                          ✅ Resolved
                        </div>

                      </div>

                    </div>
                  )
                )}

              </div>

            </div>
          )}

          {/* PROCUREMENT */}

          {activeTab === "procurement" && (
            <div className="panel">

              <div className="panel-heading">

                <div>

                  <h2>
                    🌾 Procurement Centres & Slots
                  </h2>

                  <p>
                    Check available centres,
                    choose a slot and book
                    your procurement visit.
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
                    <option>Paddy</option>
                    <option>Maize</option>
                    <option>Cotton</option>
                    <option>Wheat</option>
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
                Available Procurement Centres
              </h2>

              {centresLoading && (
                <p>
                  Loading centres...
                </p>
              )}

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
                        📍 {centre.location}
                      </p>

                      <p>
                        📞{" "}
                        {centre.contact ||
                          "Contact available at centre"}
                      </p>

                      <div className="slots-list">

                        {(centre.slots || []).map(
                          (slot, index) => (
                            <div
                              className="slot-row"
                              key={index}
                            >

                              <div>

                                <strong>
                                  {slot.date}
                                </strong>

                                <p>
                                  {slot.time}
                                </p>

                              </div>

                              <div className="slot-action">

                                <span
                                  className={
                                    (
                                      slot.available_slots ??
                                      slot.available ??
                                      0
                                    ) > 0
                                      ? "available"
                                      : "full"
                                  }
                                >
                                  {(
                                    slot.available_slots ??
                                    slot.available ??
                                    0
                                  ) > 0
                                    ? "Available"
                                    : "Full"}
                                </span>

                                <button
                                  disabled={
                                    bookingLoading ||
                                    (
                                      slot.available_slots ??
                                      slot.available ??
                                      0
                                    ) <= 0
                                  }
                                  onClick={() =>
                                    bookSlot(
                                      centre,
                                      slot
                                    )
                                  }
                                >
                                  Book Slot
                                </button>

                              </div>

                            </div>
                          )
                        )}

                      </div>

                    </div>
                  )
                )}

              </div>

              <h2 className="section-title">
                My Bookings
              </h2>

              <div className="booking-list">

                {bookings.length === 0 ? (
                  <div className="empty-state">
                    No procurement bookings yet.
                  </div>
                ) : (
                  bookings.map(
                    (booking) => (
                      <div
                        className="booking-card"
                        key={booking.id}
                      >

                        <div>

                          <h3>
                            {booking.centre_name ||
                              `Centre #${booking.centre_id}`}
                          </h3>

                          <p>
                            {booking.crop_type} •{" "}
                            {booking.quantity}
                          </p>

                          <p>
                            {booking.slot_date} •{" "}
                            {booking.slot_time}
                          </p>

                        </div>

                        <span className="status booked">

                          {booking.status ||
                            "Booked"}

                        </span>

                      </div>
                    )
                  )
                )}

              </div>

            </div>
          )}

        </div>

      </div>
    );
  }

  // OFFICER DASHBOARD
  if (page === "officer") {
    const maxCategory = Math.max(
      ...Object.values(
        analytics.categoryCounts
      ),
      1
    );

    const maxPriority = Math.max(
      ...Object.values(
        analytics.priorityCounts
      ),
      1
    );

    return (
      <div className="dashboard">

        <header className="header">

          <div>

            <h1>ResolveAI</h1>

            <p>
              Officer Management & Analytics
              Dashboard
            </p>

          </div>

          <div className="header-user">

            <span className="role-tag">
              🏢 Officer
            </span>

            <strong>{name}</strong>

            <button onClick={logout}>
              Logout
            </button>

          </div>

        </header>

        <div className="content">

          <div className="officer-actions">

            <button
              className="primary-button"
              onClick={loadAllComplaints}
            >
              🔄 Refresh Dashboard
            </button>

            <button
              className="secondary-button"
              onClick={async () => {
                try {
                  const response =
                    await axios.post(
                      `${API_URL}/sla/check`
                    );

                  alert(
                    `SLA Check Completed. New escalations: ${response.data.new_escalations}`
                  );

                  loadAllComplaints();
                } catch {
                  alert(
                    "Unable to run SLA check."
                  );
                }
              }}
            >
              ⏱ Run SLA Check
            </button>

          </div>

          {/* STATISTICS */}

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
                Assigned
              </span>

              <h2>
                {analytics.assigned}
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

          {/* ANALYTICS */}

          <div className="analytics-grid">

            {/* MAP */}

            <div className="analytics-card">

              <h2>
                🗺️ Complaint Location Map
              </h2>

              <p>
                Location overview of reported
                grievances.
              </p>

              <div className="map-box">

                <div className="map-grid">

                  {complaints
                    .filter(
                      (c) =>
                        c.location_name
                    )
                    .slice(0, 12)
                    .map(
                      (c, index) => (
                        <div
                          className="map-pin"
                          key={c.id}
                          style={{
                            left: `${
                              12 +
                              ((index * 23) %
                                70)
                            }%`,

                            top: `${
                              15 +
                              ((index * 37) %
                                65)
                            }%`,
                          }}
                          title={
                            c.location_name
                          }
                        >
                          📍
                        </div>
                      )
                    )}

                </div>

                <div className="map-legend">

                  {complaints
                    .filter(
                      (c) =>
                        c.location_name
                    )
                    .slice(0, 5)
                    .map((c) => (
                      <div key={c.id}>

                        📍 #{c.id} —{" "}
                        {c.location_name}

                      </div>
                    ))}

                  {complaints.filter(
                    (c) =>
                      c.location_name
                  ).length === 0 &&
                    "No complaint locations available yet."}

                </div>

              </div>

            </div>

            {/* CATEGORY GRAPH */}

            <div className="analytics-card">

              <h2>
                📊 Complaints by Category
              </h2>

              <div className="bar-chart">

                {Object.entries(
                  analytics.categoryCounts
                ).map(
                  ([label, value]) => (
                    <div
                      className="bar-row"
                      key={label}
                    >

                      <span>
                        {label}
                      </span>

                      <div className="bar-track">

                        <div
                          className="bar-fill"
                          style={{
                            width: `${
                              (value /
                                maxCategory) *
                              100
                            }%`,
                          }}
                        />

                      </div>

                      <strong>
                        {value}
                      </strong>

                    </div>
                  )
                )}

                {Object.keys(
                  analytics.categoryCounts
                ).length === 0 && (
                  <p>
                    No data available.
                  </p>
                )}

              </div>

            </div>

            {/* PRIORITY GRAPH */}

            <div className="analytics-card">

              <h2>
                🔥 Priority Distribution
              </h2>

              <div className="bar-chart">

                {Object.entries(
                  analytics.priorityCounts
                ).map(
                  ([label, value]) => (
                    <div
                      className="bar-row"
                      key={label}
                    >

                      <span>
                        {label}
                      </span>

                      <div className="bar-track">

                        <div
                          className="bar-fill priority-fill"
                          style={{
                            width: `${
                              (value /
                                maxPriority) *
                              100
                            }%`,
                          }}
                        />

                      </div>

                      <strong>
                        {value}
                      </strong>

                    </div>
                  )
                )}

                {Object.keys(
                  analytics.priorityCounts
                ).length === 0 && (
                  <p>
                    No data available.
                  </p>
                )}

              </div>

            </div>

            {/* RESOLUTION */}

            <div className="analytics-card resolution-card">

              <h2>
                📈 Resolution Progress
              </h2>

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
                    High Priority
                  </span>

                  <strong>
                    {analytics.high}
                  </strong>

                </div>

                <div>

                  <span>
                    Pending
                  </span>

                  <strong>
                    {analytics.total -
                      analytics.resolved}
                  </strong>

                </div>

              </div>

            </div>

          </div>

          {/* COMPLAINT MANAGEMENT */}

          <div className="panel">

            <div className="panel-heading">

              <div>

                <h2>
                  Complaint Management
                </h2>

                <p>
                  Assign officers and update
                  work progress.
                </p>

              </div>

              {dashboardLoading && (
                <span>
                  Loading...
                </span>
              )}

            </div>

            <div className="complaints-table">

              {complaints.length === 0 &&
                !dashboardLoading && (
                  <div className="empty-state">
                    No complaints available.
                  </div>
                )}

              {complaints.map(
                (complaint) => (
                  <div
                    className="officer-complaint-card"
                    key={complaint.id}
                  >

                    <div className="complaint-info">

                      <div className="complaint-title-row">

                        <h3>
                          #{complaint.id}{" "}
                          {complaint.category}
                        </h3>

                        <span
                          className={getStatusClass(
                            complaint.status
                          )}
                        >
                          {complaint.status}
                        </span>

                      </div>

                      <p>
                        {
                          complaint.complaint_text
                        }
                      </p>

                      <div className="complaint-meta">

                        <span>
                          👤 {complaint.name}
                        </span>

                        <span>
                          📍{" "}
                          {complaint.location_name ||
                            "No location"}
                        </span>

                        <span>
                          🎯{" "}
                          {complaint.severity}
                        </span>

                        <span>
                          🏢{" "}
                          {complaint.department}
                        </span>

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
                          {
                            complaint.officer_progress ||
                              0
                          }
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

                      {complaint.master_incident_id && (
                        <button
                          className="secondary-button small"
                          onClick={() =>
                            openIncident(
                              complaint.master_incident_id
                            )
                          }
                        >
                          🔗 Incident
                        </button>
                      )}

                    </div>

                  </div>
                )
              )}

            </div>

          </div>

        </div>

        {/* OFFICER UPDATE MODAL */}

        {selectedComplaint && (
          <div className="modal-overlay">

            <div className="modal">

              <button
                className="close-button"
                onClick={() =>
                  setSelectedComplaint(null)
                }
              >
                ×
              </button>

              <h2>
                Update Complaint #
                {selectedComplaint.id}
              </h2>

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
                Save Update
              </button>

            </div>

          </div>
        )}

        {/* INCIDENT MODAL */}

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

              <h2>
                🔗 Master Incident #
                {
                  incidentDetails.master_incident_id
                }
              </h2>

              <p>
                Related Complaints:{" "}
                <strong>
                  {
                    incidentDetails.total_related_complaints
                  }
                </strong>
              </p>

              <div className="related-list">

                {incidentDetails.complaints.map(
                  (complaint) => (
                    <div
                      className="related-item"
                      key={complaint.id}
                    >

                      <strong>
                        #{complaint.id}
                      </strong>

                      <p>
                        {
                          complaint.complaint_text
                        }
                      </p>

                    </div>
                  )
                )}

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