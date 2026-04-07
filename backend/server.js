const express = require("express");
const multer = require("multer");
const cors = require("cors");
const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = 5000;

// CORS — allow React dev server
app.use(cors());
app.use(express.json());

// Store uploads in the parent directory (where .exe files live)
const ENGINE_DIR = path.resolve(__dirname, "..");
const upload = multer({ dest: path.join(__dirname, "uploads") });

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", engine: "C++ MapReduce" });
});

// Upload endpoint — accepts a .txt file, pipes it through mapper | sort | reducer
app.post("/api/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded." });
  }

  const uploadedPath = req.file.path;
  const inputPath = path.join(ENGINE_DIR, "input.txt");

  // Copy uploaded file to input.txt in the engine directory
  fs.copyFileSync(uploadedPath, inputPath);

  // Build the pipeline command  (Windows)
  const mapperExe = path.join(ENGINE_DIR, "mapper.exe");
  const reducerExe = path.join(ENGINE_DIR, "reducer.exe");

  const command = `type "${inputPath}" | "${mapperExe}" | sort | "${reducerExe}"`;

  console.log(`\n⚙️  Running pipeline:\n${command}\n`);

  exec(command, { cwd: ENGINE_DIR, shell: "cmd.exe", timeout: 30000 }, (error, stdout, stderr) => {
    // Clean up uploaded temp file
    try { fs.unlinkSync(uploadedPath); } catch (_) {}

    if (error) {
      console.error("Pipeline error:", error.message);
      return res.status(500).json({ error: "MapReduce pipeline failed.", details: error.message });
    }

    if (stderr) {
      console.warn("Pipeline stderr:", stderr);
    }

    // Parse reducer output:  word\tcount  per line
    const results = {};
    const lines = stdout.trim().split("\n");
    for (const line of lines) {
      const parts = line.trim().split("\t");
      if (parts.length === 2) {
        results[parts[0]] = parseInt(parts[1], 10);
      }
    }

    const totalWords = Object.values(results).reduce((a, b) => a + b, 0);
    const uniqueWords = Object.keys(results).length;

    console.log(`✅  Done — ${uniqueWords} unique words, ${totalWords} total words`);

    res.json({
      results,
      meta: {
        totalWords,
        uniqueWords,
        fileName: req.file.originalname,
        processedAt: new Date().toISOString(),
      },
    });
  });
});

app.listen(PORT, () => {
  console.log(`\n🚀  MapReduce Backend running on http://localhost:${PORT}`);
  console.log(`📂  Engine directory: ${ENGINE_DIR}`);
  console.log(`📎  POST /api/upload  — send a .txt file\n`);
});
