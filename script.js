(function () {
  "use strict";

  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  /* ---------- Footer year ---------- */
  var yearEl = $("#year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Mobile menu ---------- */
  var menuBtn = $("#menuToggle");
  var nav = $("#nav");
  function setMenu(open) {
    nav.classList.toggle("is-open", open);
    menuBtn.setAttribute("aria-expanded", String(open));
    menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  }
  menuBtn.addEventListener("click", function () {
    setMenu(menuBtn.getAttribute("aria-expanded") !== "true");
  });
  $$("a", nav).forEach(function (a) {
    a.addEventListener("click", function () { setMenu(false); });
  });

  /* ---------- Hero path picker ---------- */
  var paths = {
    nails: {
      note: "Manicures, pedicures, gel, acrylic and nail art, finished by hand.",
      cta: "See nail services",
      filter: "nails"
    },
    lashes: {
      note: "Classic, hybrid and volume extensions, plus lifts, tints and brows.",
      cta: "See lash services",
      filter: "lashes"
    },
    both: {
      note: "Book nails and lashes back to back and leave the studio completely done.",
      cta: "See all services",
      filter: "all"
    }
  };
  var currentPath = "nails";
  var pathNote = $("#pathNote");
  var pathGo = $("#pathGo");

  $$(".path").forEach(function (btn) {
    btn.addEventListener("click", function () {
      currentPath = btn.getAttribute("data-path");
      $$(".path").forEach(function (b) {
        var on = b === btn;
        b.classList.toggle("is-active", on);
        b.setAttribute("aria-pressed", String(on));
      });
      pathNote.textContent = paths[currentPath].note;
      pathGo.textContent = paths[currentPath].cta;
    });
  });
  pathGo.addEventListener("click", function () {
    applyFilter(paths[currentPath].filter);
  });

  /* ---------- Service filter ---------- */
  var chips = $$(".chip");
  var cards = $$(".card");

  function applyFilter(name) {
    chips.forEach(function (c) {
      var on = c.getAttribute("data-filter") === name;
      c.classList.toggle("is-active", on);
      c.setAttribute("aria-selected", String(on));
    });
    cards.forEach(function (card) {
      var show = name === "all" || card.getAttribute("data-cat") === name;
      card.hidden = !show;
    });
  }
  chips.forEach(function (c) {
    c.addEventListener("click", function () { applyFilter(c.getAttribute("data-filter")); });
  });
  applyFilter("all");

  /* ---------- "Or learn more" toggles ---------- */
  $$(".card .link").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var more = $(".more", btn.closest(".card"));
      var open = more.hidden;
      more.hidden = !open;
      btn.setAttribute("aria-expanded", String(open));
      btn.textContent = open ? "Show less" : "Or learn more";
    });
  });

  /* ---------- Reviews slider ---------- */
  var slides = $$(".slide");
  var dotsWrap = $("#dots");
  var index = 0;
  var timer = null;
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  slides.forEach(function (_, i) {
    var d = document.createElement("button");
    d.type = "button";
    d.setAttribute("aria-label", "Show review " + (i + 1));
    d.addEventListener("click", function () { go(i, true); });
    dotsWrap.appendChild(d);
  });
  var dots = $$("button", dotsWrap);

  function go(i, manual) {
    index = (i + slides.length) % slides.length;
    slides.forEach(function (s, n) { s.classList.toggle("is-active", n === index); });
    dots.forEach(function (d, n) { d.classList.toggle("is-active", n === index); });
    if (manual) restart();
  }
  function restart() {
    clearInterval(timer);
    if (!reduceMotion) timer = setInterval(function () { go(index + 1); }, 7000);
  }
  $("#prev").addEventListener("click", function () { go(index - 1, true); });
  $("#next").addEventListener("click", function () { go(index + 1, true); });
  go(0);
  restart();

  /* ---------- Newsletter ---------- */
  var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  var newsForm = $("#newsForm");
  var newsMsg = $("#newsMsg");
  newsForm.addEventListener("submit", function (e) {
    e.preventDefault();
    var val = $("#newsEmail").value.trim();
    if (!emailRe.test(val)) {
      newsMsg.textContent = "Please enter a valid email address.";
      return;
    }
    // Demo only: connect this form to your email provider to collect signups.
    newsMsg.textContent = "Thank you! You're on the list.";
    newsForm.reset();
  });

  /* ---------- Booking dialog ---------- */
  var modal = $("#modal");
  var bookForm = $("#bookForm");
  var bookMsg = $("#bookMsg");
  var serviceSel = $("#bkService");
  var dateInput = $("#bkDate");
  var formWrap = $("#bookFormWrap");
  var doneWrap = $("#bookDone");
  var lastFocus = null;

  // Build the service list from the cards so it never drifts out of sync.
  var groups = { nails: [], lashes: [] };
  cards.forEach(function (card) {
    var title = $("h3", card).textContent;
    groups[card.getAttribute("data-cat")].push(title);
  });
  var placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = "Select a service";
  serviceSel.appendChild(placeholder);
  [["Nails", groups.nails], ["Lashes", groups.lashes]].forEach(function (g) {
    var og = document.createElement("optgroup");
    og.label = g[0];
    g[1].forEach(function (name) {
      var o = document.createElement("option");
      o.value = name;
      o.textContent = name;
      og.appendChild(o);
    });
    serviceSel.appendChild(og);
  });

  // Earliest bookable date is today.
  var t = new Date();
  var iso = t.getFullYear() + "-" + String(t.getMonth() + 1).padStart(2, "0") + "-" + String(t.getDate()).padStart(2, "0");
  dateInput.min = iso;

  function openModal(service) {
    lastFocus = document.activeElement;
    formWrap.hidden = false;
    doneWrap.hidden = true;
    bookMsg.textContent = "";
    $$(".invalid", bookForm).forEach(function (el) { el.classList.remove("invalid"); });
    if (service) serviceSel.value = service;
    modal.hidden = false;
    document.body.classList.add("modal-open");
    setTimeout(function () { serviceSel.focus(); }, 30);
  }
  function closeModal() {
    modal.hidden = true;
    document.body.classList.remove("modal-open");
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  $$("[data-open-booking]").forEach(function (el) {
    el.addEventListener("click", function (e) {
      e.preventDefault();
      setMenu(false);
      openModal();
    });
  });
  $$("[data-book]").forEach(function (el) {
    el.addEventListener("click", function () {
      openModal(el.getAttribute("data-book"));
    });
  });
  $$("[data-close]", modal).forEach(function (el) {
    el.addEventListener("click", closeModal);
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !modal.hidden) closeModal();
  });

  bookForm.addEventListener("submit", function (e) {
    e.preventDefault();
    var fields = ["bkService", "bkDate", "bkTime", "bkName", "bkContact"].map(function (id) { return $("#" + id); });
    var firstBad = null;
    fields.forEach(function (f) {
      var bad = !f.value.trim();
      f.classList.toggle("invalid", bad);
      if (bad && !firstBad) firstBad = f;
    });
    if (firstBad) {
      bookMsg.textContent = "Please fill in every field so we can hold your spot.";
      firstBad.focus();
      return;
    }
    bookMsg.textContent = "";
    var name = $("#bkName").value.trim().split(" ")[0];
    $("#bookDoneText").textContent =
      name + ", your request for " + serviceSel.value + " on " + dateInput.value +
      " at " + $("#bkTime").value + " is in. We'll reach out to confirm.";
    // Demo only: send the form data to your booking system or email service here.
    formWrap.hidden = true;
    doneWrap.hidden = false;
    bookForm.reset();
  });
})();
