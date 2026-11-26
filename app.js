/* Lakexplorer site: renders content.js, plus a browser-side admin editor. */
(function () {
  'use strict';
  document.documentElement.classList.add('js');
  var PASS_HASH = '1283c3208f20aa73810d3f0895f62d792eb3c10c8bb50e06aa19f5b8b8c4f24f', SALT = 'lakexplorer-v1', ITER = 150000;
  var DEF = window.SITE_CONTENT;
  var clone = function (o) { return JSON.parse(JSON.stringify(o)); };
  var C = clone(DEF), admin = sessionStorage.getItem('lx_admin') === '1', cur = 0;
  if (admin) { try { var d = localStorage.getItem('lx_draft'); if (d) C = JSON.parse(d); } catch (e) {} }

  var $ = function (s, r) { return (r || document).querySelector(s); };
  function el(t, c, x) { var e = document.createElement(t); if (c) e.className = c; if (x != null) e.textContent = x; return e; }
  function get(o, p) { return p.split('.').reduce(function (a, k) { return a == null ? '' : a[k]; }, o); }
  function digits(s) { return String(s || '').replace(/\D/g, ''); }
  function toast(m) { var t = $('#toast'); t.textContent = m; t.classList.add('on'); setTimeout(function () { t.classList.remove('on'); }, 2400); }
  function ul(id, arr) { var u = $('#' + id); u.textContent = ''; (arr || []).forEach(function (x) { u.appendChild(el('li', '', x)); }); }
  function card(h, rows) { var c = el('div', 'card tilt rv'); c.appendChild(el('h3', '', h)); rows.forEach(function (r) { c.appendChild(r); }); return c; }
  function line(label, text) { var p = el('p'); if (label) p.appendChild(el('b', '', label + ' ')); p.appendChild(document.createTextNode(text || '')); return p; }
  function link(href, text) { var p = el('p'), a = el('a', '', text); a.href = href; a.target = '_blank'; a.rel = 'noopener'; p.appendChild(a); return p; }

  function render() {
    document.title = C.siteTitle || document.title;
    [].forEach.call(document.querySelectorAll('[data-bind]'), function (n) { n.textContent = get(C, n.dataset.bind); });
    var chips = $('#chips'); chips.textContent = '';
    (C.hero.chips || []).forEach(function (x) { chips.appendChild(el('span', 'chip', x)); });
    var oc = $('#overviewCards'); oc.textContent = '';
    (C.overview || []).forEach(function (o) { oc.appendChild(card(o.title, [line('', o.text)])); });
    var tabs = $('#tabs'); tabs.textContent = '';
    if (cur >= (C.days || []).length) cur = 0;
    (C.days || []).forEach(function (d, i) {
      var b = el('button', 'tab', d.tab); b.setAttribute('role', 'tab'); b.setAttribute('aria-selected', i === cur);
      b.onclick = function () { cur = i; render(); }; tabs.appendChild(b);
    });
    var day = $('#day'); day.textContent = '';
    var d = (C.days || [])[cur];
    if (d) {
      day.appendChild(el('h3', '', d.title)); day.lastChild.style.fontSize = '1.25rem';
      (d.slots || []).forEach(function (s) {
        var row = el('div', 'slot'); row.appendChild(el('b', '', s.when));
        var u = el('ul'); (s.items || []).forEach(function (x) { u.appendChild(el('li', '', x)); });
        row.appendChild(u); day.appendChild(row);
      });
    }
    ul('optional', C.optional); ul('contingencies', C.contingencies); ul('inclusions', C.inclusions);
    ul('exclusions', C.exclusions); ul('documents', C.documents); ul('terms-list', C.terms);
    var rt = $('#routes'); rt.textContent = '';
    (C.routes || []).forEach(function (r) { var rows = [line('Arriving:', r.arriving), line('Departing:', r.departing)]; if (r.note) { var nt = line('', r.note); nt.style.fontStyle = 'italic'; rows.push(nt); } rt.appendChild(card(r.title, rows)); });
    var k = C.contact || {}, cc = $('#contactCards'); cc.textContent = '';
    var w1 = digits(k.whatsapp), w2 = digits(k.whatsapp2), msg = encodeURIComponent(k.whatsappMessage || '');
    var phones = [k.phone, k.phone2].filter(Boolean);
    if (w1 || w2) cc.appendChild(card('WhatsApp', [w1, w2].filter(Boolean).map(function (n) { return link('https://wa.me/' + n + '?text=' + msg, '+' + n); })));
    if (phones.length) cc.appendChild(card('Call us', phones.map(function (p) { return link('tel:' + p.replace(/[^\d+]/g, ''), p); })));
    if (k.email) cc.appendChild(card('Email', [link('mailto:' + k.email, k.email)]));
    if (k.instagram) { var h = k.instagram.replace(/^.*instagram\.com\//, '').replace(/[@\/]/g, ''); cc.appendChild(card('Instagram', [link('https://instagram.com/' + h, '@' + h)])); }
    if (k.address) cc.appendChild(card('Address', [line('', k.address)]));
    var fl = $('#waFloat'); fl.hidden = !w1; if (w1) fl.href = 'https://wa.me/' + w1 + '?text=' + msg;
    var aw = $('#adviceWa'); aw.hidden = !w1;
    if (w1) aw.href = 'https://wa.me/' + w1 + '?text=' + encodeURIComponent('Hello Lakexplorer, please suggest the best ship/flight connection for the Kadmat & Amini 3N/4D trip. My travel dates are: ');
    $('#sendWa2').hidden = !w2;
    ['selArr', 'selDep'].forEach(function (id) {
      var s = $('#' + id), v = s.value; s.textContent = '';
      (C.connectionOptions || []).forEach(function (o) { s.appendChild(el('option', '', o)); });
      if (v) s.value = v;
    });
    observe();
  }

  /* reveal + tilt */
  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: .1 }) : null;
  function observe() { [].forEach.call(document.querySelectorAll('.rv:not(.in)'), function (n) { if (io) io.observe(n); else n.classList.add('in'); }); }
  document.addEventListener('pointermove', function (e) {
    var c = e.target.closest && e.target.closest('.tilt'); if (!c) return;
    var r = c.getBoundingClientRect();
    c.style.setProperty('--ry', ((e.clientX - r.left) / r.width - .5) * 10 + 'deg');
    c.style.setProperty('--rx', (.5 - (e.clientY - r.top) / r.height) * 10 + 'deg');
  });
  document.addEventListener('pointerout', function (e) { var c = e.target.closest && e.target.closest('.tilt'); if (c) { c.style.setProperty('--rx', '0deg'); c.style.setProperty('--ry', '0deg'); } });

  /* enquiry form */
  function field(n) { return $('#f [name="' + n + '"]'); }
  function summary() {
    var rows = [['Name', 'Name'], ['Phone', 'Phone'], ['Email', 'Email'], ['Travellers', 'Number of travellers'], ['Arrival date', 'Arrival date'],
      ['Departure date', 'Departure date'], ['Arrival point', 'Arrival point'], ['Departure point', 'Departure point'], ['Tickets', 'Ship / flight tickets'],
      ['Travellers list', 'Traveller details'], ['Requests', 'Special requests']];
    var t = '*Lakexplorer enquiry: Kadmat & Amini 3N/4D*\n';
    rows.forEach(function (r) { var v = field(r[0]).value.trim(); if (v) t += '\n' + r[1] + ': ' + v; });
    t += '\n\nPlease confirm availability and suggest the best ship / flight connection for these dates.';
    return t;
  }
  function valid() {
    var need = ['Name', 'Phone', 'Arrival date'], miss = need.filter(function (n) { return !field(n).value.trim(); });
    if (miss.length) { toast('Please fill: ' + miss.join(', ')); field(miss[0]).focus(); return false; }
    return true;
  }
  function sendWa(n) {
    if (!n) return toast('WhatsApp number not set yet');
    if (valid()) window.open('https://wa.me/' + n + '?text=' + encodeURIComponent(summary()), '_blank');
  }
  $('#sendWa').onclick = function () { sendWa(digits((C.contact || {}).whatsapp)); };
  $('#sendWa2').onclick = function () { sendWa(digits((C.contact || {}).whatsapp2)); };
  $('#sendMail').onclick = function () {
    var m = (C.contact || {}).email;
    if (!m) return toast('Email not set yet');
    if (valid()) location.href = 'mailto:' + m + '?subject=' + encodeURIComponent('Kadmat & Amini 3N/4D enquiry') + '&body=' + encodeURIComponent(summary());
  };
  $('#copy').onclick = function () {
    try { navigator.clipboard.writeText(summary()).then(function () { toast('Summary copied'); }, function () { toast('Copy blocked by the browser'); }); } catch (e) { toast('Copy not available'); }
  };

  /* ---------------- admin ---------------- */
  function pbkdf2(pw) {
    var enc = new TextEncoder();
    return crypto.subtle.importKey('raw', enc.encode(pw), 'PBKDF2', false, ['deriveBits']).then(function (k) {
      return crypto.subtle.deriveBits({ name: 'PBKDF2', salt: enc.encode(SALT), iterations: ITER, hash: 'SHA-256' }, k, 256);
    }).then(function (b) { return [].map.call(new Uint8Array(b), function (x) { return ('0' + x.toString(16)).slice(-2); }).join(''); });
  }
  function login() {
    if ($('.modal')) return;
    var m = el('div', 'modal'), p = el('div', 'panel');
    p.appendChild(el('h3', '', 'Admin login'));
    var i = el('input'); i.type = 'password'; i.placeholder = 'Password'; i.autocomplete = 'current-password';
    var err = el('div', 'err'), go = el('button', 'btn', 'Sign in'), x = el('button', 'btn ghost', 'Cancel');
    function submit() {
      go.disabled = true;
      pbkdf2(i.value).then(function (h) {
        if (h === PASS_HASH) { sessionStorage.setItem('lx_admin', '1'); admin = true; m.remove(); try { var d = localStorage.getItem('lx_draft'); if (d) C = JSON.parse(d); } catch (e) {} render(); openAdmin(); }
        else { err.textContent = 'Incorrect password'; setTimeout(function () { go.disabled = false; }, 1200); }
      }, function () { err.textContent = 'Login needs HTTPS (GitHub Pages) or localhost'; go.disabled = false; });
    }
    go.onclick = submit; x.onclick = function () { m.remove(); history.replaceState(null, '', location.pathname); };
    i.onkeydown = function (e) { if (e.key === 'Enter') submit(); };
    [i, err, go, x].forEach(function (n) { p.appendChild(n); }); m.appendChild(p); document.body.appendChild(m); i.focus();
  }
  function human(k) { return k.replace(/([A-Z])/g, ' $1').replace(/^./, function (c) { return c.toUpperCase(); }); }
  function blank(v) {
    if (typeof v === 'string') return '';
    if (Array.isArray(v)) return v.length && typeof v[0] === 'object' ? [blank(v[0])] : [];
    if (v && typeof v === 'object') { var o = {}; Object.keys(v).forEach(function (k) { o[k] = blank(v[k]); }); return o; }
    return v;
  }
  var t;
  function changed() { clearTimeout(t); t = setTimeout(render, 250); }
  function editor(obj, host) {
    Object.keys(obj).forEach(function (k) {
      var v = obj[k];
      if (typeof v === 'string') {
        var l = el('label', '', human(k)), f = v.length > 70 || k === 'text' ? el('textarea') : el('input');
        if (f.tagName === 'TEXTAREA') f.rows = 3; f.value = v;
        f.oninput = function () { obj[k] = f.value; changed(); }; l.appendChild(f); host.appendChild(l);
      } else if (Array.isArray(v) && (!v.length || typeof v[0] === 'string')) {
        var l2 = el('label', '', human(k) + ' (one per line)'), ta = el('textarea'); ta.rows = Math.min(8, Math.max(3, v.length)); ta.value = v.join('\n');
        ta.oninput = function () { obj[k] = ta.value.split('\n').filter(function (s) { return s.trim(); }); changed(); }; l2.appendChild(ta); host.appendChild(l2);
      } else if (Array.isArray(v)) {
        var fs = el('fieldset'); fs.appendChild(el('legend', '', human(k)));
        v.forEach(function (item, i) {
          var sub = el('fieldset'); sub.appendChild(el('legend', '', human(k) + ' ' + (i + 1)));
          editor(item, sub);
          var rm = el('button', 'btn ghost sm', 'Remove'); rm.type = 'button';
          rm.onclick = function () { if (confirm('Remove this item?')) { v.splice(i, 1); rebuild(); } }; sub.appendChild(rm); fs.appendChild(sub);
        });
        var add = el('button', 'btn sm', '+ Add ' + human(k)); add.type = 'button';
        add.onclick = function () { v.push(v.length ? blank(v[0]) : {}); rebuild(); }; fs.appendChild(add); host.appendChild(fs);
      } else if (v && typeof v === 'object') {
        var fo = el('fieldset'); fo.appendChild(el('legend', '', human(k))); editor(v, fo); host.appendChild(fo);
      }
    });
  }
  function rebuild() { var b = $('#adm .body'); if (!b) return; var y = b.scrollTop; b.textContent = ''; editor(C, b); b.scrollTop = y; render(); }
  function btn(txt, fn, cls) { var b = el('button', 'btn sm' + (cls ? ' ' + cls : ''), txt); b.type = 'button'; b.onclick = fn; return b; }
  function openAdmin() {
    if ($('#adm')) return;
    var a = el('aside'); a.id = 'adm';
    var hd = el('header'); hd.appendChild(el('strong', '', 'Admin editor'));
    hd.appendChild(btn('Save draft', function () { localStorage.setItem('lx_draft', JSON.stringify(C)); toast('Draft saved in this browser'); }));
    hd.appendChild(btn('Download content.js', function () {
      var blob = new Blob(['window.SITE_CONTENT = ' + JSON.stringify(C, null, 2) + ';\n'], { type: 'text/javascript' });
      var u = URL.createObjectURL(blob), l = el('a'); l.href = u; l.download = 'content.js'; l.click(); setTimeout(function () { URL.revokeObjectURL(u); }, 500);
    }));
    var imp = el('input'); imp.type = 'file'; imp.accept = '.js,.json'; imp.hidden = true;
    imp.onchange = function () {
      var r = new FileReader(); r.onload = function () { try { C = JSON.parse(r.result.replace(/^[^{]*/, '').replace(/;\s*$/, '')); rebuild(); toast('Imported'); } catch (e) { toast('Not a valid content file'); } }; r.readAsText(imp.files[0]);
    };
    hd.appendChild(btn('Import', function () { imp.click(); })); hd.appendChild(imp);
    hd.appendChild(btn('Reset', function () { if (confirm('Discard the draft and go back to the published content?')) { localStorage.removeItem('lx_draft'); C = clone(DEF); rebuild(); } }, 'ghost'));
    hd.appendChild(btn('Close', function () { a.remove(); }, 'ghost'));
    hd.appendChild(btn('Log out', function () { sessionStorage.removeItem('lx_admin'); admin = false; a.remove(); C = clone(DEF); render(); }, 'ghost'));
    var n = el('p', 'note', 'Edits show live here. To publish them for every visitor, click Download content.js and replace content.js in your GitHub repository.');
    n.style.padding = '8px 16px 0';
    var body = el('div', 'body'); a.appendChild(hd); a.appendChild(n); a.appendChild(body); document.body.appendChild(a); editor(C, body);
  }
  function entry() { if (admin) openAdmin(); else login(); }
  $('#adminLink').onclick = function (e) { e.preventDefault(); entry(); };
  if (location.hash === '#admin') entry();
  addEventListener('hashchange', function () { if (location.hash === '#admin') entry(); });

  render();
})();
