/* SIAP-KERJA — logika halaman login */
(function () {
const $ = id => document.getElementById(id);
$('tm').textContent = document.documentElement.classList.contains('dark') ? '☀️' : '🌙';
(function () {
  const y = new Date().getFullYear(), s = $('thn');
  [y + 1, y, y - 1, y - 2].forEach(v => s.add(new Option('Tahun Anggaran ' + v, v, v == y, v == y)));
  s.value = y; $('tt').textContent = 'Tahun Anggaran ' + y; $('cp').textContent = 'Copyright 2026 - ' + y + ', SIAP-KERJA - Surat Perintah Kerja Elektronik.';
  // partikel animasi
  if (matchMedia('(min-width:768px)').matches) for (let i = 0; i < 24; i++) {
    const p = document.createElement('span'); p.className = 'pt';
    p.style.cssText = `left:${Math.random() * 100}%;animation-duration:${8 + Math.random() * 12}s;animation-delay:${-Math.random() * 15}s;width:${2 + Math.random() * 3}px;height:${2 + Math.random() * 3}px`;
    $('L').appendChild(p);
  }
  // deteksi browser
  const u = navigator.userAgent; let n = 'Browser', v = 0, m;
  if (m = u.match(/Edg\/(\d+)/)) { n = 'Microsoft Edge'; v = +m[1]; }
  else if (m = u.match(/Firefox\/(\d+)/)) { n = 'Mozilla Firefox'; v = +m[1]; }
  else if (m = u.match(/Chrome\/(\d+)/)) { n = 'Google Chrome'; v = +m[1]; }
  else if (m = u.match(/Version\/(\d+).*Safari/)) { n = 'Safari'; v = +m[1]; }
  const os = /Windows NT 10/.test(u) ? 'Windows 10/11' : /Windows/.test(u) ? 'Windows' : /Android/.test(u) ? 'Android' : /iPhone|iPad/.test(u) ? 'iOS' : /Mac OS/.test(u) ? 'macOS' : /Linux/.test(u) ? 'Linux' : '';
  const ok = m && ((n == 'Google Chrome' && v >= 90) || (n == 'Microsoft Edge' && v >= 90) || (n == 'Mozilla Firefox' && v >= 88) || (n == 'Safari' && v >= 14));
  $('br').textContent = n + (v ? ' ' + v : '') + (os ? ' di ' + os : '') + '. ' + (ok ? 'Browser Anda didukung.' : 'Disarankan memakai Chrome/Edge versi terbaru.');
  if (!ok) $('dot').className = 'w-2 h-2 rounded-full bg-amber-500 inline-block';
})();
function showSetup() { $('fm').classList.add('hidden'); $('su').classList.remove('hidden'); setTimeout(fit, 0); }
/** Logo & status setup dari server (logo disimpan di browser agar tampil instan pada kunjungan berikutnya). */
function setLogo(src) {
  const im = $('lgimg'); if (!src || !im) return;
  if (im.getAttribute('src') !== src) { im.addEventListener('load', fit, {once: true}); im.src = src; }
  im.classList.remove('hidden'); $('lgsvg').classList.add('hidden'); stk(im);
  $('mlogo').src = src; $('mlogo').classList.remove('hidden'); $('msvg').classList.add('hidden');
}
try { setLogo(localStorage.getItem('sk_logo')); } catch (x) {}
if (!API.ready()) {
  $('err').textContent = 'Alamat backend (GAS_URL) belum diisi di js/config.js.';
} else {
  API.run.withSuccessHandler(r => {
    try { if (r.logo) localStorage.setItem('sk_logo', r.logo); else localStorage.removeItem('sk_logo'); } catch (x) {}
    if (r.logo) setLogo(r.logo);
    if (r.setup) showSetup();
  }).withFailureHandler(x => { $('err').textContent = 'Server belum dapat dihubungi: ' + x.message; }).infoPublik();
}
function setup(ev) {
  ev.preventDefault();
  const g = i => $(i).value.trim(), b = $('s_btn'), er = $('s_err');
  if ($('s_pw').value !== $('s_pw2').value) { er.textContent = 'Kata sandi tidak sama.'; return false; }
  b.disabled = true; b.textContent = 'Membuat akun...'; er.textContent = '';
  const fail = m => { er.textContent = m; b.disabled = false; b.textContent = 'Buat Akun & Masuk'; };
  API.run.withSuccessHandler(r => {
    if (!r.ok) return fail(r.msg);
    $('su').classList.add('hidden'); $('fm').classList.remove('hidden');
    $('usr').value = g('s_usr'); $('pwd').value = $('s_pw').value; cek(); masuk({preventDefault() {}});
  }).withFailureHandler(x => fail('Gagal: ' + x.message)).setupAdmin(g('s_kode'), g('s_usr'), $('s_pw').value, g('s_nama'), $('s_jab').value);
  return false;
}
function stk(im){if(!im)return;const f=()=>{try{const w=64,h=Math.max(1,Math.round(w*im.naturalHeight/im.naturalWidth)),c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');x.drawImage(im,0,0,w,h);const d=x.getImageData(0,0,w,h).data;let o=0,k=0;for(let i=0;i<d.length;i+=4)if(d[i+3]>128){o++;if(d[i]+d[i+1]+d[i+2]<150)k++}if(o&&k/o>.06)im.classList.add('sticker')}catch(e){}};if(im.complete&&im.naturalWidth)f();else im.addEventListener('load',f)}
function cek() {
  const on = $('usr').value.trim() && $('pwd').value;
  $('btn').disabled = !on; $('btn').classList.toggle('on', !!on); $('err').textContent = '';
}
function masuk(ev) {
  ev.preventDefault();
  const b = $('btn'); if (b.disabled) return false;
  b.disabled = true; b.textContent = 'Memeriksa akun...';
  API.run.withSuccessHandler(r => {
    if (r.ok) {
      b.textContent = '✔ Berhasil, memuat sistem...';
      API.setToken(r.token);
      try { sessionStorage.setItem('sk_boot', JSON.stringify({sesi: r.sesi, data: r.data || null})); } catch (x) {}
      location.replace('app.html');
    } else {
      $('err').textContent = r.msg; b.textContent = 'Masuk Ke Sistem'; b.disabled = false;
      $('fm').classList.remove('shake'); void $('fm').offsetWidth; $('fm').classList.add('shake');
    }
  }).withFailureHandler(x => { $('err').textContent = 'Gagal terhubung: ' + x.message; b.textContent = 'Masuk Ke Sistem'; b.disabled = false; })
    .login($('usr').value.trim(), $('pwd').value, $('thn').value);
  return false;
}
/** Perbesar tampilan login hingga 150% (zoom), tetapi otomatis dikecilkan bila layar/bingkai tidak cukup; di HP tidak diperbesar. */
function fit() {
  const els = [$('lb'), $('fm'), $('su'), $('cp')].filter(Boolean);
  els.forEach(x => { x.style.zoom = 1; });
  if (window.innerWidth < 768 || !$('lb')) return;
  const f = $('su') && !$('su').classList.contains('hidden') ? $('su') : $('fm'), lp = $('L'), lb = $('lb');
  const zf = Math.min((f.parentElement.clientWidth - 48) / f.offsetWidth, (window.innerHeight - 110) / f.offsetHeight);
  const zl = Math.min((lp.clientWidth - 48) / lb.offsetWidth, (window.innerHeight - 40) / lb.offsetHeight);
  const z = Math.max(1, Math.min(1.5, zf, zl));
  els.forEach(x => { x.style.zoom = z; });
}
window.fit = fit; window.addEventListener('resize', fit);
if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
setTimeout(fit, 0);
window.masuk = masuk; window.cek = cek; window.setup = setup;
if (API.token()) location.replace('app.html'); // sudah login → langsung ke aplikasi (token diperiksa di sana)
})();
