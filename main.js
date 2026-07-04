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
     ABOUT ME SYNCHRONIZATION
  ---------------------------------------------------- */
  function applyAboutDetails(data) {
    if (!data) return;
    
    // Update portrait photo
    const portraitImg = $(".about__portrait img");
    if (portraitImg && data.portrait) {
      portraitImg.src = data.portrait;
    }
    
    // Update lead text
    const aboutLead = $(".about__lead");
    if (aboutLead && data.leadText) {
      aboutLead.textContent = data.leadText;
      // Re-trigger text splitting for animation
      initSplitText(aboutLead);
    }
    
    // Update body text
    const aboutBody = $(".about__body");
    if (aboutBody && data.bodyText) {
      aboutBody.textContent = data.bodyText;
    }
    
    // Update stats
    const statsContainer = $(".stats");
    if (statsContainer) {
      const statsList = $$(".stat", statsContainer);
      if (statsList[0]) {
        const num = $(".stat__num", statsList[0]);
        const label = $(".stat__label", statsList[0]);
        if (num && data.expNum !== undefined) {
          num.dataset.count = data.expNum;
          num.textContent = data.expNum;
        }
        if (label && data.expLabel) label.textContent = data.expLabel;
      }
      if (statsList[1]) {
        const num = $(".stat__num", statsList[1]);
        const label = $(".stat__label", statsList[1]);
        if (num && data.projNum !== undefined) {
          num.dataset.count = data.projNum;
          num.textContent = data.projNum;
        }
        if (label && data.projLabel) label.textContent = data.projLabel;
      }
      if (statsList[2]) {
        const num = $(".stat__num", statsList[2]);
        const label = $(".stat__label", statsList[2]);
        if (num && data.stat3Num !== undefined) {
          num.dataset.count = data.stat3Num;
          num.textContent = data.stat3Num;
        }
        if (label && data.stat3Label) label.textContent = data.stat3Label;
      }
    }
  }

  // Load cached About Me details
  const cachedAbout = localStorage.getItem("bobby_about");
  if (cachedAbout) {
    try {
      applyAboutDetails(JSON.parse(cachedAbout));
    } catch(e) {}
  }

  /* ----------------------------------------------------
     SPLIT TEXT — word-by-word "light up"
  ---------------------------------------------------- */
  function initSplitText(el) {
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
  }
  $$("[data-split]").forEach((el) => initSplitText(el));

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
  const defaultProjects = [];

  let projects = [...defaultProjects];

  // Try to load cached projects from localStorage first for instant paint
  const cached = localStorage.getItem("bobby_projects");
  if (cached) {
    try {
      projects = JSON.parse(cached);
    } catch(e) {}
  }

  // Firebase Config
  const firebaseConfig = {
    apiKey: "AIzaSyDCKv2OlgUmNQgoAAWSPteG_JJoHuM0o-8",
    authDomain: "portfolio-29fd3.firebaseapp.com",
    projectId: "portfolio-29fd3",
    storageBucket: "portfolio-29fd3.firebasestorage.app",
    messagingSenderId: "663405336350",
    appId: "1:663405336350:web:a2a49463d136246e905b0f",
    measurementId: "G-PNMGYFB58Q"
  };

  let firestoreDb;
  let analytics;
  let storage;
  try {
    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }
    firestoreDb = firebase.firestore();
    analytics = firebase.analytics();
    storage = firebase.storage();
  } catch (e) {
    console.error("Firebase init error:", e);
  }

  // Fetch from Firebase Firestore in real-time
  function syncWithFirebase() {
    if (!firestoreDb) return;
    firestoreDb.collection("projects").orderBy("createdAt", "asc").onSnapshot((querySnapshot) => {
      const list = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        data.id = doc.id; // Save doc ID
        list.push(data);
      });
      projects = list;
      localStorage.setItem("bobby_projects", JSON.stringify(projects));
      renderGrid();
      if (typeof window.updateAdminItemsCallback === "function") {
        window.updateAdminItemsCallback();
      }
    }, (err) => {
      console.error("Firebase snapshot listen error:", err);
    });

    firestoreDb.collection("portfolio").doc("about").onSnapshot((doc) => {
      if (doc.exists) {
        const aboutData = doc.data();
        localStorage.setItem("bobby_about", JSON.stringify(aboutData));
        applyAboutDetails(aboutData);
      }
    }, (err) => {
      console.error("Firebase about snapshot listen error:", err);
    });
  }

  syncWithFirebase();

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
      
      let artContent = `<canvas></canvas>`;
      if (p.image) {
        const isVideo = p.image.toLowerCase().endsWith(".mp4") || p.image.toLowerCase().endsWith(".webm") || p.image.includes("video/");
        if (isVideo) {
          artContent = `<video src="${p.image}" autoplay loop muted playsinline style="width:100%; height:${p.h}px; object-fit:cover; display:block;"></video>`;
        } else {
          artContent = `<img src="${p.image}" alt="${p.title}" style="width:100%; height:${p.h}px; object-fit:cover; display:block;" />`;
        }
      }
      
      card.innerHTML = `
        <div class="card__art"><div class="art">${artContent}</div></div>
        <span class="card__view"></span>
        <div class="card__overlay">
          <span class="card__cat">${p.catLabel}</span>
          <h3 class="card__title">${p.title}</h3>
        </div>
        <span class="card__border"></span>`;
      grid.appendChild(card);
      card.addEventListener("click", () => openProjectPage(p));

      if (!p.image) {
        const canvas = $("canvas", card);
        const w = 460;
        drawArt(canvas, w, p.h, p.c, idx + 1);
      }

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

  function openProjectPage(p) {
    const existing = $("#projectPage");
    if (existing) existing.remove();

    const pg = document.createElement("div");
    pg.className = "project-page";
    pg.id = "projectPage";
    
    let heroMediaHtml = "";
    let showcaseMediaHtml = "";
    if (p.image) {
      const isVideo = p.image.toLowerCase().endsWith(".mp4") || p.image.toLowerCase().endsWith(".webm") || p.image.includes("video/");
      if (isVideo) {
        heroMediaHtml = `<video src="${p.image}" autoplay loop muted playsinline></video>`;
        showcaseMediaHtml = `
          <div class="project-page__showcase-item">
            <video src="${p.image}" controls autoplay loop muted playsinline></video>
          </div>
        `;
      } else {
        heroMediaHtml = `<img src="${p.image}" alt="${p.title}" />`;
        showcaseMediaHtml = `
          <div class="project-page__showcase-item">
            <img src="${p.image}" alt="${p.title}" />
          </div>
        `;
      }
    } else {
      heroMediaHtml = `<canvas id="projectPageCanvas" style="width: 100%; height: 100%;"></canvas>`;
      showcaseMediaHtml = `
        <div class="project-page__showcase-item">
          <canvas id="projectPageShowcaseCanvas" style="width: 100%; height: 450px;"></canvas>
        </div>
      `;
    }

    const defaultDesc = `An immersive design study exploring the creative process, visual execution, and branding language developed for "${p.title}". Designed and executed to establish a distinct, modern identity that resonates across digital platforms and physical touchpoints. This case study details the conceptual thinking, design decisions, and ultimate outcome of the collaboration.`;
    const descriptionText = p.description || defaultDesc;

    pg.innerHTML = `
      <div class="project-page__header">
        <button class="project-page__back" id="projectPageBack">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-right:2px;"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
          <span>Back to Work</span>
        </button>
      </div>
      <div class="project-page__hero">
        <div class="project-page__hero-media">
          ${heroMediaHtml}
        </div>
      </div>
      <div class="project-page__content">
        <div class="project-page__meta">
          <div class="project-page__meta-group">
            <span class="project-page__meta-label">Category</span>
            <span class="project-page__meta-value">${p.catLabel}</span>
          </div>
          <div class="project-page__meta-group">
            <span class="project-page__meta-label">Year</span>
            <span class="project-page__meta-value">${p.year || '2026'}</span>
          </div>
          <div class="project-page__meta-group">
            <span class="project-page__meta-label">Client</span>
            <span class="project-page__meta-value">${p.client || 'Confidential'}</span>
          </div>
          <div class="project-page__meta-group">
            <span class="project-page__meta-label">Role</span>
            <span class="project-page__meta-value">Lead Designer</span>
          </div>
        </div>
        <div class="project-page__details">
          <h1 class="project-page__title">${p.title}</h1>
          <div class="project-page__description">${descriptionText}</div>
          <div class="project-page__media-showcase">
            <h4 class="project-page__meta-label" style="margin-bottom: 10px;">Visual Showcase</h4>
            ${showcaseMediaHtml}
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(pg);
    document.body.style.overflow = "hidden";
    document.body.classList.add("admin-active");

    if (!p.image) {
      const canvasHero = $("#projectPageCanvas", pg);
      const canvasShowcase = $("#projectPageShowcaseCanvas", pg);
      drawArt(canvasHero, 1200, 600, p.c, 123);
      drawArt(canvasShowcase, 1000, 450, p.c, 456);
    }

    setTimeout(() => pg.classList.add("is-active"), 50);

    const close = () => {
      pg.classList.remove("is-active");
      document.body.style.overflow = "";
      if (!$("#adminDb") && !$("#adminModal")) {
        document.body.classList.remove("admin-active");
      }
      setTimeout(() => pg.remove(), 500);
    };

    $("#projectPageBack", pg).addEventListener("click", close);

    const escHandler = (e) => {
      if (e.key === "Escape") {
        close();
        window.removeEventListener("keydown", escHandler);
      }
    };
    window.addEventListener("keydown", escHandler);
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
    document.body.classList.add("admin-active");

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
    setTimeout(() => {
      el.remove();
      if (!$("#adminDb")) {
        document.body.classList.remove("admin-active");
      }
    }, 400);
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

          <div class="admin-about-panel" style="margin-top: 40px; border-top: 1px solid var(--line); padding-top: 32px;">
            <h3 class="admin-db__section-title">Edit About Me</h3>
            
            <div class="admin-modal__group">
              <label class="admin-modal__label">Portrait Photo</label>
              <div style="display: flex; flex-direction: column; gap: 8px;">
                <div style="display: flex; gap: 8px; align-items: center;">
                  <input type="file" id="aboutFile" accept="image/*" style="display: none;" />
                  <button class="btn btn--ghost" id="uploadAboutBtn" style="padding: 10px 16px; font-size: 0.85rem; flex: 1;"><span>Choose New Portrait</span></button>
                </div>
                <div id="uploadAboutProgress" style="display: none; width: 100%; height: 6px; background: rgba(255,255,255,0.1); border-radius: 4px; overflow: hidden; margin-top: 4px;">
                  <div id="uploadAboutProgressBar" style="width: 0%; height: 100%; background: var(--purple); transition: width 0.2s;"></div>
                </div>
                <input type="text" class="admin-modal__input" id="aboutImageUrl" placeholder="Or paste image URL directly" />
              </div>
            </div>

            <div class="admin-modal__group">
              <label class="admin-modal__label">Lead Introduction</label>
              <textarea class="admin-modal__input" id="aboutLeadInput" placeholder="I'm Bobby — a designer obsessed..." style="min-height: 80px; resize: vertical; padding: 12px;"></textarea>
            </div>

            <div class="admin-modal__group">
              <label class="admin-modal__label">Detailed Bio</label>
              <textarea class="admin-modal__input" id="aboutBodyInput" placeholder="My work lives at the intersection..." style="min-height: 120px; resize: vertical; padding: 12px;"></textarea>
            </div>

            <div class="admin-modal__group">
              <label class="admin-modal__label">Stat 1: Experience</label>
              <div style="display: grid; grid-template-columns: 80px 1fr; gap: 10px;">
                <input type="number" class="admin-modal__input" id="aboutExpNum" placeholder="2" />
                <input type="text" class="admin-modal__input" id="aboutExpLabel" placeholder="Years of experience" />
              </div>
            </div>

            <div class="admin-modal__group">
              <label class="admin-modal__label">Stat 2: Projects</label>
              <div style="display: grid; grid-template-columns: 80px 1fr; gap: 10px;">
                <input type="number" class="admin-modal__input" id="aboutProjNum" placeholder="20" />
                <input type="text" class="admin-modal__input" id="aboutProjLabel" placeholder="Projects delivered" />
              </div>
            </div>

            <div class="admin-modal__group">
              <label class="admin-modal__label">Stat 3: Craft</label>
              <div style="display: grid; grid-template-columns: 80px 1fr; gap: 10px;">
                <input type="number" class="admin-modal__input" id="aboutStat3Num" placeholder="100" />
                <input type="text" class="admin-modal__input" id="aboutStat3Label" placeholder="Obsessive craft" />
              </div>
            </div>

            <button class="btn btn--primary" id="saveAboutBtn" style="width: 100%; margin-top: 10px;"><span>Save About Details</span></button>
          </div>
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
              <option value="motion">Motion Graphics</option>
            </select>
          </div>
          <div class="admin-modal__group">
            <label class="admin-modal__label">Card Height (px)</label>
            <input type="number" class="admin-modal__input" id="projHeight" value="360" min="200" max="600" />
          </div>
          <div class="admin-modal__group">
            <label class="admin-modal__label">Project Image</label>
            <div style="display: flex; flex-direction: column; gap: 8px;">
              <div style="display: flex; gap: 8px; align-items: center;">
                <input type="file" id="projFile" accept="image/*" style="display: none;" />
                <button class="btn btn--ghost" id="uploadBtn" style="padding: 10px 16px; font-size: 0.85rem; flex: 1;"><span>Choose Project Image</span></button>
              </div>
              <div id="uploadProgress" style="display: none; width: 100%; height: 6px; background: rgba(255,255,255,0.1); border-radius: 4px; overflow: hidden; margin-top: 4px;">
                <div id="uploadProgressBar" style="width: 0%; height: 100%; background: var(--purple); transition: width 0.2s;"></div>
              </div>
              <input type="text" class="admin-modal__input" id="projImageUrl" placeholder="Or paste image/video URL directly" />
            </div>
          </div>
          <div class="admin-modal__group">
            <label class="admin-modal__label">Year</label>
            <input type="text" class="admin-modal__input" id="projYear" value="2026" placeholder="e.g. 2026" />
          </div>
          <div class="admin-modal__group">
            <label class="admin-modal__label">Client / Platform</label>
            <input type="text" class="admin-modal__input" id="projClient" value="Confidential" placeholder="e.g. Personal Project" />
          </div>
          <div class="admin-modal__group">
            <label class="admin-modal__label">Project Description</label>
            <textarea class="admin-modal__input" id="projDesc" placeholder="Describe the project case study details..." style="min-height: 80px; resize: vertical; padding: 12px;"></textarea>
          </div>
          <div class="admin-modal__group">
            <label class="admin-modal__label">Fallback Colors (for canvas gradient)</label>
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
    document.body.classList.add("admin-active");
    document.body.style.overflow = "hidden";

    setTimeout(() => db.classList.add("is-active"), 50);

    const projFile = $("#projFile", db);
    const uploadBtn = $("#uploadBtn", db);
    const uploadProgress = $("#uploadProgress", db);
    const uploadProgressBar = $("#uploadProgressBar", db);
    const projImageUrl = $("#projImageUrl", db);

    uploadBtn.addEventListener("click", () => projFile.click());

    projFile.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (!file) return;

      if (file.type.startsWith("video/")) {
        alert("Videos cannot be stored directly in the database due to size limits. Please upload an image instead, or paste a video link (e.g. from YouTube, Vimeo, or a public CDN) directly into the URL field.");
        projFile.value = "";
        return;
      }

      uploadBtn.disabled = true;
      $("#uploadBtn span", db).textContent = "Processing Image...";
      uploadProgress.style.display = "block";
      uploadProgressBar.style.width = "40%";

      compressAndConvertToBase64(file, 1200, 1200, 0.85, (base64Url, origW, origH) => {
        projImageUrl.value = base64Url;

        // Auto-calculate height based on aspect ratio (base width 360px)
        if (origW && origH) {
          const calculatedHeight = Math.round((origH / origW) * 360);
          // Keep the height in a solid portfolio range [200px, 600px]
          const clampedHeight = Math.max(200, Math.min(600, calculatedHeight));
          $("#projHeight", db).value = clampedHeight;
        }

        uploadProgressBar.style.width = "100%";
        uploadBtn.disabled = false;
        $("#uploadBtn span", db).textContent = "Loaded!";
        setTimeout(() => {
          uploadProgress.style.display = "none";
          $("#uploadBtn span", db).textContent = "Choose Project Image";
        }, 1500);
      });
    });

    const closeBtn = $("#adminDbClose", db);
    closeBtn.addEventListener("click", () => {
      db.classList.remove("is-active");
      document.body.style.overflow = "";
      document.body.classList.remove("admin-active");
      window.updateAdminItemsCallback = null;
      setTimeout(() => db.remove(), 400);
    });

    const cancelEditBtn = $("#cancelEditBtn", db);
    cancelEditBtn.addEventListener("click", resetForm);

    const saveProjBtn = $("#saveProjBtn", db);
    saveProjBtn.addEventListener("click", saveProject);

    // Populate About Me fields
    const cachedAboutData = localStorage.getItem("bobby_about");
    let currentAbout = {};
    if (cachedAboutData) {
      try { currentAbout = JSON.parse(cachedAboutData); } catch(e) {}
    }

    $("#aboutImageUrl", db).value = currentAbout.portrait || $(".about__portrait img")?.getAttribute("src") || "";
    $("#aboutLeadInput", db).value = currentAbout.leadText || $(".about__lead")?.textContent.trim() || "";
    $("#aboutBodyInput", db).value = currentAbout.bodyText || $(".about__body")?.textContent.trim() || "";
    
    const statsContainer = $(".stats");
    const statsList = statsContainer ? $$(".stat", statsContainer) : [];
    $("#aboutExpNum", db).value = currentAbout.expNum !== undefined ? currentAbout.expNum : (statsList[0] ? ($(".stat__num", statsList[0])?.dataset.count || "2") : "2");
    $("#aboutExpLabel", db).value = currentAbout.expLabel || (statsList[0] ? ($(".stat__label", statsList[0])?.textContent.trim() || "Years of experience") : "Years of experience");
    
    $("#aboutProjNum", db).value = currentAbout.projNum !== undefined ? currentAbout.projNum : (statsList[1] ? ($(".stat__num", statsList[1])?.dataset.count || "20") : "20");
    $("#aboutProjLabel", db).value = currentAbout.projLabel || (statsList[1] ? ($(".stat__label", statsList[1])?.textContent.trim() || "Projects delivered") : "Projects delivered");
    
    $("#aboutStat3Num", db).value = currentAbout.stat3Num !== undefined ? currentAbout.stat3Num : (statsList[2] ? ($(".stat__num", statsList[2])?.dataset.count || "100") : "100");
    $("#aboutStat3Label", db).value = currentAbout.stat3Label || (statsList[2] ? ($(".stat__label", statsList[2])?.textContent.trim() || "Obsessive craft") : "Obsessive craft");

    // Hook up About Me listeners
    const aboutFile = $("#aboutFile", db);
    const uploadAboutBtn = $("#uploadAboutBtn", db);
    const uploadAboutProgress = $("#uploadAboutProgress", db);
    const uploadAboutProgressBar = $("#uploadAboutProgressBar", db);
    const aboutImageUrl = $("#aboutImageUrl", db);

    uploadAboutBtn.addEventListener("click", () => aboutFile.click());

    aboutFile.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (!file) return;

      uploadAboutBtn.disabled = true;
      $("#uploadAboutBtn span", db).textContent = "Processing Image...";
      uploadAboutProgress.style.display = "block";
      uploadAboutProgressBar.style.width = "40%";

      compressAndConvertToBase64(file, 1200, 1200, 0.85, (base64Url) => {
        aboutImageUrl.value = base64Url;
        uploadAboutProgressBar.style.width = "100%";
        uploadAboutBtn.disabled = false;
        $("#uploadAboutBtn span", db).textContent = "Loaded!";
        setTimeout(() => {
          uploadAboutProgress.style.display = "none";
          $("#uploadAboutBtn span", db).textContent = "Choose New Portrait";
        }, 1500);
      });
    });

    const saveAboutBtn = $("#saveAboutBtn", db);
    saveAboutBtn.addEventListener("click", () => {
      const portrait = $("#aboutImageUrl", db).value.trim();
      const leadText = $("#aboutLeadInput", db).value.trim();
      const bodyText = $("#aboutBodyInput", db).value.trim();
      const expNum = parseInt($("#aboutExpNum", db).value) || 0;
      const expLabel = $("#aboutExpLabel", db).value.trim();
      const projNum = parseInt($("#aboutProjNum", db).value) || 0;
      const projLabel = $("#aboutProjLabel", db).value.trim();
      const stat3Num = parseInt($("#aboutStat3Num", db).value) || 0;
      const stat3Label = $("#aboutStat3Label", db).value.trim();

      const aboutData = {
        portrait,
        leadText,
        bodyText,
        expNum,
        expLabel,
        projNum,
        projLabel,
        stat3Num,
        stat3Label
      };

      if (window.firebase && firestoreDb) {
        saveAboutBtn.disabled = true;
        $("#saveAboutBtn span", db).textContent = "Saving...";
        firestoreDb.collection("portfolio").doc("about").set(aboutData)
          .then(() => {
            console.log("Firestore About Me updated successfully");
            $("#saveAboutBtn span", db).textContent = "Saved!";
            setTimeout(() => {
              saveAboutBtn.disabled = false;
              $("#saveAboutBtn span", db).textContent = "Save About Details";
            }, 1500);
          })
          .catch((err) => {
            console.error("Firestore About Me update error:", err);
            alert("Error saving: " + err.message);
            saveAboutBtn.disabled = false;
            $("#saveAboutBtn span", db).textContent = "Save About Details";
          });
      } else {
        localStorage.setItem("bobby_about", JSON.stringify(aboutData));
        applyAboutDetails(aboutData);
        alert("Saved locally! (Firebase not active)");
      }
    });

    renderAdminItems();
    updateCodeExport();

    window.updateAdminItemsCallback = () => {
      renderAdminItems();
      updateCodeExport();
    };

    function renderAdminItems() {
      const list = $("#adminProjList", db);
      list.innerHTML = "";
      projects.forEach((p, idx) => {
        const item = document.createElement("div");
        item.className = "admin-item";
        item.innerHTML = `
          <div class="admin-item__info">
            <span class="admin-item__title">${p.title}</span>
            <span class="admin-item__meta">${p.catLabel} | H: ${p.h}px | ${p.image ? "🖼️ Media Uploaded" : `Colors: ${p.c.join(", ")}`}</span>
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
      $("#projImageUrl", db).value = p.image || "";
      $("#projYear", db).value = p.year || "2026";
      $("#projClient", db).value = p.client || "Confidential";
      $("#projDesc", db).value = p.description || "";
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
      $("#projImageUrl", db).value = "";
      $("#projFile", db).value = "";
      $("#projYear", db).value = "2026";
      $("#projClient", db).value = "Confidential";
      $("#projDesc", db).value = "";
      $("#saveProjBtn span", db).textContent = "Add Project";
      cancelEditBtn.style.display = "none";
    }

    function saveProject() {
      const title = $("#projTitle", db).value.trim();
      const cat = $("#projCat", db).value;
      const h = parseInt($("#projHeight", db).value) || 360;
      const c1 = $("#projCol1", db).value;
      const c2 = $("#projCol2", db).value;
      const image = $("#projImageUrl", db).value.trim();
      const year = $("#projYear", db).value.trim() || "2026";
      const client = $("#projClient", db).value.trim() || "Confidential";
      const desc = $("#projDesc", db).value.trim() || "";

      if (!title) {
        alert("Please enter a project title.");
        return;
      }
      if (!desc) {
        alert("Please enter a project description.");
        return;
      }

      const catLabels = {
        branding: "Branding",
        social: "Social Media",
        posters: "Poster",
        ui: "Design",
        motion: "Motion Graphics"
      };

      const newProj = {
        title,
        cat,
        catLabel: catLabels[cat] || "Design",
        h,
        c: [c1, c2],
        image: image || "",
        year,
        client,
        description: desc
      };

      if (window.firebase && firestoreDb) {
        if (editingProjectIndex > -1) {
          const docId = projects[editingProjectIndex].id;
          newProj.createdAt = projects[editingProjectIndex].createdAt || Date.now();
          firestoreDb.collection("projects").doc(docId).set(newProj)
            .then(() => console.log("Firestore project updated successfully"))
            .catch((err) => console.error("Firestore update error:", err));
        } else {
          newProj.createdAt = Date.now();
          firestoreDb.collection("projects").add(newProj)
            .then(() => console.log("Firestore project added successfully"))
            .catch((err) => console.error("Firestore add error:", err));
        }
      } else {
        // Fallback for local-only testing
        if (editingProjectIndex > -1) {
          newProj.createdAt = projects[editingProjectIndex].createdAt || Date.now();
          newProj.id = projects[editingProjectIndex].id;
          projects[editingProjectIndex] = newProj;
        } else {
          newProj.createdAt = Date.now();
          newProj.id = "local_" + Date.now();
          projects.push(newProj);
        }
        localStorage.setItem("bobby_projects", JSON.stringify(projects));
        renderAdminItems();
        updateCodeExport();
        resetForm();
        renderGrid();
      }

      if (window.firebase && firestoreDb) {
        resetForm();
      }
    }

    function deleteProject(idx) {
      if (confirm(`Are you sure you want to delete "${projects[idx].title}"?`)) {
        const docId = projects[idx].id;
        if (window.firebase && firestoreDb && docId && !docId.startsWith("local_")) {
          firestoreDb.collection("projects").doc(docId).delete()
            .then(() => console.log("Firestore project deleted successfully"))
            .catch((err) => console.error("Firestore delete error:", err));
        } else {
          projects.splice(idx, 1);
          localStorage.setItem("bobby_projects", JSON.stringify(projects));
          renderAdminItems();
          updateCodeExport();
          renderGrid();
        }
      }
    }

    function updateCodeExport() {
      const box = $("#codeExportBox", db);
      const str = "  const defaultProjects = " + JSON.stringify(projects, null, 4) + ";";
      box.textContent = str;
    }
  }

  function compressAndConvertToBase64(file, maxWidth, maxHeight, quality, callback) {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onerror = (err) => {
      console.error("FileReader error:", err);
      alert("Failed to read file.");
    };
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onerror = (err) => {
        console.error("Image load error:", err);
        callback(event.target.result, null, null);
      };
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;
          const origW = img.width;
          const origH = img.height;

          if (width > height) {
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);

          const compressedDataUrl = canvas.toDataURL("image/jpeg", quality);
          callback(compressedDataUrl, origW, origH);
        } catch (e) {
          console.error("Canvas draw/export error, falling back to raw data URL:", e);
          callback(event.target.result, img.width, img.height);
        }
      };
    };
  }
})();
