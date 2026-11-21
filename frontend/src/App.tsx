
import { useEffect, useState } from "react";
import "./App.css";

type Batch = {
  id: number;
  name: string;
  centre: string;
  candidates: number;
  status: string;
};

const initialBatches: Batch[] = [
  {
    id: 1,
    name: "Digital Skills - November",
    centre: "Hyderabad Training Centre",
    candidates: 45,
    status: "Pending Review",
  },
  {
    id: 2,
    name: "Web Development - Batch 04",
    centre: "Karimnagar Training Centre",
    candidates: 32,
    status: "Approved",
  },
  {
    id: 3,
    name: "AI Fundamentals - Batch 02",
    centre: "Warangal Training Centre",
    candidates: 28,
    status: "Correction Required",
  },
];

function App() {
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [batches, setBatches] = useState<Batch[]>([]);

useEffect(() => {
  async function fetchBatches() {
    try {
      const response = await fetch("http://localhost:5000/api/batches");
      const data = await response.json();

      if (data.success) {
        setBatches(
          data.batches.map((batch: any) => ({
            ...batch,
            candidates: batch.candidates ?? 0,
          }))
        );
      }
    } catch (error) {
      console.error("Error fetching batches:", error);
    }
  }

  fetchBatches();
}, []);
  const [selectedRole, setSelectedRole] = useState("Training Centre");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [batchName, setBatchName] = useState("");
  const [centre, setCentre] = useState("");
  const [candidateCount, setCandidateCount] = useState("");
  const [verificationId, setVerificationId] = useState("");
  const [verificationResult, setVerificationResult] = useState("");

  const filteredBatches = batches.filter((batch) =>
    `${batch.name} ${batch.centre} ${batch.status}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  async function createBatch(e: React.FormEvent<HTMLFormElement>) {
  e.preventDefault();

  if (!batchName.trim() || !centre.trim() || !candidateCount) return;

  try {
    const response = await fetch("http://localhost:5000/api/batches", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: batchName.trim(),
        centre: centre.trim(),
        candidates: Number(candidateCount),
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      alert(data.message || "Failed to create batch");
      return;
    }

    setBatches((previous) => [data.batch, ...previous]);

    setBatchName("");
    setCentre("");
    setCandidateCount("");
    setShowForm(false);
    setActiveTab("Batches");

    alert("Batch saved successfully!");
  } catch (error) {
    console.error("Batch creation error:", error);
    alert("Cannot connect to the backend. Check whether the server is running.");
  }
}

  async function updateStatus(id: number, status: string) {
  try {
    const comments =
      status === "Correction Required"
        ? prompt("Enter reason for returning this batch:") || ""
        : "";

    if (status === "Correction Required" && !comments.trim()) {
      alert("Please provide a reason.");
      return;
    }

    const response = await fetch(
      `http://localhost:5000/api/batches/${id}/review`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          role: selectedRole,
          comments,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok || !data.success) {
      alert(data.message || "Review failed");
      return;
    }

    setBatches((previous) =>
      previous.map((batch) =>
        batch.id === id ? { ...batch, ...data.batch } : batch
      )
    );

    alert("Batch status saved successfully!");
  } catch (error) {
    console.error(error);
    alert("Could not connect to the backend.");
  }
}

  function verifyCertificate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!verificationId.trim()) {
      setVerificationResult("Please enter a certificate ID.");
      return;
    }

    setVerificationResult(
      verificationId.trim().toUpperCase() === "CERT-2026-001"
        ? "VALID: Certificate verified successfully."
        : "Certificate not found. Please check the ID."
    );
  }

  const navItems = [
    "Dashboard",
    "Batches",
    "Candidates",
    "Approvals",
    "Certificates",
    "Verification",
  ];

  const approved = batches.filter((b) => b.status === "Approved").length;
  const pending = batches.filter(
    (b) => b.status === "Pending Review"
  ).length;
  const corrections = batches.filter(
    (b) => b.status === "Correction Required"
  ).length;

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">C</div>
          <div>
            <h2>CertiFlow</h2>
            <span>Certificate Management</span>
          </div>
        </div>

        <p className="menu-label">WORKSPACE</p>

        <nav>
          {navItems.map((item) => (
            <button
              key={item}
              className={`nav-item ${activeTab === item ? "active" : ""}`}
              onClick={() => setActiveTab(item)}
            >
              <span>{item === "Dashboard" ? "⌂" : item === "Batches" ? "▦" : item === "Candidates" ? "♙" : item === "Approvals" ? "✓" : item === "Certificates" ? "▤" : "⌕"}</span>
              {item}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <p className="menu-label">CURRENT ROLE</p>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
          >
            <option>Training Centre</option>
            <option>District Officer</option>
            <option>Quality Officer</option>
            <option>State Officer</option>
          </select>
          <div className="user-profile">
            <div className="avatar">S</div>
            <div>
              <strong>Demo User</strong>
              <small>{selectedRole}</small>
            </div>
          </div>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div>
            <span className="breadcrumb">Workspace / </span>
            <strong>{activeTab}</strong>
          </div>
          <div className="topbar-right">
            <span className="status-dot"></span>
            System Online
            <div className="avatar">S</div>
          </div>
        </header>

        <section className="content">
          <div className="page-heading">
            <div>
              <p className="eyebrow">CERTIFICATE MANAGEMENT PLATFORM</p>
              <h1>{activeTab}</h1>
              <p className="subtitle">
                Manage training batches, reviews and certificate issuance.
              </p>
            </div>

            {activeTab === "Batches" && (
              <button className="primary-btn" onClick={() => setShowForm(!showForm)}>
                + Create Batch
              </button>
            )}
          </div>

          {activeTab === "Dashboard" && (
            <>
              <div className="welcome-banner">
                <div>
                  <span>WELCOME BACK</span>
                  <h2>Your certification workflow, all in one place.</h2>
                  <p>Track batches, review submissions and manage certificates.</p>
                </div>
                <div className="banner-symbol">✓</div>
              </div>

              <div className="stats-grid">
                <div className="stat-card">
                  <span>Total Batches</span>
                  <h2>{batches.length}</h2>
                  <small>All training batches</small>
                </div>
                <div className="stat-card">
                  <span>Pending Reviews</span>
                  <h2>{pending}</h2>
                  <small>Awaiting district review</small>
                </div>
                <div className="stat-card">
                  <span>Approved Batches</span>
                  <h2>{approved}</h2>
                  <small>Successfully approved</small>
                </div>
                <div className="stat-card">
                  <span>Corrections Required</span>
                  <h2>{corrections}</h2>
                  <small>Require resubmission</small>
                </div>
              </div>

              <div className="section-heading">
                <div>
                  <h2>Recent Batches</h2>
                  <p>Latest activity across training centres</p>
                </div>
                <button className="text-btn" onClick={() => setActiveTab("Batches")}>
                  View all →
                </button>
              </div>

              <BatchTable
                batches={batches.slice(0, 3)}
                onUpdate={updateStatus}
                role={selectedRole}
              />
            </>
          )}

          {activeTab === "Batches" && (
            <>
              {showForm && (
                <form className="form-card" onSubmit={createBatch}>
                  <h2>Create New Training Batch</h2>
                  <label>Batch Name</label>
                  <input
                    value={batchName}
                    onChange={(e) => setBatchName(e.target.value)}
                    placeholder="Enter batch name"
                    required
                  />
                  <label>Training Centre</label>
                  <input
                    value={centre}
                    onChange={(e) => setCentre(e.target.value)}
                    placeholder="Enter training centre"
                    required
                  />
                  <label>Number of Candidates</label>
                  <input
                    type="number"
                    min="1"
                    value={candidateCount}
                    onChange={(e) => setCandidateCount(e.target.value)}
                    placeholder="Enter candidate count"
                    required
                  />
                  <button className="primary-btn" type="submit">
                    Save Batch
                  </button>
                </form>
              )}

              <div className="table-card">
                <div className="table-toolbar">
                  <h2>All Training Batches</h2>
                  <input
                    className="search-input"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search batches..."
                  />
                </div>
                <BatchTable
                  batches={filteredBatches}
                  onUpdate={updateStatus}
                  role={selectedRole}
                />
              </div>
            </>
          )}

          {activeTab === "Candidates" && (
            <div className="table-card">
              <h2>Candidate Management</h2>
              <p className="subtitle">
                Candidate records are associated with their training batches.
              </p>
              <div className="candidate-list">
                {["Ananya Sharma", "Rahul Verma", "Priya Reddy", "Arjun Kumar"].map(
                  (name, index) => (
                    <div className="candidate-row" key={name}>
                      <div className="avatar">{name[0]}</div>
                      <div>
                        <strong>{name}</strong>
                        <small>Candidate ID: CAN-2026-00{index + 1}</small>
                      </div>
                      <span className="pill approved">Registered</span>
                    </div>
                  )
                )}
              </div>
            </div>
          )}

          {activeTab === "Approvals" && (
            <div className="table-card">
              <h2>Batch Approval Queue</h2>
              <p className="subtitle">
                Review submitted batches and record a decision.
              </p>
              <BatchTable
                batches={batches.filter((b) => b.status !== "Draft")}
                onUpdate={updateStatus}
                role={selectedRole}
              />
            </div>
          )}

          {activeTab === "Certificates" && (
            <div className="table-card">
              <h2>Certificate Management</h2>
              <p className="subtitle">
                Approved batches can proceed to certificate generation.
              </p>
              {batches
                .filter((b) => b.status === "Approved")
                .map((batch) => (
                  <div className="candidate-row" key={batch.id}>
                    <div>
                      <strong>{batch.name}</strong>
                      <small>{batch.candidates} candidates</small>
                    </div>
                    <span className="pill approved">Approved</span>
                    <button
                      className="secondary-btn"
                      onClick={() => alert("Demo: Certificate generation workflow started.")}
                    >
                      Generate Certificates
                    </button>
                  </div>
                ))}
            </div>
          )}

          {activeTab === "Verification" && (
            <div className="verification-card">
              <div className="verify-icon">✓</div>
              <h2>Verify a Certificate</h2>
              <p>
                Employers and members of the public can verify a certificate
                using its unique certificate ID.
              </p>
              <form onSubmit={verifyCertificate}>
                <label>Certificate ID</label>
                <input
                  value={verificationId}
                  onChange={(e) => setVerificationId(e.target.value)}
                  placeholder="Example: CERT-2026-001"
                />
                <button className="primary-btn" type="submit">
                  Verify Certificate
                </button>
              </form>
              {verificationResult && (
                <div className="verification-result">{verificationResult}</div>
              )}
              <small className="demo-note">
                Demo certificate ID: CERT-2026-001
              </small>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

function BatchTable({
  batches,
  onUpdate,
  role,
}: {
  batches: Batch[];
  onUpdate: (id: number, status: string) => void;
  role: string;
}) {
  return (
    <div className="table-scroll">
      <table>
        <thead>
          <tr>
            <th>Batch Name</th>
            <th>Training Centre</th>
            <th>Candidates</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {batches.map((batch) => (
            <tr key={batch.id}>
              <td><strong>{batch.name}</strong></td>
              <td>{batch.centre}</td>
              <td>{batch.candidates}</td>
              <td>
                <span className={`pill ${batch.status === "Approved" ? "approved" : batch.status === "Correction Required" ? "warning" : "pending"}`}>
                  {batch.status}
                </span>
              </td>
              <td>
                {role === "District Officer" || role === "Quality Officer" || role === "State Officer" ? (
                  <div className="action-buttons">
                    <button className="approve-btn" onClick={() => onUpdate(batch.id, "Approved")}>
                      Approve
                    </button>
                    <button className="return-btn" onClick={() => onUpdate(batch.id, "Correction Required")}>
                      Return
                    </button>
                  </div>
                ) : (
                  <button
                    className="secondary-btn"
                    onClick={() => onUpdate(batch.id, "Pending Review")}
                  >
                    Submit
                  </button>
                )}
              </td>
            </tr>
          ))}
          {batches.length === 0 && (
            <tr>
              <td colSpan={5}>No batches found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default App;