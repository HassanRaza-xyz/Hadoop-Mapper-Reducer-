import { useState, useCallback, useMemo } from "react";
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
import "./App.css";

/* ─────────────────────── Color Palette for Chart ─────────────────────── */
const CHART_COLORS = [
  "#00d4ff",
  "#8b5cf6",
  "#10b981",
  "#f43f5e",
  "#f59e0b",
  "#06b6d4",
  "#a855f7",
  "#22c55e",
  "#ec4899",
  "#eab308",
];

/* ─────────────────────── Custom Tooltip ─────────────────────── */
function CustomTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          background: "#16161f",
          border: "1px solid #2a2a3d",
          borderRadius: "12px",
          padding: "12px 16px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
        }}
      >
        <p style={{ color: "#e8e8ed", fontSize: "0.9rem", fontWeight: 600 }}>
          {payload[0].payload.word}
        </p>
        <p style={{ color: "#00d4ff", fontSize: "0.8rem", marginTop: 4 }}>
          Count: <strong>{payload[0].value}</strong>
        </p>
      </div>
    );
  }
  return null;
}

/* ─────────────────────── Stat Card Component ─────────────────────── */
function StatCard({ icon, label, value, color }) {
  return (
    <div className="stat-card" style={{ "--accent": color }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            background: `${color}15`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1.2rem",
          }}
        >
          {icon}
        </div>
        <div>
          <div
            style={{
              fontSize: "0.75rem",
              color: "var(--text-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              fontWeight: 600,
            }}
          >
            {label}
          </div>
          <div
            style={{
              fontSize: "1.5rem",
              fontWeight: 700,
              color: color,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {value}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────── Main App ─────────────────────── */
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
      const message =
        err.response?.data?.error || err.message || "Something went wrong";
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

  /* ── Process results for display ── */
  const sortedEntries = useMemo(() => {
    if (!results) return [];
    return Object.entries(results)
      .map(([word, count]) => ({ word, count }))
      .sort((a, b) => b.count - a.count);
  }, [results]);

  const top10 = useMemo(() => sortedEntries.slice(0, 10), [sortedEntries]);
  const maxCount = useMemo(
    () => (top10.length > 0 ? top10[0].count : 1),
    [top10]
  );

  /* ─────────────────────── RENDER ─────────────────────── */
  return (
    <div className="bg-grid noise-overlay" style={{ minHeight: "100vh" }}>
      {/* ── Background Glow Orbs ── */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          zIndex: 0,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "-20%",
            left: "-10%",
            width: "600px",
            height: "600px",
            background:
              "radial-gradient(circle, rgba(0,212,255,0.06) 0%, transparent 70%)",
            borderRadius: "50%",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-20%",
            right: "-10%",
            width: "600px",
            height: "600px",
            background:
              "radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 70%)",
            borderRadius: "50%",
          }}
        />
      </div>

      <div
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "40px 24px 80px",
        }}
      >
        {/* ━━━━━━━━━━━━━━━ Header ━━━━━━━━━━━━━━━ */}
        <header
          className="animate-fade-in-up"
          style={{ textAlign: "center", marginBottom: "48px" }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              background: "var(--accent-cyan-dim)",
              border: "1px solid var(--accent-cyan)",
              borderRadius: "999px",
              padding: "6px 16px",
              fontSize: "0.75rem",
              fontWeight: 600,
              color: "var(--accent-cyan)",
              marginBottom: "20px",
              letterSpacing: "0.05em",
              textTransform: "uppercase",
            }}
          >
            ⚡ C++ Powered Engine
          </div>
          <h1
            style={{
              fontSize: "clamp(2rem, 5vw, 3.2rem)",
              fontWeight: 800,
              lineHeight: 1.15,
              letterSpacing: "-0.03em",
              marginBottom: "16px",
            }}
          >
            <span className="gradient-text">MapReduce</span>
            <br />
            <span style={{ color: "var(--text-primary)" }}>
              Big Data Analytics
            </span>
          </h1>
          <p
            style={{
              fontSize: "1.05rem",
              color: "var(--text-secondary)",
              maxWidth: "540px",
              margin: "0 auto",
              lineHeight: 1.7,
            }}
          >
            Upload a text file and watch the C++ MapReduce engine analyze word
            frequencies in real-time with blazing fast performance.
          </p>
        </header>

        {/* ━━━━━━━━━━━━━━━ Upload Zone ━━━━━━━━━━━━━━━ */}
        <div
          className="animate-fade-in-up"
          style={{ animationDelay: "0.15s", opacity: 0 }}
        >
          <div
            {...getRootProps()}
            id="dropzone"
            className={`dropzone ${isDragActive ? "active" : ""} ${
              loading ? "animate-pulse-glow" : ""
            }`}
            style={{ marginBottom: "36px" }}
          >
            <input {...getInputProps()} id="file-input" />
            <div style={{ position: "relative", zIndex: 1 }}>
              {loading ? (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "16px",
                  }}
                >
                  <div className="spinner"></div>
                  <p style={{ color: "var(--accent-cyan)", fontWeight: 500 }}>
                    Processing through C++ Pipeline...
                  </p>
                  <p
                    style={{
                      color: "var(--text-muted)",
                      fontSize: "0.8rem",
                    }}
                  >
                    mapper.exe → sort → reducer.exe
                  </p>
                </div>
              ) : (
                <>
                  <div
                    className="animate-float"
                    style={{
                      fontSize: "3rem",
                      marginBottom: "12px",
                    }}
                  >
                    {isDragActive ? "📥" : "📄"}
                  </div>
                  <p
                    style={{
                      fontSize: "1.1rem",
                      fontWeight: 600,
                      color: "var(--text-primary)",
                      marginBottom: "8px",
                    }}
                  >
                    {isDragActive
                      ? "Drop it right here!"
                      : "Drag & Drop your text file"}
                  </p>
                  <p
                    style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}
                  >
                    or click to browse • Only .txt files accepted
                  </p>
                  {fileName && !results && (
                    <div
                      style={{
                        marginTop: "12px",
                        padding: "8px 16px",
                        background: "var(--bg-primary)",
                        borderRadius: "8px",
                        display: "inline-block",
                        fontSize: "0.8rem",
                        color: "var(--text-secondary)",
                      }}
                    >
                      📎 {fileName}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* ━━━━━━━━━━━━━━━ Error ━━━━━━━━━━━━━━━ */}
        {error && (
          <div
            className="glass-card animate-fade-in"
            style={{
              padding: "16px 24px",
              marginBottom: "24px",
              borderColor: "var(--accent-rose)",
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <span style={{ fontSize: "1.3rem" }}>⚠️</span>
            <div>
              <p
                style={{
                  color: "var(--accent-rose)",
                  fontWeight: 600,
                  fontSize: "0.9rem",
                }}
              >
                Pipeline Error
              </p>
              <p
                style={{
                  color: "var(--text-secondary)",
                  fontSize: "0.8rem",
                  marginTop: 2,
                }}
              >
                {error}
              </p>
            </div>
          </div>
        )}

        {/* ━━━━━━━━━━━━━━━ Results ━━━━━━━━━━━━━━━ */}
        {results && meta && (
          <div className="animate-fade-in-up">
            {/* ── Stats Row ── */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "16px",
                marginBottom: "32px",
              }}
            >
              <StatCard
                icon="📊"
                label="Total Words"
                value={meta.totalWords.toLocaleString()}
                color="#00d4ff"
              />
              <StatCard
                icon="🔤"
                label="Unique Words"
                value={meta.uniqueWords.toLocaleString()}
                color="#8b5cf6"
              />
              <StatCard
                icon="📄"
                label="Source File"
                value={meta.fileName}
                color="#10b981"
              />
              <StatCard
                icon="⚡"
                label="Engine"
                value="C++ MR"
                color="#f59e0b"
              />
            </div>

            {/* ── Chart + Table Grid ── */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "24px",
              }}
              className="results-grid"
            >
              {/* ── Bar Chart ── */}
              <div
                className="glass-card"
                style={{ padding: "28px", overflow: "hidden" }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: "24px",
                  }}
                >
                  <div>
                    <h2
                      style={{
                        fontSize: "1.1rem",
                        fontWeight: 700,
                        color: "var(--text-primary)",
                      }}
                    >
                      Top 10 Words
                    </h2>
                    <p
                      style={{
                        fontSize: "0.78rem",
                        color: "var(--text-muted)",
                        marginTop: 4,
                      }}
                    >
                      Most frequent words by count
                    </p>
                  </div>
                  <div
                    style={{
                      background: "var(--accent-cyan-dim)",
                      color: "var(--accent-cyan)",
                      padding: "4px 12px",
                      borderRadius: "8px",
                      fontSize: "0.72rem",
                      fontWeight: 600,
                    }}
                  >
                    BAR CHART
                  </div>
                </div>
                <div style={{ width: "100%", height: 320 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={top10}
                      margin={{ top: 5, right: 10, left: -10, bottom: 60 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="var(--border-subtle)"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="word"
                        tick={{
                          fill: "var(--text-secondary)",
                          fontSize: 11,
                          fontWeight: 500,
                        }}
                        axisLine={false}
                        tickLine={false}
                        angle={-40}
                        textAnchor="end"
                        interval={0}
                      />
                      <YAxis
                        tick={{
                          fill: "var(--text-muted)",
                          fontSize: 11,
                        }}
                        axisLine={false}
                        tickLine={false}
                        allowDecimals={false}
                      />
                      <Tooltip
                        content={<CustomTooltip />}
                        cursor={{ fill: "rgba(255,255,255,0.03)" }}
                      />
                      <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={48}>
                        {top10.map((_, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={CHART_COLORS[index % CHART_COLORS.length]}
                            fillOpacity={0.85}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* ── Scrollable Table ── */}
              <div
                className="glass-card"
                style={{
                  padding: "28px",
                  display: "flex",
                  flexDirection: "column",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: "20px",
                  }}
                >
                  <div>
                    <h2
                      style={{
                        fontSize: "1.1rem",
                        fontWeight: 700,
                        color: "var(--text-primary)",
                      }}
                    >
                      Word Frequency Table
                    </h2>
                    <p
                      style={{
                        fontSize: "0.78rem",
                        color: "var(--text-muted)",
                        marginTop: 4,
                      }}
                    >
                      {sortedEntries.length} words sorted by frequency
                    </p>
                  </div>
                  <div
                    style={{
                      background: "var(--accent-violet-dim)",
                      color: "var(--accent-violet)",
                      padding: "4px 12px",
                      borderRadius: "8px",
                      fontSize: "0.72rem",
                      fontWeight: 600,
                    }}
                  >
                    ALL WORDS
                  </div>
                </div>
                <div
                  style={{
                    flex: 1,
                    overflowY: "auto",
                    maxHeight: "340px",
                    borderRadius: "10px",
                    border: "1px solid var(--border-subtle)",
                  }}
                >
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th style={{ width: "48px" }}>#</th>
                        <th>Word</th>
                        <th style={{ width: "80px", textAlign: "right" }}>
                          Count
                        </th>
                        <th style={{ width: "120px" }}>Distribution</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedEntries.map((entry, i) => (
                        <tr key={entry.word}>
                          <td style={{ color: "var(--text-muted)" }}>
                            {i + 1}
                          </td>
                          <td>
                            <span
                              style={{
                                fontWeight: i < 3 ? 600 : 400,
                                color:
                                  i < 3
                                    ? "var(--accent-cyan)"
                                    : "var(--text-primary)",
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
                            <div
                              style={{
                                width: "100%",
                                height: "4px",
                                background: "var(--bg-primary)",
                                borderRadius: "2px",
                                overflow: "hidden",
                              }}
                            >
                              <div
                                className="count-bar"
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

            {/* ── Pipeline Info Footer ── */}
            <div
              style={{
                marginTop: "32px",
                textAlign: "center",
                color: "var(--text-muted)",
                fontSize: "0.78rem",
              }}
            >
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  background: "var(--bg-card)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "999px",
                  padding: "8px 20px",
                }}
              >
                <span style={{ color: "var(--accent-emerald)" }}>●</span>
                Pipeline:{" "}
                <code
                  style={{
                    color: "var(--text-secondary)",
                    fontSize: "0.72rem",
                  }}
                >
                  input.txt → mapper.exe → sort → reducer.exe
                </code>
                <span style={{ color: "var(--text-muted)" }}>•</span>
                Processed at{" "}
                {new Date(meta.processedAt).toLocaleTimeString()}
              </div>
            </div>
          </div>
        )}

        {/* ━━━━━━━━━━━━━━━ Empty State Footer ━━━━━━━━━━━━━━━ */}
        {!results && !loading && (
          <div
            className="animate-fade-in-up"
            style={{
              animationDelay: "0.3s",
              opacity: 0,
              marginTop: "48px",
              textAlign: "center",
            }}
          >
            <div
              className="glass-card"
              style={{
                display: "inline-block",
                padding: "24px 40px",
              }}
            >
              <p
                style={{
                  fontSize: "0.85rem",
                  color: "var(--text-secondary)",
                  marginBottom: "12px",
                }}
              >
                How It Works
              </p>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                  fontSize: "0.82rem",
                  color: "var(--text-muted)",
                }}
              >
                <span
                  style={{
                    padding: "6px 14px",
                    background: "var(--bg-primary)",
                    borderRadius: "8px",
                    border: "1px solid var(--border-subtle)",
                    fontFamily: "monospace",
                    fontSize: "0.75rem",
                  }}
                >
                  📄 Upload .txt
                </span>
                <span style={{ color: "var(--accent-cyan)" }}>→</span>
                <span
                  style={{
                    padding: "6px 14px",
                    background: "var(--bg-primary)",
                    borderRadius: "8px",
                    border: "1px solid var(--border-subtle)",
                    fontFamily: "monospace",
                    fontSize: "0.75rem",
                  }}
                >
                  ⚙️ mapper.exe
                </span>
                <span style={{ color: "var(--accent-violet)" }}>→</span>
                <span
                  style={{
                    padding: "6px 14px",
                    background: "var(--bg-primary)",
                    borderRadius: "8px",
                    border: "1px solid var(--border-subtle)",
                    fontFamily: "monospace",
                    fontSize: "0.75rem",
                  }}
                >
                  🔀 sort
                </span>
                <span style={{ color: "var(--accent-emerald)" }}>→</span>
                <span
                  style={{
                    padding: "6px 14px",
                    background: "var(--bg-primary)",
                    borderRadius: "8px",
                    border: "1px solid var(--border-subtle)",
                    fontFamily: "monospace",
                    fontSize: "0.75rem",
                  }}
                >
                  📊 reducer.exe
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
