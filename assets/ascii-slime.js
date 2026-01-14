// ===== ASCII ENGINE CLASS =====
(function () {
    const DEFAULTS = {
      charset: "@%#*+=-:. ",
      cellSize: 20,
      speed: 10.8,
      sensitivity: 0.025,
      density: 1,
      reducedMotion: true,
      maxFps: 60,
      gamma: 1.5,
      distortion: 1,
      verticalDrift: -0.5,
      spinSpeed: 2,
      spiralStrength: 5.0
    };
  
    function clamp(v, min, max) {
      return v < min ? min : v > max ? max : v;
    }
    function lerp(a, b, t) {
      return a + (b - a) * t;
    }
    function softsign(x) {
      return x / (1 + Math.abs(x));
    }
    function easeInOutCubic(t) {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }
    function easeOutQuad(t) {
      return 1 - (1 - t) * (1 - t);
    }
  
    class AsciiEngine {
      constructor(el, opts = {}) {
        this.el = el;
        this._container = el?.parentElement || null;
        this.options = Object.assign({}, DEFAULTS, opts);
        this.running = false;
        this._time = 0;
        this._lastFrame = 0;
        this._pointer = { x: 0.5, y: 0.5, vx: 0, vy: 0, t: 0 };
        this._grid = { cols: 0, rows: 0 };
        this._cell = { w: 10, h: 10 };
        this._palette = this._buildPalette();
        this._computeGrid();
        this._installResizeObserver();
        this._renderFrame = this._renderFrame.bind(this);
      }
  
      _measureCell() {
        const cs = getComputedStyle(this.el);
        const probe = document.createElement("pre");
        probe.textContent = "0000000000\n0000000000";
        probe.style.position = "fixed";
        probe.style.left = "-9999px";
        probe.style.top = "0";
        probe.style.margin = "0";
        probe.style.padding = "0";
        probe.style.whiteSpace = "pre";
        probe.style.visibility = "hidden";
        probe.style.fontFamily = cs.fontFamily;
        probe.style.fontSize = cs.fontSize;
        probe.style.letterSpacing = cs.letterSpacing;
        probe.style.lineHeight = cs.lineHeight;
        document.body.appendChild(probe);
        const totalW = probe.offsetWidth;
        const totalH = probe.offsetHeight;
        document.body.removeChild(probe);
        this._cell.w = Math.max(4, totalW / 10);
        this._cell.h = Math.max(4, totalH / 2);
      }
  
      _installResizeObserver() {
        if (this._resizeObserver) return;
        this._resizeObserver = new ResizeObserver(() => this._computeGrid());
        if (this.el) this._resizeObserver.observe(this.el);
        if (this._container) this._resizeObserver.observe(this._container);
        window.addEventListener("resize", () => this._computeGrid());
      }
  
      _computeGrid() {
        if (this.el) this._measureCell();
        const vw = Math.max(320, window.innerWidth || 800);
        const vh = Math.max(240, window.innerHeight || 600);
        const cols = Math.max(10, Math.ceil(vw / this._cell.w) + 1);
        const rows = Math.max(8, Math.ceil(vh / this._cell.h) + 1);
        this._grid.cols = cols;
        this._grid.rows = rows;
      }
  
      refresh() {
        this._computeGrid();
      }
  
      setPointer(px, py, vx = 0, vy = 0) {
        this._pointer.x = clamp(px, 0, 1);
        this._pointer.y = clamp(py, 0, 1);
        this._pointer.vx = vx;
        this._pointer.vy = vy;
        this._pointer.t = performance.now();
      }
  
      setReducedMotion(val) {
        this.options.reducedMotion = !!val;
      }
  
      start() {
        if (this.running) return;
        this.running = true;
        this._lastFrame = performance.now();
        this._frameReq = requestAnimationFrame(this._renderFrame);
      }
  
      stop() {
        this.running = false;
        if (this._frameReq) cancelAnimationFrame(this._frameReq);
        this._frameReq = null;
      }
  
      _valueAt(i, j, t) {
        const u = i / (this._grid.cols - 1);
        const v = j / (this._grid.rows - 1);
        const cx = lerp(0.5, this._pointer.x, 0.25);
        const cy = lerp(0.5, this._pointer.y, 0.25);
  
        const warp = 0.05 * this.options.distortion;
        const u2 = u + warp * Math.sin(v * 12.0 - t * 0.9);
        let v2 = v + warp * Math.cos(u * 12.0 + t * 0.7);
        v2 += t * (this.options.reducedMotion ? this.options.verticalDrift * 0.4 : this.options.verticalDrift);
  
        const dx0 = u2 - cx;
        const dy0 = v2 - cy;
        const r0 = Math.hypot(dx0, dy0);
        const a0 = Math.atan2(dy0, dx0);
        const spin = (this.options.reducedMotion ? 0.5 : 1) * this.options.spinSpeed;
        const spiral = this.options.spiralStrength * r0 * this.options.distortion;
        const a = a0 + spin * t + spiral;
        const u3 = cx + Math.cos(a) * r0;
        const v3 = cy + Math.sin(a) * r0;
  
        const w1 = Math.sin(u3 * 6.283 + t * 0.9) * 0.45;
        const w2 = Math.cos(v3 * 6.283 + t * 0.7) * 0.45;
        const du = u3 - cx;
        const dv = v3 - cy;
        const r = Math.hypot(du, dv);
        const radial = Math.sin(r * 12.0 - t * 2.2);
        const radial2 = Math.sin(r * 20.0 + t * 1.7);
        const radial3 = Math.sin(r * 28.0 - t * 2.8);
        const theta = Math.atan2(dv, du);
        const angular = Math.sin(theta * 6.0 - t * 1.4);
        const swirlMod = Math.sin(theta * 8.0 + r * 10.0 - t * 1.2);
        const cross = Math.sin(u3 * 6.283 * (v3 * 6.283) + t * 0.9);
  
        const dist2 = du * du + dv * dv;
        const speed = Math.hypot(this._pointer.vx, this._pointer.vy);
        const influence = Math.exp(-dist2 * 10) * (speed * 2 + 0.2) * this.options.distortion;
  
        const val = w1 * 0.55 + w2 * 0.55 +
                    radial * (0.75 * this.options.distortion) +
                    radial2 * (0.45 * this.options.distortion) +
                    radial3 * (0.25 * this.options.distortion) +
                    angular * (0.35 * this.options.distortion) +
                    swirlMod * (0.2 * this.options.distortion) +
                    cross * (0.12 * this.options.distortion) +
                    influence;
  
        const compressed = softsign(val) * 0.95;
        const nn = clamp((compressed * 0.5 + 0.5) * this.options.density, 0, 1);
        return lerp(nn, easeInOutCubic(nn), 0.35);
      }
  
      _mapToIndex(n) {
        const cs = this.options.charset;
        const g = this.options.gamma > 0 ? this.options.gamma : 1;
        const nn = Math.pow(n, g);
        return Math.min(cs.length - 1, Math.max(0, Math.floor(nn * (cs.length - 1))));
      }
  
      _mapToChar(n) {
        return this.options.charset[this._mapToIndex(n)];
      }
  
      _renderFrame(now) {
        if (!this.running) return;
        const elapsed = (now - this._lastFrame) / 1000;
        const minDt = 1 / this.options.maxFps;
        if (elapsed < minDt) {
          this._frameReq = requestAnimationFrame(this._renderFrame);
          return;
        }
        this._lastFrame = now;
        const motionFactor = this.options.reducedMotion ? 0.15 : 1;
        this._time += elapsed * this.options.speed * motionFactor;
  
        let out = "";
        const rows = this._grid.rows;
        const cols = this._grid.cols;
        let cs = this.options.charset;
        for (let j = 0; j < rows; j++) {
          let run = "", currentIdx = -1;
          for (let i = 0; i < cols; i++) {
            const n = this._valueAt(i, j, this._time);
            const idx = this._mapToIndex(n);
            const ch = cs[idx];
            if (idx === currentIdx) run += ch;
            else {
              if (currentIdx !== -1 && run.length)
                out += `<span style="color:${this._palette[currentIdx]}">${run}</span>`;
              run = ch; currentIdx = idx;
            }
          }
          if (run.length) out += `<span style="color:${this._palette[currentIdx]}">${run}</span>`;
          if (j < rows - 1) out += "\n";
        }
        this.el.innerHTML = out;
  
        const speed = Math.hypot(this._pointer.vx, this._pointer.vy);
        const basePulse = this.options.reducedMotion ? 0 : Math.sin(this._time * 0.8) * 0.01;
        const targetScale = this.options.reducedMotion ? 1 : 1 + basePulse + easeOutQuad(clamp(0.02 + speed * 0.8, 0, 0.08));
        const layer = this.el.parentElement;
        if (layer) layer.style.transform = `scale(${lerp(this._scale || 1, targetScale, 0.08).toFixed(4)})`;
  
        this._frameReq = requestAnimationFrame(this._renderFrame);
      }
  
      
      _buildPalette() {
        const cs = this.options.charset;
        const L = cs.length;
        const arr = new Array(L);
        for (let i = 0; i < L; i++) {
          const t = L > 1 ? i / (L - 1) : 0;
          const r = 0;
          const g = Math.round(40 + 120 * t); // dark → bright green
          const b = 0;
          arr[i] = `rgb(${r},${g},${b})`;
        }
        return arr;
      }
    }
  
    window.AsciiEngine = AsciiEngine;
  })();
  
  // ===== MAIN PAGE LOGIC =====
  document.addEventListener("DOMContentLoaded", () => {
    // ===== SIGN IN / SIGN UP HANDLERS =====
    const signinForm = document.getElementById("signin-form");
    const signupForm = document.getElementById("signup-form");
  
    if (signinForm) {
      signinForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const payload = Object.fromEntries(new FormData(signinForm));
        try {
          const res = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          const data = await res.json();
          if (!res.ok) return alert(data.error || "Login failed");
          localStorage.setItem("token", data.token);
          window.location.href = "/";
        } catch (err) {
          console.error(err);
          alert("Unable to connect. Please try again.");
        }
      });
    }
  
    if (signupForm) {
      signupForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const payload = Object.fromEntries(new FormData(signupForm));
        try {
          const res = await fetch("/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          const data = await res.json();
          if (!res.ok) return alert(data.error || "Signup failed");
          if (data.token) localStorage.setItem("token", data.token);
          window.location.href = "/";
        } catch (err) {
          console.error(err);
          alert("Unable to connect. Please try again.");
        }
      });
    }
  
    // ===== SHOW / HIDE PASSWORD =====
    const togglePassword = document.getElementById("toggle-password");
    const passwordInput = document.getElementById("password");
    if (togglePassword && passwordInput) {
      togglePassword.addEventListener("click", () => {
        const isHidden = passwordInput.type === "password";
        passwordInput.type = isHidden ? "text" : "password";
        togglePassword.src = isHidden
          ? "/assets/images/yesshow.png"
          : "/assets/images/noshow.png";
        togglePassword.classList.toggle("yesshow", isHidden);
        togglePassword.classList.toggle("noshow", !isHidden);
      });
    }
  
    
    // ===== ASCII RAIN / SLIME =====
    const el = document.getElementById("ascii-canvas");
    if (!el) return;
  
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    const engine = new window.AsciiEngine(el, {
      charset: "0123456789",
      cellSize: 10,
      speed: 0.35,
      sensitivity: 0.005,
      reducedMotion: mql.matches,
      gamma: 1.1,
      distortion: 2.5,
      density: 1.4,
      verticalDrift: -0.4,
      spiralStrength: 1.5
    });

  
    let last = 0, lastX = 0.5, lastY = 0.5;
    function updatePointer(e) {
      const now = performance.now();
      if (now - last < 16) return;
      last = now;
      let x = 0.5, y = 0.5;
      if (e.touches && e.touches[0]) {
        x = e.touches[0].clientX / window.innerWidth;
        y = e.touches[0].clientY / window.innerHeight;
      } else x = e.clientX / window.innerWidth, y = e.clientY / window.innerHeight;
      const vx = x - lastX, vy = y - lastY;
      lastX = x; lastY = y;
      engine.setPointer(x, y, vx, vy);
    }
  
    window.addEventListener("mousemove", updatePointer, { passive: true });
    window.addEventListener("touchmove", updatePointer, { passive: true });
    window.addEventListener("orientationchange", () => setTimeout(() => engine.setPointer(0.5, 0.5, 0, 0), 250));
  
    const btn = document.getElementById("toggle-motion");
    function toggleMotion(isReduced) {
      engine.setReducedMotion(isReduced);
      btn?.setAttribute("aria-pressed", String(isReduced));
      btn && (btn.textContent = isReduced ? "Riprendi animazione" : "Pausa animazione");
    }
    btn?.addEventListener("click", () => toggleMotion(!engine.options.reducedMotion));
    mql.addEventListener?.("change", e => toggleMotion(e.matches));
  
    engine.start();
    document.fonts?.ready.then(() => engine.refresh());
    window.addEventListener("load", () => engine.refresh(), { once: true });
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") engine.refresh();
    });
  });
  
