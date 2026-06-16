// Devxora agency site — interactions
(function () {
  "use strict";

  // Current year in footer
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  // Mobile nav toggle
  var toggle = document.querySelector(".nav-toggle");
  var menu = document.getElementById("nav-menu");
  if (toggle && menu) {
    toggle.addEventListener("click", function () {
      var open = menu.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });
    // Close menu when a link is clicked
    menu.addEventListener("click", function (e) {
      if (e.target.tagName === "A") {
        menu.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  // Scroll reveal via IntersectionObserver (respects reduced motion)
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var revealables = document.querySelectorAll(".reveal");
  if (reduced || !("IntersectionObserver" in window)) {
    revealables.forEach(function (el) { el.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    revealables.forEach(function (el) { io.observe(el); });
  }

  // Contact form: client-side validation + honeypot (no backend)
  var form = document.querySelector(".contact-form");
  if (form) {
    var note = form.querySelector(".form-note");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var hp = form.querySelector('input[name="company"]');
      if (hp && hp.value) return; // bot trapped
      var name = form.querySelector("#name");
      var email = form.querySelector("#email");
      var message = form.querySelector("#message");
      var emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value);
      if (!name.value.trim() || !emailOk || !message.value.trim()) {
        if (note) note.textContent = "Please fill in your name, a valid email, and a message.";
        return;
      }
      if (note) note.textContent = "Thanks! We'll reply within one business day.";
      form.reset();
    });
  }
})();
