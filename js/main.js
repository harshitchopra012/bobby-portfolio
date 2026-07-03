/* =========================================================
   ARIA VANCE — Portfolio interactions
   Vanilla JS • no dependencies
   ========================================================= */
(() => {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const canHover = window.matchMedia("(hover: hover)").matches;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  /* ----------------------------------------------------
     PRELOADER
  ---------------------------------------------------- */
  const preloader = $("#preloader");
  const counterEl = $("#preloaderCounter");
  const barEl = $("#preloaderBar");
  let preloaderDone = false;

  function runPreloader() {
    const dur = reduceMotion ? 1 : 1500;
    const start = performance.now();

    const update = (now) => {
      const t = Math.min((now - start) / dur, 1);
      const p = Math.round((1 - Math.pow(1 - t, 3)) * 100); // ease-out
      counterEl.textContent = p;
      barEl.style.width = p + "%";
      return t;
    };

    // rAF for smooth progress
    (function tick(now) {
      if (update(now) < 1) requestAnimationFrame(tick);
      else finishPreloader();
    })(start);

    // Guaranteed completion — rAF is throttled in background tabs,
    // so never leave the loader stuck. This always fires.
    setTimeout(() => { update(performance.now()); finishPreloader(); }, dur + 120);
  }

  function finishPreloader() {
    if (preloaderDone) return;
    preloaderDone = true;
    counterEl.textContent = "100";
    barEl.style.width = "100%";
    preloader.classList.add("is-done");
    document.body.classList.add("loaded");
    setTimeout(() => (preloader.style.display = "none"), 900);
    playHeroIntro();
  }

  /* ----------------------------------------------------
     HERO INTRO (text reveal)
  ---------------------------------------------------- */
  function playHeroIntro() {
    const masks = $$(".hero .reveal-mask > span");
    masks.forEach((el, i) => {
      el.animate(
        [{ transform: "translateY(110%)" }, { transform: "translateY(0%)" }],
        { duration: 1100, delay: 120 * i, easing: "cubic-bezier(0.16,1,0.3,1)", fill: "forwards" }
      );
    });
    const fades = $$(".hero .reveal-fade, .hero .reveal-line");
    fades.forEach((el, i) => {
      el.animate(
        [{ opacity: 0, transform: "translateY(24px)" }, { opacity: 1, transform: "none" }],
        { duration: 1000, delay: 500 + 120 * i, easing: "cubic-bezier(0.16,1,0.3,1)", fill: "forwards" }
      );
    });

    // Guaranteed final state (in case WAAPI is throttled while hidden)
    setTimeout(() => {
      masks.forEach((el) => (el.style.transform = "translateY(0%)"));
      fades.forEach((el) => { el.style.opacity = "1"; el.style.transform = "none"; });
    }, 1900);
  }

  /* ----------------------------------------------------
     CUSTOM CURSOR
  ---------------------------------------------------- */
  if (canHover) {
    const cursor = $("#cursor");
    const dot = $("#cursorDot");
    let cx = innerWidth / 2, cy = innerHeight / 2, x = cx, y = cy;

    window.addEventListener("mousemove", (e) => {
      cx = e.clientX; cy = e.clientY;
      dot.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`;
    });
    (function loop() {
      x += (cx - x) * 0.18; y += (cy - y) * 0.18;
      cursor.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
      requestAnimationFrame(loop);
    })();

    document.addEventListener("mouseover", (e) => {
      if (e.target.closest("a, button, [data-magnetic], [data-magnetic-soft], .card")) cursor.classList.add("is-hover");
    });
    document.addEventListener("mouseout", (e) => {
      if (e.target.closest("a, button, [data-magnetic], [data-magnetic-soft], .card")) cursor.classList.remove("is-hover");
    });
    document.addEventListener("mouseleave", () => { cursor.classList.add("is-hidden"); dot.classList.add("is-hidden"); });
    document.addEventListener("mouseenter", () => { cursor.classList.remove("is-hidden"); dot.classList.remove("is-hidden"); });
  }

  /* ----------------------------------------------------
     MAGNETIC ELEMENTS
  ---------------------------------------------------- */
  if (canHover && !reduceMotion) {
    const setupMagnetic = (el, strength) => {
      el.addEventListener("mousemove", (e) => {
        const r = el.getBoundingClientRect();
        const mx = e.clientX - (r.left + r.width / 2);
        const my = e.clientY - (r.top + r.height / 2);
        el.style.transform = `translate(${mx * strength}px, ${my * strength}px)`;
      });
      el.addEventListener("mouseleave", () => { el.style.transform = "translate(0,0)"; });
    };
    $$("[data-magnetic]").forEach((el) => setupMagnetic(el, 0.35));
    $$("[data-magnetic-soft]").forEach((el) => setupMagnetic(el, 0.12));
  }

  /* ----------------------------------------------------
     NAV
  ---------------------------------------------------- */
  const nav = $("#nav");
  const burger = $("#navBurger");
  const navLinks = $("#navLinks");

  window.addEventListener("scroll", () => {
    nav.classList.toggle("is-scrolled", window.scrollY > 40);
  }, { passive: true });

  burger.addEventListener("click", () => nav.classList.toggle("is-open"));
  $$("#navLinks a").forEach((a) => a.addEventListener("click", () => nav.classList.remove("is-open")));

  $("#toTop")?.addEventListener("click", () => window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" }));

  /* ----------------------------------------------------
     SCROLL PROGRESS
  ---------------------------------------------------- */
  const progress = $("#scrollProgress");
  window.addEventListener("scroll", () => {
    const h = document.documentElement;
    const scrolled = h.scrollTop / (h.scrollHeight - h.clientHeight);
    progress.style.width = (scrolled * 100) + "%";
  }, { passive: true });

  /* ----------------------------------------------------
     REVEAL ON SCROLL
  ---------------------------------------------------- */
  const revealObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) { entry.target.classList.add("in"); obs.unobserve(entry.target); }
    });
  }, { threshold: 0.15, rootMargin: "0px 0px -8% 0px" });

  function observeReveals() {
    $$(".reveal-fade:not(.hero .reveal-fade)").forEach((el) => revealObserver.observe(el));
  }

  /* ----------------------------------------------------
     SPLIT TEXT — word-by-word "light up"
  ---------------------------------------------------- */
  $$("[data-split]").forEach((el) => {
    const words = el.textContent.trim().split(/\s+/);
    el.innerHTML = words.map((w) => `<span class="word">${w}</span>`).join(" ");
    const spans = $$(".word", el);
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        spans.forEach((s, i) => setTimeout(() => s.classList.add("is-lit"), i * 55));
        io.disconnect();
      });
    }, { threshold: 0.4 });
    io.observe(el);
  });

  /* ----------------------------------------------------
     COUNTERS
  ---------------------------------------------------- */
  $$("[data-count]").forEach((el) => {
    const target = +el.dataset.count;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const dur = 1600, start = performance.now();
        (function tick(now) {
          const t = Math.min((now - start) / dur, 1);
          el.textContent = Math.round((1 - Math.pow(1 - t, 3)) * target);
          if (t < 1) requestAnimationFrame(tick);
        })(start);
        io.disconnect();
      });
    }, { threshold: 0.6 });
    io.observe(el);
  });

  /* ----------------------------------------------------
     SKILL BARS
  ---------------------------------------------------- */
  $$(".skill").forEach((el) => {
    const fill = $("i", el);
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        requestAnimationFrame(() => (fill.style.width = el.dataset.skill + "%"));
        io.disconnect();
      });
    }, { threshold: 0.5 });
    io.observe(el);
  });

  /* ----------------------------------------------------
     HERO PARALLAX
  ---------------------------------------------------- */
  if (!reduceMotion) {
    const word = $(".hero__word");
    const inner = $(".hero__inner");
    window.addEventListener("scroll", () => {
      const y = window.scrollY;
      if (y < innerHeight) {
        if (word) word.style.transform = `translateY(${y * 0.22}px)`;
        if (inner) inner.style.opacity = String(1 - y / (innerHeight * 0.85));
      }
    }, { passive: true });
  }

  /* ----------------------------------------------------
     PORTFOLIO — data + procedural artwork
  ---------------------------------------------------- */
  let projects = [];
  const defaultProjects = [
    { title: "Benny's — Jazz Club Identity", cat: "branding", catLabel: "Branding & Logo", h: 420, c: ["#ec0909", "#151109"] },
    { title: "KhaasCup — Indian Tea Branding", cat: "branding", catLabel: "Branding", h: 300, c: ["#ff5e36", "#b3001e"] },
    { title: "Vaani — Luxury Clothing Identity", cat: "branding", catLabel: "Branding", h: 480, c: ["#b3001e", "#a6a5a6"] },
    { title: "Benny's — Album Cover", cat: "posters", catLabel: "Album Art", h: 320, c: ["#ff1a2b", "#260005"] },
    { title: "KhaasCup — Campaign Reels", cat: "social", catLabel: "Social Media", h: 360, c: ["#ff8a93", "#e0d6d6"] },
    { title: "Vaani — Brand Book Layout", cat: "posters", catLabel: "Layout Design", h: 340, c: ["#a6a5a6", "#ec0909"] },
    { title: "Midnight Groove — Motion Poster", cat: "motion", catLabel: "Motion Graphics", h: 300, c: ["#ff2a3a", "#4a000b"] },
    { title: "Benny's — Mobile App Concept", cat: "ui", catLabel: "UI Design", h: 440, c: ["#ec0909", "#151109"] },
    { title: "Vaani — Digital Lookbook UI", cat: "ui", catLabel: "UI Design", h: 380, c: ["#e0d6d6", "#9e0018"] },
    { title: "KhaasCup — Tea Packaging Design", cat: "branding", catLabel: "Packaging", h: 320, c: ["#ff5e36", "#ff1a2b"] },
    { title: "Benny's — Street Ads Series", cat: "posters", catLabel: "Poster Design", h: 300, c: ["#9e0018", "#ec0909"] },
    { title: "MAAC — Kinetic Typography Reel", cat: "motion", catLabel: "Motion Graphics", h: 360, c: ["#ff4d5a", "#260005"] },
  ];

  function loadProjects() {
    const stored = localStorage.getItem("bobby_projects");
    if (stored) {
      try {
        projects = JSON.parse(stored);
      } catch (e) {
        projects = [...defaultProjects];
      }
    } else {
      projects = [...defaultProjects];
    }
  }
  loadProjects();

  function hexToRgb(h) {
    const n = parseInt(h.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }

  function drawArt(canvas, w, h, colors, seed) {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = w * dpr; canvas.height = h * dpr;
    canvas.style.height = h + "px";
    const ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);

    // base gradient
    const g = ctx.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, "#0f0909");
    g.addColorStop(1, "#050202");
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);

    // glowing blobs
    let s = seed * 9301 + 49297;
    const rnd = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
    for (let i = 0; i < 4; i++) {
      const [r, gg, b] = hexToRgb(colors[i % colors.length]);
      const cx = rnd() * w, cy = rnd() * h, rad = (0.35 + rnd() * 0.4) * Math.max(w, h);
      const rg = ctx.createRadialGradient(cx, cy, 0, cx, cy, rad);
      rg.addColorStop(0, `rgba(${r},${gg},${b},0.55)`);
      rg.addColorStop(1, `rgba(${r},${gg},${b},0)`);
      ctx.fillStyle = rg; ctx.fillRect(0, 0, w, h);
    }

    // fine lines for editorial feel
    ctx.globalAlpha = 0.08; ctx.strokeStyle = "#fff"; ctx.lineWidth = 1;
    for (let i = 0; i < 5; i++) {
      const yy = (h / 5) * i + rnd() * 20;
      ctx.beginPath(); ctx.moveTo(0, yy);
      ctx.bezierCurveTo(w * 0.3, yy + (rnd() - 0.5) * 80, w * 0.7, yy + (rnd() - 0.5) * 80, w, yy);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // grain
    const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const d = img.data;
    for (let i = 0; i < d.length; i += 4) {
      const n = (Math.random() - 0.5) * 18;
      d[i] += n; d[i + 1] += n; d[i + 2] += n;
    }
    ctx.putImageData(img, 0, 0);
  }

  const grid = $("#grid");
  
  function renderGrid() {
    grid.innerHTML = "";
    projects.forEach((p, idx) => {
      const card = document.createElement("article");
      card.className = "card";
      card.dataset.cat = p.cat;
      card.style.transitionDelay = (idx % 3) * 0.08 + "s";
      card.innerHTML = `
        <div class="card__art"><div class="art"><canvas></canvas></div></div>
        <span class="card__view"></span>
        <div class="card__overlay">
          <span class="card__cat">${p.catLabel}</span>
          <h3 class="card__title">${p.title}</h3>
        </div>
        <span class="card__border"></span>`;
      grid.appendChild(card);

      const canvas = $("canvas", card);
      const w = 460;
      drawArt(canvas, w, p.h, p.c, idx + 1);

      revealObserver.observe(card);
    });

    if (canHover && !reduceMotion) {
      $$(".card").forEach((card) => {
        const art = $(".art", card);
        card.addEventListener("mousemove", (e) => {
          const r = card.getBoundingClientRect();
          const px = (e.clientX - r.left) / r.width - 0.5;
          const py = (e.clientY - r.top) / r.height - 0.5;
          art.style.transform = `scale(1.12) translate(${px * -16}px, ${py * -16}px)`;
        });
        card.addEventListener("mouseleave", () => { art.style.transform = ""; });
      });
    }
  }

  renderGrid();

  /* ----------------------------------------------------
     FILTERS
  ---------------------------------------------------- */
  const filters = $("#filters");
  filters.addEventListener("click", (e) => {
    const btn = e.target.closest(".filter");
    if (!btn) return;
    $$(".filter", filters).forEach((b) => b.classList.remove("is-active"));
    btn.classList.add("is-active");
    const f = btn.dataset.filter;
    $$(".card").forEach((card) => {
      const show = f === "all" || card.dataset.cat === f;
      card.classList.toggle("hide", !show);
    });
  });

  /* ----------------------------------------------------
     CONTACT FORM
  ---------------------------------------------------- */
  const form = $("#contactForm");
  const status = $("#formStatus");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = new FormData(form);
    if (!data.get("name") || !data.get("email") || !data.get("message")) {
      status.style.color = "#ff7a90";
      status.textContent = "Please fill in your name, email and message.";
      return;
    }
    const btn = $("button[type=submit]", form);
    btn.querySelector("span").textContent = "Sending…";
    setTimeout(() => {
      status.style.color = "";
      status.textContent = `Thanks ${data.get("name")} — your message is on its way. I'll be in touch soon.`;
      form.reset();
      btn.querySelector("span").textContent = "Send message";
    }, 1100);
  });

  /* ----------------------------------------------------
     INIT
  ---------------------------------------------------- */
  observeReveals();
  if (reduceMotion) {
    finishPreloaderInstant();
  } else if (document.readyState === "complete") {
    runPreloader();
  } else {
    window.addEventListener("load", runPreloader);
    // fallback in case load is slow
    setTimeout(() => { if (!document.body.classList.contains("loaded")) runPreloader(); }, 2500);
  }

  function finishPreloaderInstant() {
    counterEl.textContent = "100";
    barEl.style.width = "100%";
    finishPreloader();
  }

  /* ----------------------------------------------------
     HIDDEN ADMIN PORTAL
  ---------------------------------------------------- */
  let clickCount = 0;
  const copyrightEl = $(".footer__bottom span");
  if (copyrightEl) {
    copyrightEl.style.cursor = "pointer";
    copyrightEl.addEventListener("click", () => {
      clickCount++;
      if (clickCount >= 5) {
        clickCount = 0;
        showAdminLogin();
      }
    });
  }

  window.addEventListener("keydown", (e) => {
    if (e.ctrlKey && e.altKey && e.key.toLowerCase() === "a") {
      e.preventDefault();
      showAdminLogin();
    }
  });

  function showAdminLogin() {
    const existingModal = $("#adminModal");
    if (existingModal) existingModal.remove();

    const modal = document.createElement("div");
    modal.className = "admin-modal";
    modal.id = "adminModal";
    modal.innerHTML = `
      <div class="admin-modal__card">
        <button class="admin-modal__close" id="adminCloseBtn">&times;</button>
        <h3 class="admin-modal__title">Admin Portal</h3>
        <div class="admin-modal__group">
          <label class="admin-modal__label">Enter Admin Passcode</label>
          <input type="password" class="admin-modal__input" id="adminPasscode" placeholder="••••••••" />
        </div>
        <button class="btn btn--primary btn--full" id="adminLoginBtn"><span>Unlock Dashboard</span></button>
        <p class="form__status" id="adminLoginStatus" style="margin-top:12px;"></p>
      </div>
    `;
    document.body.appendChild(modal);

    setTimeout(() => modal.classList.add("is-active"), 50);

    const closeBtn = $("#adminCloseBtn", modal);
    closeBtn.addEventListener("click", () => closeModal(modal));

    const input = $("#adminPasscode", modal);
    input.focus();
    input.addEventListener("keypress", (e) => {
      if (e.key === "Enter") handleLogin();
    });

    const loginBtn = $("#adminLoginBtn", modal);
    loginBtn.addEventListener("click", handleLogin);

    function handleLogin() {
      const val = input.value;
      const status = $("#adminLoginStatus", modal);
      if (val === "bobbyadmin") {
        status.style.color = "#3ad29a";
        status.textContent = "Access Granted! Loading...";
        setTimeout(() => {
          closeModal(modal);
          showAdminDashboard();
        }, 800);
      } else {
        status.style.color = "#ff4d5a";
        status.textContent = "Invalid Passcode. Please try again.";
        input.value = "";
        input.focus();
      }
    }
  }

  function closeModal(el) {
    el.classList.remove("is-active");
    setTimeout(() => el.remove(), 400);
  }

  let editingProjectIndex = -1;

  function showAdminDashboard() {
    const existingDb = $("#adminDb");
    if (existingDb) existingDb.remove();

    const db = document.createElement("div");
    db.className = "admin-db";
    db.id = "adminDb";
    db.innerHTML = `
      <div class="admin-db__header">
        <h2 class="admin-db__title">Bobby Portfolio Manager <span>Admin</span></h2>
        <div class="admin-db__actions">
          <button class="btn btn--ghost" id="adminDbClose" style="padding: 10px 20px;"><span>Exit Manager</span></button>
        </div>
      </div>
      <div class="admin-db__body">
        <div>
          <h3 class="admin-db__section-title">Active Projects</h3>
          <div class="admin-db__list" id="adminProjList"></div>
        </div>
        <div class="admin-form-panel">
          <h3 class="admin-db__section-title" id="formPanelTitle">Add New Project</h3>
          <div class="admin-modal__group">
            <label class="admin-modal__label">Project Title</label>
            <input type="text" class="admin-modal__input" id="projTitle" placeholder="e.g. Benny's — Website Design" />
          </div>
          <div class="admin-modal__group">
            <label class="admin-modal__label">Category</label>
            <select class="admin-modal__select" id="projCat">
              <option value="branding">Branding</option>
              <option value="social">Social Media</option>
              <option value="posters">Posters</option>
              <option value="ui">UI Design</option>
              <option value="motion">Motion Graphics</option>
            </select>
          </div>
          <div class="admin-modal__group">
            <label class="admin-modal__label">Card Height (px)</label>
            <input type="number" class="admin-modal__input" id="projHeight" value="360" min="200" max="600" />
          </div>
          <div class="admin-modal__group">
            <label class="admin-modal__label">Colors (Gradient stops)</label>
            <div class="admin-form-panel__colors">
              <input type="color" class="admin-modal__input" id="projCol1" value="#ec0909" style="height:45px; padding:2px;" />
              <input type="color" class="admin-modal__input" id="projCol2" value="#151109" style="height:45px; padding:2px;" />
            </div>
          </div>
          <div style="display:flex; gap:12px;">
            <button class="btn btn--primary" id="saveProjBtn" style="flex:1;"><span>Add Project</span></button>
            <button class="btn btn--ghost" id="cancelEditBtn" style="display:none; padding:10px 20px;"><span>Cancel</span></button>
          </div>
          
          <div style="margin-top: 32px; border-top: 1px solid var(--line); padding-top: 24px;">
            <h4 class="admin-modal__label">Code Export for js/main.js</h4>
            <p style="font-size:0.75rem; color:var(--muted); margin-bottom:8px;">Copy this array code and paste it inside js/main.js's "defaultProjects" definition to make edits permanent!</p>
            <div class="admin-export-box" id="codeExportBox"></div>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(db);
    document.body.style.overflow = "hidden";

    setTimeout(() => db.classList.add("is-active"), 50);

    const closeBtn = $("#adminDbClose", db);
    closeBtn.addEventListener("click", () => {
      db.classList.remove("is-active");
      document.body.style.overflow = "";
      setTimeout(() => db.remove(), 400);
    });

    const cancelEditBtn = $("#cancelEditBtn", db);
    cancelEditBtn.addEventListener("click", resetForm);

    const saveProjBtn = $("#saveProjBtn", db);
    saveProjBtn.addEventListener("click", saveProject);

    renderAdminItems();
    updateCodeExport();

    function renderAdminItems() {
      const list = $("#adminProjList", db);
      list.innerHTML = "";
      projects.forEach((p, idx) => {
        const item = document.createElement("div");
        item.className = "admin-item";
        item.innerHTML = `
          <div class="admin-item__info">
            <span class="admin-item__title">${p.title}</span>
            <span class="admin-item__meta">${p.catLabel} | H: ${p.h}px | Colors: ${p.c.join(", ")}</span>
          </div>
          <div class="admin-item__btns">
            <button class="admin-item__btn" data-action="edit" data-idx="${idx}" title="Edit Project">✏️</button>
            <button class="admin-item__btn admin-item__btn--delete" data-action="delete" data-idx="${idx}" title="Delete Project">🗑️</button>
          </div>
        `;
        list.appendChild(item);
      });

      list.querySelectorAll("[data-action]").forEach(btn => {
        btn.addEventListener("click", () => {
          const action = btn.dataset.action;
          const idx = parseInt(btn.dataset.idx);
          if (action === "edit") {
            startEdit(idx);
          } else if (action === "delete") {
            deleteProject(idx);
          }
        });
      });
    }

    function startEdit(idx) {
      editingProjectIndex = idx;
      const p = projects[idx];
      $("#formPanelTitle", db).textContent = "Edit Project";
      $("#projTitle", db).value = p.title;
      $("#projCat", db).value = p.cat;
      $("#projHeight", db).value = p.h;
      $("#projCol1", db).value = p.c[0] || "#ec0909";
      $("#projCol2", db).value = p.c[1] || "#151109";
      $("#saveProjBtn span", db).textContent = "Update Project";
      cancelEditBtn.style.display = "block";
    }

    function resetForm() {
      editingProjectIndex = -1;
      $("#formPanelTitle", db).textContent = "Add New Project";
      $("#projTitle", db).value = "";
      $("#projCat", db).value = "branding";
      $("#projHeight", db).value = "360";
      $("#projCol1", db).value = "#ec0909";
      $("#projCol2", db).value = "#151109";
      $("#saveProjBtn span", db).textContent = "Add Project";
      cancelEditBtn.style.display = "none";
    }

    function saveProject() {
      const title = $("#projTitle", db).value.trim();
      const cat = $("#projCat", db).value;
      const h = parseInt($("#projHeight", db).value) || 360;
      const c1 = $("#projCol1", db).value;
      const c2 = $("#projCol2", db).value;

      if (!title) {
        alert("Please enter a project title.");
        return;
      }

      const catLabels = {
        branding: "Branding",
        social: "Social Media",
        posters: "Poster",
        ui: "UI Design",
        motion: "Motion Graphics"
      };

      const newProj = {
        title,
        cat,
        catLabel: catLabels[cat] || "Design",
        h,
        c: [c1, c2]
      };

      if (editingProjectIndex > -1) {
        projects[editingProjectIndex] = newProj;
      } else {
        projects.push(newProj);
      }

      localStorage.setItem("bobby_projects", JSON.stringify(projects));
      
      renderAdminItems();
      updateCodeExport();
      resetForm();
      renderGrid();
    }

    function deleteProject(idx) {
      if (confirm(`Are you sure you want to delete "${projects[idx].title}"?`)) {
        projects.splice(idx, 1);
        localStorage.setItem("bobby_projects", JSON.stringify(projects));
        renderAdminItems();
        updateCodeExport();
        renderGrid();
      }
    }

    function updateCodeExport() {
      const box = $("#codeExportBox", db);
      const str = "  const defaultProjects = " + JSON.stringify(projects, null, 4) + ";";
      box.textContent = str;
    }
  }
})();
