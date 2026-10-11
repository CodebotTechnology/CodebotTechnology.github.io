/* CodeBot Technologies — site behaviour */
(function () {
  "use strict";

  var root = document.documentElement;
  var CONTACT_EMAIL = "codebottechnologies434@gmail.com";

  function store(key, value) {
    try {
      if (value === undefined) return localStorage.getItem(key);
      localStorage.setItem(key, value);
    } catch (e) { return null; }
  }

  /* ---------- Theme toggle ---------- */
  var themeBtns = document.querySelectorAll("[data-theme-toggle]");
  function currentTheme() {
    var set = root.getAttribute("data-theme");
    if (set) return set;
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  function syncThemeLabel() {
    var next = currentTheme() === "dark" ? "light" : "dark";
    themeBtns.forEach(function (b) { b.setAttribute("aria-label", "Switch to " + next + " theme"); });
  }
  themeBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var next = currentTheme() === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      store("cb-theme", next);
      syncThemeLabel();
    });
  });
  syncThemeLabel();

  /* ---------- Header shadow on scroll ---------- */
  var header = document.querySelector(".site-header");
  function onScroll() { if (header) header.classList.toggle("scrolled", window.scrollY > 8); }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile menu ---------- */
  var menuBtn = document.querySelector(".menu-toggle");
  var menu = document.getElementById("mobile-menu");
  function setMenu(open) {
    if (!menu || !menuBtn) return;
    menu.classList.toggle("open", open);
    menuBtn.setAttribute("aria-expanded", String(open));
    menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  }
  if (menuBtn && menu) {
    menuBtn.addEventListener("click", function () { setMenu(!menu.classList.contains("open")); });
    menu.addEventListener("click", function (e) { if (e.target.closest("a")) setMenu(false); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") setMenu(false); });
    window.addEventListener("resize", function () { if (window.innerWidth > 920) setMenu(false); });
  }

  /* ---------- Reveal on scroll ---------- */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add("in"); io.unobserve(entry.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- Footer year ---------- */
  document.querySelectorAll("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* ---------- Copy email ---------- */
  document.querySelectorAll("[data-copy]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var text = btn.getAttribute("data-copy");
      var label = btn.getAttribute("aria-label");
      function done() {
        btn.setAttribute("aria-label", "Copied!");
        btn.classList.add("copied");
        btn.querySelector(".i-copy") && (btn.querySelector(".i-copy").style.display = "none");
        btn.querySelector(".i-check") && (btn.querySelector(".i-check").style.display = "block");
        setTimeout(function () {
          btn.setAttribute("aria-label", label);
          btn.querySelector(".i-copy") && (btn.querySelector(".i-copy").style.display = "");
          btn.querySelector(".i-check") && (btn.querySelector(".i-check").style.display = "none");
        }, 1800);
      }
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(done, function () {});
      } else {
        var ta = document.createElement("textarea");
        ta.value = text; ta.setAttribute("readonly", ""); ta.style.position = "absolute"; ta.style.left = "-9999px";
        document.body.appendChild(ta); ta.select();
        try { document.execCommand("copy"); done(); } catch (e) {}
        document.body.removeChild(ta);
      }
    });
  });

  /* ---------- Gallery scroll buttons ---------- */
  document.querySelectorAll("[data-gallery-prev], [data-gallery-next]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var g = document.getElementById(btn.getAttribute("aria-controls"));
      if (!g) return;
      var dir = btn.hasAttribute("data-gallery-next") ? 1 : -1;
      g.scrollBy({ left: dir * Math.max(g.clientWidth * 0.8, 260), behavior: "smooth" });
    });
  });

  /* ---------- Lightbox ---------- */
  var lb = document.getElementById("lightbox");
  if (lb) {
    var lbImg = lb.querySelector("img");
    var lbCount = lb.querySelector(".lb-count");
    var items = Array.prototype.slice.call(document.querySelectorAll("[data-lightbox]"));
    var idx = 0, lastFocus = null;
    function show(i) {
      idx = (i + items.length) % items.length;
      var el = items[idx];
      lbImg.src = el.getAttribute("data-lightbox");
      lbImg.alt = el.querySelector("img") ? el.querySelector("img").alt : "";
      lbCount.textContent = (idx + 1) + " / " + items.length;
    }
    function open(i) {
      lastFocus = document.activeElement;
      show(i);
      lb.classList.add("open");
      document.body.style.overflow = "hidden";
      lb.querySelector(".lb-close").focus();
    }
    function close() {
      lb.classList.remove("open");
      document.body.style.overflow = "";
      if (lastFocus) lastFocus.focus();
    }
    items.forEach(function (el, i) { el.addEventListener("click", function () { open(i); }); });
    lb.querySelector(".lb-close").addEventListener("click", close);
    lb.querySelector(".lb-prev").addEventListener("click", function () { show(idx - 1); });
    lb.querySelector(".lb-next").addEventListener("click", function () { show(idx + 1); });
    lb.addEventListener("click", function (e) { if (e.target === lb) close(); });
    document.addEventListener("keydown", function (e) {
      if (!lb.classList.contains("open")) return;
      if (e.key === "Escape") close();
      else if (e.key === "ArrowLeft") show(idx - 1);
      else if (e.key === "ArrowRight") show(idx + 1);
      else if (e.key === "Tab") {
        var f = lb.querySelectorAll("button");
        var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
  }

  /* ---------- Contact form ----------
     Sends through FormSubmit (free, no backend needed). If that fails for any
     reason, it falls back to opening the visitor's email app with the message
     already filled in. */
  var form = document.getElementById("contact-form");
  if (form) {
    var status = form.querySelector(".form-status");
    var submit = form.querySelector("button[type=submit]");
    function setStatus(msg, cls) { status.textContent = msg; status.className = "form-status " + (cls || ""); }
    function mailtoFallback(data) {
      var body = data.message + "\n\n— " + data.name + " (" + data.email + ")";
      window.location.href = "mailto:" + CONTACT_EMAIL +
        "?subject=" + encodeURIComponent("[Website] " + data.subject) +
        "&body=" + encodeURIComponent(body);
    }
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (form.querySelector(".hp input").value) return; // bot trap
      if (!form.checkValidity()) { form.reportValidity(); return; }
      var data = {
        name: form.name.value.trim(),
        email: form.email.value.trim(),
        subject: form.subject.value,
        message: form.message.value.trim()
      };
      submit.disabled = true;
      setStatus("Sending…");
      fetch("https://formsubmit.co/ajax/" + CONTACT_EMAIL, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          _subject: "[Website] " + data.subject + " — " + data.name,
          _template: "table",
          _captcha: "false",
          topic: data.subject,
          message: data.message
        })
      }).then(function (r) { return r.json().then(function (j) { return { ok: r.ok, body: j }; }); })
        .then(function (res) {
          if (res.ok && String(res.body.success) === "true") {
            form.reset();
            setStatus("Thanks! Your message has been sent. We'll get back to you soon.", "ok");
          } else { throw new Error("send failed"); }
        })
        .catch(function () {
          setStatus("Opening your email app so you can send the message directly…", "");
          mailtoFallback(data);
        })
        .then(function () { submit.disabled = false; });
    });
  }
})();
