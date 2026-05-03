import os
import subprocess
import shutil
from datetime import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename

app = Flask(__name__)
CORS(app)

# Directories
BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
ENGINE_DIR = os.path.dirname(BACKEND_DIR)
UPLOADS_DIR = os.path.join(BACKEND_DIR, "uploads")

# Ensure uploads dir exists
if not os.path.exists(UPLOADS_DIR):
    os.makedirs(UPLOADS_DIR, exist_ok=True)

# Helper functions
def run_pipeline(input_path):
    # Cross-platform executable naming: favor Linux binaries on Render
    if os.name == 'nt':  # Windows
        mapper_exe = os.path.join(ENGINE_DIR, "mapper.exe")
        reducer_exe = os.path.join(ENGINE_DIR, "reducer.exe")
    else:  # Linux (Render)
        mapper_exe = os.path.join(ENGINE_DIR, "mapper")
        reducer_exe = os.path.join(ENGINE_DIR, "reducer")
    
    # Validation
    if not os.path.exists(mapper_exe):
        # Last ditch effort for local dev
        if os.name != 'nt' and os.path.exists(mapper_exe + ".exe"):
             mapper_exe += ".exe"
        else:
             raise Exception(f"Mapper executable not found at: {mapper_exe}")

    if not os.path.exists(reducer_exe):
        if os.name != 'nt' and os.path.exists(reducer_exe + ".exe"):
             reducer_exe += ".exe"
        else:
             raise Exception(f"Reducer executable not found at: {reducer_exe}")

    with open(input_path, "r", encoding="utf-8") as f:
        input_data = f.read()

    if not input_data.strip():
        raise Exception("Input file is empty.")

    print("⚙️  Step 1/3: mapper")
    # Step 1: Mapper
    mapper = subprocess.Popen(
        [mapper_exe],
        cwd=ENGINE_DIR,
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True
    )
    mapper_out, mapper_err = mapper.communicate(input=input_data)

    if mapper.returncode != 0:
        raise Exception(f"Mapper exited with code {mapper.returncode}. {mapper_err}")
    if not mapper_out.strip():
        raise Exception("Mapper produced no output.")

    print(f"   ✓ {len(mapper_out.strip().splitlines())} mapped lines")

    # Step 2: Sort
    print("⚙️  Step 2/3: sort")
    lines = [line.strip() for line in mapper_out.strip().splitlines() if line.strip()]
    lines.sort()
    sorted_data = "\n".join(lines) + "\n"
    print(f"   ✓ {len(lines)} sorted lines")

    # Step 3: Reducer
    print("⚙️  Step 3/3: reducer")
    reducer = subprocess.Popen(
        [reducer_exe],
        cwd=ENGINE_DIR,
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True
    )
    reducer_out, reducer_err = reducer.communicate(input=sorted_data)

    if reducer.returncode != 0:
        raise Exception(f"Reducer exited with code {reducer.returncode}. {reducer_err}")
    if not reducer_out.strip():
        raise Exception("Reducer produced no output.")

    print("   ✓ Reducer done")
    return reducer_out

@app.route("/api/health", methods=["GET"])
def health_check():
    return jsonify({"status": "ok", "engine": "C++ MapReduce (Python Backend)"})

@app.route("/api/upload", methods=["POST"])
def upload_file():
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded."}), 400

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "No file selected."}), 400

    filename = secure_filename(file.filename)
    uploaded_path = os.path.join(UPLOADS_DIR, filename)
    file.save(uploaded_path)

    input_path = os.path.join(ENGINE_DIR, "input.txt")
    shutil.copyfile(uploaded_path, input_path)

    print(f"\n📄  File: {filename} ({os.path.getsize(uploaded_path)} bytes)")

    try:
        reducer_out = run_pipeline(input_path)
    except Exception as e:
        print(f"❌  Error: {str(e)}")
        return jsonify({"error": "MapReduce pipeline failed.", "details": str(e)}), 500
    finally:
        if os.path.exists(uploaded_path):
            os.remove(uploaded_path)

    # Parse reducer output: word\tcount per line
    results = {}
    lines = reducer_out.strip().splitlines()
    for line in lines:
        trimmed = line.strip()
        if not trimmed:
            continue
        tab_idx = trimmed.rfind("\t")
        if tab_idx > 0:
            word = trimmed[:tab_idx].strip()
            count_str = trimmed[tab_idx + 1:].strip()
            try:
                count = int(count_str)
                if word:
                    results[word] = count
            except ValueError:
                continue

    total_words = sum(results.values())
    unique_words = len(results)

    print(f"✅  Done — {unique_words} unique, {total_words} total\n")

    return jsonify({
        "results": results,
        "meta": {
            "totalWords": total_words,
            "uniqueWords": unique_words,
            "fileName": filename,
            "processedAt": datetime.utcnow().isoformat() + "Z",
        }
    })

if __name__ == "__main__":
    PORT = 5000
    print(f"\n🚀  MapReduce Backend on http://localhost:{PORT}")
    print(f"📂  Engine: {ENGINE_DIR}")
    print("📎  POST /api/upload\n")
    app.run(port=PORT, debug=True)
