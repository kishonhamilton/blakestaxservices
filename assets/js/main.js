(function () {
  'use strict';

  var PHONE_DISPLAY = '(718) 994-8460';
  var PHONE_TEL = 'tel:+17189948460';

  /* ---------- Header shadow on scroll + mobile CTA bar ---------- */
  var header = document.querySelector('.site-header');
  var mobileCta = document.querySelector('.mobile-cta');
  var hero = document.querySelector('.hero');
  function onScroll() {
    var y = window.scrollY;
    if (header) header.classList.toggle('is-scrolled', y > 8);
    if (mobileCta && hero) {
      var contact = document.getElementById('contact');
      var pastHero = y > hero.offsetHeight - 120;
      var atContact = contact && contact.getBoundingClientRect().top < window.innerHeight * 0.6;
      mobileCta.classList.toggle('is-visible', pastHero && !atContact);
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile navigation ---------- */
  var toggle = document.querySelector('.nav-toggle');
  var menu = document.getElementById('nav-menu');
  function setMenu(open) {
    if (!toggle || !menu) return;
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    menu.classList.toggle('is-open', open);
    document.body.classList.toggle('nav-open', open);
  }
  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      setMenu(toggle.getAttribute('aria-expanded') !== 'true');
    });
    menu.addEventListener('click', function (e) {
      if (e.target.closest('a')) setMenu(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.classList.contains('is-open')) { setMenu(false); toggle.focus(); }
    });
    window.matchMedia('(min-width: 901px)').addEventListener('change', function (mq) { if (mq.matches) setMenu(false); });
  }

  /* ---------- Active nav link ---------- */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav-links a[href^="#"]'));
  if ('IntersectionObserver' in window && navLinks.length) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navLinks.forEach(function (a) {
          a.toggleAttribute('aria-current', a.getAttribute('href') === '#' + entry.target.id);
          if (a.hasAttribute('aria-current')) a.setAttribute('aria-current', 'true');
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    navLinks.forEach(function (a) {
      var s = document.querySelector(a.getAttribute('href'));
      if (s) spy.observe(s);
    });
  }

  /* ---------- Reveal on scroll ---------- */
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add('is-in'); io.unobserve(entry.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ---------- Hero photo fallback ---------- */
  var portrait = document.getElementById('hero-portrait');
  if (portrait) {
    var img = portrait.querySelector('img');
    var markMissing = function () { portrait.classList.add('is-missing'); };
    if (img) {
      img.addEventListener('error', markMissing);
      if (img.complete && img.naturalWidth === 0) markMissing();
    }
  }

  /* ---------- Year ---------- */
  document.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* ---------- Contact form ---------- */
  var form = document.getElementById('contact-form');
  if (!form) return;

  var status = form.querySelector('.form-status');
  var submitBtn = form.querySelector('#f-submit');
  var consultFields = form.querySelectorAll('.consult-only');
  var msgOpt = document.getElementById('msg-opt');
  var message = form.querySelector('#f-message');

  function mode() {
    var checked = form.querySelector('input[name="request_type"]:checked');
    return checked && checked.value === 'General message' ? 'message' : 'consult';
  }
  function applyMode() {
    var isConsult = mode() === 'consult';
    consultFields.forEach(function (f) { f.hidden = !isConsult; });
    if (msgOpt) msgOpt.hidden = !isConsult;
    message.required = !isConsult;
    submitBtn.firstChild.nodeValue = isConsult ? 'Request Consultation ' : 'Send Message ';
  }
  form.addEventListener('change', function (e) { if (e.target.name === 'request_type') applyMode(); });
  applyMode();

  // Any "consultation" CTA preselects the consultation tab.
  document.querySelectorAll('[data-intent="consultation"]').forEach(function (a) {
    a.addEventListener('click', function () {
      var r = form.querySelector('input[value="Consultation request"]');
      if (r && !r.checked) { r.checked = true; applyMode(); }
    });
  });

  function setError(input, msg) {
    var field = input.closest('.field');
    var err = field && field.querySelector('.field-error');
    if (field) field.classList.toggle('has-error', !!msg);
    if (err) err.textContent = msg || '';
    input.setAttribute('aria-invalid', msg ? 'true' : 'false');
  }
  function validate() {
    var ok = true, first = null;
    var name = form.elements.name, phone = form.elements.phone, email = form.elements.email;
    var checks = [
      [name, name.value.trim().length < 2 ? 'Please enter your name.' : ''],
      [phone, phone.value.replace(/\D/g, '').length < 10 ? 'Please enter a valid phone number.' : ''],
      [email, email.value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim()) ? 'Please enter a valid email address.' : ''],
      [message, message.required && message.value.trim().length < 5 ? 'Please include a short message.' : '']
    ];
    checks.forEach(function (c) {
      setError(c[0], c[1]);
      if (c[1]) { ok = false; if (!first) first = c[0]; }
    });
    if (first) first.focus();
    return ok;
  }
  form.addEventListener('input', function (e) {
    if (e.target.getAttribute('aria-invalid') === 'true') setError(e.target, '');
  });

  function showStatus(kind, html) {
    status.className = 'form-status is-visible is-' + kind;
    status.innerHTML = html;
  }
  function escapeHtml(s) {
    return s.replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; });
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    status.className = 'form-status';
    if (!validate()) return;

    var firstName = escapeHtml(form.elements.name.value.trim().split(/\s+/)[0]);
    var endpoint = form.getAttribute('data-endpoint');

    if (!endpoint) {
      // No delivery service configured yet — be honest and route the visitor to the phone.
      showStatus('success', 'Thank you, ' + firstName + '. To confirm your ' +
        (mode() === 'consult' ? 'consultation' : 'request') + ', please call us at <a href="' + PHONE_TEL + '">' + PHONE_DISPLAY +
        '</a> during business hours (Mon–Fri 10–6, Sat 10–4).');
      return;
    }

    submitBtn.disabled = true;
    fetch(endpoint, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
      .then(function (res) {
        if (!res.ok) throw new Error('Request failed');
        form.reset(); applyMode();
        showStatus('success', 'Thank you, ' + firstName + '. Your request has been received — we\'ll be in touch during business hours.');
      })
      .catch(function () {
        showStatus('error', 'Sorry, something went wrong sending your request. Please call us at <a href="' + PHONE_TEL + '">' + PHONE_DISPLAY + '</a>.');
      })
      .then(function () { submitBtn.disabled = false; });
  });
})();
