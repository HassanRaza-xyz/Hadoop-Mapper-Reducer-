import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { useDropzone } from "react-dropzone";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

/* ═════════════════════════════════════════════════════════════
   DESIGN CONSTANTS
   ═════════════════════════════════════════════════════════════ */

const CHART_COLORS = [
  "#3B82F6", "#60A5FA", "#93C5FD", "#3B82F6", "#60A5FA",
  "#93C5FD", "#3B82F6", "#60A5FA", "#93C5FD", "#3B82F6",
];

/* ═════════════════════════════════════════════════════════════
   INTERSECTION OBSERVER HOOK
   ═════════════════════════════════════════════════════════════ */

function useScrollReveal(threshold = 0.15) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);

  return [ref, visible];
}

/* ═════════════════════════════════════════════════════════════
   CUSTOM TOOLTIP
   ═════════════════════════════════════════════════════════════ */

function CustomTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    return (
      <div className="chart-tooltip">
        <p className="chart-tooltip-word">{payload[0].payload.word}</p>
        <p className="chart-tooltip-count">
          Count: <strong>{payload[0].value}</strong>
        </p>
      </div>
    );
  }
  return null;
}

/* ═════════════════════════════════════════════════════════════
   STAT CARD
   ═════════════════════════════════════════════════════════════ */

function StatCard({ icon, label, value, color }) {
  return (
    <div className="stat-card">
      <div className="stat-icon" style={{ background: `${color}14` }}>
        {icon}
      </div>
      <div>
        <div className="stat-label">{label}</div>
        <div className="stat-value" style={{ color }}>{value}</div>
      </div>
    </div>
  );
}

/* ═════════════════════════════════════════════════════════════
   FEATURE CARD
   ═════════════════════════════════════════════════════════════ */

function FeatureCard({ icon, title, description, delay = 0 }) {
  const [ref, visible] = useScrollReveal();
  return (
    <div
      ref={ref}
      className="feature-card"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(30px)",
        transition: `all 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
      }}
    >
      <div className="feature-icon">{icon}</div>
      <h3 className="feature-title">{title}</h3>
      <p className="feature-description">{description}</p>
    </div>
  );
}

/* ═════════════════════════════════════════════════════════════
   NAVBAR
   ═════════════════════════════════════════════════════════════ */

function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToUpload = () => {
    document.getElementById("upload-section")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav id="main-nav" className={`navbar ${scrolled ? "scrolled" : ""}`}>
      <div className="navbar-inner">
        <a href="#" className="nav-brand">
          <div className="nav-brand-icon">M</div>
          <span className="nav-brand-text">MapReduce</span>
        </a>
        <ul className="nav-links">
          <li><a href="#features" className="nav-link">Features</a></li>
          <li><a href="#upload-section" className="nav-link">Upload</a></li>
          <li><a href="#how-it-works" className="nav-link">How It Works</a></li>
        </ul>
        <button id="nav-get-started" className="nav-cta" onClick={scrollToUpload}>
          Get Started
        </button>
      </div>
    </nav>
  );
}

/* ═════════════════════════════════════════════════════════════
   FOOTER
   ═════════════════════════════════════════════════════════════ */

function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <a href="#" className="nav-brand">
              <div className="nav-brand-icon">M</div>
              <span className="nav-brand-text">MapReduce</span>
            </a>
            <p className="footer-brand-description">
              High-performance Big Data analytics powered by a native C++ MapReduce engine with real-time visualization.
            </p>
          </div>
          <div>
            <h4 className="footer-col-title">Product</h4>
            <ul className="footer-links">
              <li><a href="#features" className="footer-link">Features</a></li>
              <li><a href="#upload-section" className="footer-link">Upload</a></li>
              <li><a href="#how-it-works" className="footer-link">How It Works</a></li>
            </ul>
          </div>
          <div>
            <h4 className="footer-col-title">Stack</h4>
            <ul className="footer-links">
              <li><a href="#" className="footer-link">C++ Engine</a></li>
              <li><a href="#" className="footer-link">Node.js API</a></li>
              <li><a href="#" className="footer-link">React Frontend</a></li>
            </ul>
          </div>
          <div>
            <h4 className="footer-col-title">Resources</h4>
            <ul className="footer-links">
              <li><a href="#" className="footer-link">Documentation</a></li>
              <li><a href="#" className="footer-link">GitHub</a></li>
              <li><a href="#" className="footer-link">License</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p className="footer-copyright">
            © {new Date().getFullYear()} MapReduce Analytics. Built with C++ & React.
          </p>
          <div className="footer-social">
            <a href="#" className="footer-social-link" aria-label="GitHub">⌘</a>
            <a href="#" className="footer-social-link" aria-label="Twitter">✦</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ═════════════════════════════════════════════════════════════
   MAIN APP
   ═════════════════════════════════════════════════════════════ */

export default function App() {
  const [results, setResults] = useState(null);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fileName, setFileName] = useState(null);

  /* ── Dropzone ── */
  const onDrop = useCallback(async (acceptedFiles) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    setFileName(file.name);
    setLoading(true);
    setError(null);
    setResults(null);
    setMeta(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post("/api/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 30000,
      });
      setResults(response.data.results);
      setMeta(response.data.meta);
    } catch (err) {
      const message = err.response?.data?.error || err.message || "Something went wrong";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "text/plain": [".txt"] },
    multiple: false,
  });

  /* ── Data processing ── */
  const sortedEntries = useMemo(() => {
    if (!results) return [];
    return Object.entries(results)
      .map(([word, count]) => ({ word, count }))
      .sort((a, b) => b.count - a.count);
  }, [results]);

  const top10 = useMemo(() => sortedEntries.slice(0, 10), [sortedEntries]);
  const maxCount = useMemo(() => (top10.length > 0 ? top10[0].count : 1), [top10]);

  /* ── Scroll-reveal refs ── */
  const [featuresRef, featuresVisible] = useScrollReveal();
  const [uploadRef, uploadVisible] = useScrollReveal(0.1);
  const [ctaRef, ctaVisible] = useScrollReveal();

  /* ═════════════ RENDER ═════════════ */
  return (
    <>
      <Navbar />

      {/* ━━━━━━━━━━━━━━━ HERO ━━━━━━━━━━━━━━━ */}
      <section className="hero" id="hero">
        <div className="hero-bg">
          <div className="hero-orb hero-orb-1" />
          <div className="hero-orb hero-orb-2" />
        </div>

        <div className="container">
          <div className="hero-content">
            {/* Left: Text */}
            <div className="hero-text">
              <div className="hero-badge anim-fade-up">
                <span className="hero-badge-dot" />
                
              </div>
              <h1 className="anim-fade-up-delay-1">
                <span className="accent-word">MapReduce</span>
                <br />
                Big Data Analytics
              </h1>
              <p className="hero-description anim-fade-up-delay-2">
                Upload a text file and watch the C++ MapReduce engine analyze word
                frequencies in real-time with blazing fast performance.
              </p>
              <div className="hero-actions anim-fade-up-delay-3">
                <button
                  id="hero-cta"
                  className="btn-primary"
                  onClick={() => document.getElementById("upload-section")?.scrollIntoView({ behavior: "smooth" })}
                >
                  Start Analyzing →
                </button>
                <a href="#features" className="btn-secondary">
                  Learn More
                </a>
              </div>
            </div>

            {/* Right: Visual */}
            <div className="hero-visual anim-fade-up-delay-2">
              <div className="hero-visual-card">
                <div className="hero-terminal-dots">
                  <span /><span /><span />
                </div>
                <div className="hero-code-line"><span className="comment">// MapReduce Pipeline</span></div>
                <div className="hero-code-line"><span className="keyword">$</span> cat input.txt | ./mapper</div>
                <div className="hero-code-line"><span className="keyword">$</span> sort mapped_output.txt</div>
                <div className="hero-code-line"><span className="keyword">$</span> ./reducer {"<"} sorted.txt</div>
                <div className="hero-code-line"> </div>
                <div className="hero-code-line"><span className="string">✓ 2,847 words processed</span></div>
                <div className="hero-code-line"><span className="string">✓ 412 unique words found</span></div>
                <div className="hero-code-line"><span className="string">✓ Top word: "the" (187)</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━ FEATURES ━━━━━━━━━━━━━━━ */}
      <section className="section" id="features" ref={featuresRef}>
        <div className="container">
          <div
            className="section-header"
            style={{
              opacity: featuresVisible ? 1 : 0,
              transform: featuresVisible ? "translateY(0)" : "translateY(30px)",
              transition: "all 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          >
            <span className="section-label">Features</span>
            <h2 className="section-title">Built for Performance</h2>
            <p className="section-subtitle">
              A full-stack pipeline combining native C++ speed with modern web visualization.
            </p>
          </div>
          <div className="features-grid">
            <FeatureCard
              icon="⚡"
              title="Native C++ Engine"
              description="Mapper and Reducer executables compiled to native code for maximum throughput on large datasets."
              delay={0}
            />
            <FeatureCard
              icon="📊"
              title="Real-Time Charts"
              description="Interactive bar charts with hover tooltips powered by Recharts, rendering your data beautifully."
              delay={100}
            />
            <FeatureCard
              icon="📁"
              title="Drag & Drop Upload"
              description="Simply drag your text files into the upload zone. No configuration needed — just drop and analyze."
              delay={200}
            />
            <FeatureCard
              icon="🔍"
              title="Frequency Analysis"
              description="Complete word frequency breakdown with sortable results, distribution bars, and top-10 highlights."
              delay={300}
            />
            <FeatureCard
              icon="🚀"
              title="Express API"
              description="Node.js backend handles file I/O and orchestrates the C++ pipeline with robust error handling."
              delay={400}
            />
            <FeatureCard
              icon="🛡️"
              title="Full Pipeline View"
              description="See every step from input → mapper → sort → reducer, with live status updates during processing."
              delay={500}
            />
          </div>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━ UPLOAD SECTION ━━━━━━━━━━━━━━━ */}
      <section
        className="section upload-section"
        id="upload-section"
        ref={uploadRef}
      >
        <div className="container">
          <div
            className="section-header"
            style={{
              opacity: uploadVisible ? 1 : 0,
              transform: uploadVisible ? "translateY(0)" : "translateY(30px)",
              transition: "all 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          >
            <span className="section-label">Upload</span>
            <h2 className="section-title">Analyze Your Data</h2>
            <p className="section-subtitle">
              Drop a .txt file below and the C++ MapReduce engine will process it instantly.
            </p>
          </div>

          {/* Dropzone */}
          <div
            style={{
              maxWidth: 720,
              margin: "0 auto",
              opacity: uploadVisible ? 1 : 0,
              transform: uploadVisible ? "translateY(0)" : "translateY(20px)",
              transition: "all 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.15s",
            }}
          >
            <div
              {...getRootProps()}
              id="dropzone"
              className={`dropzone ${isDragActive ? "active" : ""}`}
            >
              <input {...getInputProps()} id="file-input" />
              <div style={{ position: "relative", zIndex: 1 }}>
                {loading ? (
                  <div>
                    <div className="loading-spinner" />
                    <p className="loading-text">Processing through C++ Pipeline…</p>
                    <p className="loading-subtext">mapper.exe → sort → reducer.exe</p>
                  </div>
                ) : (
                  <>
                    <div className="dropzone-icon">
                      {isDragActive ? "↓" : "↑"}
                    </div>
                    <p className="dropzone-title">
                      {isDragActive ? "Drop it right here!" : "Drag & Drop your text file"}
                    </p>
                    <p className="dropzone-subtitle">
                      or click to browse · Only .txt files accepted
                    </p>
                    {fileName && !results && (
                      <div className="dropzone-file-badge">📎 {fileName}</div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="error-card anim-fade-in" style={{ maxWidth: 720, margin: "var(--space-3) auto 0" }}>
              <div className="error-icon">✕</div>
              <div>
                <p className="error-title">Pipeline Error</p>
                <p className="error-message">{error}</p>
              </div>
            </div>
          )}

          {/* Results */}
          {results && meta && (
            <div className="anim-slide-in" style={{ marginTop: "var(--space-5)" }}>
              {/* Stats */}
              <div className="stats-grid">
                <StatCard
                  icon="📊"
                  label="Total Words"
                  value={meta.totalWords.toLocaleString()}
                  color="#3B82F6"
                />
                <StatCard
                  icon="Aa"
                  label="Unique Words"
                  value={meta.uniqueWords.toLocaleString()}
                  color="#60A5FA"
                />
                <StatCard
                  icon="📄"
                  label="Source File"
                  value={meta.fileName}
                  color="#22C55E"
                />
                <StatCard
                  icon="⚡"
                  label="Engine"
                  value="C++ MR"
                  color="#F59E0B"
                />
              </div>

              {/* Chart + Table */}
              <div className="results-grid">
                {/* Chart Panel */}
                <div className="panel" id="chart-panel">
                  <div className="panel-header">
                    <div>
                      <h2 className="panel-title">Top 10 Words</h2>
                      <p className="panel-subtitle">Most frequent words by count</p>
                    </div>
                    <span className="panel-badge">Chart</span>
                  </div>
                  <div className="panel-body">
                    <div style={{ width: "100%", height: 300 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={top10}
                          margin={{ top: 5, right: 10, left: -10, bottom: 60 }}
                        >
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="rgba(255,255,255,0.04)"
                            vertical={false}
                          />
                          <XAxis
                            dataKey="word"
                            tick={{ fill: "#94A3B8", fontSize: 11, fontWeight: 500 }}
                            axisLine={false}
                            tickLine={false}
                            angle={-40}
                            textAnchor="end"
                            interval={0}
                          />
                          <YAxis
                            tick={{ fill: "#64748B", fontSize: 11 }}
                            axisLine={false}
                            tickLine={false}
                            allowDecimals={false}
                          />
                          <Tooltip
                            content={<CustomTooltip />}
                            cursor={{ fill: "rgba(255,255,255,0.02)" }}
                          />
                          <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={44}>
                            {top10.map((_, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={CHART_COLORS[index]}
                                fillOpacity={1 - index * 0.06}
                              />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* Table Panel */}
                <div className="panel" id="table-panel">
                  <div className="panel-header">
                    <div>
                      <h2 className="panel-title">Word Frequency Table</h2>
                      <p className="panel-subtitle">
                        {sortedEntries.length} words sorted by frequency
                      </p>
                    </div>
                    <span className="panel-badge">All Words</span>
                  </div>
                  <div className="table-scroll">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th style={{ width: 48 }}>#</th>
                          <th>Word</th>
                          <th style={{ width: 80, textAlign: "right" }}>Count</th>
                          <th style={{ width: 120 }}>Distribution</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sortedEntries.map((entry, i) => (
                          <tr key={entry.word}>
                            <td style={{ color: "var(--text-muted)" }}>{i + 1}</td>
                            <td>
                              <span
                                style={{
                                  fontWeight: i < 3 ? 600 : 400,
                                  color: i < 3 ? "var(--accent)" : "var(--text-primary)",
                                }}
                              >
                                {entry.word}
                              </span>
                            </td>
                            <td
                              style={{
                                textAlign: "right",
                                fontWeight: 600,
                                color: "var(--text-primary)",
                              }}
                            >
                              {entry.count}
                            </td>
                            <td>
                              <div className="distribution-bar-track">
                                <div
                                  className="distribution-bar-fill"
                                  style={{
                                    width: `${(entry.count / maxCount) * 100}%`,
                                  }}
                                />
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Pipeline Info */}
              <div className="pipeline-footer">
                <div className="pipeline-badge">
                  <span className="pipeline-dot" />
                  <span>Pipeline:</span>
                  <code>input.txt → mapper.exe → sort → reducer.exe</code>
                  <span style={{ color: "var(--text-muted)" }}>·</span>
                  <span>Processed at {new Date(meta.processedAt).toLocaleTimeString()}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━ HOW IT WORKS (empty state) ━━━━━━━━━━━━━━━ */}
      {!results && !loading && (
        <section className="section" id="how-it-works">
          <div className="container">
            <div className="section-header">
              <span className="section-label">Pipeline</span>
              <h2 className="section-title">How It Works</h2>
              <p className="section-subtitle">
                Your file flows through a four-stage C++ MapReduce pipeline.
              </p>
            </div>
            <div className="pipeline-steps">
              <div className="pipeline-step">📄 Upload .txt</div>
              <span className="pipeline-arrow">→</span>
              <div className="pipeline-step">⚙️ mapper.exe</div>
              <span className="pipeline-arrow">→</span>
              <div className="pipeline-step">🔀 sort</div>
              <span className="pipeline-arrow">→</span>
              <div className="pipeline-step">📊 reducer.exe</div>
            </div>
          </div>
        </section>
      )}

      {/* ━━━━━━━━━━━━━━━ CTA SECTION ━━━━━━━━━━━━━━━ */}
      <section className="cta-section" ref={ctaRef}>
        <div className="container">
          <div
            className="cta-box"
            style={{
              opacity: ctaVisible ? 1 : 0,
              transform: ctaVisible ? "translateY(0)" : "translateY(30px)",
              transition: "all 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          >
            <h2 className="cta-title">Ready to Analyze Your Data?</h2>
            <p className="cta-description">
              Upload a text file and see the full MapReduce pipeline in action — powered by native C++.
            </p>
            <button
              id="cta-button"
              className="btn-primary"
              onClick={() => document.getElementById("upload-section")?.scrollIntoView({ behavior: "smooth" })}
            >
              Start Now →
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
