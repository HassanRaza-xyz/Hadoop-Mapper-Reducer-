import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { useDropzone } from "react-dropzone";
import axios from "axios";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/* ═ ICON ═ */
function Icon({ name, filled, style }) {
  return (
    <span className="material-symbols-outlined"
      style={{ ...(filled ? { fontVariationSettings: "'FILL' 1" } : {}), ...style }}>
      {name}
    </span>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MATRIX BACKGROUND —Canvas-based digital rain for "Engine" feel
   ═══════════════════════════════════════════════════════════════ */
function MatrixBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let columns, drops, raf;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      const fontSize = 14;
      columns = Math.floor(canvas.width / fontSize);
      drops = Array(columns).fill(1).map(() => Math.random() * -100);
    };

    window.addEventListener("resize", resize);
    resize();

    const characters = "0101XYZMAPREDUCE<>{}[]_/*-+".split("");

    const draw = () => {
      ctx.fillStyle = "rgba(10, 11, 14, 0.05)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = "rgba(174, 198, 255, 0.15)"; // Very subtle blue
      ctx.font = "14px monospace";

      for (let i = 0; i < drops.length; i++) {
        const text = characters[Math.floor(Math.random() * characters.length)];
        ctx.fillText(text, i * 14, drops[i] * 14);

        if (drops[i] * 14 > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i] += 0.5;
      }
      raf = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(raf);
    };
  }, []);

  return <canvas ref={canvasRef} className="matrix-bg" />;
}

/* ═══════════════════════════════════════════════════════════════
   PARTICLE TRAIL CURSOR — Premium version with connecting lines
   ═══════════════════════════════════════════════════════════════ */
function CursorSystem() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const dot = dotRef.current, ring = ringRef.current, canvas = canvasRef.current;
    if (!dot || !ring || !canvas) return;
    const ctx2d = canvas.getContext("2d");
    let particles = [], lastX = -100, lastY = -100, raf;

    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);

    class Particle {
      constructor(x, y) {
        this.x = x; this.y = y;
        this.size = Math.random() * 4 + 1;
        this.speedX = (Math.random() - 0.5) * 3;
        this.speedY = (Math.random() - 0.5) * 3;
        this.life = 1;
        this.decay = Math.random() * 0.02 + 0.008;
        this.hue = Math.random() > 0.6 ? 215 : 155; // Blue or Emerald
      }
      update() { this.x += this.speedX; this.y += this.speedY; this.life -= this.decay; this.size *= 0.98; }
      draw(c) {
        c.globalAlpha = this.life * 0.7;
        c.fillStyle = `hsla(${this.hue}, 85%, 65%, ${this.life})`;
        c.shadowBlur = 12;
        c.shadowColor = `hsla(${this.hue}, 85%, 65%, 0.6)`;
        c.beginPath(); c.arc(this.x, this.y, this.size, 0, Math.PI * 2); c.fill();
        c.shadowBlur = 0;
      }
    }

    const onMove = (e) => {
      gsap.set(dot, { x: e.clientX, y: e.clientY });
      gsap.to(ring, { x: e.clientX, y: e.clientY, duration: 0.25, ease: "power2.out", overwrite: true });
      
      const dx = e.clientX - lastX, dy = e.clientY - lastY;
      const speed = Math.sqrt(dx * dx + dy * dy);
      const count = Math.min(Math.floor(speed / 3), 8);
      
      for (let i = 0; i < count; i++) {
        particles.push(new Particle(
          e.clientX + (Math.random() - 0.5) * 15, 
          e.clientY + (Math.random() - 0.5) * 15
        ));
      }
      lastX = e.clientX; lastY = e.clientY;
    };

    const animate = () => {
      ctx2d.clearRect(0, 0, canvas.width, canvas.height);
      particles = particles.filter(p => p.life > 0);
      
      // Draw lines between nearby particles for "network" aesthetic
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const p1 = particles[i], p2 = particles[j];
          const dist = Math.sqrt((p1.x - p2.x)**2 + (p1.y - p2.y)**2);
          if (dist < 80) {
            ctx2d.beginPath();
            ctx2d.strokeStyle = `rgba(174, 198, 255, ${Math.min(p1.life, p2.life) * (1 - dist/80) * 0.2})`;
            ctx2d.lineWidth = 1;
            ctx2d.moveTo(p1.x, p1.y);
            ctx2d.lineTo(p2.x, p2.y);
            ctx2d.stroke();
          }
        }
        particles[i].update();
        particles[i].draw(ctx2d);
      }
      raf = requestAnimationFrame(animate);
    };
    animate();
    window.addEventListener("mousemove", onMove);

    const grow = () => {
      gsap.to(dot, { width: 18, height: 18, background: "#4edea3", duration: 0.3 });
      gsap.to(ring, { width: 70, height: 70, borderColor: "rgba(78,222,163,0.5)", duration: 0.3 });
    };
    const shrink = () => {
      gsap.to(dot, { width: 6, height: 6, background: "white", duration: 0.3 });
      gsap.to(ring, { width: 44, height: 44, borderColor: "rgba(174,198,255,0.4)", duration: 0.3 });
    };
    const sel = "button,a,.sidebar-item,.mapper-node,.reducer-card-wrapper,.floating-analytics-btn,.top-nav-icon,textarea,input,.chart-bar-group,.terminal-entry";
    const attach = () => document.querySelectorAll(sel).forEach(el => { el.onmouseenter = grow; el.onmouseleave = shrink; });
    attach();
    const obs = new MutationObserver(attach);
    obs.observe(document.body, { childList: true, subtree: true });

    return () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("resize", resize); cancelAnimationFrame(raf); obs.disconnect(); };
  }, []);

  return (
    <>
      <canvas ref={canvasRef} className="cursor-particles" />
      <div ref={dotRef} className="cursor-dot" />
      <div ref={ringRef} className="cursor-ring" />
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════
   FIXED PIPELINE — With glowing connections and fill progress
   ═══════════════════════════════════════════════════════════════ */
function FixedPipeline({ activeStage }) {
  const trackRef = useRef(null);
  const particleRef = useRef(null);
  const stages = [
    { id: "input", label: "Input", top: "10%" },
    { id: "mapper", label: "Mapper", top: "30%" },
    { id: "shuffle", label: "Shuffle", top: "50%" },
    { id: "reducer", label: "Reducer", top: "70%" },
    { id: "output", label: "Output", top: "90%" },
  ];
  const stageOrder = ["input", "mapper", "shuffle", "reducer", "output"];
  const activeIdx = stageOrder.indexOf(activeStage);

  useEffect(() => {
    const onScroll = () => {
      const f = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
      const pct = Math.min(f * 100, 100);
      const pipe = trackRef.current?.querySelector(".pipeline-pipe");
      if (pipe) pipe.style.setProperty("--pipeline-fill", `${pct}%`);
      if (particleRef.current) {
        particleRef.current.style.top = `${pct}%`;
        particleRef.current.style.opacity = pct > 0.5 && pct < 99.5 ? "1" : "0";
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="pipeline-track" ref={trackRef} style={{ pointerEvents: "none", zIndex: 5 }}>
      <div className="pipeline-pipe" style={{ pointerEvents: "none" }}>
        <div className="pipeline-data-particle" ref={particleRef} style={{ opacity: 0, pointerEvents: "none" }} />
      </div>
      {stages.map((s, i) => (
        <div key={s.id} className={`pipeline-node ${i < activeIdx ? "passed" : ""} ${i === activeIdx ? "active" : ""}`} 
          style={{ top: s.top, pointerEvents: "none" }}>
          <div className="pipeline-node-dot" style={{ pointerEvents: "none" }} />
          <span className="pipeline-node-label" style={{ pointerEvents: "none" }}>{s.label}</span>
        </div>
      ))}
    </div>
  );
}

/* ═ SCROLL PROGRESS ═ */
function ScrollProgress() {
  const r = useRef(null);
  useEffect(() => { gsap.to(r.current, { scaleX: 1, ease: "none", scrollTrigger: { trigger: document.documentElement, start: "top top", end: "bottom bottom", scrub: 0.3 } }); }, []);
  return <div ref={r} className="scroll-progress" style={{ transform: "scaleX(0)" }} />;
}



/* 1. HERO_INPUT — CINEMATIC PINNED SCROLL */
function HeroInput({ onSubmit, loading, error }) {
  const [text, setText] = useState("");
  const ref = useRef(null);
  const labelRef = useRef(null);
  const titleRef = useRef(null);
  const formRef = useRef(null);
  const boltRef = useRef(null);

  const onDrop = useCallback(files => { if (files.length) onSubmit(files[0]); }, [onSubmit]);
  const { getRootProps, getInputProps, isDragActive, open: openFileBrowser } = useDropzone({ 
    onDrop, 
    accept: { "text/plain": [".txt"] }, 
    multiple: false,
    noClick: true // Manual trigger to bypass click interference
  });
  const handleSubmit = () => {
    if (!text.trim()) return;
    onSubmit(new File([new Blob([text], { type: "text/plain" })], "input.txt", { type: "text/plain" }));
  };

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set(labelRef.current, { opacity: 0, scale: 0.5 });
      gsap.set(titleRef.current, { opacity: 0, x: -150, skewX: -20, filter: "blur(20px)" });
      gsap.set(formRef.current, { opacity: 0, scale: 0.9, y: 100, filter: "blur(10px)" });
      gsap.set(boltRef.current, { opacity: 0, rotateY: 90, scale: 0.2 });

      const tl = gsap.timeline({
        scrollTrigger: { trigger: ref.current, start: "top top", end: "+=220%", pin: true, scrub: 1.5 },
      });

      tl.to(labelRef.current, { opacity: 1, scale: 1, duration: 0.2 }, 0);
      tl.to(titleRef.current, { opacity: 1, x: 0, skewX: 0, filter: "blur(0px)", duration: 0.4 }, 0.1);
      tl.to(formRef.current, { opacity: 1, scale: 1, y: 0, filter: "blur(0px)", duration: 0.45 }, 0.2);
      tl.to(boltRef.current, { opacity: 1, rotateY: 0, scale: 1, duration: 0.5, ease: "back.out(2)" }, 0.3);
      
      tl.to(titleRef.current, { color: "#4edea3", textShadow: "0 0 50px rgba(78,222,163,0.4)", duration: 0.2 }, 0.7);
      
      tl.to([labelRef.current, titleRef.current, formRef.current, boltRef.current], {
        opacity: 0, y: -150, filter: "blur(15px)", duration: 0.35, stagger: 0.05, ease: "power2.in"
      }, 0.85);
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section className="pipeline-stage" id="input" ref={ref}>
      <div className="stage-content">
        <div className="hero-grid">
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: 32 }}>
            <div className="stage-label" ref={labelRef}>◆ STAGE 01 / INPUT</div>
            <h1 className="hero-title" ref={titleRef}>RAW_<br /><span className="hero-title-accent">STREAM</span></h1>
            <div ref={formRef} style={{ position: "relative", zIndex: 1000 }}>
              <div className="glass-panel">
                <div className="terminal-inner">
                  <textarea value={text} onChange={e => setText(e.target.value)}
                    placeholder={'// paste your text or drop a .txt file\n"The quick brown fox jumps over the lazy dog"'}
                    className="terminal-textarea" id="text-input" />
                  <div className="terminal-cursor" />
                </div>
              </div>
              <div className="actions-row" style={{ position: "relative", zIndex: 1001 }}>
                <button className="btn-execute" 
                  onClick={(e) => { console.log("EXECUTE_CLICKED"); handleSubmit(); }} 
                  disabled={loading || !text.trim()} 
                  id="submit-text-btn" 
                  style={{ cursor: "pointer", position: "relative", zIndex: 2000, pointerEvents: "auto" }}>
                  {loading ? "INITIALIZING..." : "🚀 RUN_ENGINE"}
                </button>
                <button type="button" 
                  className={`btn-upload ${isDragActive ? "active" : ""}`}
                  id="load-file-btn"
                  onClick={(e) => { console.log("LOAD_CLICKED"); openFileBrowser(); }}
                  style={{ cursor: "pointer", position: "relative", zIndex: 2000, pointerEvents: "auto" }}>
                  <input {...getInputProps()} id="file-input" />
                  {isDragActive ? "↓ DROP" : "↑ LOAD_FILE"}
                </button>
              </div>
              {error && <div className="error-card">✕ {error}</div>}
            </div>
          </div>
          <div ref={boltRef} style={{ perspective: "1000px" }}>
            <div className="pipeline-bolt-container">
              <div className="pipeline-bolt"><Icon name="electric_bolt" style={{ color: "white", fontSize: 40 }} /></div>
              <div className="pipeline-bolt-glow" />
              <div className="pipeline-bolt-rings">
                <div className="p-ring" /><div className="p-ring" /><div className="p-ring" />
              </div>
            </div>
          </div>
        </div>
        <div className="hero-bg-gradient" />
      </div>
    </section>
  );
}

/* 2. MAPPING_LAYER — CINEMATIC PINNED SCROLL */
function MapperSection({ results }) {
  const ref = useRef(null);
  const headRef = useRef(null);
  const gridRef = useRef(null);

  const mapperData = useMemo(() => {
    if (!results) return [
      { id: "NODE_01", entries: [["quick", 1], ["brown", 1], ["fox", 1]] },
      { id: "NODE_02", entries: [["kinetic", 1], ["engine", 1]] },
      { id: "NODE_03", entries: [["data", 1], ["grid", 1]] },
    ];
    const arr = Object.entries(results), sz = Math.ceil(arr.length / 3);
    return [0, 1, 2].map(i => ({ id: `NODE_0${i + 1}`, entries: arr.slice(i * sz, (i + 1) * sz).slice(0, 4).map(([k]) => [k, 1]) }));
  }, [results]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set(headRef.current, { opacity: 0, y: -100, filter: "blur(20px)" });
      const nodes = gridRef.current?.children;
      if (nodes?.length) gsap.set(nodes, { opacity: 0, scale: 0.5, rotateY: 45, x: 200 });

      const tl = gsap.timeline({
        scrollTrigger: { trigger: ref.current, start: "top top", end: "+=220%", pin: true, scrub: 1.5 },
      });

      tl.to(headRef.current, { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.4 }, 0);
      if (nodes?.length) tl.to(nodes, { opacity: 1, scale: 1, rotateY: 0, x: 0, stagger: 0.15, duration: 0.6, ease: "power4.out" }, 0.15);
      
      tl.to(nodes, { borderColor: "#4edea3", boxShadow: "0 0 30px rgba(78,222,163,0.3)", duration: 0.2, stagger: 0.1 }, 0.65);
      
      tl.to([headRef.current, ...Array.from(nodes || [])], {
        opacity: 0, scale: 1.2, filter: "blur(20px)", duration: 0.4, stagger: 0.05
      }, 0.88);
    }, ref);
    return () => ctx.revert();
  }, [results]);

  return (
    <section className="pipeline-stage" id="mapper" ref={ref}>
      <div className="stage-content" style={{ flexDirection: "column", justifyContent: "center" }}>
        <div ref={headRef} style={{ textAlign: "center", marginBottom: 60 }}>
          <div className="stage-label">◆ STAGE 02 / MAPPER</div>
          <h2 className="mapper-title">Parallel_Mapping</h2>
          <p className="mapper-subtitle">Decomposing data into key-value pairs across distributed cluster nodes</p>
        </div>
        <div className="mapper-nodes" ref={gridRef} style={{ perspective: "2000px" }}>
          {mapperData.map(node => (
            <div className="mapper-node" key={node.id}>
              <div className="mapper-node-id">{node.id}</div>
              {node.entries.map(([key, val], i) => (
                <div className="mapper-entry" key={i}><span className="mapper-entry-key">"{key}"</span><span className="mapper-entry-val">{val}</span></div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* 3. SHUFFLE — CINEMATIC PINNED SCROLL */
function ShuffleSection() {
  const ref = useRef(null);
  const textRef = useRef(null);
  const vRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set(textRef.current, { opacity: 0, x: -200, filter: "blur(30px)" });
      gsap.set(vRef.current, { opacity: 0, scale: 0, rotate: 720 });

      const tl = gsap.timeline({
        scrollTrigger: { trigger: ref.current, start: "top top", end: "+=220%", pin: true, scrub: 2 },
      });

      tl.to(textRef.current, { opacity: 1, x: 0, filter: "blur(0px)", duration: 0.5 }, 0);
      tl.to(vRef.current, { opacity: 1, scale: 1, rotate: 0, duration: 0.8, ease: "power4.out" }, 0.1);
      
      tl.to(vRef.current, { rotate: 360, duration: 0.5, repeat: 1 }, 0.5);
      
      tl.to([textRef.current, vRef.current], {
        opacity: 0, scale: 0.5, rotate: -180, duration: 0.5
      }, 0.9);
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section className="pipeline-stage" id="shuffle" ref={ref}>
      <div className="stage-content">
        <div className="shuffle-grid">
          <div ref={textRef}>
            <div className="stage-label">◆ STAGE 03 / SHUFFLE</div>
            <h2 className="shuffle-title">Global_Interconnect</h2>
            <p className="shuffle-desc">Rerouting identical keys through the network fabric for aggregation. <br/>Latency optimized via RDMA protocols.</p>
          </div>
          <div ref={vRef} className="vortex-container">
            <div className="vortex">
              <div className="vortex-ring-outer" /><div className="vortex-ring-mid" /><div className="vortex-ring-inner" />
              <div className="vortex-center"><Icon name="dynamic_form" style={{ fontSize: 40 }} /></div>
            </div>
          </div>
        </div>
      </div>
      <div className="shuffle-bg-image" style={{ opacity: 0.1 }}>
        <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuDMs_eRZZUndidkZIQ5BjVKWLFFZ2tkaQF5J0rp2JfrhsJLsJVpOCfMiYTQC-nVx_MhZN7Y_aecZzyEMYcCK0FfUTI7Jae_AHOt2LQf-ySDTelIrF_9dihYnJmhPg0N2_OLlWzjlZLCISfn8gGyQXhRKCvfFAk5Zx7mICpC2aaSTFnQA3iMIMMZPs3s21diyozCob4VaZK23Q4tpjfoGZmq2o7xqeYoHb6LWWntlc6Pas7bT28HJITT9FmjwjEBhEMktO6-oL2qVN0" alt="circuit" />
      </div>
    </section>
  );
}

/* 4. REDUCER — CINEMATIC PINNED SCROLL */
function ReducerSection({ results }) {
  const ref = useRef(null);
  const cardsRef = useRef(null);
  const headRef = useRef(null);

  const reducerData = useMemo(() => {
    if (!results) return [
      { id: "ALPHA", icon: "join_inner", entries: [["engine", 8], ["kinetic", 12]] },
      { id: "BETA", icon: "join_right", entries: [["data", 45], ["stream", 19]] },
    ];
    const sorted = Object.entries(results).sort((a, b) => b[1] - a[1]), mid = Math.ceil(sorted.length / 2);
    return [
      { id: "ALPHA", icon: "join_inner", entries: sorted.slice(0, Math.min(4, mid)) },
      { id: "BETA", icon: "join_right", entries: sorted.slice(mid, mid + Math.min(4, sorted.length - mid)) },
    ];
  }, [results]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set(headRef.current, { opacity: 0, scale: 0.8 });
      const cards = cardsRef.current?.children;
      if (cards?.length) {
        gsap.set(cards[0], { x: -400, opacity: 0, rotateY: -30 });
        gsap.set(cards[1], { x: 400, opacity: 0, rotateY: 30 });
      }

      const tl = gsap.timeline({
        scrollTrigger: { trigger: ref.current, start: "top top", end: "+=220%", pin: true, scrub: 1.5 },
      });

      tl.to(headRef.current, { opacity: 1, scale: 1, duration: 0.4 }, 0);
      if (cards?.length) {
        tl.to(cards[0], { x: 0, opacity: 1, rotateY: 0, duration: 0.7 }, 0.15);
        tl.to(cards[1], { x: 0, opacity: 1, rotateY: 0, duration: 0.7 }, 0.25);
      }
      
      tl.to([headRef.current, ...Array.from(cards || [])], {
        opacity: 0, y: 150, filter: "blur(20px)", duration: 0.5, stagger: 0.1
      }, 0.85);
    }, ref);
    return () => ctx.revert();
  }, [results]);

  return (
    <section className="pipeline-stage" id="reducer" ref={ref}>
      <div className="stage-content" style={{ flexDirection: "column", justifyContent: "center" }}>
        <div ref={headRef} style={{ textAlign: "center", marginBottom: 50 }}>
          <div className="stage-label">◆ STAGE 04 / REDUCER</div>
          <h2 className="reducer-title">Aggregation_Phase</h2>
          <p className="reducer-subtitle">Consolidating mapped results into final count vectors</p>
        </div>
        <div className="reducer-cards" ref={cardsRef} style={{ perspective: "2000px" }}>
          {reducerData.map(node => (
            <div className="reducer-card-wrapper" key={node.id}>
              <div className="reducer-card">
                <div className="reducer-card-top">
                  <div className="reducer-card-icon-box"><Icon name={node.icon} /></div>
                  <div className="reducer-card-meta"><div className="reducer-card-id">{node.id}</div><div className="reducer-card-name">COMMIT_SET</div></div>
                </div>
                <div className="reducer-entries">
                  {node.entries.map(([key, val], i) => (
                    <div className="reducer-entry" key={i}><span>"{key}"</span><span className="reducer-entry-val">{val}</span></div>
                  ))}
                  <div className="reducer-status"><span>STATUS</span><span style={{ color: "#4edea3" }}>READY</span></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* 5. JOB_RESULT — CINEMATIC PINNED SCROLL */
function OutputSection({ results, meta }) {
  const ref = useRef(null);
  const headRef = useRef(null);
  const chartRef = useRef(null);
  const pRef = useRef(null);

  const sorted = useMemo(() => {
    if (!results) return [];
    return Object.entries(results).map(([word, count]) => ({ word, count })).sort((a, b) => b.count - a.count);
  }, [results]);

  const data = results ? sorted.slice(0, 8) : [
    { word: "data", count: 45 }, { word: "kinetic", count: 38 }, { word: "stream", count: 19 },
    { word: "engine", count: 12 }, { word: "grid", count: 7 }, { word: "fox", count: 3 },
  ];
  const maxVal = data.length ? Math.max(...data.map(d => d.count)) : 1;

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set(headRef.current, { opacity: 0, x: -100 });
      gsap.set(chartRef.current, { opacity: 0, y: 100, scale: 0.8 });
      gsap.set(pRef.current, { opacity: 0, x: 100 });
      const bars = chartRef.current?.querySelectorAll(".chart-bar");
      const cLabel = chartRef.current?.querySelectorAll(".chart-bar-count");
      if (bars) gsap.set(bars, { scaleY: 0 });
      if (cLabel) gsap.set(cLabel, { opacity: 0, y: 20 });

      const tl = gsap.timeline({
        scrollTrigger: { trigger: ref.current, start: "top top", end: "+=220%", pin: true, scrub: 1.5 },
      });

      tl.to(headRef.current, { opacity: 1, x: 0, duration: 0.4 }, 0);
      tl.to(chartRef.current, { opacity: 1, y: 0, scale: 1, duration: 0.6 }, 0.1);
      tl.to(pRef.current, { opacity: 1, x: 0, duration: 0.45 }, 0.2);
      
      if (bars) tl.to(bars, { scaleY: 1, duration: 0.5, stagger: 0.05, ease: "power4.out" }, 0.3);
      if (cLabel) tl.to(cLabel, { opacity: 1, y: 0, duration: 0.3, stagger: 0.05 }, 0.55);
      
      tl.to(chartRef.current, { boxShadow: "0 0 60px rgba(78,222,163,0.2)", duration: 0.3 }, 0.7);
    }, ref);
    return () => ctx.revert();
  }, [results]);

  const handleExport = () => {
    const d = results || data.reduce((acc, it) => { acc[it.word] = it.count; return acc; }, {});
    const blob = new Blob([JSON.stringify(d, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "mapreduce_results.json";
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <section className="pipeline-stage" id="output" ref={ref}>
      <div className="stage-content">
        <div className="output-grid">
          <div>
            <div ref={headRef}>
              <div className="stage-label">◆ STAGE 05 / OUTPUT</div>
              <h2 className="output-header-title">Computed_Ingress</h2>
              <p className="output-header-sub" style={{ marginBottom: 40 }}>Final high-fidelity aggregations after shuffle-reduce cycle</p>
            </div>
            <div className="chart-container" ref={chartRef}>
              <div className="chart-grid-lines">{[...Array(5)].map((_, i) => <div className="chart-grid-line" key={i} />)}</div>
              {data.map(item => {
                const h = Math.max(10, (item.count / maxVal) * 260);
                return (
                  <div className="chart-bar-group" key={item.word}>
                    <span className="chart-bar-count">{item.count}</span>
                    <div className="chart-bar" style={{ height: h, transformOrigin: "bottom center" }} />
                    <span className="chart-bar-label">{item.word}</span>
                  </div>
                );
              })}
            </div>
          </div>
          <div ref={pRef} className="terminal-panel" style={{ height: "fit-content" }}>
            <div className="terminal-status"><Icon name="verified" style={{ fontSize: 16 }} /><span>PIPELINE_COMPLETE</span></div>
            <div className="terminal-entries">{(results ? sorted : data).slice(0, 10).map(e => (
              <div className="terminal-entry" key={e.word}><span className="terminal-entry-key">{e.word}:</span><span className="terminal-entry-val">{e.count}</span></div>
            ))}</div>
            <button className="btn-export" onClick={handleExport}>⬇ EXPORT_DATASET</button>
          </div>
        </div>
        {meta && <div className="pipeline-footer">Job Completed in 1.4s · {new Date(meta.processedAt).toLocaleTimeString()}</div>}
      </div>
    </section>
  );
}

/* ═ PROCESSING OVERLAY ═ */
function ProcessingOverlay() {
  return (
    <div className="processing-overlay">
      <div style={{ textAlign: "center" }}>
        <div className="processing-spinner" />
        <div className="processing-title">PROCESSING_MAPREDUCE</div>
        <div className="processing-subtitle">Building clusters... Mapping data... Reducer initializing...</div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   APP
   ═══════════════════════════════════════════════════════════════ */
export default function App() {
  const [results, setResults] = useState(null);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeStage, setActiveStage] = useState("input");

  useEffect(() => {
    const ids = ["input", "mapper", "shuffle", "reducer", "output"];
    const obs = ids.map(id => {
      const el = document.getElementById(id);
      if (!el) return null;
      const o = new IntersectionObserver(([e]) => { if (e.isIntersecting) setActiveStage(id); }, { threshold: 0.3 });
      o.observe(el); return o;
    });
    return () => obs.forEach(o => o?.disconnect());
  }, [results]);

  const handleSubmit = useCallback(async (file) => {
    setLoading(true); setError(null); setResults(null); setMeta(null);
    const fd = new FormData(); fd.append("file", file);
    try {
      const res = await axios.post("/api/upload", fd, { headers: { "Content-Type": "multipart/form-data" }, timeout: 30000 });
      setResults(res.data.results); setMeta(res.data.meta);
      setTimeout(() => { ScrollTrigger.refresh(); document.getElementById("output")?.scrollIntoView({ behavior: "smooth" }); }, 600);
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Pipeline failed");
    } finally { setLoading(false); }
  }, []);

  const handleRestart = () => { setResults(null); setMeta(null); setError(null); window.scrollTo({ top: 0, behavior: "smooth" }); };

  useEffect(() => { ScrollTrigger.refresh(); }, [results]);

  return (
    <>
      <MatrixBackground />
      <CursorSystem />
      <ScrollProgress />
      <FixedPipeline activeStage={activeStage} />
      {loading && <ProcessingOverlay />}
      <main className="main-content">
        <HeroInput onSubmit={handleSubmit} loading={loading} error={error} />
        <MapperSection results={results} />
        <ShuffleSection />
        <ReducerSection results={results} />
        <OutputSection results={results} meta={meta} />
        <div style={{ height: "50vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
           <button className="sidebar-restart-btn" onClick={handleRestart} style={{ opacity: 0.6 }}>RESTART PIPELINE</button>
        </div>
      </main>
      <div className="floating-analytics"><button className="floating-analytics-btn"><Icon name="analytics" /></button></div>
    </>
  );
}
