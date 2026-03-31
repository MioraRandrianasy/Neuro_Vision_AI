import { useState, useEffect } from "react";
import axios from "axios";
import "./index.css";
import NetworkBackground from "./NetworkBackground";

// SVGs for visual enhancement
const BrainIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.5 2h5"/><path d="M16 4.5v1.86a2 2 0 0 1-.58 1.42l-1.34 1.34a2 2 0 0 0-.58 1.42v1"/><path d="M8 4.5v1.86a2 2 0 0 0 .58 1.42l1.34 1.34a2 2 0 0 1 .58 1.42v1"/><path d="M12 11c-2.5 0-4.5 2-4.5 4.5S9.5 20 12 20s4.5-2 4.5-4.5-2-4.5-4.5-4.5Z"/><path d="M14 15.5a2 2 0 0 0-4 0"/></svg>
);
const UploadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
);
const ActivityIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
);
const ShieldIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
);
const ScanIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="12" cy="12" r="3"/><path d="M12 8v4l3 3"/></svg>
);
const LayoutDashboardIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>
);
const SunIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
);
const MoonIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
);

export default function App() {
  const [theme, setTheme] = useState(localStorage.getItem("neurovision_theme") || "light");
  const [currentView, setCurrentView] = useState("home");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  // Handle Theme
  useEffect(() => {
    localStorage.setItem("neurovision_theme", theme);
    if (theme === "dark") {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }
  }, [theme]);

  // Load history from localStorage on mounting
  useEffect(() => {
    const saved = localStorage.getItem("neurovision_history");
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
  }, []);

  // Save history to localStorage
  useEffect(() => {
    localStorage.setItem("neurovision_history", JSON.stringify(history));
  }, [history]);

  const handleFile = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
      setResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return alert("Please upload a brain MRI scan");

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
      const res = await axios.post(`${apiUrl}/predict`, formData);

      setResult(res.data);

      setHistory((prev) => [
        {
          name: file.name,
          prediction: res.data.prediction,
          confidence: res.data.confidence,
          time: new Date().toLocaleString(),
        },
        ...prev,
      ]);
    } catch (err) {
      console.error(err);
      const apiUrl = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
      alert(`Unable to connect to AI diagnostic server at ${apiUrl}. Please check your backend deployment or VITE_API_URL environment variable.`);
    }

    setLoading(false);
  };

  const renderHome = () => (
    <>
      {/* ================= HERO ================= */}
      <section className="hero">
        <h1>AI-Assisted Brain MRI Analysis System</h1>
        <p>
          NeuroVision is a research-grade decision support system designed
          to assist radiologists in detecting brain abnormalities from MRI scans
          using deep convolutional neural networks and explainable AI techniques.
        </p>
        <a href="#scan" className="cta">
          Launch Diagnostic Workflow
        </a>
      </section>

      {/* ================= FEATURES ================= */}
      <section className="features" id="features">
        <div className="feature">
          <div className="feature-icon"><BrainIcon /></div>
          <h3>Deep Learning Classification</h3>
          <p>CNN-based model trained on annotated MRI datasets for high-accuracy brain tumor detection.</p>
        </div>
        <div className="feature">
          <div className="feature-icon"><ActivityIcon /></div>
          <h3>Explainable AI (Grad-CAM)</h3>
          <p>Generates detailed heatmaps highlighting the exact regions of interest that influenced the model's prediction.</p>
        </div>
        <div className="feature">
          <div className="feature-icon"><ShieldIcon /></div>
          <h3>Clinical Decision Support</h3>
          <p>Designed to securely assist radiological interpretation and streamline medical decision-making workflows.</p>
        </div>
      </section>

      {/* ================= SCAN ================= */}
      <section className="scan-section" id="scan">
        <div className="section-header">
          <h2>MRI Diagnostic Workflow</h2>
          <p>Upload a brain MRI scan to perform automated tumor detection and model interpretability analysis.</p>
        </div>

        <div className="scan-grid">
          {/* UPLOAD PANEL */}
          <div className="scan-card">
            <h3><ScanIcon /> Upload MRI Study</h3>

            <label className="upload-area">
              <input type="file" className="upload-input" onChange={handleFile} accept="image/*" />
              <div className="upload-icon"><UploadIcon /></div>
              <span className="upload-text">Drag & Drop or Click to Browse</span>
              <span className="upload-hint">Supports DICOM, JPEG, and PNG formats</span>
            </label>

            {preview && (
              <div className="preview-container">
                <div style={{ position: "relative", display: "inline-block" }}>
                  <img src={preview} alt="MRI preview" className="preview" />
                  {result?.bbox && (
                    <div
                      style={{
                        position: "absolute",
                        border: "3px solid #ef4444",
                        boxShadow: "0 0 15px rgba(239, 68, 68, 0.5)",
                        backgroundColor: "rgba(239, 68, 68, 0.15)",
                        left: `${(result.bbox.x / 224) * 100}%`,
                        top: `${(result.bbox.y / 224) * 100}%`,
                        width: `${(result.bbox.w / 224) * 100}%`,
                        height: `${(result.bbox.h / 224) * 100}%`,
                        pointerEvents: "none",
                        borderRadius: "4px"
                      }}
                    />
                  )}
                </div>
              </div>
            )}

            <button className="analysis-btn" onClick={handleUpload} disabled={loading || !file}>
              {loading ? "Running AI Analysis..." : "Start AI Analysis"}
            </button>

            {loading && (
              <div className="loader-container">
                <div className="loader"></div>
                <span className="loader-text">Processing Neural Networks...</span>
              </div>
            )}

            {result && (
              <div className={`result-container ${result.prediction.includes("No") ? "safe" : "danger"}`}>
                <div className="result-header">
                  <h4>Diagnostic Result</h4>
                  <span className="status-badge">
                    {result.prediction.includes("No") ? "Clear" : "Attention"}
                  </span>
                </div>
                <div className="result-details">
                  <div className="detail-row">
                    <span className="detail-label">Prediction</span>
                    <span className="detail-value">{result.prediction}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Confidence Level</span>
                    <span className="detail-value">{parseFloat(result.confidence).toFixed(2)}%</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* AI OUTPUT */}
          <div className="scan-card">
            <h3><ActivityIcon /> Model Explainability Map</h3>
            <p style={{ color: "var(--text-secondary)", marginBottom: "20px", fontSize: "0.95rem", lineHeight: "1.6" }}>
              This visualization highlights the regions of the MRI scan that contributed most
              significantly to the network's final clinical decision.
            </p>

            {result?.heatmap ? (
              <img
                src={`data:image/png;base64,${result.heatmap}`}
                alt="heatmap"
                className="heatmap"
              />
            ) : (
              <div className="heatmap-empty">
                <BrainIcon />
                <p>No analysis available. Please upload a scan and run the diagnostic workflow.</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );

  const renderDashboard = () => {
    const totalScans = history.length;
    const tumorsDetected = history.filter(h => h.prediction.includes("Tumor")).length;
    const cleanScans = totalScans - tumorsDetected;
    const avgConfidence = totalScans > 0 
      ? (history.reduce((acc, curr) => acc + parseFloat(curr.confidence), 0) / totalScans).toFixed(1) 
      : 0;
    return (
      <div className="dashboard-view">
        <div className="dashboard-header-text">
          <h2>Clinical Analytics Dashboard</h2>
          <p>Aggregate statistics and comprehensive patient records log.</p>
        </div>

        <div className="stat-cards">
          <div className="stat-card">
            <span className="stat-title">Total Scans</span>
            <span className="stat-value">{totalScans}</span>
          </div>
          <div className="stat-card danger-card">
            <span className="stat-title">Tumors Detected</span>
            <span className="stat-value">{tumorsDetected}</span>
          </div>
          <div className="stat-card safe-card">
            <span className="stat-title">Clear Scans</span>
            <span className="stat-value">{cleanScans}</span>
          </div>
          <div className="stat-card">
            <span className="stat-title">Avg. AI Confidence</span>
            <span className="stat-value">{avgConfidence}%</span>
          </div>
        </div>

        <div className="history-table-container scan-card">
          <h3><LayoutDashboardIcon /> Session Logs Database</h3>
          
          {history.length === 0 ? (
            <div className="empty-state">
              <ShieldIcon width="48" height="48" />
              <p>No medical records stored across your sessions yet.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="history-table">
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>Image Source</th>
                    <th>Diagnostic Prediction</th>
                    <th>Confidence Level</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((item, i) => (
                    <tr key={i}>
                      <td className="time-col">{item.time}</td>
                      <td className="file-col">{item.name}</td>
                      <td>
                        <span className={`status-badge ${item.prediction.includes("No") ? 'badge-safe' : 'badge-danger'}`}>
                          {item.prediction}
                        </span>
                      </td>
                      <td className="conf-col">
                        <div className="conf-wrapper">
                          <span>{parseFloat(item.confidence).toFixed(1)}%</span>
                          <div className="conf-bar-bg">
                            <div className="conf-bar-fill" style={{width: `${parseFloat(item.confidence)}%`}}></div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div>
      <NetworkBackground theme={theme} />
      <header className="header">
        <div className="logo-container" onClick={() => setCurrentView("home")}>
          <img src="/logo.png" alt="NeuroVision Logo" className="logo-icon" />
          <div className="logo">NeuroVision</div>
        </div>
        <nav>
          <button className="theme-toggle" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} title="Toggle Theme">
            {theme === 'light' ? <MoonIcon /> : <SunIcon />}
          </button>
          <a href="#" onClick={(e) => { e.preventDefault(); setCurrentView("home"); }} className={currentView === "home" ? "active-nav" : ""}>
            Scanner
          </a>
          <a href="#" onClick={(e) => { e.preventDefault(); setCurrentView("dashboard"); }} className={`dash-link ${currentView === "dashboard" ? "active-nav" : ""}`}>
            <LayoutDashboardIcon style={{width: 16, height: 16, marginRight: 6, marginBottom: -3}} />
            Dashboard
          </a>
        </nav>
      </header>

      {currentView === "home" ? renderHome() : renderDashboard()}

      <footer id="contact">
        <div className="footer-logo">NeuroVision System v2.1</div>
        <p>Research prototype for medical imaging analysis</p>
        <p>Contact: miora.randrianasy@gmail.com</p>
        <p style={{ marginTop: "20px", fontSize: "0.8rem", color: "rgba(255,255,255,0.4)" }}>
          © 2026 NeuroVision Research Group. All rights reserved.
        </p>
      </footer>
    </div>
  );
}