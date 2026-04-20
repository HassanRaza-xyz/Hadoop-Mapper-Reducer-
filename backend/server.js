const express = require("express");
const multer = require("multer");
const cors = require("cors");
const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = 5000;

// CORS — allow React dev server
app.use(cors());
app.use(express.json());

// Directories
const ENGINE_DIR = path.resolve(__dirname, "..");
const UPLOADS_DIR = path.join(__dirname, "uploads");

// Ensure uploads dir exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const upload = multer({ dest: UPLOADS_DIR });

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", engine: "C++ MapReduce" });
});

/**
 * Runs the MapReduce pipeline step-by-step:
 *   1. mapper.exe  (stdin: raw text → stdout: word\t1 per line)
 *   2. JavaScript sort
 *   3. reducer.exe (stdin: sorted word\t1 lines → stdout: word\tcount)
 */
function runPipeline(inputPath, callback) {
  const mapperExe = path.join(ENGINE_DIR, "mapper.exe");
  const reducerExe = path.join(ENGINE_DIR, "reducer.exe");

  // Verify executables exist
  if (!fs.existsSync(mapperExe)) {
    return callback(new Error(`mapper.exe not found at: ${mapperExe}`));
  }
  if (!fs.existsSync(reducerExe)) {
    return callback(new Error(`reducer.exe not found at: ${reducerExe}`));
  }

  const inputData = fs.readFileSync(inputPath, "utf-8");

  if (!inputData.trim()) {
    return callback(new Error("Input file is empty."));
  }

  console.log(`⚙️  Step 1/3: mapper.exe`);

  // ─── STEP 1: MAPPER ───
  const mapper = spawn(mapperExe, [], { cwd: ENGINE_DIR, stdio: ["pipe", "pipe", "pipe"] });

  let mapperOut = "";
  let mapperErr = "";

  mapper.stdout.on("data", (chunk) => { mapperOut += chunk.toString(); });
  mapper.stderr.on("data", (chunk) => { mapperErr += chunk.toString(); });

  mapper.on("error", (err) => callback(new Error(`Mapper failed to start: ${err.message}`)));

  mapper.on("close", (code) => {
    if (code !== 0) {
      return callback(new Error(`Mapper exited with code ${code}. ${mapperErr}`));
    }
    if (!mapperOut.trim()) {
      return callback(new Error("Mapper produced no output."));
    }

    console.log(`   ✓ ${mapperOut.trim().split("\n").length} mapped lines`);

    // ─── STEP 2: SORT ───
    console.log(`⚙️  Step 2/3: sort`);
    const lines = mapperOut.trim().split("\n").map(l => l.replace(/\r/g, ""));
    lines.sort((a, b) => a.localeCompare(b));
    const sorted = lines.join("\n") + "\n";
    console.log(`   ✓ ${lines.length} sorted lines`);

    // ─── STEP 3: REDUCER ───
    console.log(`⚙️  Step 3/3: reducer.exe`);
    const reducer = spawn(reducerExe, [], { cwd: ENGINE_DIR, stdio: ["pipe", "pipe", "pipe"] });

    let reducerOut = "";
    let reducerErr = "";

    reducer.stdout.on("data", (chunk) => { reducerOut += chunk.toString(); });
    reducer.stderr.on("data", (chunk) => { reducerErr += chunk.toString(); });

    reducer.on("error", (err) => callback(new Error(`Reducer failed to start: ${err.message}`)));

    reducer.on("close", (code2) => {
      if (code2 !== 0) {
        return callback(new Error(`Reducer exited with code ${code2}. ${reducerErr}`));
      }
      if (!reducerOut.trim()) {
        return callback(new Error("Reducer produced no output."));
      }

      console.log(`   ✓ Reducer done`);
      callback(null, reducerOut);
    });

    reducer.stdin.write(sorted);
    reducer.stdin.end();
  });

  mapper.stdin.write(inputData);
  mapper.stdin.end();
}

// Upload endpoint
app.post("/api/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded." });
  }

  const uploadedPath = req.file.path;
  const inputPath = path.join(ENGINE_DIR, "input.txt");

  // Copy uploaded file to input.txt in engine directory
  fs.copyFileSync(uploadedPath, inputPath);

  console.log(`\n📄  File: ${req.file.originalname} (${req.file.size} bytes)`);

  runPipeline(inputPath, (error, stdout) => {
    // Clean up uploaded temp file
    try { fs.unlinkSync(uploadedPath); } catch (_) {}

    if (error) {
      console.error("❌  Error:", error.message);
      return res.status(500).json({ error: "MapReduce pipeline failed.", details: error.message });
    }

    // Parse reducer output:  word\tcount per line
    const results = {};
    const lines = stdout.trim().split("\n");
    for (const line of lines) {
      const trimmed = line.trim().replace(/\r/g, "");
      if (!trimmed) continue;
      const tabIdx = trimmed.lastIndexOf("\t");
      if (tabIdx > 0) {
        const word = trimmed.substring(0, tabIdx).trim();
        const count = parseInt(trimmed.substring(tabIdx + 1).trim(), 10);
        if (word && !isNaN(count)) {
          results[word] = count;
        }
      }
    }

    const totalWords = Object.values(results).reduce((a, b) => a + b, 0);
    const uniqueWords = Object.keys(results).length;

    console.log(`✅  Done — ${uniqueWords} unique, ${totalWords} total\n`);

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
  console.log(`\n🚀  MapReduce Backend on http://localhost:${PORT}`);
  console.log(`📂  Engine: ${ENGINE_DIR}`);
  console.log(`📎  POST /api/upload\n`);
});
