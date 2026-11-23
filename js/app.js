/* SIAP-KERJA — logika aplikasi (frontend). Komunikasi server lewat js/api.js. */
var ST = ['spk','bapp','baphp','bast','bap','kuitansi'];
var SL = {spk:['Penerbitan SPK','bg-slate-100 text-slate-600 border-slate-200'],bapp:['Verifikasi BAPP','bg-blue-50 text-blue-700 border-blue-200'],baphp:['Menunggu BAPHP','bg-amber-50 text-amber-700 border-amber-200'],bast:['Tanda Tangan BAST','bg-sky-50 text-sky-700 border-sky-200'],bap:['Proses BAP Keuangan','bg-rose-50 text-rose-700 border-rose-200'],kuitansi:['Kuitansi Cair','bg-emerald-50 text-emerald-700 border-emerald-200']};
var PCT = {spk:15,bapp:40,baphp:60,bast:80,bap:90,kuitansi:100};
var PIPE = [['spk','SPK','Surat Perintah Kerja','Terbit & Aktif','blue'],['bapp','BAPP','Berita Acara Penyelesaian Pekerjaan','Uji Fisik & Fungsi','orange'],['baphp','BAPHP','Berita Acara Pemeriksaan Hasil Pekerjaan','Verifikasi Berkas','blue'],['bast','BAST','Serah Terima Hasil Pekerjaan','Tanda Tangan E-Sign','sky'],['bap','BAP','Berita Acara Pembayaran','Validasi Keuangan','indigo'],['kuitansi','Kuitansi / SPM','Pencairan Dana Vendor','Selesai / Cair','emerald']];
var MENU = [['dash','Dashboard','<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>'],['ang','Anggaran','<path d="M12 3v18M17 7H9.5a2.5 2.5 0 0 0 0 5h5a2.5 2.5 0 0 1 0 5H6"/>'],['bbm','BBM','<path d="M3 22h12M4 9h10M5 22V4a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v18M15 13h2a2 2 0 0 1 2 2v2a2 2 0 0 0 4 0V9l-3-3"/>'],['rek','Rekanan','<path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6"/>'],['buat',' SPK/SPB/SP Baru','<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M12 11v6M9 14h6"/>'],['dok','BAPP/BAPHP/BAST/BAP','<path d="M5 4h14v16H5z"/><path d="M9 9h6M9 13h6M9 17h3"/>'],['cetak','Cetak Dokumen','<path d="M6 9V3h12v6M6 18H4a1 1 0 0 1-1-1v-6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v6a1 1 0 0 1-1 1h-2"/><path d="M6 14h12v7H6z"/>'],['verif','Verifikasi Lapangan','<path d="M9 11l3 3 8-8"/><path d="M20 12v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h9"/>'],['keu','Penyelesaian Keuangan','<path d="M3 7h16a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M3 7l12-4v4M17 14h2"/>'],['usr','Pengguna','<circle cx="9" cy="8" r="3"/><path d="M3 20v-1a5 5 0 0 1 10 0v1M16 11a3 3 0 1 0 0-6M21 20v-1a4 4 0 0 0-4-4"/>'],['set','Pengaturan','<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/>']];
var S = {rows:[],set:{},log:[]}, view = 'dash', tab = 'all', q = '', pg = 1, files = [], fund = '';
var PS = 8;
var OPU = {op_umum: 'umum', op_bupati: 'bupati', op_wabup: 'wabup', op_sekda: 'setda'};
var ROLE_LBL = {user: 'Pengguna', admin: 'Administrator', op_umum: 'Op Bag. Umum', op_bupati: 'Op Bupati', op_wabup: 'Op Wabup', op_sekda: 'Op Sekda'};
var canMenu = k => { const r = window.SESI && SESI.role; if (OPU[r]) return ['dash', 'buat', 'dok', 'keu', 'rek', 'bbm'].includes(k); return r == 'admin' || (k != 'ang' && k != 'usr'); };

var e = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
var rp = n => 'Rp ' + (+n || 0).toLocaleString('id-ID');
/** Pembulatan rupiah: 0,5 ke atas dibulatkan naik, di bawah 0,5 dibulatkan turun. */
var rd = n => Math.round((+n || 0) + 1e-9);
var uid = () => (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : 'x' + Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
/** Tarif efektif & label pajak (sudah termasuk dalam harga) menurut kategori pengadaan. */
var KAT_BOGA = 'Jasa Boga (Catering)';
var ppnR = k => k == KAT_BOGA ? 0.10 : 0.11;
var ppnLbl = k => k == KAT_BOGA ? 'PPN (10%)' : 'PPN (12%)';
var $ = id => document.getElementById(id);
var cnt = k => S.rows.filter(r => r.tahap == k).length;
var sisa = r => { if (!r.selesai) return '-'; const d = Math.ceil((new Date(r.selesai) - new Date()) / 864e5); return d >= 0 ? 'Sisa ' + d + ' hr' : 'Lewat ' + (-d) + ' hr'; };

var refSeq = 0, firstLoad = true, lastRef = 0;

function stk(im){if(!im)return;const f=()=>{try{const w=64,h=Math.max(1,Math.round(w*im.naturalHeight/im.naturalWidth)),c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');x.drawImage(im,0,0,w,h);const d=x.getImageData(0,0,w,h).data;let o=0,k=0;for(let i=0;i<d.length;i+=4)if(d[i+3]>128){o++;if(d[i]+d[i+1]+d[i+2]<150)k++}if(o&&k/o>.06)im.classList.add('sticker')}catch(e){}};if(im.complete&&im.naturalWidth)f();else im.addEventListener('load',f)}
function init() {
  if (window.SESI && OPU[SESI.role]) document.querySelectorAll('[onclick*="showLog()"]').forEach(b => { b.style.display = 'none'; });
  S.set = Object.assign({}, DEFSET, S.set);
  if (window.SESI) { S.set.tahun = SESI.tahun || S.set.tahun; if (SESI.nama) S.set.nama = SESI.nama; if (SESI.jabatan) S.set.jabatan = SESI.jabatan; }
  $('tm').textContent = document.documentElement.classList.contains('dark') ? '☀️' : '🌙';
  if ($('thn')) $('thn').textContent = S.set.tahun;
  $('role').textContent = 'Halo, ' + ((window.SESI && SESI.nama) || S.set.nama || (window.SESI && SESI.u) || '-') + ' - Selamat Bekerja';
  draw();
}
function go(v) { view = v; if (v == 'usr') U = null; pg = 1; lpg = 1; tab = 'all'; if (v == 'buat') files = []; draw(); scrollTo(0, 0); closeNav(); soft(); }
/** Status sub-menu yang ditutup manual (klik kedua pada menu induk). */
var NAVX = {};
function navGrp(k, dst) {
  if (String(view).startsWith(k)) { NAVX[k] = !NAVX[k]; draw(); } // sudah di menu ini → buka/tutup sub-menu
  else { NAVX[k] = false; go(dst); }                              // menu lain → pindah & buka sub-menu
}
function draw() {
  if (!canMenu(String(view).split(':')[0])) view = 'dash';
  const nav = (cls, on, hz) => MENU.filter(m => canMenu(m[0])).map(m => {
    const grp = m[0] == 'ang' || m[0] == 'bbm', inGrp = grp && view.startsWith(m[0]), open = inGrp && !NAVX[m[0]], act = m[0] == view || inGrp;
    const dst = m[0] == 'ang' ? 'ang:umum' : m[0] == 'bbm' ? 'bbm:reg' : m[0];
    return `<a onclick="${grp ? `navGrp('${m[0]}','${dst}')` : `go('${dst}')`}" class="${cls} ${act ? on : 'text-slate-600 hover:bg-slate-100'} cursor-pointer"><svg class="ic" viewBox="0 0 24 24">${m[2]}</svg>${m[1]}${m[0] == 'verif' && cnt('bapp') + cnt('baphp') ? `<span class="ml-auto bg-rose-500 text-white text-[10px] font-bold rounded-full px-1.5">${cnt('bapp') + cnt('baphp')}</span>` : ''}${grp ? `<span class="ml-auto text-slate-400">${open ? '⌄' : '›'}</span>` : ''}</a>`
      + (m[0] == 'ang' && open ? `<div style="margin:2px 0 6px 22px;padding-left:9px">${ANG.map(u => { const on = view == 'ang:' + u[0];
          return `<a onclick="go('ang:${u[0]}')" class="flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs cursor-pointer ${on ? 'text-brand font-semibold' : 'text-slate-500 hover:bg-slate-100'}"><span style="width:6px;height:6px;border-radius:50%;flex-shrink:0;background:${on ? '#1d5fd8' : '#cbd5e1'}"></span>${u[1]}</a>`; }).join('')}</div>` : '')
      + (m[0] == 'bbm' && open ? `<div style="margin:2px 0 6px 22px;padding-left:9px">${BBM_SUB.map(u => { const on = view == 'bbm:' + u[0];
          return `<a onclick="go('bbm:${u[0]}')" class="flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs cursor-pointer ${on ? 'text-brand font-semibold' : 'text-slate-500 hover:bg-slate-100'}"><span style="width:6px;height:6px;border-radius:50%;flex-shrink:0;background:${on ? '#1d5fd8' : '#cbd5e1'}"></span>${u[1]}</a>`; }).join('')}</div>` : '');
  }).join('');
  $('nv').innerHTML = nav('flex items-center gap-2.5 px-3 py-2 rounded-lg font-medium', 'bg-blue-50 text-brand font-semibold');
  $('v').innerHTML = view == 'dash' ? dash() : view == 'buat' ? spbList() : view == 'dok' ? dokView() : view == 'usr' ? userView() : view == 'cetak' ? cetakView() : view == 'rek' ? rekView() : view.startsWith('bbm') ? bbmView()  : view.startsWith('ang') ? angView() : view == 'verif' ? queue('Verifikasi Lapangan', 'Pemeriksaan fisik & fungsi pekerjaan sebelum BAST.', ['spk', 'bapp', 'baphp']) : view == 'keu' ? queue('Penyelesaian Keuangan', 'Serah terima, pembayaran, dan pencairan dana vendor.', ['bast', 'bap']) : pengaturan();
  labelTables();
}

/* ---------- DASHBOARD ---------- */
function dash() {
  const aktif = S.rows.filter(r => r.tahap != 'kuitansi'), cair = S.rows.filter(r => r.tahap == 'kuitansi');
  const sum = a => a.reduce((x, r) => x + (+r.nilai || 0), 0), pct = S.rows.length ? Math.round(cair.length / S.rows.length * 100) : 0;
  const card = (t, n, u, sub, col) => `<div class="bg-white rounded-xl border border-slate-200 p-4"><div class="flex justify-between items-start"><span class="text-slate-500 font-medium">${t}</span><span class="w-7 h-7 rounded-lg grid place-items-center ${col}">●</span></div><div class="mt-2"><span class="text-2xl md:text-3xl font-extrabold">${n}</span> <span class="text-slate-500 text-xs">${u}</span></div><div class="border-t border-slate-100 mt-3 pt-2 text-[11px] text-slate-500">${sub}</div></div>`;
  const rows = S.rows.filter(r => (tab == 'all' || (tab == 'a' && ['spk', 'bapp', 'baphp'].includes(r.tahap)) || (tab == 'b' && ['bast', 'bap'].includes(r.tahap)) || (tab == 'c' && r.tahap == 'bap')) && (!q || JSON.stringify(Object.values(r)).toLowerCase().includes(q)) && (!fund || r.sumber == fund));
  const pages = Math.max(1, Math.ceil(rows.length / PS)); if (pg > pages) pg = pages;
  const slice = rows.slice((pg - 1) * PS, pg * PS);
  const tabs = [['all', 'Semua', S.rows.length], ['a', 'Tahap SPK - BAPHP', S.rows.filter(r => ['spk', 'bapp', 'baphp'].includes(r.tahap)).length], ['b', 'Tahap BAST - BAP', S.rows.filter(r => ['bast', 'bap'].includes(r.tahap)).length], ['c', 'Siap Pencairan', cnt('bap')]];
  const funds = [...new Set(S.rows.map(r => r.sumber).filter(Boolean))];
  return `<div class="flex justify-between items-start flex-wrap gap-2 mb-4"><div><div class="text-[10px] font-bold tracking-widest text-slate-400">MODUL TERPADU PENGADAAN & FINANSIAL <span class="ml-1 bg-emerald-100 text-emerald-700 rounded px-1.5 py-0.5 normal-case tracking-normal">Live Audit</span></div>
  <h1 class="text-xl md:text-2xl font-extrabold mt-1">Dashboard Monitoring Alur Dokumen Pengadaan</h1><p class="text-slate-500 text-xs">Tahun Anggaran ${e(S.set.tahun)} • Status Berjalan • ${e(S.set.jabatan || 'PPTK')}</p></div>
  <div class="text-xs text-slate-500 flex items-center gap-2 no-print">Pembaruan data otomatis: <b class="text-slate-700" id="upd">baru saja</b><button onclick="refresh(1)" title="Muat ulang langsung dari Google Sheets" class="border border-slate-200 rounded-lg px-2 py-1 bg-white hover:bg-slate-50">↻</button></div></div>
  <div class="grid grid-cols-2 xl:grid-cols-4 gap-3 mb-4">
  ${card('SPK Aktif', aktif.length, 'Proyek', 'Total komitmen: <b class="text-slate-700">' + rp(sum(aktif)) + '</b>', 'bg-blue-50 text-brand')}
  ${card('Menunggu BAPHP', cnt('baphp'), 'Berkas', 'Tahap: <b class="text-slate-700">Pemeriksaan hasil pekerjaan</b>', 'bg-orange-50 text-orange-500')}
  ${card('Perlu Tanda Tangan BAST', cnt('bast'), 'Berkas', 'Serah terima hasil pekerjaan • e-sign', 'bg-sky-50 text-sky-600')}
  ${card('Kuitansi Cair', cair.length, 'Dokumen Selesai', 'Nilai cair: <b class="text-slate-700">' + rp(sum(cair)) + '</b> • Penyerapan: <b class="text-emerald-600">' + pct + '%</b>', 'bg-emerald-50 text-emerald-600')}</div>
  <div class="bg-white rounded-xl border border-slate-200 p-4 mb-4"><div class="flex justify-between items-center flex-wrap gap-2 mb-3"><h3 class="font-bold text-sm">Siklus Alur Dokumen Pengadaan Barang & Jasa <span class="ml-1 text-[10px] bg-slate-100 text-slate-500 rounded px-1.5 py-0.5 font-medium">Realtime Pipeline</span></h3>
  <div class="text-[11px] text-slate-500 flex gap-3"><span>● Selesai</span><span class="text-brand">● Tahap Berjalan</span><span class="text-slate-400">● Antrean</span></div></div>
  <div class="grid grid-cols-2 lg:grid-cols-6 gap-2.5">${PIPE.map((p, i) => `<div class="rounded-xl border border-${p[4]}-200 bg-${p[4]}-50/50 p-3 flex flex-col"><div class="flex justify-between items-center"><span class="w-5 h-5 rounded-full bg-${p[4]}-600 text-white text-[10px] font-bold grid place-items-center">${i + 1}</span><span class="text-[10px] font-semibold bg-white border border-${p[4]}-200 text-${p[4]}-700 rounded px-1.5">${cnt(p[0])} ${p[0] == 'kuitansi' ? 'selesai' : 'berkas'}</span></div><div class="font-extrabold mt-2">${p[1]}</div><div class="text-[11px] text-slate-500 leading-snug flex-1">${p[2]}</div><div class="mt-2 pt-2 border-t border-${p[4]}-100 text-[11px] font-semibold text-${p[4]}-700">${p[3]} →</div></div>`).join('')}</div></div>
  <div class="bg-white rounded-xl border border-slate-200"><div class="flex flex-wrap items-center gap-2 p-3 border-b border-slate-100 no-print">${tabs.map(t => `<button onclick="tab='${t[0]}';pg=1;draw()" class="rounded-lg px-3 py-1.5 text-xs font-semibold border ${tab == t[0] ? 'bg-navy text-white border-navy' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}">${t[1]} (${t[2]})</button>`).join('')}
  <select onchange="fund=this.value;pg=1;draw()" class="ml-auto border border-slate-200 rounded-lg px-2 py-1.5 text-xs"><option value="">Filter Sumber Dana (BPP/BLU)</option>${funds.map(f => `<option ${f == fund ? 'selected' : ''}>${e(f)}</option>`).join('')}</select><button onclick="q='';fund='';tab='all';if($('sq'))$('sq').value='';draw()" class="border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-medium">Filter Lanjutan ✕</button></div>
  <div class="tw"><table class="w-full text-left"><thead class="text-[10px] uppercase tracking-wide text-slate-400"><tr><th class="p-3 w-8"></th><th class="p-3">Nama Proyek & No. SPK</th><th class="p-3">Vendor / Rekanan</th><th class="p-3">Nilai Kontrak (IDR)</th><th class="p-3">Tahapan Dokumen</th><th class="p-3">Proses & Waktu</th><th class="p-3 no-print">Aksi</th></tr></thead><tbody class="divide-y divide-slate-100">
  ${slice.map(r => `<tr class="hover:bg-slate-50"><td class="p-3"><input type="checkbox" class="rounded"></td><td class="p-3 max-w-[260px]"><div class="font-semibold whitespace-normal">${e(r.nama)}</div><div class="text-[11px] text-slate-400">${e(r.nomor)}${r.jenis ? ' • ' + e(r.jenis) : ''}${r.status == 'Draft' ? ' <span class="text-amber-600 font-semibold">• Draf</span>' : ''}</div></td><td class="p-3"><div class="font-semibold">${e(r.vendor)}</div><div class="text-[11px] text-slate-400">NPWP: ${e(r.npwp || '-')}</div></td><td class="p-3 font-bold">${rp(r.nilai)}</td><td class="p-3"><span class="inline-block border rounded-md px-2 py-1 text-[11px] font-semibold ${SL[r.tahap][1]}">${SL[r.tahap][0]}</span></td><td class="p-3 w-40"><div class="flex justify-between text-[11px] mb-1"><b>${PCT[r.tahap]}%</b><span class="text-slate-400">${r.tahap == 'kuitansi' ? 'Selesai' : sisa(r)}</span></div><div class="bar"><i style="width:${PCT[r.tahap]}%"></i></div></td><td class="p-3 no-print"><button onclick="pratinjau('${r.id}','spb')" title="Pratinjau dan cetak ${r.jenis == 'SPK' ? 'SPK' : 'SPB'}" class="border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-semibold whitespace-nowrap">🖨 Cetak ${r.jenis == 'SPK' ? 'SPK' : 'SPB'}</button></td></tr>`).join('') || '<tr><td colspan="7" class="p-10 text-center text-slate-400">Belum ada data.</td></tr>'}</tbody></table></div>
  <div class="flex justify-between items-center p-3 border-t border-slate-100 text-xs text-slate-500 no-print"><span>Menampilkan ${rows.length ? (pg - 1) * PS + 1 : 0}–${Math.min(pg * PS, rows.length)} dari ${rows.length} pengajuan</span><div class="flex gap-1"><button ${pg < 2 ? 'disabled' : ''} onclick="pg--;draw()" class="border rounded-md px-2.5 py-1 disabled:opacity-40">‹</button><span class="px-2 py-1 rounded-md bg-navy text-white font-semibold">${pg}</span><button ${pg >= pages ? 'disabled' : ''} onclick="pg++;draw()" class="border rounded-md px-2.5 py-1 disabled:opacity-40">›</button></div></div></div>`;
}
/** Ambil data terbaru dari server di latar belakang (tampilan lama tetap terlihat; bilah di atas = sedang memuat). */
function busy(on) { const b = $('ld'); if (b) b.style.display = on ? 'block' : 'none'; }
/** Muat ulang data hanya bila data di layar sudah lebih dari 30 detik (berpindah menu jadi instan). */
/** Terapkan data terbaru yang dikembalikan langsung oleh operasi simpan/hapus (tanpa permintaan muat ulang). */
function setData(d) { if (!d || !d.rows) return; refSeq++; busy(0); S = d; lastRef = Date.now(); init(); }
/** Panggilan tulis: bilah pemuatan tampil, data hasil langsung dipakai; jika gagal, tampilan dikembalikan dari server. */
function tulis(fn, args, ok, fail) {
  busy(1);
  const rn = API.run.withSuccessHandler(r => { busy(0); if (r && r.data) setData(r.data); if (ok) ok(r); })
    .withFailureHandler(x => { busy(0); if (/Sesi berakhir/.test(x.message)) { toLogin(); return; } if (fail) fail(x); else { notify(x.message); refresh(); } });
  rn[fn].apply(rn, [SESI.t].concat(args));
}
function soft() { if (Date.now() - lastRef > 30000) refresh(); }
function refresh(hard) {
  const my = ++refSeq; busy(1);
  API.run.withSuccessHandler(d => {
    if (my !== refSeq || !window.SESI) return; // respons lama / sesi sudah berakhir diabaikan
    busy(0); S = d; lastRef = Date.now();
    const a = document.activeElement, typing = !firstLoad && a && /^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName) && $('v') && $('v').contains(a);
    firstLoad = false;
    if (typing) { S.set = Object.assign({}, DEFSET, S.set); return; } // jangan menghapus isian yang sedang diketik
    init();
  }).withFailureHandler(x => {
    if (my !== refSeq || !window.SESI) return; busy(0);
    if (/Sesi berakhir/.test(x.message)) { toLogin(); return; }
    if (firstLoad) $('v').innerHTML = '<div class="text-center py-20 text-rose-600">Gagal memuat: ' + e(x.message) + '<br><button onclick="refresh()" class="mt-3 border border-slate-300 rounded-lg px-4 py-2 text-sm">Coba lagi</button></div>';
  }).getApp(SESI.t, !!hard);
}
function loadBrand() {
  let c = null; try { c = JSON.parse(sessionStorage.getItem('sp_brand') || 'null'); } catch (x) {}
  if (c) { applyBrand(c); return; }
  API.run.withSuccessHandler(b => { try { sessionStorage.setItem('sp_brand', JSON.stringify(b)); } catch (x) {} applyBrand(b); })
    .withFailureHandler(() => {}).getBrand(SESI.t);
}
function applyBrand(b) {
    if (!window.SESI) return;
    window.LOGO = b.logo || ''; window.KOP = b.kop || '';
    const im = $('lg_img');
    if (b.logo && im) { im.src = b.logo; im.classList.remove('hidden'); $('lg_s').classList.add('hidden'); $('lg_box').className = 'px-1 mb-3'; stk(im); }
    if (view == 'set') draw();
}
function dropBrand() { try { sessionStorage.removeItem('sp_brand'); } catch (x) {} }
function toggleNav() { const s = $('side'), open = s.classList.contains('-translate-x-full'); s.classList.toggle('-translate-x-full', !open); $('ov').classList.toggle('hidden', !open); }
function closeNav() { const s = $('side'), o = $('ov'); if (s) s.classList.add('-translate-x-full'); if (o) o.classList.add('hidden'); }
/** Beri label kolom pada setiap sel tabel agar tabel tampil sebagai kartu di layar HP. */
function labelTables() {
  document.querySelectorAll('.tw table').forEach(t => {
    const hs = Array.from(t.querySelectorAll('thead th')).map(h => h.textContent.trim());
    t.querySelectorAll('tbody tr').forEach(tr => Array.from(tr.children).forEach((td, i) => { if (td.colSpan <= 1) td.setAttribute('data-l', hs[i] || ''); }));
  });
}

/* ---------- ANTREAN (Verifikasi Lapangan / Penyelesaian Keuangan) ---------- */
function queue(t, sub, stages) {
  const rows = S.rows.filter(r => stages.includes(r.tahap) && r.tahap != 'kuitansi');
  return `<h1 class="text-xl font-extrabold">${t}</h1><p class="text-slate-500 text-xs mb-4">${sub}</p><div class="bg-white rounded-xl border border-slate-200 tw"><table class="w-full text-left"><thead class="text-[10px] uppercase tracking-wide text-slate-400"><tr><th class="p-3">Proyek & No. SPK</th><th class="p-3">Vendor</th><th class="p-3">Nilai</th><th class="p-3">Tahapan</th><th class="p-3 text-right">Aksi</th></tr></thead><tbody class="divide-y divide-slate-100">
  ${rows.map(r => { const nx = ST[ST.indexOf(r.tahap) + 1]; return `<tr><td class="p-3"><div class="font-semibold">${e(r.nama)}</div><div class="text-[11px] text-slate-400">${e(r.nomor)}</div></td><td class="p-3">${e(r.vendor)}</td><td class="p-3 font-bold">${rp(r.nilai)}</td><td class="p-3"><span class="border rounded-md px-2 py-1 text-[11px] font-semibold ${SL[r.tahap][1]}">${SL[r.tahap][0]}</span></td><td class="p-3 text-right"><button onclick="adv('${r.id}','${nx}')" class="bg-navy text-white rounded-lg px-3 py-1.5 text-xs font-semibold">Setujui → ${SL[nx][0]}</button></td></tr>`; }).join('') || '<tr><td colspan="5" class="p-10 text-center text-slate-400">Tidak ada berkas dalam antrean.</td></tr>'}</tbody></table></div>`;
}
function adv(id, t) { const r = S.rows.find(x => x.id == id); if (r) { r.tahap = t; draw(); } tulis('setTahap', [id, t]); }

/* ---------- BUAT SPK ---------- */
var CL = 'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand';
var L = (t, h, x) => `<div class="${x || ''}"><label class="block text-xs font-semibold text-slate-600 mb-1">${t}</label>${h}</div>`;
var inp = (id, ph, t, x) => `<input id="${id}" type="${t || 'text'}" placeholder="${ph || ''}" ${x || ''} class="${CL}">`;
var sel = (id, o) => `<select id="${id}" class="${CL}">${o.map(x => `<option>${x}</option>`).join('')}</select>`;
var sec = (n, t, d, h, bd) => `<section class="fx-sec"><div class="fx-hd"><h3>Bagian ${n}: ${t}</h3>${bd ? `<span class="fx-pill ${bd[1]}">${bd[0]}</span>` : ''}</div>${h}</section>`;
var lj = 'all', lpg = 1, EDIT = null;
function frmBuat(id) {
  EDIT = id ? S.rows.find(x => x.id == id) || null : null;
  IT = EDIT ? parseItems(EDIT.items) : [];
  files = EDIT && EDIT.files ? String(EDIT.files).split(',').map(x => x.trim()).filter(Boolean) : [];
  $('md').innerHTML = `<div class="fixed inset-0 bg-black/50 z-50 overflow-auto p-3 md:p-6"><div class="bg-white rounded-2xl w-full max-w-4xl mx-auto">${buat()}</div></div>`;
  if (EDIT) { fillForm(EDIT); const m = (S.rek || []).find(x => String(x.nama).trim().toLowerCase() == String(EDIT.vendor).trim().toLowerCase()); if (m) $('f_rekp').value = m.id; }
  noInit(); jenisChg(); itDraw(); calc();
}
function fillForm(r) {
  const set = (id, v) => { const x = $('f_' + id); if (!x || v === undefined || v === null || v === '') return; if (x.options && !Array.from(x.options).some(o => o.value == v)) { if (id != 'bank' && id != 'dpa') return; const op = document.createElement('option'); op.textContent = op.value = v; x.appendChild(op); } x.value = v; };
  set('jenis', r.jenis || 'SPB'); set('nomor', r.nomor); set('sumber', r.sumber); set('ang', String(r.kodrek || '').trim()); set('kategori', r.kategori); set('kual', r.kualifikasi);
  set('nama', r.nama); set('vendor', r.vendor); set('npwp', npwpFmt(r.npwp)); if (r.nonpwp == 'Ya') { $('f_nonpwp').checked = true; npwpTog(); } set('direktur', r.direktur); set('telp', r.telp); set('alamat', r.alamat); set('bank', r.bank); set('rek', r.rekening);
  set('nilai', r.nilai);
  set('mulai', r.mulai); set('selesai', r.selesai); set('tgl', r.tgl); set('lok', r.lokasi); set('dpa', r.dpa);
  const c = $('st_chip'); if (c) c.textContent = 'Status: ' + (r.status || 'Terbit');
}
function hpsSpk(id) {
  const r = S.rows.find(x => x.id == id); if (!r) return;
  ask('Hapus ' + jns(r) + ' ' + r.nomor + '?\nAnggaran yang terpakai akan dikembalikan. Tindakan ini tidak dapat dibatalkan.', () => {
  S.rows = S.rows.filter(x => x.id != id); draw();
  tulis('delSpk', [id], null, x => { notify('Gagal menghapus: ' + x.message); refresh(); });
  });
}
/** Sama dengan aturan server: admin bebas; SPK buatan operator hanya admin (operator boleh pada Draf buatannya). */
var bolehUbah = r => { const role = window.SESI && SESI.role; if (role == 'admin') return true;
  const op = String(r.pembuat || '').indexOf('op_') == 0;
  if (!op && !OPU[role]) return true;
  return r.status == 'Draft' && r.pembuat == role; };
var jns = r => (r.jenis == 'SPK' || r.jenis == 'SP' ? r.jenis : 'SPB');
/** Nama dokumen dasar sesuai jenis: SPK, SPB, atau SP. */
var jnm = s => (s.jenis == 'SPK' || s.jenis == 'SPB') ? s.jenis : 'SP';
var jnmFull = s => s.jenis == 'SPK' ? 'Surat Perintah Kerja (SPK)' : s.jenis == 'SPB' ? 'Surat Pemesanan Barang (SPB)' : 'Surat Pemesanan (SP)';
function spbRow(r) {
  const kunci = r.tahap != 'spk' || (S.dok || []).some(d => d.spk == r.id);
  return `<tr class="hover:bg-slate-50"><td class="p-3 max-w-[280px]"><div class="font-semibold whitespace-normal">${e(r.nama)}</div><div class="text-[11px] text-slate-400">${e(r.nomor)}${r.jenis ? ' • ' + e(r.jenis) : ''}${r.status == 'Draft' ? ' <span class="text-amber-600 font-semibold">• Draf</span>' : ''}</div></td><td class="p-3"><div class="font-semibold">${e(r.vendor)}</div><div class="text-[11px] text-slate-400">NPWP: ${e(r.npwp || '-')}</div></td><td class="p-3 font-bold">${rp(r.nilai)}</td><td class="p-3"><span class="inline-block border rounded-md px-2 py-1 text-[11px] font-semibold ${SL[r.tahap][1]}">${SL[r.tahap][0]}</span></td><td class="p-3 w-44"><div class="flex justify-between text-[11px] mb-1"><b>${PCT[r.tahap]}%</b><span class="text-slate-400">${r.tahap == 'kuitansi' ? 'Selesai' : sisa(r)}</span></div><div class="bar"><i style="width:${PCT[r.tahap]}%"></i></div></td><td class="p-3 no-print whitespace-nowrap"><button onclick="pratinjau('${r.id}','spb')" title="Pratinjau dan cetak ${jns(r)}" class="border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-semibold">🖨 Cetak ${jns(r)}</button> <button onclick="frmBuat('${r.id}')" title="Ubah ${jns(r)}" class="border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-semibold">✏ Edit</button> <button onclick="hpsSpk('${r.id}')" ${kunci || !bolehUbah(r) ? 'disabled' : ''} title="${!bolehUbah(r) ? 'Hanya administrator yang dapat menghapus' : kunci ? 'Tidak dapat dihapus: sudah diproses atau memiliki dokumen' : 'Hapus ' + jns(r)}" class="border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-rose-600">🗑 Hapus</button></td></tr>`;
}
function spbList() {
  const rows = S.rows.filter(r => (lj == 'all' || jns(r) == lj) && (!q || JSON.stringify(Object.values(r)).toLowerCase().includes(q)));
  const pages = Math.max(1, Math.ceil(rows.length / PS)); if (lpg > pages) lpg = pages;
  const slice = rows.slice((lpg - 1) * PS, lpg * PS), n = j => S.rows.filter(r => jns(r) == j).length;
  const tabs = [['all', 'Semua', S.rows.length], ['SPK', 'SPK', n('SPK')], ['SPB', 'SPB', n('SPB')], ['SP', 'SP', n('SP')]];
  return `<div class="flex justify-between items-start flex-wrap gap-2 mb-4"><div><h1 class="text-xl md:text-2xl font-extrabold">Daftar SPK/SPB</h1><p class="text-slate-500 text-xs">Surat Perintah Kerja dan Surat Pesanan Barang yang sudah dibuat. Klik <b>Buat SPK/SPB</b> untuk menambah dokumen baru.</p></div><button onclick="frmBuat()" class="bg-navy text-white rounded-lg px-4 py-2 font-semibold no-print">+ Buat SPK/SPB</button></div>
  <div class="bg-white rounded-xl border border-slate-200"><div class="flex flex-wrap items-center gap-2 p-3 border-b border-slate-100 no-print">${tabs.map(t => `<button onclick="lj='${t[0]}';lpg=1;draw()" class="rounded-lg px-3 py-1.5 text-xs font-semibold border ${lj == t[0] ? 'bg-navy text-white border-navy' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}">${t[1]} (${t[2]})</button>`).join('')}</div>
  <div class="tw"><table class="w-full text-left"><thead class="text-[10px] uppercase tracking-wide text-slate-400"><tr><th class="p-3">Nama Proyek & No. SPK</th><th class="p-3">Vendor / Rekanan</th><th class="p-3">Nilai Kontrak (IDR)</th><th class="p-3">Tahapan Dokumen</th><th class="p-3">Proses & Waktu</th><th class="p-3 no-print">Aksi</th></tr></thead><tbody class="divide-y divide-slate-100">${slice.map(spbRow).join('') || '<tr><td colspan="6" class="p-10 text-center text-slate-400">Belum ada SPK/SPB. Klik tombol Buat SPK/SPB.</td></tr>'}</tbody></table></div>
  <div class="flex justify-between items-center p-3 border-t border-slate-100 text-xs text-slate-500 no-print"><span>Menampilkan ${rows.length ? (lpg - 1) * PS + 1 : 0}–${Math.min(lpg * PS, rows.length)} dari ${rows.length} dokumen</span><div class="flex gap-1"><button ${lpg < 2 ? 'disabled' : ''} onclick="lpg--;draw()" class="border rounded-md px-2.5 py-1">‹</button><span class="px-2 py-1 rounded-md bg-navy text-white font-semibold">${lpg}</span><button ${lpg >= pages ? 'disabled' : ''} onclick="lpg++;draw()" class="border rounded-md px-2.5 py-1">›</button></div></div></div>`;
}
var BANKS = [
  ['Bank Milik Negara (BUMN)', ['Bank Mandiri', 'Bank Rakyat Indonesia (BRI)', 'Bank Negara Indonesia (BNI)', 'Bank Tabungan Negara (BTN)', 'Bank Syariah Indonesia (BSI)', 'Bank Mandiri Taspen']],
  ['Bank Pembangunan Daerah (BPD)', ['Bank Aceh Syariah', 'Bank Sumut', 'Bank Nagari (Sumatera Barat)', 'Bank Riau Kepri Syariah (BRK Syariah)', 'Bank Jambi', 'Bank Sumsel Babel', 'Bank Bengkulu', 'Bank Lampung',
    'Bank DKI', 'Bank BJB (Jawa Barat dan Banten)', 'Bank Jateng', 'Bank BPD DIY', 'Bank Jatim', 'Bank BPD Bali', 'Bank NTB Syariah', 'Bank NTT',
    'Bank Kalbar', 'Bank Kalsel', 'Bank Kalteng', 'Bank Kaltimtara', 'Bank SulutGo', 'Bank Sulteng', 'Bank Sulselbar', 'Bank Sultra', 'Bank Maluku Malut', 'Bank Papua']],
  ['Bank Swasta Nasional', ['Bank Central Asia (BCA)', 'Bank CIMB Niaga', 'Bank Danamon Indonesia', 'Bank Permata', 'Bank Maybank Indonesia', 'Bank OCBC NISP', 'Bank Panin', 'Bank Mega', 'Bank KB Indonesia (KB Bukopin)',
    'Bank SMBC Indonesia (BTPN)', 'Bank Sinarmas', 'Bank Bumi Arta', 'Bank Mayapada', 'Bank Woori Saudara Indonesia', 'Bank Index Selindo', 'Bank Ina Perdana', 'Bank Mestika Dharma', 'Bank Victoria International',
    'Bank Artha Graha Internasional', 'Bank Capital Indonesia', 'Bank Ganesha', 'Bank Nationalnobu', 'Bank QNB Indonesia', 'Bank Jasa Jakarta', 'Bank Bisnis Internasional', 'Bank Sahabat Sampoerna', 'Bank Amar Indonesia',
    'Bank Multiarta Sentosa', 'Bank Mitraniaga', 'Bank Neo Commerce', 'Allo Bank Indonesia', 'Bank Jago', 'SeaBank Indonesia', 'blu by BCA Digital', 'Bank Raya Indonesia', 'Bank Oke Indonesia', 'Bank Fama Internasional',
    'Bank Dinar Indonesia', 'Bank IBK Indonesia', 'Bank Kesejahteraan Ekonomi', 'Bank Yudha Bhakti']],
  ['Bank Syariah', ['Bank Muamalat Indonesia', 'Bank BCA Syariah', 'Bank Mega Syariah', 'Bank BJB Syariah', 'Bank Aladin Syariah', 'Bank Panin Dubai Syariah', 'KB Bank Syariah', 'Bank BTPN Syariah', 'Bank Victoria Syariah']],
  ['Bank Asing & Campuran', ['Bank UOB Indonesia', 'Bank DBS Indonesia', 'Bank ANZ Indonesia', 'Bank CTBC Indonesia', 'Bank Shinhan Indonesia', 'Bank Mizuho Indonesia', 'Bank ICBC Indonesia', 'Bank China Construction Bank Indonesia',
    'Bank Resona Perdania', 'Bank BNP Paribas Indonesia', 'Bank of India Indonesia', 'Citibank N.A.', 'HSBC Indonesia', 'Standard Chartered Bank', 'Deutsche Bank AG', 'Bank of China', 'JPMorgan Chase Bank', 'Bank of America N.A.']]
];
/** Daftar Nomor DPA dari menu Pengaturan (bisa lebih dari 1). */
var dpaList = () => (Array.isArray(S.set.dpa_list) ? S.set.dpa_list : []).map(x => String(x || '').trim()).filter(Boolean);
var dpaSel = () => { const l = dpaList(); return l.length ? `<select id="f_dpa" class="${CL}">${l.length > 1 ? '<option value="">— Pilih Nomor DPA —</option>' : ''}${l.map(x => `<option>${e(x)}</option>`).join('')}</select>`
  : inp('f_dpa', 'Belum ada Nomor DPA — tambahkan di menu Pengaturan'); };
var bankSel = (id, v) => `<select id="${id}" class="${CL}"><option value="">— Pilih bank —</option>${BANKS.map(g => `<optgroup label="${g[0]}">${g[1].map(b => `<option ${b == v ? 'selected' : ''}>${e(b)}</option>`).join('')}</optgroup>`).join('')}</select>`;
/* Nomor SPK: 000.3.2/<manual maks. 3>/SPK/UM-SETDA/<bulan romawi>/<tahun>
 * Nomor SPB: 000.3.2/<manual maks. 3>/SPB/UM/<bulan romawi>/<tahun>  (bulan = bulan pembuatan, tahun = Tahun Anggaran) */
var UNIT_KODE = {bupati: 'UM-RT.BUP', wabup: 'UM-RT.WABUP', setda: 'UM-RT.SEKDA'};
/** Bagian tengah nomor: SPK/SPB + kode unit sesuai pos anggaran terpilih (Bagian Umum tetap UM-SETDA untuk SPK, UM untuk SPB). */
var noUnit = j => {
  if (j != 'SPK' && j != 'SPB') return '';
  const k = $('f_ang') ? $('f_ang').value : '', a = (S.ang || []).find(x => x.full == k), kd = a && UNIT_KODE[a.unit];
  return j + '/' + (kd || (j == 'SPK' ? 'UM-SETDA' : 'UM'));
};
var ROMAWI = ['I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII'], NOM = {};
/** Bulan romawi dari tanggal yang dipilih (format yyyy-mm-dd). */
var romTgl = t => { const p = pd(t); return p.length >= 3 && p[1] >= 1 && p[1] <= 12 ? ROMAWI[p[1] - 1] : ROMAWI[new Date().getMonth()]; };
var NO_RE = /^000\.3\.2\/([A-Za-z0-9]{1,3})\/(?:SPK|SPB)\/(?:UM-SETDA|UM(?:-SETDA)?|UM-RT\.(?:BUP|WABUP|SEKDA))\/([IVX]+)\/(\d{4})$/;
function noInit() {
  const r = EDIT, m = r ? String(r.nomor || '').trim().match(NO_RE) : null, dib = r && r.dibuat ? new Date(r.dibuat) : new Date();
  NOM = {rom: romTgl($('f_tgl') ? $('f_tgl').value : ''), th: m ? m[3] : String(S.set.tahun || new Date().getFullYear()), lama: r && !m ? String(r.nomor || '') : ''};
  $('f_noin').value = m ? m[1] : '';
  $('f_nofull').value = r && r.jenis == 'SP' ? String(r.nomor || '') : '';
  NOM.hint = NOM.lama ? 'Nomor lama: <b>' + e(NOM.lama) + '</b> — tetap dipakai bila kolom di atas dikosongkan.' : 'Isi nomor urut secara manual (maksimal 3 angka/huruf). Bulan romawi mengikuti bulan pembuatan.';
  noUpd();
}
function noUpd() {
  const j = $('f_jenis').value, sp = j == 'SP';
  if ($('f_tgl') && NOM) NOM.rom = romTgl($('f_tgl').value);
  $('f_nofull').classList.toggle('hidden', !sp); $('no_auto').classList.toggle('hidden', sp);
  $('no_hint').innerHTML = sp ? 'Surat Pesanan: nomor diisi <b>manual</b> secara lengkap (mis. nomor dari e-Katalog/e-Purchasing).' : NOM.hint;
  if (sp) { $('f_nomor').value = $('f_nofull').value.trim(); return; }
  const u = noUnit(j), n = $('f_noin').value.trim(), suf = '/' + (u || '.....') + '/' + NOM.rom + '/' + NOM.th;
  $('no_suf').textContent = '000.3.2/' + (n || '____') + '/' + (u || '____') + '/' + NOM.rom + '/' + NOM.th; // pratinjau nomor lengkap
  $('f_nomor').value = n && j ? '000.3.2/' + n + suf : (n ? '' : NOM.lama);
}
/** Program / Kegiatan / Sub Kegiatan diambil dari pos anggaran terpilih (nama diisi di menu Anggaran). */
function angNama() {
  const k = $('f_ang') ? $('f_ang').value : '', a = (S.ang || []).find(x => x.full == k) || {}, same = EDIT && String(EDIT.kodrek || '').trim() == k;
  // cadangan: rekening lain pada sub kegiatan yang sama yang sudah punya nama
  const sib = a.sub ? (S.ang || []).find(x => x.unit == a.unit && x.sub == a.sub && (x.program || x.kegiatan || x.subkeg)) : null;
  const v = f => a[f] || (sib && sib[f]) || (same ? EDIT[f] : '') || (k ? S.set[f] : '') || '';
  if ($('f_prog')) { $('f_prog').value = v('program'); $('f_keg').value = v('kegiatan'); $('f_subk').value = v('subkeg'); }
}
function buat() {
  const R = ' <span class="text-rose-500">*</span>', RO = `${CL} bg-slate-50`;
  return `<div class="p-5 md:p-6 border-b border-slate-100">
    <div class="flex justify-between items-center gap-4 mb-4"><div class="text-xs text-slate-500 font-medium">Beranda <span class="text-slate-400">›</span> Proyek Pengadaan <span class="text-slate-400">›</span> <b id="bc_t" class="text-slate-800 font-semibold">Buat SPK Baru</b></div>
      <button onclick="$('md').innerHTML=''" title="Tutup" class="text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg p-2 text-base leading-none">✕</button></div>
    <div class="flex justify-between items-start flex-wrap gap-4"><div><h1 id="bt_title" class="text-2xl md:text-3xl font-bold">Buat Surat Perintah Kerja Baru</h1><p class="text-slate-500 text-sm mt-1">Pastikan semua data kontrak dan vendor diisi dengan benar sebelum disimpan.</p></div>
      <div class="flex gap-2 flex-wrap text-xs font-semibold"><span id="st_chip" class="bg-amber-50 text-amber-700 border border-amber-200 rounded-md px-3 py-1">Status: Draf Baru</span><span class="bg-slate-50 text-slate-700 border border-slate-200 rounded-md px-3 py-1">Tahun Anggaran: ${e(S.set.tahun)}</span></div></div>
  </div>
  <div class="p-5 md:p-6">
  ${sec(1, 'Informasi Proyek', '', `<div class="grid gap-4">
    <div class="grid md:grid-cols-2 gap-4">
      ${L('Jenis Dokumen' + R, `<select id="f_jenis" onchange="jenisChg()" class="${CL}"><option value="">— Pilih jenis dokumen —</option><option value="SPK">SPK — Surat Perintah Kerja</option><option value="SPB">SPB — Surat Pesanan Barang</option><option value="SP">SP — Surat Pesanan</option></select>`)}
      ${L('Kategori Pengadaan' + R, `<select id="f_kategori" onchange="calc()" class="${CL}"><option value="">— Pilih kategori pengadaan —</option>${['Barang', 'Jasa Lainnya', 'Jasa Konsultansi', 'Pekerjaan Konstruksi', 'Jasa Boga (Catering)'].map(x => `<option>${x}</option>`).join('')}</select>`)}
    </div>
    <div id="kual_box" class="hidden">${L('Kualifikasi Usaha Konstruksi (dasar PPh Pasal 4 ayat 2)', `<select id="f_kual" onchange="calc()" class="${CL}">${PPH_K.map(k => `<option value="${k[0]}">${k[1]}</option>`).join('')}</select>`)}</div>
    <div><label id="lb_no" class="block text-xs font-semibold text-slate-600 mb-1">Nomor SPK/SPB *</label>
      <input id="f_nofull" autocomplete="off" maxlength="120" oninput="noUpd()" placeholder="Ketik nomor Surat Pesanan lengkap, mis. EP-01KT662HKK86E4M762X03G361Q" class="hidden ${CL}">
      <div id="no_auto" class="flex items-center gap-3 flex-wrap sm:flex-nowrap">
        <input id="f_noin" maxlength="3" autocomplete="off" oninput="this.value=this.value.replace(/[^A-Za-z0-9]/g,'').slice(0,3);noUpd()" placeholder="001" class="${CL} sm:w-40">
        <span id="no_suf" title="Pratinjau nomor" class="w-full sm:flex-1 min-w-0 rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-sm font-bold text-slate-600 whitespace-nowrap overflow-hidden text-ellipsis"></span></div>
      <input id="f_nomor" type="hidden"><p id="no_hint" class="text-[11px] text-slate-500 mt-1"></p></div>
    ${L('Pos Anggaran (Sub Kegiatan • Rekening)' + R, `<select id="f_ang" onchange="angNama();calc();noUpd()" class="${CL}">${angOpts()}</select>`)}
    ${L('Program <span class="font-normal text-slate-400">(dari Anggaran)</span>', `<input id="f_prog" readonly tabindex="-1" placeholder="Pilih pos anggaran" class="${RO}">`)}
    ${L('Kegiatan <span class="font-normal text-slate-400">(dari Anggaran)</span>', `<input id="f_keg" readonly tabindex="-1" placeholder="Pilih pos anggaran" class="${RO}">`)}
    ${L('Sub Kegiatan <span class="font-normal text-slate-400">(dari Anggaran)</span>', `<input id="f_subk" readonly tabindex="-1" placeholder="Pilih pos anggaran" class="${RO}">`)}
    ${L('Nama Paket Pekerjaan / Proyek' + R, `<textarea id="f_nama" rows="3" maxlength="250" class="${CL}" placeholder="Contoh: Pengadaan Konsumsi Rapat"></textarea>`)}
  </div>`, ['Wajib Diisi', 'bg-blue-50 text-blue-700'])}
  ${sec(2, 'Data Vendor / Pihak Ketiga', '', `<div class="grid gap-4">
    ${L('Pilih Rekanan' + R, `<select id="f_rekp" onchange="rekPilih()" class="${CL}">${rekOpts()}</select><p class="text-[11px] text-slate-500 mt-1">Rekanan belum ada? <a onclick="$('md').innerHTML='';go('rek')" class="text-brand underline cursor-pointer">Kelola Rekanan</a></p>`)}
    ${L('Perusahaan Penyedia (Vendor)', `<input id="f_vendor" readonly tabindex="-1" class="${RO}">`)}
    <div class="grid md:grid-cols-2 gap-4">
      <div><div class="flex justify-between items-center gap-2 mb-1"><label class="text-xs font-semibold text-slate-600">NPWP Vendor</label><label class="flex items-center gap-1.5 text-[11px] font-medium text-slate-600"><input id="f_nonpwp" type="checkbox" disabled> Tidak memiliki NPWP</label></div><input id="f_npwp" readonly tabindex="-1" class="${RO} font-mono"><p id="npwp_h" class="text-[11px] text-slate-500 mt-1">Data diambil dari menu Rekanan.</p></div>
      ${L('Nama Direktur / Penanggung Jawab', `<input id="f_direktur" readonly tabindex="-1" class="${RO}">`)}
    </div>
    <div class="grid md:grid-cols-2 gap-4">
      ${L('Nomor Telepon', `<input id="f_telp" readonly tabindex="-1" class="${RO}">`)}
      ${L('Alamat Lengkap Perusahaan', `<textarea id="f_alamat" rows="2" readonly tabindex="-1" class="${RO}"></textarea>`)}
    </div>
    <div class="grid md:grid-cols-2 gap-4">
      ${L('Bank Rekening Penerima', `<input id="f_bank" readonly tabindex="-1" class="${RO}">`)}
      ${L('Nomor Rekening & Nama Rekening', `<input id="f_rek" readonly tabindex="-1" class="${RO} font-mono">`)}
    </div>
  </div>`, ['Rekanan Terverifikasi', 'bg-emerald-50 text-emerald-700'])}
  ${sec(3, 'Nilai Kontrak, Data Surat & Rincian Barang/Jasa', '', `
    <div class="grid md:grid-cols-2 gap-4 mb-4">
      ${L('Tanggal SP / SPK' + R, inp('f_tgl', '', 'date', `value="${new Date().toISOString().slice(0, 10)}" oninput="noUpd()"`))}
      ${L('Lokasi Kegiatan' + R, inp('f_lok', '', 'text', 'value="Tanjung Selor"'))}
    </div>
    <div class="grid md:grid-cols-2 gap-4">
      ${L('Nomor DPA' + R, dpaSel())}
      ${L('Kode Rekening' + R + ' <span class="font-normal text-slate-400">(otomatis dari Pos Anggaran)</span>', `<input id="f_kod" readonly tabindex="-1" class="${RO} font-mono">`)}
    </div>
    <div class="flex justify-between items-center mt-5 mb-3"><b class="text-base">Rincian Barang / Jasa</b><span class="text-sm font-semibold">Total: <b id="it_tot">Rp 0</b></span></div>
    <div class="fx-box">
      <div id="it_box" class="overflow-x-auto"></div>
      <div class="flex flex-wrap items-center gap-3 mt-3"><button onclick="IT.push({u:'',q:1,s:'',h:0,p:1});itDraw()" class="border border-slate-300 bg-white rounded-lg px-3 py-1.5 text-xs font-semibold hover:bg-slate-50">+ Tambah Baris</button></div>
      <details class="text-xs mt-3"><summary class="cursor-pointer text-brand font-semibold">Tempel dari Excel</summary><p class="text-slate-500 my-1">Salin kolom Excel berurutan: Uraian, Banyaknya, Satuan, Harga Satuan (tanpa judul kolom), lalu tempel di bawah.</p><textarea id="it_paste" rows="4" class="${CL}"></textarea><button onclick="itPaste()" class="mt-1 border border-slate-300 bg-white rounded-lg px-3 py-1.5 text-xs">Impor Baris</button></details>
    </div>
    <div class="grid md:grid-cols-2 gap-4 mt-5">
      <div><input id="f_nilai" type="hidden">
        <div class="fx-tax text-xs space-y-2">
          <div class="flex justify-between"><span>Nilai sebelum PPN (DPP)</span><b id="c_dpp">Rp 0</b></div>
          <div class="flex justify-between"><span id="c_ppnl">PPN — sudah termasuk</span><b id="c_ppn">Rp 0</b></div>
          <div class="flex justify-between gap-2"><span id="c_pphl">PPh</span><b id="c_pph" class="whitespace-nowrap">Rp 0</b></div>
          <div id="c_pphn" class="text-[11px] text-slate-400 leading-snug"></div>
          <div class="flex justify-between items-center border-t border-slate-100 pt-2 mt-1 text-sm"><b>Total Nilai Kontrak:</b><b class="text-brand text-base" id="c_tot">Rp 0</b></div>
        </div></div>
      <div class="space-y-3">
        <div class="grid grid-cols-2 gap-3">${L('Tanggal Mulai Kerja' + R, inp('f_mulai', '', 'date', 'oninput="calc()"'))}${L('Tanggal Selesai Kerja' + R, inp('f_selesai', '', 'date', 'oninput="calc()"'))}</div>
        <div class="fx-dur"><span class="text-xs font-medium text-slate-600">Kalkulasi Waktu Pelaksanaan:</span><b class="text-brand" id="c_hari">- Hari Kalender</b></div>
      </div>
    </div>
    <div id="c_bud" class="mt-4 text-xs rounded-lg border px-3 py-2"></div>`)}
  ${sec(4, 'Berkas Pendukung & Lampiran Teknis', '', `<p class="text-[11px] text-slate-500 mb-3">Opsional — dokumen KAK, RAB rincian, dan dokumen penetapan pemenang.</p><label id="fz" class="block border-2 border-dashed border-slate-300 rounded-xl p-6 text-center cursor-pointer hover:bg-slate-50"><input type="file" multiple accept=".pdf" class="hidden" onchange="addF(this)"><div class="text-2xl">☁</div><div class="font-semibold text-sm">Tarik & lepas file PDF di sini atau <span class="text-brand">klik untuk memilih file</span></div><div class="text-[11px] text-slate-500">Maksimal ukuran berkas 25MB per file</div></label><div id="fl" class="mt-3 space-y-2"></div>`)}
  </div>
  <div class="fx-bar flex items-center justify-between gap-2 rounded-b-2xl no-print">
    <button onclick="$('md').innerHTML=''" class="border border-slate-300 bg-white rounded-xl px-4 py-2.5 text-xs font-semibold hover:bg-slate-50">Batal</button>
    <div class="flex items-center gap-2.5"><button id="bd" onclick="simpan('Draft')" class="border border-slate-200 bg-slate-50 rounded-xl px-4 py-2.5 text-xs font-semibold hover:bg-slate-100">Simpan sebagai Draf</button><button id="bt" onclick="simpan('Terbit')" class="btn-sky text-xs">Terbitkan & Kirim SPK</button></div>
  </div>`;
}
function jenisChg() {
  const j = $('f_jenis').value, ed = !!EDIT, draft = !ed || EDIT.status == 'Draft';
  const nmj = j == 'SPB' ? 'Surat Pesanan Barang' : j == 'SPK' ? 'Surat Perintah Kerja' : j == 'SP' ? 'Surat Pesanan' : 'SPK/SPB';
  $('bt_title').textContent = (ed ? 'Ubah ' : 'Buat ') + nmj + (ed ? '' : ' Baru');
  $('bc_t').textContent = (ed ? 'Ubah ' : 'Buat ') + (j || 'SPK/SPB') + (ed ? '' : ' Baru');
  $('lb_no').textContent = 'Nomor ' + (j || 'SPK/SPB') + ' *';
  noUpd();
  $('bt').textContent = draft ? 'Terbitkan & Kirim' + (j ? ' ' + j : '') : 'Simpan Perubahan';
  if ($('bd')) $('bd').style.display = draft ? '' : 'none';
}
/* ---------- PPh menurut Kategori Pengadaan (dipotong/dipungut bendahara, dasar = DPP / nilai sebelum PPN) ----------
 * Barang               : PPh Pasal 22  1,5%  (tidak dipungut bila DPP ≤ Rp 2.000.000; tanpa NPWP 3%)
 * Jasa Lainnya         : PPh Pasal 23  2%    (tanpa NPWP 4%)
 * Jasa Konsultansi     : PPh Pasal 23  2%    (tanpa NPWP 4%)
 * Pekerjaan Konstruksi : PPh Pasal 4 ayat (2) final — PP 9/2022, menurut kualifikasi usaha. */
var PPH_K = [['kecil', 'Kecil / perseorangan bersertifikat (1,75%)', 1.75], ['menengah', 'Menengah / Besar (2,65%)', 2.65], ['nonsbu', 'Tidak memiliki SBU/sertifikat (4%)', 4]];
function hitPph(kat, dpp, npwp, kual) {
  const ada = npwpOk(npwp), rp_ = n => rp(Math.round(n));
  if (!kat) return {lbl: 'PPh', v: 0, note: 'Pilih Kategori Pengadaan untuk menghitung PPh.'};
  if (kat == 'Pekerjaan Konstruksi') { const k = PPH_K.find(x => x[0] == kual) || PPH_K[0]; return {lbl: 'PPh Pasal 4 ayat (2) final (' + String(k[2]).replace('.', ',') + '%)', v: dpp * k[2] / 100, note: 'Jasa konstruksi — PP 9/2022, kualifikasi: ' + k[1].replace(/ \(.*\)/, '') + '. Dasar: DPP ' + rp_(dpp) + '.'}; }
  if (kat == 'Barang') {
    if (dpp <= 2e6) return {lbl: 'PPh Pasal 22 (1,5%)', v: 0, note: 'Tidak dipungut: nilai pembelian barang ≤ Rp 2.000.000 (sebelum PPN).'};
    const t = ada ? 1.5 : 3; return {lbl: 'PPh Pasal 22 (' + String(t).replace('.', ',') + '%)', v: dpp * t / 100, note: 'Pembelian barang oleh bendahara pemerintah. Dasar: DPP ' + rp_(dpp) + '.' + (ada ? '' : ' Vendor tanpa NPWP: tarif 100% lebih tinggi.')};
  }
  const t = ada ? 2 : 4; return {lbl: 'PPh Pasal 23 (' + t + '%)', v: dpp * t / 100, note: (kat == 'Jasa Konsultansi' ? 'Jasa konsultansi' : kat == KAT_BOGA ? 'Jasa boga/katering' : 'Jasa lainnya') + ' (non-konstruksi). Dasar: DPP ' + rp_(dpp) + '.' + (ada ? '' : ' Vendor tanpa NPWP: tarif 100% lebih tinggi.')};
}
function pphShow(dpp) {
  const kat = $('f_kategori').value, kb = $('kual_box'); if (kb) kb.classList.toggle('hidden', kat != 'Pekerjaan Konstruksi');
  const p = hitPph(kat, dpp, $('f_nonpwp') && $('f_nonpwp').checked ? '' : ($('f_npwp') ? $('f_npwp').value : ''), $('f_kual') ? $('f_kual').value : '');
  $('c_pphl').textContent = p.lbl; $('c_pph').textContent = rp(rd(p.v)); $('c_pphn').textContent = p.note;
}
function calc() {
  budCek();
  const kd = $('f_kod'); if (kd) kd.value = $('f_ang').value || (EDIT ? String(EDIT.kodrek || '') : ''); angNama();
  const kat = $('f_kategori').value, n = rd($('f_nilai').value), ppn = IT.length ? ppnIT() : n - rd(n / (1 + ppnR(kat))), dpp = n - ppn;
  if ($('c_ppnl')) $('c_ppnl').textContent = ppnLbl(kat) + ' — sudah termasuk'; $('c_dpp').textContent = rp(dpp); $('c_ppn').textContent = rp(ppn); pphShow(dpp); $('c_tot').textContent = rp(n);
  const a = $('f_mulai').value, b = $('f_selesai').value;
  $('c_hari').textContent = a && b && b >= a ? (Math.round((new Date(b) - new Date(a)) / 864e5) + 1) + ' Hari Kalender' : '- Hari Kalender';
  $('fl').innerHTML = files.map((f, i) => `<div class="flex items-center gap-2 border border-slate-200 rounded-lg p-2"><span class="bg-rose-50 text-rose-600 text-[10px] font-bold rounded px-1.5 py-1">PDF</span><span class="flex-1 truncate">${e(f)}</span><button onclick="files.splice(${i},1);calc()" class="text-rose-500 px-1">🗑</button></div>`).join('');
}
var itSum = r => { let it = []; try { it = JSON.parse(r.items || '[]'); } catch (x) {} return rd(it.reduce((a, x) => a + (+x.q || 0) * (+x.h || 0), 0)); };
var ownKomit = () => EDIT ? (itSum(EDIT) || Math.round(+EDIT.nilai || 0)) : 0;
var sv = a => a.sisa + (EDIT && String(EDIT.kodrek || '').trim() == a.full ? ownKomit() : 0); // sisa + komitmen SPK yang sedang diubah
function angOpts() {
  const ls = (S.ang || []).filter(a => a.full), o = ['<option value="">— Pilih pos anggaran —</option>'];
  ANG.forEach(u => { const g = ls.filter(a => a.unit == u[0]); if (g.length) o.push(`<optgroup label="${u[1]}">${g.map(a => `<option value="${e(a.full)}" ${sv(a) > 0 ? '' : 'disabled'}>${e(a.full)} — Sisa ${rp(sv(a))}${a.uraian ? ' — ' + e(a.uraian) : ''}</option>`).join('')}</optgroup>`); });
  return o.join('');
}
function budCek() {
  const b = $('c_bud'); if (!b) return true;
  const nilai = +$('f_nilai').value || 0, need = itTotal() || Math.round(nilai), kode = $('f_ang').value;
  const a = (S.ang || []).find(x => x.full == kode), legacy = EDIT && !String(EDIT.kodrek || '').trim();
  let ok = false, cls = 'bg-amber-50 text-amber-700 border-amber-200', msg;
  if (legacy && !kode) { ok = nilai > 0; msg = 'SPK/SPB ini dibuat sebelum fitur anggaran dan belum terhubung ke pos anggaran. Memilih pos anggaran bersifat opsional saat mengubah.'; }
  else if (!(S.ang || []).some(x => x.full && sv(x) > 0)) msg = '<b>Tidak ada anggaran tersedia.</b> SPK/SPB tidak dapat dibuat. Hubungi administrator untuk mengisi pagu pada menu Anggaran.';
  else if (!a) msg = 'Pilih pos anggaran untuk melihat sisa anggaran.';
  else {
    const sisa = sv(a), after = sisa - need;
    ok = need > 0 && (after >= 0 || (EDIT && String(EDIT.kodrek || '').trim() == kode && need == ownKomit()));
    cls = ok ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200';
    msg = `Sisa anggaran: <b>${rp(sisa)}</b> • Kebutuhan (incl. PPN): <b>${rp(need)}</b> • Setelah ${EDIT ? 'perubahan' : 'SPK/SPB'}: <b>${rp(after)}</b>${ok ? '' : '<br><b>Anggaran tidak mencukupi — SPK/SPB tidak dapat disimpan.</b>'}`;
  }
  b.className = 'mt-2 text-xs rounded-lg border px-3 py-2 ' + cls; b.innerHTML = msg;
  if ($('bt')) $('bt').disabled = !ok;
  return ok;
}
function addF(i) { [...i.files].forEach(f => files.push(f.name)); calc(); }
/* ---------- NPWP 15 digit, format otomatis 99.999.999.9-999.999 ---------- */
var npwpDig = v => String(v || '').replace(/\D/g, '');
var npwpFmt = v => { const d = npwpDig(v).slice(0, 15), p = [[0, 2], [2, 5], [5, 8], [8, 9], [9, 12], [12, 15]], sep = ['', '.', '.', '.', '-', '.']; let o = '';
  p.forEach((x, i) => { if (d.length > x[0]) o += sep[i] + d.slice(x[0], x[1]); }); return o; };
function npwpIn(el) {
  const d = npwpDig(el.value).slice(0, 15), h = $('npwp_h');
  el.value = npwpFmt(d);
  if (h) { h.textContent = d.length == 15 ? '✔ 15 digit' : d.length + ' / 15 digit — titik dan strip ditambahkan otomatis.'; h.className = 'text-[11px] mt-1 ' + (d.length == 15 ? 'text-emerald-600' : 'text-slate-500'); }
  calc();
}
/** Centang "Tidak memiliki NPWP": isian dikosongkan & dikunci, PPh 22/23 memakai tarif 100% lebih tinggi. */
function npwpTog() {
  const c = $('f_nonpwp').checked, x = $('f_npwp'), h = $('npwp_h');
  x.disabled = c; x.classList.toggle('bg-slate-100', c); x.classList.remove('ring-2', 'ring-rose-400', 'border-rose-400');
  if (c) { x.value = ''; h.className = 'text-[11px] mt-1 text-amber-700'; h.textContent = 'Vendor dianggap tidak memiliki NPWP — PPh Pasal 22/23 dikenakan tarif 100% lebih tinggi.'; }
  else { h.className = 'text-[11px] mt-1 text-slate-500'; npwpIn(x); }
  calc();
}
var npwpOk = v => /^\d{15}$/.test(npwpDig(v)) && !/^0{15}$/.test(npwpDig(v));
/** Semua isian wajib diisi; yang kosong/tidak valid ditandai merah dan penyimpanan ditolak. */
function wajib() {
  const g = id => ($('f_' + id) ? $('f_' + id).value : '').trim(), miss = [], mark = [];
  const need = (ok, label, el) => { if (!ok) { miss.push(label); if (el) mark.push(el); } };
  document.querySelectorAll('#md .ring-rose-400').forEach(x => x.classList.remove('ring-2', 'ring-rose-400', 'border-rose-400'));
  need(g('jenis'), 'Jenis Dokumen', 'f_jenis');
  need(g('nomor'), 'Nomor ' + (g('jenis') || 'SPK/SPB'), g('jenis') == 'SP' ? 'f_nofull' : 'f_noin');
  need(g('ang'), 'Pos Anggaran', 'f_ang');
  need(g('prog') && g('keg') && g('subk'), 'Program/Kegiatan/Sub Kegiatan (isi nama di menu Anggaran)', 'f_prog');
  need(g('kategori'), 'Kategori Pengadaan', 'f_kategori');
  need(g('nama'), 'Nama Paket', 'f_nama');
  need(g('tgl'), 'Tanggal SP/SPK', 'f_tgl');
  need(g('lok'), 'Lokasi Kegiatan', 'f_lok');
  need(g('dpa'), 'Nomor DPA', 'f_dpa');
  const itOk = IT.length && IT.every(x => String(x.u || '').trim() && +x.q > 0 && String(x.s || '').trim() && +x.h > 0);
  need(itOk, 'Rincian Barang/Jasa (setiap baris: uraian, banyaknya, satuan, harga)', 'it_box');
  need(g('mulai'), 'Tanggal Mulai Kerja', 'f_mulai');
  need(g('selesai') && (!g('mulai') || g('selesai') >= g('mulai')), 'Tanggal Selesai Kerja (tidak boleh sebelum tanggal mulai)', 'f_selesai');
  need(g('vendor'), 'Rekanan (pilih dari daftar)', 'f_rekp');
  const nonpwp = $('f_nonpwp') && $('f_nonpwp').checked;
  need(nonpwp || npwpOk(g('npwp')), 'NPWP Vendor (15 digit, atau centang "Tidak memiliki NPWP")', 'f_npwp');
  need(g('direktur'), 'Nama Direktur', 'f_direktur');
  need(npwpDig(g('telp')).length >= 9, 'Nomor Telepon (min. 9 angka)', 'f_telp');
  need(g('alamat'), 'Alamat Perusahaan', 'f_alamat');
  need(g('bank'), 'Bank Rekening', 'f_bank');
  need(g('rek'), 'Nomor & Nama Rekening', 'f_rek');
  if (!miss.length) return true;
  mark.forEach(id => { const x = $(id); if (x) { x.classList.add('ring-2', 'ring-rose-400', 'border-rose-400'); x.addEventListener('input', () => x.classList.remove('ring-2', 'ring-rose-400', 'border-rose-400'), {once: true}); } });
  const f = $(mark[0]); if (f) { if (f.scrollIntoView) f.scrollIntoView({block: 'center', behavior: 'smooth'}); if (f.focus) f.focus({preventScroll: true}); }
  notify('Data belum lengkap — wajib diisi: ' + miss.join(', ') + '.');
  return false;
}
function simpan(status) {
  const g = id => $('f_' + id).value.trim();
  const draf = status == 'Draft';
  if (!draf) {
    if (!wajib()) return;
    if (!budCek()) { notify('Anggaran tidak tersedia atau tidak mencukupi. SPK/SPB tidak dapat dibuat.'); return; }
  }
  const o = Object.assign(EDIT ? Object.assign({}, EDIT) : {}, {nomor: g('nomor'), nonpwp: $('f_nonpwp').checked ? 'Ya' : '', kualifikasi: g('kategori') == 'Pekerjaan Konstruksi' ? g('kual') : '', program: g('prog'), kegiatan: g('keg'), subkeg: g('subk'), kategori: g('kategori'), nama: g('nama'), vendor: g('vendor'), npwp: g('npwp'), direktur: g('direktur'), telp: g('telp'), alamat: g('alamat'), bank: g('bank'), rekening: g('rek'), nilai: +g('nilai'), mulai: g('mulai'), selesai: g('selesai'), files: files.join(', '), tgl: g('tgl'), lokasi: g('lok'), dpa: g('dpa'), items: itJson(), status: status, tahap: EDIT ? EDIT.tahap : 'spk', kodrek: g('ang') || (EDIT ? String(EDIT.kodrek || '') : ''), jenis: g('jenis')});
  if (o.nomor && S.rows.some(x => x.id != o.id && String(x.nomor).trim().toLowerCase() == o.nomor.toLowerCase())) { notify('Nomor ' + o.nomor + ' sudah digunakan oleh SPK/SPB lain.'); return; }
  if (!o.id) { o.id = uid(); o.dibuat = new Date().toISOString(); o.pembuat = SESI.role; }
  const edit = !!EDIT, i = S.rows.findIndex(x => x.id == o.id);
  if (i >= 0) S.rows[i] = o; else S.rows.push(o);
  $('md').innerHTML = ''; view = 'buat'; lpg = 1; draw();
  tulis('saveSpk', [o], r => { notify((edit ? 'Perubahan ' : '') + jns(o) + ' ' + o.nomor + ' tersimpan.' + (r && r.auto ? ' ' + r.auto + ' dokumen (BAPP/BAPHP/BAST/BAP) diterbitkan otomatis.' : ''), 'ok'); },
    x => { notify('Gagal menyimpan: ' + x.message); refresh(); });
}

/* ---------- PENOMORAN DOKUMEN ---------- */
var DJ = {bapp:['BAPP','Berita Acara Penyelesaian Pekerjaan'],baphp:['BAPHP','Berita Acara Pemeriksaan Hasil Pekerjaan'],bast:['BAST','Berita Acara Serah Terima Hasil Pekerjaan'],bap:['BAP','Berita Acara Pembayaran'],rks:['Ringkasan Belanja','Ringkasan Belanja Barang dan Jasa']};
var dj = 'bapp';
var DASAR = [['bapp', 'BAPP'], ['baphp', 'BAPHP'], ['bast', 'BAST'], ['bap', 'BAP']];
var dokOf = (sid, j) => (S.dok || []).filter(d => d.spk == sid && d.jenis == j).sort((a, b) => String(a.tanggal).localeCompare(String(b.tanggal))).slice(-1)[0];
var nDasar = sid => DASAR.filter(x => dokOf(sid, x[0])).length;
/** Jumlah hari pelaksanaan: hari kalender (selisih + 1) atau hari kerja (Senin–Jumat). */
function hitungHari(a, b, sat) {
  const p = pd(a), q = pd(b); if (p.length < 3 || q.length < 3 || !p[0] || !q[0]) return 0;
  const d0 = new Date(p[0], p[1] - 1, p[2]), d1 = new Date(q[0], q[1] - 1, q[2]); if (d1 < d0) return 0;
  if (sat != 'hari kerja') return Math.round((d1 - d0) / 864e5) + 1;
  let n = 0; for (const d = new Date(d0); d <= d1; d.setDate(d.getDate() + 1)) if (d.getDay() % 6) n++;
  return n;
}
var fdt = d => d ? new Date(d).toLocaleDateString('id-ID', {day:'numeric', month:'long', year:'numeric'}) : '-';
var dtl = d => d.jenis == 'rks' ? (d.hari ? e(d.hari) + ' ' + e(d.satuan || 'hari kalender') + ' • ' : '') + 'Dokumen dasar ' + nDasar(d.spk) + '/4' : d.jenis == 'bapp' ? 'Progres ' + (d.persen || 0) + '%' : d.jenis == 'baphp' ? e(d.hasil) : d.jenis == 'bast' ? e(d.pihak) : e(d.termin) + ' • ' + rp(d.nilai);
function dokView() {
  const all = S.dok || [], rows = all.filter(d => d.jenis == dj);
  return `<h1 class="text-xl font-extrabold">BAPP/BAPHP/BAST/BAP</h1><p class="text-slate-500 text-xs mb-4">Terbitkan dan catat nomor BAPP, BAPHP, BAST, dan BAP (menyimpan nomor baru memajukan tahap SPK terkait), serta susun Ringkasan Belanja Barang dan Jasa untuk setiap SPK.</p>
  <div class="flex flex-wrap gap-2 mb-3">${Object.keys(DJ).map(k => `<button onclick="dj='${k}';draw()" class="rounded-lg px-3 py-1.5 text-xs font-semibold border ${dj == k ? 'bg-navy text-white border-navy' : 'bg-white text-slate-600 border-slate-200'}">${DJ[k][0]} (${all.filter(d => d.jenis == k).length})</button>`).join('')}<button onclick="frmDok()" class="ml-auto bg-navy text-white rounded-lg px-3.5 py-1.5 text-xs font-semibold">+ ${dj == 'rks' ? 'Ringkasan Belanja' : 'Nomor ' + DJ[dj][0]} Baru</button></div>
  <div class="bg-white rounded-xl border border-slate-200 tw"><table class="w-full text-left"><thead class="text-[10px] uppercase tracking-wide text-slate-400"><tr><th class="p-3">${dj == 'rks' ? 'Sub Kegiatan' : 'Nomor ' + DJ[dj][0]}</th><th class="p-3">Tanggal</th><th class="p-3">SPK Terkait</th><th class="p-3">Keterangan</th><th class="p-3 text-right">Aksi</th></tr></thead><tbody class="divide-y divide-slate-100">
  ${rows.map(d => { const s = S.rows.find(x => x.id == d.spk); return `<tr><td class="p-3 font-bold${d.jenis == 'rks' ? ' max-w-[240px] whitespace-normal' : ''}">${d.jenis == 'rks' ? e(d.subkeg || '-') : e(d.nomor)}</td><td class="p-3">${fdt(d.tanggal)}</td><td class="p-3 max-w-[260px]">${s ? e(s.nomor) + '<div class="text-[11px] text-slate-400 whitespace-normal">' + e(s.nama) + '</div>' : '-'}</td><td class="p-3">${dtl(d)}</td><td class="p-3 text-right"><button onclick="pratinjau('${d.spk}','${d.jenis}','${d.id}')" class="border border-slate-300 rounded-lg px-2.5 py-1 text-xs">${d.jenis == 'bap' ? 'Cetak BAP + Kuitansi' : d.jenis == 'rks' ? '🖨 Cetak Ringkasan' : 'Cetak'}</button> <button onclick="frmDok('${d.id}')" class="border border-slate-300 rounded-lg px-2.5 py-1 text-xs">Ubah</button> <button onclick="delDok('${d.id}')" class="border border-slate-300 rounded-lg px-2.5 py-1 text-xs text-rose-600">Hapus</button></td></tr>`; }).join('') || '<tr><td colspan="5" class="p-10 text-center text-slate-400">' + (dj == 'rks' ? 'Belum ada Ringkasan Belanja.' : 'Belum ada nomor ' + DJ[dj][0] + '.') + '</td></tr>'}</tbody></table></div>`;
}
function frmDok(id) {
  if (!S.rows.length) { notify('Buat SPK terlebih dahulu.'); return; }
  if (dj == 'rks') return frmRks(id);
  const pakai = {}; (S.dok || []).forEach(x => { if (x.jenis == dj && x.id != id) pakai[x.spk] = 1; });
  const sisaSpk = S.rows.filter(s => !pakai[s.id] && s.status != 'Draft');
  if (!id && !sisaSpk.length) { notify('Tidak ada SPK/SPB/SP berstatus Terbit yang belum memiliki ' + DJ[dj][0] + '.'); return; }
  const d = id ? S.dok.find(x => x.id == id) : {tanggal: new Date().toISOString().slice(0, 10), spk: sisaSpk[0].id};
  const ex = {bapp:[['persen','Progres Pekerjaan (%)','n'],['uraian','Uraian Pekerjaan (= Nama Paket Pekerjaan pada SPK/SPB)','r']],baphp:[['hasil','Hasil Pemeriksaan','s'],['uraian','Catatan Pemeriksaan','x']],bast:[['pihak','Pihak Penerima','t'],['uraian','Catatan','x']],bap:[['termin','Termin Pembayaran','t'],['nilai','Nilai Dibayar (Rp, termasuk PPN)','n']]}[dj];
  const fld = f => L(f[1], f[2] == 'r' ? `<textarea id="d_${f[0]}" rows="3" readonly tabindex="-1" class="${CL} bg-slate-50">${e(d[f[0]])}</textarea>` : f[2] == 'x' ? `<textarea id="d_${f[0]}" rows="3" class="${CL}">${e(d[f[0]])}</textarea>` : f[2] == 's' ? `<select id="d_${f[0]}" class="${CL}">${['Hasil pekerjaan sesuai', 'Perlu perbaikan'].map(o => `<option ${o == d[f[0]] ? 'selected' : ''}>${o}</option>`).join('')}</select>` : inp('d_' + f[0], '', f[2] == 'n' ? 'number' : 'text', `value="${e(d[f[0]])}"`));
  $('md').innerHTML = `<div class="fixed inset-0 bg-black/50 z-50 grid place-items-center p-4"><div class="bg-white rounded-xl p-5 w-full max-w-lg max-h-[90vh] overflow-auto space-y-3"><div><h3 class="font-bold">${id ? 'Ubah' : 'Terbitkan'} Nomor ${DJ[dj][0]}</h3><p class="text-[11px] text-slate-500">${DJ[dj][1]}</p></div>
  ${noDokHtml()}
  ${L('Tanggal *', inp('d_tanggal', '', 'date', `value="${e(d.tanggal)}" oninput="noDokUpd()"`))}
  ${L('SPK Terkait *', `<select id="d_spk" onchange="dokSpk()" class="${CL}">${S.rows.filter(s => id ? s.id == d.spk : (!pakai[s.id] && s.status != 'Draft')).map(s => `<option value="${e(s.id)}" ${s.id == d.spk ? 'selected' : ''}>${e(s.nomor)} - ${e(s.nama)}</option>`).join('')}</select>`)}
  ${ex.map(fld).join('')}
  <div class="flex justify-end gap-2 pt-1"><button onclick="$('md').innerHTML=''" class="border border-slate-300 rounded-lg px-4 py-2 font-medium">Batal</button><button id="d_ok" onclick="svDok('${id || ''}')" class="bg-navy text-white rounded-lg px-4 py-2 font-semibold">Simpan</button></div></div></div>`;
  noDokInit(d); dokSpk();
}
/* ---------- NOMOR DOKUMEN (gaya penomoran SPK/SPB):
 * 000.3.2/<manual maks. 3>/<KODE>/UM-SETDA/<bulan pembuatan romawi>/<tahun anggaran>
 * KODE: BAPP, BAPHP, BAST, BAP. Ringkasan Belanja tidak bernomor. ---------- */
var DKODE = {bapp: 'BAPP', baphp: 'BAPHP', bast: 'BAST', bap: 'BAP'}, DNOM = {};
var dnoRe = k => new RegExp('^000\\.3\\.2\\/([A-Za-z0-9]{1,3})\\/' + k + '\\/(?:UM-SETDA|UM-RT\\.(?:BUP|WABUP|SEKDA))\\/([IVX]+)\\/(\\d{4})$');
/** Kode unit mengikuti pos anggaran SPK yang dipilih (Bagian Umum tetap UM-SETDA). */
var unitDok = () => {
  const s = S.rows.find(x => x.id == $('d_spk').value) || {}, a = (S.ang || []).find(x => x.full == String(s.kodrek || '').trim());
  const ku = a && UNIT_KODE[a.unit];
  if (dj == 'bast' && s.jenis == 'SP') return 'UM-SETDA'; // BAST untuk SP tetap UM-SETDA
  return ku || 'UM-SETDA';
};
var noDokHtml = () => `<div><label class="block text-xs font-semibold text-slate-600 mb-1">Nomor ${DJ[dj][0]} *</label>
  <div class="flex items-center gap-3 flex-wrap sm:flex-nowrap"><input id="d_noin" maxlength="3" autocomplete="off" oninput="this.value=this.value.replace(/[^A-Za-z0-9]/g,'').slice(0,3);noDokUpd()" placeholder="001" class="w-full sm:w-32 rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20">
  <span id="d_nopv" class="w-full sm:flex-1 min-w-0 rounded-lg border border-slate-200 bg-slate-100 px-3 py-2.5 text-sm font-bold text-slate-600 whitespace-nowrap overflow-hidden text-ellipsis"></span></div>
  <input id="d_nomor" type="hidden"><p id="d_nohint" class="text-[11px] text-slate-500 mt-1">Isi nomor urut secara manual (maksimal 3 angka/huruf). Bulan romawi mengikuti bulan pembuatan.</p></div>`;
function noDokInit(d) {
  const k = DKODE[dj], m = String(d.nomor || '').trim().match(dnoRe(k)), dib = d.dibuat ? new Date(d.dibuat) : new Date();
  DNOM = {k: k, rom: romTgl(d.tanggal), th: m ? m[3] : String(S.set.tahun || new Date().getFullYear()), lama: d.nomor && !m ? String(d.nomor) : ''};
  $('d_noin').value = m ? m[1] : '';
  if (DNOM.lama) $('d_nohint').innerHTML = 'Nomor lama: <b>' + e(DNOM.lama) + '</b> — tetap dipakai bila kolom di atas dikosongkan.';
  noDokUpd();
}
function noDokUpd() {
  if (!$('d_noin')) return;
  const n = $('d_noin').value.trim();
  if ($('d_tanggal')) DNOM.rom = romTgl($('d_tanggal').value);
  const suf = '/' + DNOM.k + '/' + unitDok() + '/' + DNOM.rom + '/' + DNOM.th;
  $('d_nopv').textContent = '000.3.2/' + (n || '____') + suf;
  $('d_nomor').value = n ? '000.3.2/' + n + suf : DNOM.lama;
}
/** Uraian Pekerjaan BAPP = Nama Paket Pekerjaan / Proyek pada SPK/SPB terpilih. */
function dokSpk() { const u = $('d_uraian'), s = S.rows.find(x => x.id == $('d_spk').value); if (dj == 'bapp' && u && s) u.value = s.nama || ''; if ($('d_noin')) noDokUpd(); }
/* ---------- RINGKASAN BELANJA BARANG DAN JASA ---------- */
function frmRks(id) {
  const ada = {}; (S.dok || []).forEach(x => { if (x.jenis == 'rks' && x.id != id) ada[x.spk] = 1; });
  const pilih = S.rows.filter(s => !ada[s.id] && s.status != 'Draft');
  if (!id && !pilih.length) { notify('Semua SPK sudah memiliki Ringkasan Belanja. Gunakan tombol Ubah.'); return; }
  const d = id ? S.dok.find(x => x.id == id) : {spk: pilih[0].id, program: S.set.program, kegiatan: S.set.kegiatan, subkeg: S.set.subkeg, satuan: 'hari kalender'};
  mdlW(`<div><h3 class="font-bold">${id ? 'Ubah' : 'Buat'} Ringkasan Belanja</h3><p class="text-[11px] text-slate-500">Ringkasan Belanja Barang dan Jasa — menggabungkan SP, BAPP, BAPHP, BAST, BAP, dan data penyedia.</p></div>
  ${L('SPK Terkait *', `<select id="d_spk" onchange="rksSpk(true)" class="${CL}">${S.rows.filter(s => s.status != 'Draft' || s.id == d.spk).map(s => `<option value="${e(s.id)}" ${s.id == d.spk ? 'selected' : ''} ${ada[s.id] ? 'disabled' : ''}>${e(s.nomor)} - ${e(s.nama)}${ada[s.id] ? ' (sudah ada)' : ''}</option>`).join('')}</select>`)}
  <div id="rk_info"></div>
  ${L('Program', inp('d_program', 'mis. PENUNJANG URUSAN PEMERINTAHAN KABUPATEN/KOTA', 'text', `value="${e(d.program)}"`))}
  ${L('Kegiatan', inp('d_kegiatan', 'mis. Fasilitasi Kerumahtanggaan Sekretariat Daerah', 'text', `value="${e(d.kegiatan)}"`))}
  ${L('Sub Kegiatan', inp('d_subkeg', 'mis. Penyediaan Kebutuhan Rumah Tangga Wakil Kepala Daerah', 'text', `value="${e(d.subkeg)}"`))}
  <div class="grid grid-cols-2 gap-3">${L('Masa Pelaksanaan (jumlah)', inp('d_hari', '', 'number', `value="${e(d.hari)}" min="0"`))}${L('Satuan', `<select id="d_satuan" onchange="rksHari()" class="${CL}">${['hari kalender', 'hari kerja'].map(o => `<option ${o == d.satuan ? 'selected' : ''}>${o}</option>`).join('')}</select>`)}</div>
  <p class="text-[11px] text-slate-500 -mt-1">Dihitung otomatis dari tanggal mulai–selesai SPK; boleh diubah. <a onclick="rksHari()" class="text-brand cursor-pointer">Hitung ulang</a></p>
  ${L('Tanggal Ringkasan (tanggal tanda tangan) *', inp('d_tanggal', '', 'date', `value="${e(d.tanggal)}" oninput="noDokUpd()"`))}
  <p class="text-[11px] text-slate-500 -mt-1">Bawaan: tanggal BAP. Program, Kegiatan, dan Sub Kegiatan bawaan diambil dari SPK (pos anggaran).</p>
  <div class="flex justify-end gap-2 pt-1"><button onclick="$('md').innerHTML=''" class="border border-slate-300 rounded-lg px-4 py-2 font-medium">Batal</button><button id="d_ok" onclick="svDok('${id || ''}')" class="bg-navy text-white rounded-lg px-4 py-2 font-semibold">Simpan</button></div>`, 'max-w-lg');
  rksSpk(!id);
}
/** Tampilkan kelengkapan dokumen dasar SPK terpilih; untuk ringkasan baru isi otomatis tanggal & masa pelaksanaan. */
function rksSpk(isi) {
  const sid = $('d_spk').value, s = S.rows.find(x => x.id == sid) || {};
  const chip = (ok, t) => `<span class="inline-block border rounded-md px-2 py-0.5 text-[11px] font-semibold mr-1 mb-1 ${ok ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'}">${ok ? '✔' : '✕'} ${t}</span>`;
  const miss = [!s.kodrek && 'kode rekening', !s.tgl && 'tanggal SP', !(s.mulai && s.selesai) && 'tanggal mulai/selesai', !s.direktur && 'penanggung jawab', !s.bank && 'bank', !s.rekening && 'no. rekening'].filter(Boolean);
  $('rk_info').innerHTML = `<div class="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs"><div class="font-semibold mb-1.5">Dokumen dasar</div>${DASAR.map(x => { const d = dokOf(sid, x[0]); return chip(d, x[1] + (d ? ' ' + e(d.nomor) : '')); }).join('')}${miss.length ? `<div class="text-amber-700 mt-1">Data SPK belum lengkap: <b>${miss.join(', ')}</b> (lengkapi lewat ✏ Edit SPK).</div>` : ''}</div>`;
  if (isi) { const b = dokOf(sid, 'bap'); $('d_tanggal').value = b ? b.tanggal : new Date().toISOString().slice(0, 10); rksHari();
    ['program', 'kegiatan', 'subkeg'].forEach(f => { $('d_' + f).value = s[f] || S.set[f] || ''; }); }
}
function rksHari() { const s = S.rows.find(x => x.id == $('d_spk').value) || {}, n = hitungHari(s.mulai, s.selesai, $('d_satuan').value); $('d_hari').value = n || ''; }
function autoDok() { API.run.withSuccessHandler(n => { $('d_nomor').value = n; }).withFailureHandler(x => notify(x.message)).nomorBerikut(dj, S.set.tahun); }
function svDok(id) {
  const g = k => $('d_' + k) ? $('d_' + k).value.trim() : '';
  if (dj != 'rks' && !g('nomor')) { notify('Isi nomor urut ' + DJ[dj][0] + ' (maksimal 3 angka/huruf).'); $('d_noin').focus(); return; }
  if (!g('tanggal') || !g('spk')) { notify(dj == 'rks' ? 'Lengkapi SPK dan tanggal ringkasan.' : 'Lengkapi nomor, tanggal, dan SPK.'); return; }
  const o = {jenis: dj, nomor: g('nomor'), tanggal: g('tanggal'), spk: g('spk'), uraian: g('uraian'), persen: g('persen'), hasil: g('hasil'), pihak: g('pihak'), termin: g('termin'), nilai: g('nilai'),
    program: g('program'), kegiatan: g('kegiatan'), subkeg: g('subkeg'), satuan: g('satuan'), hari: g('hari')};
  if (id) { o.id = id; o.dibuat = S.dok.find(x => x.id == id).dibuat; }
  if (o.jenis != 'rks' && S.dok.some(x => x.jenis == o.jenis && x.id != id && String(x.nomor) == String(o.nomor))) { notify('Nomor ' + o.nomor + ' sudah digunakan.'); return; }
  if (!id) { o.id = uid(); o.dibuat = new Date().toISOString(); }
  const k = S.dok.findIndex(x => x.id == o.id);
  if (k >= 0) S.dok[k] = o; else S.dok.push(o);
  const nx = {bapp: 'baphp', baphp: 'bast', bast: 'bap', bap: 'kuitansi'}[o.jenis], sp = S.rows.find(x => x.id == o.spk);
  if (nx && sp && ST.indexOf(sp.tahap) < ST.indexOf(nx)) sp.tahap = nx;
  $('md').innerHTML = ''; draw();
  tulis('saveDok', [o], r => {
    if (!id && o.jenis == 'rks') ask('Ringkasan Belanja berhasil disimpan.\nPratinjau dan cetak sekarang?', () => pratinjau(r.row.spk, 'rks', r.row.id), 'Cetak sekarang');
    if (!id && o.jenis == 'bap') ask('BAP berhasil diterbitkan bersama Kuitansi.\nCetak BAP beserta Kuitansi sekarang?', () => pratinjau(r.row.spk, 'bap', r.row.id), 'Cetak sekarang');
  }, x => { notify(x.message); refresh(); });
}
function delDok(id) {
  ask('Hapus nomor dokumen ini? Tahap SPK tidak dikembalikan otomatis.', () => {
  S.dok = S.dok.filter(x => x.id != id); draw(); tulis('delDok', [id]);
  });
}

/* ---------- AKUN: GANTI KATA SANDI & MANAJEMEN PENGGUNA ---------- */
var U = null;
var mdl = h => { $('md').innerHTML = `<div class="fixed inset-0 bg-black/50 z-50 grid place-items-center p-4"><div class="bg-white rounded-xl p-5 w-full max-w-md max-h-[90vh] overflow-auto space-y-3">${h}</div></div>`; };
var pw = id => `<input id="${id}" type="password" autocomplete="new-password" class="${CL}">`;
var mbtn = (ok, id, fn, lbl) => `<p id="${id}_err" class="text-[11px] text-rose-600 min-h-[16px]"></p><div class="flex justify-end gap-2"><button onclick="$('md').innerHTML=''" class="border border-slate-300 rounded-lg px-4 py-2 font-medium">Batal</button><button id="${id}_ok" onclick="${fn}" class="bg-navy text-white rounded-lg px-4 py-2 font-semibold">${lbl}</button></div>`;
function frmSandi() {
  mdl(`<h3 class="font-bold">Ganti Kata Sandi</h3>${L('Kata sandi lama', pw('p_lama'))}${L('Kata sandi baru (min. 8 karakter)', pw('p_baru'))}${L('Ulangi kata sandi baru', pw('p_ulang'))}${mbtn(0, 'p', 'svSandi()', 'Simpan')}`);
}
function svSandi() {
  const a = $('p_lama').value, b = $('p_baru').value, c = $('p_ulang').value, er = $('p_err'), ok = $('p_ok');
  if (!a || !b) { er.textContent = 'Lengkapi semua isian.'; return; }
  if (b.length < 8) { er.textContent = 'Kata sandi baru minimal 8 karakter.'; return; }
  if (b !== c) { er.textContent = 'Kata sandi baru tidak sama.'; return; }
  if (b === a) { er.textContent = 'Kata sandi baru harus berbeda dari yang lama.'; return; }
  ok.disabled = true; ok.textContent = 'Menyimpan...';
  API.run.withSuccessHandler(() => { $('md').innerHTML = ''; notify('Kata sandi berhasil diganti.'); })
    .withFailureHandler(x => { er.textContent = x.message; ok.disabled = false; ok.textContent = 'Simpan'; }).gantiSandi(SESI.t, a, b);
}
function akunCard() {
  return `<div class="bg-white rounded-xl border border-slate-200 p-5 mt-4"><h3 class="font-bold text-sm mb-1">Akun Saya</h3><p class="text-[11px] text-slate-500 mb-3">Masuk sebagai <b>${e(SESI.u)}</b> (${ROLE_LBL[SESI.role] || 'Pengguna'}).</p><button onclick="frmSandi()" class="bg-navy text-white rounded-lg px-3 py-1.5 text-xs font-semibold">Ganti Kata Sandi</button></div>`;
}
function userView() {
  if (U === null) {
    API.run.withSuccessHandler(r => { U = r; draw(); }).withFailureHandler(x => { U = []; notify(x.message); draw(); }).daftarUser(SESI.t);
    return '<div class="text-center py-20 text-slate-400">Memuat pengguna...</div>';
  }
  return `<div class="flex justify-between items-center flex-wrap gap-2 mb-4"><div><h1 class="text-xl font-extrabold">Manajemen Pengguna</h1><p class="text-slate-500 text-xs">Kelola akun yang dapat masuk ke SiPerkasa. Menu ini hanya untuk administrator.</p></div><button onclick="frmUser()" class="bg-navy text-white rounded-lg px-3.5 py-2 text-xs font-semibold">+ Tambah Pengguna</button></div>
  <div class="bg-white rounded-xl border border-slate-200 tw"><table class="w-full text-left"><thead class="text-[10px] uppercase tracking-wide text-slate-400"><tr><th class="p-3">Username / NIP</th><th class="p-3">Nama</th><th class="p-3">Jabatan</th><th class="p-3">Peran</th><th class="p-3 text-right">Aksi</th></tr></thead><tbody class="divide-y divide-slate-100">
  ${U.map((u, i) => `<tr><td class="p-3 font-semibold">${e(u.username)}</td><td class="p-3">${e(u.nama)}</td><td class="p-3">${e(u.jabatan)}</td><td class="p-3"><span class="border rounded-md px-2 py-1 text-[11px] font-semibold ${u.role == 'admin' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-slate-100 text-slate-600 border-slate-200'}">${e(ROLE_LBL[u.role] || 'Pengguna')}</span></td><td class="p-3 text-right"><button onclick="frmUser(${i})" class="border border-slate-300 rounded-lg px-2.5 py-1 text-xs">Ubah / Reset Sandi</button>${String(u.username).toLowerCase() == String(SESI.u).toLowerCase() ? '' : ` <button onclick="hpsUser(${i})" class="border border-slate-300 rounded-lg px-2.5 py-1 text-xs text-rose-600">Hapus</button>`}</td></tr>`).join('') || '<tr><td colspan="5" class="p-10 text-center text-slate-400">Belum ada pengguna.</td></tr>'}</tbody></table></div>`;
}
function frmUser(i) {
  const ed = i != null, u = ed ? U[i] : {role: 'user', jabatan: 'PPTK'};
  const jb = [...new Set(['PPK', 'PPTK', 'Bendahara', 'Operator', 'Administrator', u.jabatan].filter(Boolean))];
  mdl(`<h3 class="font-bold">${ed ? 'Ubah' : 'Tambah'} Pengguna</h3>
  ${L('Username / NIP *', `<input id="u_usr" value="${e(u.username)}" ${ed ? 'readonly' : ''} class="${CL}">`)}
  ${L('Nama lengkap', `<input id="u_nama" value="${e(u.nama)}" class="${CL}">`)}
  ${L('Jabatan', `<select id="u_jab" class="${CL}">${jb.map(o => `<option ${o == u.jabatan ? 'selected' : ''}>${e(o)}</option>`).join('')}</select>`)}
  ${L('Peran', `<select id="u_role" class="${CL}">${Object.keys(ROLE_LBL).map(k => `<option value="${k}" ${u.role == k ? 'selected' : ''}>${ROLE_LBL[k]}</option>`).join('')}</select>`)}
  <p class="text-[11px] text-slate-500 -mt-1">Op Bupati / Op Wabup / Op Sekda hanya dapat mengakses Dashboard, Buat SPK Baru, BAPP/BAPHP/BAST/BAP, dan Penyelesaian Keuangan, serta hanya untuk data dan anggaran unitnya.</p>
  ${L(ed ? 'Kata sandi baru (kosongkan jika tidak diubah)' : 'Kata sandi * (min. 8 karakter)', pw('u_pw'))}${mbtn(0, 'u', 'svUser()', 'Simpan')}`);
}
function svUser() {
  const g = k => $('u_' + k).value.trim(), er = $('u_err'), ok = $('u_ok'), p = $('u_pw').value;
  if (g('usr').length < 3) { er.textContent = 'Username minimal 3 karakter.'; return; }
  if (p && p.length < 8) { er.textContent = 'Kata sandi minimal 8 karakter.'; return; }
  ok.disabled = true; ok.textContent = 'Menyimpan...';
  API.run.withSuccessHandler(() => { U = null; $('md').innerHTML = ''; draw(); })
    .withFailureHandler(x => { er.textContent = x.message; ok.disabled = false; ok.textContent = 'Simpan'; })
    .simpanUser(SESI.t, {username: g('usr'), nama: g('nama'), jabatan: g('jab'), role: g('role'), password: p});
}
function hpsUser(i) {
  ask('Hapus pengguna ' + U[i].username + '?', () => {
  API.run.withSuccessHandler(() => { U = null; draw(); }).withFailureHandler(x => notify(x.message)).hapusUser(SESI.t, U[i].username);
  });
}

/* ---------- TEMPLATE CETAK (KERTAS LEGAL) ---------- */
var HARI = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'], BLN = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
var DEFSET = {kop1: 'PEMERINTAH KABUPATEN BULUNGAN', kop2: 'SEKRETARIAT DAERAH', kop3: 'Jalan Jelarai Telp. (0552) 21008 – 23316 Faks (0552) 21009', kota: 'Tanjung Selor', ppk_jab: 'Pejabat Pembuat Komitmen'};
function tb(n) {
  n = Math.floor(n); const s = ['', 'satu', 'dua', 'tiga', 'empat', 'lima', 'enam', 'tujuh', 'delapan', 'sembilan', 'sepuluh', 'sebelas'];
  if (n < 12) return s[n]; if (n < 20) return tb(n - 10) + ' belas';
  if (n < 100) return tb(n / 10) + ' puluh ' + tb(n % 10); if (n < 200) return 'seratus ' + tb(n - 100);
  if (n < 1e3) return tb(n / 100) + ' ratus ' + tb(n % 100); if (n < 2e3) return 'seribu ' + tb(n - 1e3);
  if (n < 1e6) return tb(n / 1e3) + ' ribu ' + tb(n % 1e3); if (n < 1e9) return tb(n / 1e6) + ' juta ' + tb(n % 1e6);
  return tb(n / 1e9) + ' miliar ' + tb(n % 1e9);
}
var wd = n => (tb(n) || 'nol').replace(/\s+/g, ' ').trim();
var terb = n => { const w = wd(n); return w.charAt(0).toUpperCase() + w.slice(1) + ' rupiah'; };
var fmt = n => (+n || 0).toLocaleString('id-ID');
var pd = d => String(d || '').split('-').map(Number);
var dl = d => { const p = pd(d); return p.length < 3 || !p[0] ? '........' : p[2] + ' ' + BLN[p[1] - 1] + ' ' + p[0]; };
var tglTxt = d => { const p = pd(d); if (p.length < 3 || !p[0]) return '........'; return HARI[new Date(p[0], p[1] - 1, p[2]).getDay()] + ' Tanggal ' + wd(p[2]) + ' Bulan ' + BLN[p[1] - 1] + ' tahun ' + wd(p[0]); };

/** Tujuan/lokasi pada Keterangan SPK/SPB/SP, mengikuti unit pos anggaran yang dipilih. */
var TUJUAN = {umum: 'Bagian Umum Setda Kab. Bulungan', bupati: 'Rumah Jabatan Bupati Kab. Bulungan', wabup: 'Rumah Jabatan Wakil Bupati Kab. Bulungan', setda: 'Rumah Jabatan Sekretaris Daerah Kab. Bulungan'};
var tujuanSpb = s => { const a = (S.ang || []).find(x => x.full == String(s.kodrek || '').trim()); return (a && TUJUAN[a.unit]) || ''; };

function ctx(sid) {
  const s = S.rows.find(x => x.id == sid), st = S.set; let it = [];
  try { it = JSON.parse(s.items || '[]'); } catch (x) {}
  const sum = rd(it.reduce((a, x) => a + (+x.q || 0) * (+x.h || 0), 0));
  const kena = rd(it.reduce((a, x) => x.p === 0 ? a : a + (+x.q || 0) * (+x.h || 0), 0)), total0 = sum || rd(s.nilai), ppn = sum ? kena - rd(kena / (1 + ppnR(s.kategori))) : total0 - rd(total0 / (1 + ppnR(s.kategori)));
return {s, st, it, sum, total: total0, ppn, tujuan: tujuanSpb(s) || st.satker || '..............',
    dk: j => (S.dok || []).filter(d => d.spk == sid && d.jenis == j).sort((a, b) => String(a.tanggal).localeCompare(String(b.tanggal))),
    v: {nama: s.direktur, jab: 'Direktur ' + s.vendor, alm: s.alamat || st.kota},
    ppk: {nama: st.ppk_nama, nip: st.ppk_nip, jab: st.ppk_jab || 'Pejabat Pembuat Komitmen', alm: st.kota},
    pptk: st.pptk_nama ? {nama: st.pptk_nama, nip: st.pptk_nip} : {nama: st.ppk_nama, nip: st.ppk_nip}, // PPTK; cadangan: PPK (data lama)
    kpa: {nama: st.kpa_nama, nip: st.kpa_nip, jab: st.kpa_jab || '', alm: st.kota}};
}
var kopH = mini => `<div class="dkop${mini ? ' mini' : ''}">${window.KOP ? `<img src="${window.KOP}">` : ''}<div class="dkt"><div class="k1">${e(S.set.kop1)}</div><div class="k2">${e(S.set.kop2)}</div>${mini ? '' : `<div class="k3">${e(S.set.kop3)}</div><div class="k4">${e(String(S.set.kota || '').toUpperCase())}</div>`}</div></div>`;
var judul = (t, n) => `<div class="dj">${t}</div><div class="dn">Nomor : ${e(n || '-')}</div>`;
var pihak = (n, nama, jab, alm, sb) => `<table class="p"><tr><td style="width:22px">${n}.</td><td style="width:62px">Nama</td><td style="width:10px">:</td><td>${e(nama || '..............')}</td></tr><tr><td></td><td>Jabatan</td><td>:</td><td>${jab}</td></tr><tr><td></td><td>Alamat</td><td>:</td><td>${e(alm)}, Selanjutnya disebut ${sb}</td></tr></table>`;
var ttd = (a, b, nama, sub, m) => `${a}<br>${b}<div class="sp${m ? ' spm' : ''}"></div><span class="u">${e(nama || '..............')}</span><br>${sub}`;
var sig = (l, r) => `<div class="sg"><div>${l}</div><div>${r}</div></div>`;
var kv = (arr, abc, lw) => `<table class="p">${arr.map((r, i) => `<tr>${abc === false ? '' : `<td style="width:20px">${String.fromCharCode(97 + i)}.</td>`}<td style="width:${lw || 175}px${lw ? ';white-space:nowrap' : ''}">${r[0]}</td><td style="width:10px">:</td><td>${r[1]}</td></tr>`).join('')}</table>`;
var nip = x => 'NIP. ' + e(x || '..............');
/** dpp = true: tampilkan baris DPP saja (untuk SPB); selain itu baris "Sudah termasuk PPN". */
var tblItems = (c, lab, ter, dpp) => { const bp = c.ppn > 0, nt = c.it.some(x => x.p === 0), atas = dpp || bp;
  const baris = (t, v, tt) => { const st = 'border-bottom:0;padding-bottom:0' + (tt ? ';border-top:0' : ''); return `<tr><td colspan="4" align="right" style="${st}"><i style="font-size:9pt">${t}</i></td><td align="right" style="${st}"><i style="font-size:9pt">${fmt(v)}</i></td></tr>`; };
  return `<table class="t"><tr><th style="width:28px">No</th><th>${lab}</th><th style="width:80px">Banyaknya</th><th style="width:90px">Harga Satuan</th><th style="width:92px">Jumlah</th></tr>${c.it.map((x, i) => `<tr><td align="center">${i + 1}</td><td>${e(x.u)}${x.p === 0 ? ' *' : ''}</td><td align="center">${e(x.q)} ${e(x.s)}</td><td align="right">${fmt(x.h)}</td><td align="right">${fmt(rd((+x.q || 0) * (+x.h || 0)))}</td></tr>`).join('') || '<tr><td colspan="5" align="center">(rincian belum diisi)</td></tr>'}${dpp ? baris('DPP', c.total - c.ppn) : ''}${bp ? baris('Sudah termasuk ' + ppnLbl(c.s.kategori), c.ppn, dpp) : ''}<tr><td colspan="4" align="right"${atas ? ' style="border-top:0"' : ''}><b>Jumlah</b></td><td align="right"${atas ? ' style="border-top:0"' : ''}><b>${fmt(c.total)}</b></td></tr></table>${nt ? '<p style="font-size:9pt;margin:2px 0"><i>* Tidak dikenakan PPN</i></p>' : ''}${ter ? `<p><b><i>Terbilang : ${terb(c.total)}</i></b></p>` : ''}`; };

var TPL = {
  spb: c => c.s.jenis == 'SPK' ? TPL.spk(c) : `${kopH()}<div class="dj">${c.s.jenis == 'SPK' ? 'SURAT PERINTAH KERJA' : c.s.jenis == 'SP' ? 'SURAT PESANAN' : 'SURAT PEMESANAN BARANG'}</div><div class="dn">Nomor : ${e(c.s.nomor)}</div>
  <p style="text-align:left">Kepada Yth. ${e(c.v.jab)}<br>Di-<br>&nbsp;&nbsp;&nbsp;&nbsp;<u>${e(c.st.kota)}</u></p>
  <p>Dengan hormat,<br>Untuk menunjang peralatan dan perlengkapan ${e(c.st.satker || '..............')}, ${c.s.jenis == 'SPK' ? 'maka kami memerintahkan pelaksanaan pekerjaan sebagai berikut :' : 'maka kami bermohon untuk memesan barang/jasa sebagai berikut :'}</p>
  ${tblItems(c, 'Uraian', false, c.s.jenis == 'SPB' || c.s.jenis == 'SP')}
  <p><b>Keterangan :</b><br>Untuk keperluan Pada ${e(c.tujuan)}.</p>
  <p>${c.s.jenis == 'SPK' ? 'Pekerjaan tersebut agar dilaksanakan dan diselesaikan sesuai ketentuan yang berlaku.' : 'Barang-barang yang kami pesan tersebut dibutuhkan, harap segera dikirim ke ' + e(c.tujuan) + '.'}</p>
  <p>Pembayaran dapat dilakukan melalui ${e(c.s.sumber || 'APBD')} Tahun ${e(c.st.tahun)} setelah pekerjaan penyediaan barang ini telah selesai dengan baik serta dibuatkan berita acara serah terima barang.</p>
  ${sig(ttd('&nbsp;', 'Rekanan<br>' + e(c.s.vendor), c.v.nama, 'Direktur').replace('&nbsp;<br>', ''), ttd(e(c.st.kota) + ', ' + dl(c.s.tgl), e(c.ppk.jab), c.ppk.nama, nip(c.ppk.nip)))}`,

  bapp: (c, d) => `${kopH()}${judul('BERITA ACARA PENYELESAIAN PEKERJAAN', d.nomor)}
  <p>Pada hari ini, ${tglTxt(d.tanggal)}, yang bertanda tangan dibawah ini :</p>
  ${pihak(1, c.ppk.nama, e(c.ppk.jab), c.ppk.alm, 'PIHAK KESATU')}${pihak(2, c.v.nama, e(c.v.jab), c.v.alm, 'PIHAK KEDUA')}
  <p><span class="u">Pasal 1</span><br>PIHAK KESATU telah memerintahkan PIHAK KEDUA untuk melaksanakan Pekerjaan ${e(c.s.nama)} dan PIHAK KEDUA menyatakan menerima pekerjaan tersebut sesuai ${jnm(c.s)} Nomor : ${e(c.s.nomor)} Tanggal ${dl(c.s.tgl)}.</p>
  <p><span class="u">Pasal 2</span><br>PIHAK KEDUA menyatakan telah menyelesaikan pekerjaan tersebut dengan baik${d.persen ? ' (progres ' + e(d.persen) + '%)' : ''}.${d.uraian ? ' ' + e(d.uraian) : ''}</p>
  <p>Demikian Berita Acara Penyelesaian Pekerjaan ini dibuat dengan sebenarnya agar dapat dipergunakan sebagaimana mestinya.</p>
  ${sig(ttd('Yang menyerahkan', 'PIHAK KEDUA', c.v.nama, 'Direktur'), ttd('Yang menerima', e(c.ppk.jab), c.ppk.nama, nip(c.ppk.nip)))}`,

  baphp: (c, d) => `${kopH()}${judul('BERITA ACARA PEMERIKSAAN HASIL PEKERJAAN', d.nomor)}
  <p>Pada hari ini, ${tglTxt(d.tanggal)}, yang bertanda tangan dibawah ini :</p>
  ${pihak(1, c.ppk.nama, e(c.ppk.jab), c.ppk.alm, 'PIHAK KESATU')}${pihak(2, c.v.nama, e(c.v.jab), c.v.alm, 'PIHAK KEDUA')}
  <p>PIHAK KESATU telah melakukan pemeriksaan terhadap hasil pekerjaan pengadaan barang/jasa yang telah dikerjakan oleh PIHAK KEDUA selaku penyedia barang/jasa sesuai dengan ${jnm(c.s)} Nomor : ${e(c.s.nomor)} Tanggal ${dl(c.s.tgl)}.</p>
  <p style="text-align:center"><b>NAMA PEKERJAAN PENGADAAN BARANG/JASA YANG DIPERIKSA :</b></p>
  ${tblItems(c, 'Uraian Pekerjaan', true)}
  <p>PIHAK KESATU melakukan pemeriksaan terhadap hasil pekerjaan yang dilaksanakan oleh PIHAK KEDUA sesuai dengan kriteria/spesifikasi yang tercantum dalam kontrak/surat pesanan.</p>
  <p>${d.hasil == 'Perlu perbaikan' ? 'PIHAK KESATU menyatakan bahwa pekerjaan tersebut masih perlu perbaikan' + (d.uraian ? ' : ' + e(d.uraian) : '') + '.' : 'PIHAK KESATU menyatakan bahwa pekerjaan tersebut telah selesai dengan baik dan lengkap sesuai dengan Kontrak/Surat pesanan.'}</p>
  ${sig(ttd('PIHAK KEDUA', e(c.s.vendor), c.v.nama, 'Direktur'), ttd('PIHAK KESATU', e(c.ppk.jab), c.ppk.nama, nip(c.ppk.nip)))}`,

  bast: (c, d) => { const h = c.dk('baphp').slice(-1)[0] || {};
    return `${kopH()}${judul('BERITA ACARA SERAH TERIMA HASIL PEKERJAAN', d.nomor)}
  <p>Pada hari ini, ${tglTxt(d.tanggal)}, yang bertanda tangan dibawah ini :</p>
  ${pihak(1, c.v.nama, e(c.v.jab), c.v.alm, 'PIHAK PERTAMA')}${pihak(2, c.ppk.nama, e(c.ppk.jab), c.ppk.alm, 'PIHAK KEDUA')}
  <p>Dengan ini PIHAK PERTAMA selaku Penyedia Barang/Jasa dan PIHAK KEDUA selaku PPK telah setuju dan sepakat untuk melakukan Serah Terima Barang/Jasa atau hasil Pekerjaan Pengadaan ${e(c.s.nama)} sesuai ${jnm(c.s)} Nomor : ${e(c.s.nomor)} tanggal ${dl(c.s.tgl)}.</p>
  <p>PIHAK PERTAMA menyerahkan hasil pekerjaan tersebut kepada PIHAK KEDUA dan PIHAK KEDUA menerima berdasarkan BAPHP nomor : ${e(h.nomor || '-')} Tanggal ${dl(h.tanggal)}.${d.pihak ? ' Diterima oleh ' + e(d.pihak) + '.' : ''}${d.uraian ? ' ' + e(d.uraian) : ''}</p>
  <p style="text-align:center"><b>NAMA PEKERJAAN PENGADAAN BARANG/JASA YANG DISERAHTERIMAKAN :</b></p>
  ${tblItems(c, 'Uraian Pekerjaan', false)}
  <p>Demikian Berita Acara Serah Terima ini dibuat dengan sebenarnya agar dapat dipergunakan sebagaimana mestinya</p>
  ${sig(ttd('Yang menyerahkan', 'PIHAK PERTAMA', c.v.nama, 'Direktur'), ttd('Yang menerima', 'PIHAK KEDUA', c.ppk.nama, nip(c.ppk.nip)))}
  <div class="cn">Mengetahui,<br>Kuasa Pengguna Anggaran<div class="sp"></div><span class="u">${e(c.kpa.nama || '..............')}</span><br>${nip(c.kpa.nip)}</div>`; },

  bap: (c, d) => { const lst = c.dk('bap'), upto = lst.slice(0, Math.max(1, lst.indexOf(d) + 1)), nil = +d.nilai || c.total, cum = upto.reduce((a, x) => a + (+x.nilai || 0), 0) || nil;
    return `${kopH()}${judul('BERITA ACARA PEMBAYARAN', d.nomor)}
  <p>Pada hari ini, ${tglTxt(d.tanggal)}, yang bertanda tangan dibawah ini :</p>
  ${pihak(1, c.kpa.nama, e(c.kpa.jab) + '<br>Selaku Kuasa Pengguna Anggaran', c.kpa.alm, 'PIHAK KESATU')}${pihak(2, c.v.nama, e(c.v.jab), c.v.alm, 'PIHAK KEDUA')}
  <p>Berdasarkan pada :</p>
  ${kv([['Nomor DPA', e(c.s.dpa || '-')], ['Kode Rekening', e(c.s.kodrek || '-') + ' &nbsp; Tahun Anggaran ' + e(c.st.tahun)], [jnm(c.s) + ' Nomor', e(c.s.nomor) + ' Tanggal ' + dl(c.s.tgl)], ['Nilai ' + jnm(c.s), 'Rp ' + fmt(c.total)], ['Uraian Kegiatan', e(c.s.nama)], ['Lokasi Kegiatan', e(c.s.lokasi || '-')]])}
  <p>Sesuai dengan Berita Acara Penyelesaian Pekerjaan, maka <i>Pihak Kedua</i> berhak menerima Pembayaran dari <i>Pihak Kesatu</i> dengan rincian sebagai berikut :</p>
  <table class="p"><tr><td style="width:20px">1</td><td>Nilai kegiatan sampai dengan BAP ini${d.termin ? ' (' + e(d.termin) + ')' : ''}</td><td align="right" style="width:30px">Rp</td><td align="right" style="width:100px">${fmt(cum)}</td></tr><tr><td>2</td><td>Nilai Pembayaran BAP ini${c.ppn > 0 ? ' termasuk ' + ppnLbl(c.s.kategori) : ' (tidak dikenakan PPN)'}</td><td align="right">Rp</td><td align="right">${fmt(nil)}</td></tr></table>
  <p><b><i>Terbilang : ${terb(nil)}</i></b></p>
  <p>Demikian Berita Acara Pembayaran ini dibuat dalam rangkap 5 (lima) untuk dipergunakan sebagaimana mestinya.</p>
  ${sig(ttd('PIHAK KEDUA', e(c.s.vendor), c.v.nama, 'Direktur', 1), ttd('PIHAK KESATU', 'Kuasa Pengguna Anggaran', c.kpa.nama, nip(c.kpa.nip), 1))}`; },

  rks: (c, d) => { d = d || {}; const g = j => c.dk(j).slice(-1)[0] || {}, p = g('bap'), st = c.st;
    const sat = d.satuan || 'hari kalender', hari = +d.hari || hitungHari(c.s.mulai, c.s.selesai, sat);
    const masa = hari ? hari + ' (' + wd(hari) + ') ' + e(sat) + ' (' + dl(c.s.mulai) + ' s/d ' + dl(c.s.selesai) + ')' : '-';
    const ab = 'abcdefghij', row = (lbl, v, k) => `<tr><td></td><td class="ra">${ab[k]}.</td><td class="rl2">${lbl}</td><td class="rc">:</td><td>${v}</td></tr>`;
    const grp = (n, t, arr) => `<tr><td class="rn">${n}.</td><td colspan="4">${t}</td></tr>` + arr.map((x, k) => row(x[0], x[1], k)).join('');
    const nb = x => [['Nomor', e(x.nomor || '-')], ['Tanggal', dl(x.tanggal)]];
    return `${kopH()}<div class="dj" style="margin-bottom:14px">RINGKASAN BELANJA BARANG DAN JASA</div>
  <table class="p rk rkh">${[['Program', d.program || c.s.program || st.program], ['Kegiatan', d.kegiatan || c.s.kegiatan || st.kegiatan], ['Sub Kegiatan', d.subkeg || c.s.subkeg || st.subkeg], ['Kode Rekening', c.s.kodrek || '-']].map(x => `<tr><td class="rh">${x[0]}</td><td class="rc">:</td><td>${e(x[1] || '..............')}</td></tr>`).join('')}</table>
  <div style="margin-top:2px">Dilakukan pengeluaran atas dasar :</div>
  <table class="p rk">
  ${grp(1, jnmFull(c.s), [['Nomor', e(c.s.nomor)], ['Tanggal', dl(c.s.tgl)], ['Nilai Kontrak', 'Rp <span style="display:inline-block;min-width:96px;text-align:right">' + fmt(c.total) + '</span>'], ['Masa Pelaksanaan', masa]])}
  ${grp(2, 'Berita Acara Penyelesaian Pekerjaan', nb(g('bapp')))}${grp(3, 'Berita Acara Pemeriksaan Hasil Pekerjaan', nb(g('baphp')))}${grp(4, 'Berita Acara Serah Terima Hasil Pekerjaan', nb(g('bast')))}${grp(5, 'Berita Acara Pembayaran', nb(p))}
  </table>
  <p>Berdasarkan dokumen-dokumen tersebut dan didukung dokumentasi yang ada, maka pengeluaran atas belanja dimaksud layak untuk diberikan kepada penyedia barang/jasa dengan data sebagai berikut :</p>
  <table class="p rk">${[['Nama Penyedia', c.s.vendor], ['Penanggungjawab', c.s.direktur], ['NPWP', c.s.npwp], ['Nama Bank', c.s.bank], ['No. Rekening Bank', c.s.rekening]].map((x, k) => row(x[0], e(x[1] || '-'), k)).join('')}</table>
  <p style="line-height:2.1;margin-top:8px">Kebenaran serta kesesuaian materi data dan dokumen yang telah disebutkan diatas adalah benar adanya, dan kami yang bertanda tangan dibawah ini membenarkan dan bertanggung jawab sepenuhnya dengan membubuhkan tanda tangan masing-masing sebagai bukti tanggung jawab.</p>
  ${sig(ttd('&nbsp;', 'Penyedia Barang/Jasa<br>' + e(c.s.vendor), c.v.nama, 'Direktur'), ttd(e(st.kota) + ', ' + dl(d.tanggal || p.tanggal || new Date().toISOString().slice(0, 10)), 'PPTK<br>&nbsp;', c.pptk.nama, nip(c.pptk.nip)))}
  <div class="cn">Menyetujui,<br>Kuasa Pengguna Anggaran<div class="sp"></div><span class="u">${e(c.kpa.nama || '..............')}</span><br>${nip(c.kpa.nip)}</div>`; }
};

/** Surat Perintah Kerja (format Pasal 1–3) — dipakai otomatis untuk dokumen berjenis SPK. */
var cap1 = t => t.charAt(0).toUpperCase() + t.slice(1);
var capW = t => t.replace(/\b\w/g, m => m.toUpperCase());
var hariIni = d => { const p = pd(d); if (p.length < 3 || !p[0]) return '........'; return HARI[new Date(p[0], p[1] - 1, p[2]).getDay()] + ' Tanggal ' + cap1(wd(p[2])) + ' Bulan ' + BLN[p[1] - 1] + ' Tahun ' + capW(wd(p[0])); };
TPL.spk = c => { const K2 = '<i>PIHAK KEDUA</i>';
  const pk = (n, nama, jab, alm, sb) => `<table class="p sk1"><tr><td class="n">${n}.</td><td class="l">Nama</td><td class="c">:</td><td>${e(nama || '..............')}</td></tr><tr><td></td><td class="l">Jabatan</td><td class="c">:</td><td>${jab}</td></tr><tr><td></td><td class="l">Alamat</td><td class="c">:</td><td>${e(alm || '..............')} selanjutnya disebut <b>${sb}</b></td></tr></table>`;
  const p3 = [c.s.denda != 'Tidak' && `Apabila ${K2} tidak dapat menyelesaikan pekerjaan sesuai pasal 1 diatas dengan jangka waktu yang telah ditentukan maka ${K2} dapat dikenakan sanksi 1/1000 ( satu perseribu ) dari nilai Surat Perintah Kerja untuk setiap hari keterlambatan.`,
    `Apabila ternyata hasil pekerjaan pengadaan barang/jasa tidak sesuai dengan perjanjian yang telah disepakati pada pasal 1 diatas (rusak/tidak dapat dipergunakan ) maka ${K2} bertanggung jawab atas hal tersebut.`,
    `Apabila terjadi sesuatu hal yang menimpa terhadap ${K2}, atas kegiatan tersebut pada pasal 1 diatas, maka kejadian / resiko sepenuhnya menjadi tanggungjawab ${K2}.`].filter(Boolean);
  return `${kopH()}<div class="dj">SURAT PERINTAH KERJA</div><div class="dn">Nomor: ${e(c.s.nomor)}</div>
  <p>Pada hari ini, ${hariIni(c.s.tgl)} yang bertanda tangan dibawah ini :</p>
  ${pk(1, c.ppk.nama, e(c.ppk.jab), c.st.kota, 'PIHAK KESATU')}${pk(2, c.v.nama, e(c.v.jab), c.s.alamat || c.st.kota, 'PIHAK KEDUA')}
  <div class="sk-ps">Pasal 1</div>
  <p style="margin-top:0">PIHAK KESATU telah memerintahkan kepada PIHAK KEDUA untuk melaksanakan pekerjaan ${e(c.s.nama)} dengan rincian biaya :</p>
  <table class="t sk-t"><tr><th style="width:36px">NO</th><th>Uraian</th><th style="width:112px">Satuan</th><th style="width:122px">Harga Satuan</th><th style="width:128px">Jumlah</th></tr>${c.it.map((x, i) => `<tr><td align="center" valign="top">${i + 1}</td><td>${e(x.u)}</td><td align="right" valign="top">${e(x.q)} ${e(x.s)}</td><td align="right" valign="top">${fmt(x.h)}</td><td align="right" valign="top">${fmt(rd((+x.q || 0) * (+x.h || 0)))}</td></tr>`).join('') || `<tr><td align="center">1</td><td>${e(c.s.nama)}</td><td align="right">1 paket</td><td align="right">${fmt(c.total)}</td><td align="right">${fmt(c.total)}</td></tr>`}
  <tr><td colspan="4" align="right">DPP</td><td align="right">${fmt(c.total - c.ppn)}</td></tr>${c.ppn > 0 ? `<tr><td colspan="4" align="right">PPN 12%</td><td align="right">${fmt(c.ppn)}</td></tr>` : ''}
  <tr><td colspan="4" align="center"><b>Total</b></td><td align="right"><b>${fmt(c.total)}</b></td></tr></table>
  <p style="margin-top:2px">Terbilang : (${terb(c.total)}) termasuk PPN dan pajak lainnya dengan menggunakan kode rekening ${e(c.s.kodrek || '..............')} Tahun Anggaran ${e(c.st.tahun)}.</p>
  <div class="sk-ps">Pasal 2</div>
  <p style="margin-top:0">Jangka waktu pelaksanaan pekerjaan terhitung sejak Surat Perintah Kerja Nomor : ${e(c.s.nomor)} ini dibuat dan berakhir pada tanggal ${dl(c.s.selesai)}</p>
  <div class="sk-ps">Pasal 3</div>
  <ol class="sk-ol">${p3.map(x => `<li>${x}</li>`).join('')}</ol>
  <p>Pembayaran dapat dilaksanakan apabila pekerjaan sudah selesai dalam keadaan baik, serta di buatkan Berita Acara Serah Terima Barang dan Berita Acara Penyelesaian Pekerjaan.</p>
  <p>Demikian Surat Perintah Kerja ini dibuat untuk dilaksanakan sebagaimana mestinya .</p>
  ${sig(ttd('PIHAK KEDUA', e(c.s.vendor), c.v.nama, 'Direktur', 1), ttd('PIHAK KESATU', e(c.ppk.jab), c.ppk.nama, nip(c.ppk.nip), 1))}`; };

/** Kuitansi: mengikuti BAP (tanggal, nilai, uraian kegiatan). No. Kuitansi sengaja dikosongkan. */
TPL.kw = (c, d) => { const n = +d.nilai || c.total;
  return `${kopH(true)}<div class="dj" style="letter-spacing:.4em;margin-top:2px">KUITANSI</div>
  <table class="kwr" style="margin:6px 0 0 auto;border-collapse:collapse;white-space:nowrap"><tr><td style="padding:5px 0">No. Kuitansi</td><td style="padding:5px 4px 5px 14px">:</td><td style="padding:5px 0">&nbsp;</td></tr><tr><td style="padding:5px 0">Kode Rekening</td><td style="padding:5px 4px 5px 14px">:</td><td style="padding:5px 0">${e(c.s.kodrek || '-')}</td></tr></table>
  <div class="kw" style="margin-top:8px">${kv([['Sudah Terima Dari', 'Bendahara Pengeluaran Pembantu ' + e(c.st.satker || '..............')], ['Sebesar', 'Rp&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' + fmt(n) + ',00'], ['Terbilang', e(terb(n).replace(/\b\w/g, m => m.toUpperCase()))], ['Untuk Pengeluaran', e(d.uraian || c.s.nama)]], false, 1)}</div>
  <div style="text-align:right;margin-top:12px"><div style="display:inline-block;text-align:center;min-width:230px">${e(c.st.kota)}, ${dl(d.tanggal)}<br>Tanda Tangan Penerima<div class="sp spm"></div>${e(c.s.direktur || '..............')}</div></div>
  <div class="rl"></div>
  <div class="sg3"><div>${ttd('Menyetujui', 'Kuasa Pengguna Anggaran', c.kpa.nama, nip(c.kpa.nip))}</div><div>${ttd('&nbsp;', '<span style="letter-spacing:.3em">PPTK</span>', c.pptk.nama, nip(c.pptk.nip))}</div><div><span style="display:inline-block;text-align:left">${e(c.st.kota)},<br>Bendahara Pengeluaran Pembantu</span><div class="sp"></div><span class="u">${e(c.st.bend_nama || '..............')}</span><br>${nip(c.st.bend_nip)}</div></div>`; };

var PRH = '', PRX = {};
function prHtml() { const x = PRX; return TPL[x.j](x.c, x.d) + (x.j == 'bap' && x.kw ? '<div class="pgbrk">' + TPL.kw(x.c, x.d) + '</div>' : ''); }
function togKw(on) { PRX.kw = on; PRH = prHtml(); $('pp').innerHTML = PRH; }
function pratinjau(sid, j, docId, kw) {
  const src = j == 'kw' ? 'bap' : j, c = ctx(sid), d = docId ? (S.dok || []).find(x => x.id == docId) : c.dk(src).slice(-1)[0];
  if (!['spb', 'rks'].includes(j) && !d) { notify('Nomor dokumen belum diterbitkan di menu BAPP/BAPHP/BAST/BAP.'); return; }
  PRX = {c: c, d: d || {}, j: j, kw: j == 'bap' && kw !== false};
  PRH = prHtml();
  $('md').innerHTML = `<div class="fixed inset-0 bg-black/60 z-50 flex flex-col p-3"><div class="flex justify-between items-center flex-wrap gap-2 mb-2 text-white text-sm"><b>Pratinjau — Kertas Legal (21,59 × 35,56 cm)</b><div class="flex gap-2 items-center flex-wrap">${j == 'bap' ? `<label class="flex items-center gap-1.5 text-xs cursor-pointer"><input type="checkbox" ${PRX.kw ? 'checked' : ''} onchange="togKw(this.checked)"> Sertakan Kuitansi</label>` : ''}<button onclick="cetakNow()" class="bg-blue-600 text-white rounded-lg px-4 py-1.5 font-semibold">🖨 Cetak</button><button onclick="openFull()" title="Jika dialog cetak tidak muncul (mode sematan Google Sites), buka aplikasi di tab baru" class="bg-slate-700 text-white rounded-lg px-3 py-1.5">⤢ Layar Penuh</button><button onclick="$('md').innerHTML=''" class="bg-slate-700 text-white rounded-lg px-4 py-1.5">Tutup</button></div></div><div class="flex-1 overflow-auto"><div id="pp" class="paper dc">${PRH}</div></div></div>`;
}
function cetakNow() {
  $('pr').innerHTML = '<div class="dc">' + PRH + '</div>';
  document.body.classList.add('pp'); window.print();
  setTimeout(() => document.body.classList.remove('pp'), 1000);
}

var cs = null, IT = [];
var mdlW = (h, w) => { $('md').innerHTML = `<div class="fixed inset-0 bg-black/50 z-50 grid place-items-center p-4"><div class="bg-white rounded-xl p-5 w-full ${w} max-h-[92vh] overflow-auto space-y-3">${h}</div></div>`; };
function cetakView() {
  if (!S.rows.length) return '<div class="text-center py-20 text-slate-400">Belum ada SPK. Buat SPK terlebih dahulu.</div>';
  if (!S.rows.find(r => r.id == cs)) cs = S.rows[0].id;
  const s = S.rows.find(r => r.id == cs), c = ctx(cs), st = S.set;
  const miss = [!c.it.length && 'rincian barang', !s.tgl && 'tanggal SP', !s.dpa && 'nomor DPA', !s.kodrek && 'kode rekening', !s.lokasi && 'lokasi kegiatan'].filter(Boolean);
  const miss2 = [!st.ppk_nama && 'nama PPK', !st.pptk_nama && 'nama PPTK', !st.kpa_nama && 'nama KPA', !st.bend_nama && 'nama Bendahara Pengeluaran Pembantu'].filter(Boolean);
  const cards = [['spb', 'Surat Perintah Kerja / Surat Pemesanan Barang (SPK/SPB)', 1], ['bapp', 'Berita Acara Penyelesaian Pekerjaan (BAPP)'], ['baphp', 'Berita Acara Pemeriksaan Hasil Pekerjaan (BAPHP)'], ['bast', 'Berita Acara Serah Terima Hasil Pekerjaan (BAST)'], ['bap', 'Berita Acara Pembayaran (BAP) + Kuitansi'], ['kw', 'Kuitansi saja (mengikuti BAP)'], ['rks', 'Ringkasan Belanja Barang dan Jasa', 2]];
  return `<h1 class="text-xl font-extrabold">Cetak Dokumen</h1><p class="text-slate-500 text-xs mb-4">Template cetak ukuran kertas Legal. Pilih SPK, lengkapi data bila perlu, lalu pratinjau dan cetak.${window.SESI && SESI.role == 'admin' ? ' <a onclick="go(\'set\')" class="text-brand underline cursor-pointer">Ganti logo / teks kop surat</a>' : ''}</p>
  <div class="flex flex-wrap gap-2 items-end mb-3"><div class="flex-1 min-w-[240px]">${L('Pilih SPK', `<select onchange="cs=this.value;draw()" class="${CL}">${S.rows.map(r => `<option value="${e(r.id)}" ${r.id == cs ? 'selected' : ''}>${e(r.nomor)} - ${e(r.nama)}</option>`).join('')}</select>`)}</div></div>
  ${miss.length || miss2.length ? `<div class="border rounded-lg px-3 py-2 mb-3 text-xs bg-amber-50 text-amber-700 border-amber-200">${miss.length ? 'Data SPK belum lengkap: <b>' + miss.join(', ') + '</b> (lengkapi lewat menu SPK/SPB/SP Baru → ✏ Edit). ' : ''}${miss2.length ? 'Pengaturan belum lengkap: <b>' + miss2.join(', ') + '</b> (menu Pengaturan).' : ''}</div>` : ''}
  <div class="grid md:grid-cols-2 xl:grid-cols-3 gap-3">${cards.map(k => { const d = c.dk(k[0] == 'kw' ? 'bap' : k[0]).slice(-1)[0], ok = k[2] || d;
    return `<div class="bg-white rounded-xl border border-slate-200 p-4 flex flex-col"><div class="font-bold text-sm">${k[1]}</div><div class="text-[11px] text-slate-500 flex-1 my-2">${k[2] == 1 ? 'Nomor: ' + e(s.nomor) : k[2] == 2 ? (d ? 'Data ringkasan tersimpan • ' + dl(d.tanggal) : 'Memakai data SPK. Lengkapi di BAPP/BAPHP/BAST/BAP → Ringkasan Belanja.') + ' Dokumen dasar ' + nDasar(cs) + '/4.' : d ? (k[0] == 'kw' ? 'Mengikuti BAP ' : 'Nomor: ') + e(d.nomor) + ' • ' + dl(d.tanggal) : 'Belum ada nomor. Terbitkan di menu BAPP/BAPHP/BAST/BAP.'}</div><button ${ok ? '' : 'disabled'} onclick="pratinjau('${cs}','${k[0]}')" class="bg-navy text-white rounded-lg px-3 py-1.5 text-xs font-semibold disabled:opacity-40">Pratinjau &amp; Cetak</button></div>`; }).join('')}</div>`;
}
var CS = 'w-full rounded-lg border border-slate-300 px-2 py-1.5 text-xs bg-white';
var itTotal = () => rd(IT.reduce((a, x) => a + (+x.q || 0) * (+x.h || 0), 0));
/** PPN yang terkandung dalam harga: hanya dari baris yang dicentang (kena PPN), tarif 11%. */
var ppnIT = () => { const k = rd(IT.reduce((a, x) => x.p === 0 ? a : a + (+x.q || 0) * (+x.h || 0), 0)), r = ppnR($('f_kategori') ? $('f_kategori').value : ''); return k - rd(k / (1 + r)); };
var itJson = () => JSON.stringify(IT.filter(x => String(x.u || '').trim()).map(x => ({u: String(x.u).trim(), q: +x.q || 0, s: String(x.s || '').trim(), h: +x.h || 0, p: x.p === 0 ? 0 : 1})));
var parseItems = s => { try { const a = JSON.parse(s || '[]'); return Array.isArray(a) ? a.map(x => ({u: x.u, q: x.q, s: x.s, h: x.h, p: x.p === 0 || x.p === '0' ? 0 : 1})) : []; } catch (x) { return []; } };
function itDraw() {
  $('it_box').innerHTML = `<table class="w-full text-xs table-fixed" style="min-width:560px"><thead><tr class="text-slate-400 text-left"><th>Uraian</th><th style="width:78px">Banyaknya</th><th style="width:84px">Satuan</th><th style="width:116px">Harga Satuan</th><th style="width:44px" title="Centang jika barang/jasa ini kena PPN">PPN</th><th style="width:28px"></th></tr></thead><tbody>${IT.map((x, i) => `<tr><td class="pr-1 pb-1"><input value="${e(x.u)}" oninput="IT[${i}].u=this.value" class="${CS}"></td><td class="pr-1"><input type="number" value="${e(x.q)}" oninput="IT[${i}].q=this.value;itTot()" class="${CS}"></td><td class="pr-1"><input value="${e(x.s)}" oninput="IT[${i}].s=this.value" class="${CS}"></td><td class="pr-1"><input type="number" value="${e(x.h)}" oninput="IT[${i}].h=this.value;itTot()" class="${CS}"></td><td class="text-center"><input type="checkbox" ${x.p === 0 ? '' : 'checked'} onchange="IT[${i}].p=this.checked?1:0;itTot()"></td><td><button onclick="IT.splice(${i},1);itDraw()" class="text-rose-500" title="Hapus baris">✕</button></td></tr>`).join('') || '<tr><td colspan="6" class="py-3 text-center text-slate-400">Belum ada rincian. Klik + Tambah Baris atau tempel dari Excel.</td></tr>'}</tbody></table>`;
  itTot();
}
function itTot() {
  const t = itTotal(), n = $('f_nilai'); $('it_tot').textContent = rp(t);
  if (!n) return;
  // Nilai kontrak = total rincian barang/jasa (sudah termasuk PPN). SPK lama tanpa rincian tetap memakai nilai tersimpan.
  n.value = t > 0 ? Math.round(t) : (EDIT && !itSum(EDIT) ? Math.round(+EDIT.nilai || 0) || '' : '');
  calc();
}
function itPaste() {
  const num = s => +String(s || '').replace(/[^\d.,-]/g, '').replace(/\./g, '').replace(',', '.') || 0;
  $('it_paste').value.split(/\r?\n/).forEach(l => { const c = l.split('\t'); if (c[0].trim()) IT.push({u: c[0].trim(), q: num(c[1]) || 1, s: (c[2] || '').trim(), h: num(c[3]), p: 1}); });
  $('it_paste').value = ''; itDraw();
}

/* ---------- REKANAN ---------- */
var REK_ID = '';
function rekView() {
  const list = (S.rek || []).filter(r => !q || JSON.stringify(Object.values(r)).toLowerCase().includes(q)).sort((a, b) => String(a.nama).localeCompare(String(b.nama))), op = !!OPU[window.SESI && SESI.role];
  const pakai = r => S.rows.filter(s => String(s.vendor).trim().toLowerCase() == String(r.nama).trim().toLowerCase()).length;
  return `<div class="flex justify-between items-start flex-wrap gap-2 mb-4"><div><h1 class="text-xl font-extrabold">Rekanan</h1><p class="text-slate-500 text-xs">Daftar vendor / pihak ketiga. Data ini menjadi pilihan pada form Buat SPK/SPB.</p></div><button onclick="frmRek()" class="bg-navy text-white rounded-lg px-3.5 py-2 text-xs font-semibold no-print">+ Tambah Rekanan</button></div>
  <div class="bg-white rounded-xl border border-slate-200 tw"><table class="w-full text-left"><thead class="text-[10px] uppercase tracking-wide text-slate-400"><tr><th class="p-3">Perusahaan & NPWP</th><th class="p-3">Direktur & Telepon</th><th class="p-3">Alamat</th><th class="p-3">Bank & Rekening</th><th class="p-3 text-right no-print">Aksi</th></tr></thead><tbody class="divide-y divide-slate-100">
  ${list.map(r => { const n = pakai(r); return `<tr><td class="p-3 max-w-[260px]"><div class="font-semibold whitespace-normal">${e(r.nama)}</div><div class="text-[11px] text-slate-400">NPWP: ${r.nonpwp == 'Ya' ? 'Tidak memiliki' : e(r.npwp || '-')}</div></td><td class="p-3"><div class="font-semibold">${e(r.direktur)}</div><div class="text-[11px] text-slate-400">${e(r.telp)}</div></td><td class="p-3 max-w-[240px] whitespace-normal">${e(r.alamat)}</td><td class="p-3"><div>${e(r.bank)}</div><div class="text-[11px] text-slate-400">${e(r.rekening)}</div></td><td class="p-3 text-right whitespace-nowrap no-print"><button onclick="frmRek('${r.id}')" class="border border-slate-300 rounded-lg px-2.5 py-1 text-xs">Ubah</button> <button onclick="hpsRek('${r.id}')" ${n || op ? 'disabled' : ''} title="${op ? 'Hanya untuk peran non-operator' : n ? 'Dipakai pada ' + n + ' SPK/SPB' : 'Hapus rekanan'}" class="border border-slate-300 rounded-lg px-2.5 py-1 text-xs text-rose-600">Hapus</button></td></tr>`; }).join('') || '<tr><td colspan="5" class="p-10 text-center text-slate-400">Belum ada rekanan. Klik + Tambah Rekanan.</td></tr>'}</tbody></table></div>`;
}
function frmRek(id) {
  const r = id ? (S.rek || []).find(x => x.id == id) || {} : {}; REK_ID = id || '';
  mdlW(`<h3 class="font-bold">${id ? 'Ubah' : 'Tambah'} Rekanan</h3><div class="grid md:grid-cols-2 gap-4">
    ${L('Perusahaan Penyedia (Vendor) *', inp('r_nama', '', 'text', `value="${e(r.nama)}"`), 'md:col-span-2')}
    <div><div class="flex justify-between items-center gap-2 mb-1"><label class="text-xs font-semibold text-slate-600">NPWP Vendor * (15 digit)</label><label class="flex items-center gap-1.5 text-[11px] font-medium text-slate-600 cursor-pointer"><input id="r_nonpwp" type="checkbox" onchange="rNpwpTog()" ${r.nonpwp == 'Ya' ? 'checked' : ''}> Tidak memiliki NPWP</label></div>${inp('r_npwp', '99.999.999.9-999.999', 'text', `value="${e(npwpFmt(r.npwp))}" inputmode="numeric" maxlength="20" oninput="rNpwpIn(this)"`)}<p id="r_npwp_h" class="text-[11px] text-slate-500 mt-1">Sesuai PMK 112/2022: orang pribadi memakai NIK, badan memakai NPWP 16 digit.</p></div>
    ${L('Nama Direktur / Penanggung Jawab *', inp('r_direktur', '', 'text', `value="${e(r.direktur)}"`))}
    ${L('Nomor Telepon *', inp('r_telp', 'mis. 0812xxxxxxxx', 'tel', `value="${e(r.telp)}" inputmode="tel" maxlength="20"`))}${L('Alamat Lengkap Perusahaan *', `<textarea id="r_alamat" rows="2" class="${CL}">${e(r.alamat)}</textarea>`)}
    ${L('Bank Rekening Penerima *', bankSel('r_bank', r.bank))}${L('Nomor Rekening & Nama Rekening *', inp('r_rek', '', 'text', `value="${e(r.rekening)}"`))}</div>
  ${mbtn(0, 'r', 'svRek()', 'Simpan')}`, 'max-w-2xl');
  if (r.nonpwp == 'Ya') rNpwpTog();
}
function rNpwpIn(el) {
  const d = npwpDig(el.value).slice(0, 15), h = $('r_npwp_h'); el.value = npwpFmt(d);
  h.textContent = d.length == 15 ? '✔ 15 digit' : d.length + ' / 15 digit — titik dan strip ditambahkan otomatis.'; h.className = 'text-[11px] mt-1 ' + (d.length == 15 ? 'text-emerald-600' : 'text-slate-500');
}
function rNpwpTog() {
  const c = $('r_nonpwp').checked, x = $('r_npwp'), h = $('r_npwp_h'); x.disabled = c; x.classList.toggle('bg-slate-100', c);
  if (c) { x.value = ''; h.className = 'text-[11px] mt-1 text-amber-700'; h.textContent = 'Vendor dianggap tidak memiliki NPWP — PPh Pasal 22/23 dikenakan tarif 100% lebih tinggi.'; } else rNpwpIn(x);
}
function svRek() {
  const g = k => $('r_' + k).value.trim(), er = $('r_err'), ok = $('r_ok'), non = $('r_nonpwp').checked, miss = [];
  if (!g('nama')) miss.push('Perusahaan Penyedia'); if (!non && !npwpOk(g('npwp'))) miss.push('NPWP (15 digit, atau centang "Tidak memiliki NPWP")');
  if (!g('direktur')) miss.push('Nama Direktur'); if (npwpDig(g('telp')).length < 9) miss.push('Nomor Telepon (min. 9 angka)');
  if (!g('alamat')) miss.push('Alamat'); if (!g('bank')) miss.push('Bank'); if (!g('rek')) miss.push('Nomor Rekening');
  if (miss.length) { er.textContent = 'Wajib diisi: ' + miss.join(', ') + '.'; return; }
  const o = {nama: g('nama'), npwp: non ? '' : g('npwp'), nonpwp: non ? 'Ya' : '', direktur: g('direktur'), telp: g('telp'), alamat: g('alamat'), bank: g('bank'), rekening: g('rek')}; if (REK_ID) o.id = REK_ID;
  if ((S.rek || []).some(x => x.id != REK_ID && String(x.nama).trim().toLowerCase() == o.nama.toLowerCase())) { er.textContent = 'Rekanan "' + o.nama + '" sudah ada.'; return; }
  const lama = REK_ID ? (S.rek || []).find(x => x.id == REK_ID) : null;
  o.id = REK_ID || uid(); o.dibuat = lama ? lama.dibuat : new Date().toISOString();
  S.rek = (S.rek || []).filter(x => x.id != o.id).concat([o]);
  $('md').innerHTML = ''; draw(); notify('Rekanan tersimpan.', 'ok');
  tulis('saveRek', [o], null, x => { notify(x.message); refresh(); });
}
function hpsRek(id) {
  const r = (S.rek || []).find(x => x.id == id); if (!r) return;
  ask('Hapus rekanan ' + r.nama + '?', () => { S.rek = S.rek.filter(x => x.id != id); draw(); tulis('delRek', [id], null, x => { notify(x.message); refresh(); }); });
}
/** Pilihan rekanan pada form SPK/SPB: mengisi data vendor (hanya baca) dari daftar. */
var rekOpts = () => '<option value="">— Pilih rekanan —</option>' + (S.rek || []).slice().sort((a, b) => String(a.nama).localeCompare(String(b.nama))).map(r => `<option value="${e(r.id)}">${e(r.nama)}</option>`).join('');
function rekPilih() {
  const r = (S.rek || []).find(x => x.id == $('f_rekp').value) || {}, set = (k, v) => { $('f_' + k).value = v || ''; };
  set('vendor', r.nama); set('npwp', r.nonpwp == 'Ya' ? '' : npwpFmt(r.npwp)); set('direktur', r.direktur); set('telp', r.telp); set('alamat', r.alamat); set('bank', r.bank); set('rek', r.rekening);
  $('f_nonpwp').checked = r.nonpwp == 'Ya';
  const h = $('npwp_h'); h.className = 'text-[11px] mt-1 ' + (r.nonpwp == 'Ya' ? 'text-amber-700' : 'text-slate-500');
  h.textContent = r.nonpwp == 'Ya' ? 'Vendor tidak memiliki NPWP — PPh Pasal 22/23 dikenakan tarif 100% lebih tinggi.' : 'Data diambil dari menu Rekanan.';
  calc();
}

/* ---------- BBM ---------- */
var BBM_SUB = [['reg', 'Reg BBM'], ['kw', 'Kuitansi']], BBM_ID = '';
function bbmView() {
  const sub = view.split(':')[1] || 'reg';
  if (sub == 'kw') {
    const ls = (S.bbm || []).filter(r => !q || JSON.stringify(Object.values(r)).toLowerCase().includes(q)).sort((a, b) => String(b.tgl || b.dibuat).localeCompare(String(a.tgl || a.dibuat)));
    return `<h1 class="text-xl font-extrabold">Kuitansi BBM</h1><p class="text-slate-500 text-xs mb-4">Kuitansi dicetak dari data Reg BBM. Untuk mengubah isinya, ubah Reg BBM terkait.</p>
    <div class="bg-white rounded-xl border border-slate-200 tw"><table class="w-full text-left"><thead class="text-[10px] uppercase tracking-wide text-slate-400"><tr><th class="p-3">Nomor Reg BBM</th><th class="p-3">Kode Rekening</th><th class="p-3">Untuk Pengeluaran</th><th class="p-3 text-right">Jumlah</th><th class="p-3 text-right no-print">Aksi</th></tr></thead><tbody class="divide-y divide-slate-100">
    ${ls.map(r => `<tr><td class="p-3"><div class="font-semibold">${e(r.nomor)}</div><div class="text-[11px] text-slate-400">${e(r.jenis || '-')} • ${r.tgl ? dl(r.tgl) : '-'}</div></td><td class="p-3 font-mono text-xs">${e(r.kodrek)}</td><td class="p-3 whitespace-normal max-w-[320px]">${e(r.uraian)}</td><td class="p-3 text-right font-bold">${rp(bbmTot(r))}</td><td class="p-3 text-right no-print"><button onclick="cetakBbm('${r.id}',1)" ${bbmTot(r) ? '' : 'disabled title="Rincian Reg BBM belum diisi"'} class="border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-semibold whitespace-nowrap"> Cetak </button></td></tr>`).join('') || '<tr><td colspan="5" class="p-10 text-center text-slate-400">Belum ada Reg BBM. Buat lebih dulu di sub-menu Reg BBM.</td></tr>'}</tbody></table></div>`;
  }
  const op = !!OPU[window.SESI && SESI.role];
  const list = (S.bbm || []).filter(r => !q || JSON.stringify(Object.values(r)).toLowerCase().includes(q)).sort((a, b) => String(b.dibuat).localeCompare(String(a.dibuat)));
  const ur = k => { const a = (S.ang || []).find(x => x.full == k); return a && a.uraian ? '<div class="text-[11px] text-slate-400 whitespace-normal">' + e(a.uraian) + '</div>' : ''; };
  return `<div class="flex justify-between items-start flex-wrap gap-2 mb-4"><div><h1 class="text-xl font-extrabold">Reg BBM</h1><p class="text-slate-500 text-xs">Register pembelian Bahan Bakar Minyak.</p></div><button onclick="frmBbm()" class="bg-navy text-white rounded-lg px-3.5 py-2 text-xs font-semibold no-print">+ Tambah Reg BBM</button></div>
  <div class="bg-white rounded-xl border border-slate-200 tw"><table class="w-full text-left"><thead class="text-[10px] uppercase tracking-wide text-slate-400"><tr><th class="p-3">Nomor</th><th class="p-3">Kode Rekening</th><th class="p-3">Uraian</th><th class="p-3 text-right no-print">Aksi</th></tr></thead><tbody class="divide-y divide-slate-100">
  ${list.map(r => `<tr><td class="p-3 font-semibold">${e(r.nomor)}</td><td class="p-3 font-mono text-xs max-w-[260px]">${e(r.kodrek)}${ur(r.kodrek)}</td><td class="p-3 whitespace-normal">${e(r.uraian)}</td><td class="p-3 text-right whitespace-nowrap no-print"><button onclick="cetakBbm('${r.id}')" class="border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-semibold"> Cetak</button> <button onclick="frmBbm('${r.id}')" class="border border-slate-300 rounded-lg px-2.5 py-1 text-xs">Ubah</button> <button onclick="hpsBbm('${r.id}')" ${op ? 'disabled title="Hanya untuk peran non-operator"' : ''} class="border border-slate-300 rounded-lg px-2.5 py-1 text-xs text-rose-600">Hapus</button></td></tr>`).join('') || '<tr><td colspan="4" class="p-10 text-center text-slate-400">Belum ada Reg BBM. Klik + Tambah Reg BBM.</td></tr>'}</tbody></table></div>`;
}
/** Tanggal hari ini menurut jam perangkat (yyyy-mm-dd). */
var tglLokal = () => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
/* Nomor Reg BBM: 000.3.2/<manual maks. 3>/UM/<BBM.Jab|BBM.Ops>/<bulan romawi pembuatan>/<tahun anggaran> */
var BNO_RE = /^000\.3\.2\/([A-Za-z0-9]{1,3})\/UM\/(BBM\.(?:Jab|Ops))\/([IVX]+)\/(\d{4})$/, BNOM = {};
function frmBbm(id) {
  const r = id ? (S.bbm || []).find(x => x.id == id) || {} : {}; BBM_ID = id || '';
  try { BIT = JSON.parse(r.items || '[]'); } catch (x) { BIT = []; } if (!Array.isArray(BIT)) BIT = [];
  const m = String(r.nomor || '').trim().match(BNO_RE), dib = r.dibuat ? new Date(r.dibuat) : new Date();
  BNOM = {rom: m ? m[3] : ROMAWI[(isNaN(dib) ? new Date() : dib).getMonth()], th: m ? m[4] : String(S.set.tahun || new Date().getFullYear()), lama: r.nomor && !m ? String(r.nomor) : ''};
  const jn = r.jenis || (m ? m[2] : '');
  const ls = (S.ang || []).filter(a => a.full), ada = !r.kodrek || ls.some(a => a.full == r.kodrek);
  const opts = '<option value="">— Pilih kode rekening —</option>' + (ada ? '' : `<option value="${e(r.kodrek)}" selected>${e(r.kodrek)}</option>`)
    + ANG.map(u => { const g = ls.filter(a => a.unit == u[0]); return g.length ? `<optgroup label="${u[1]}">${g.map(a => `<option value="${e(a.full)}" ${a.full == r.kodrek ? 'selected' : ''}>${e(a.full)}${a.uraian ? ' — ' + e(a.uraian) : ''}</option>`).join('')}</optgroup>` : ''; }).join('');
  mdlW(`<h3 class="font-bold">${id ? 'Ubah' : 'Tambah'} Reg BBM</h3>
  <div class="grid md:grid-cols-2 gap-3">
  ${L('Jenis BBM *', `<select id="b_jenis" onchange="bbmUpd()" class="${CL}"><option value="">— Pilih jenis —</option>${['BBM.Jab', 'BBM.Ops'].map(x => `<option ${x == jn ? 'selected' : ''}>${x}</option>`).join('')}</select>`)}
  ${L('Tanggal Pembuatan *', inp('b_tgl', '', 'date', `value="${e(r.tgl || String(r.dibuat || '').slice(0, 10) || tglLokal())}" oninput="bbmUpd()"`))}
  </div>
  <div><label class="block text-xs font-semibold text-slate-600 mb-1">Nomor Reg BBM *</label>
    <div class="flex items-center gap-3 flex-wrap sm:flex-nowrap"><input id="b_noin" maxlength="3" autocomplete="off" value="${m ? e(m[1]) : ''}" oninput="this.value=this.value.replace(/[^A-Za-z0-9]/g,'').slice(0,3);bbmUpd()" placeholder="001" class="${CL} sm:w-32">
    <span id="b_nopv" class="w-full sm:flex-1 min-w-0 rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-sm font-bold text-slate-600 whitespace-nowrap overflow-hidden text-ellipsis"></span></div>
    <input id="b_nomor" type="hidden"><p class="text-[11px] text-slate-500 mt-1">${BNOM.lama ? 'Nomor lama: <b>' + e(BNOM.lama) + '</b>, tetap dipakai bila kolom di atas dikosongkan.' : 'Isi nomor urut secara manual (maksimal 3 angka/huruf). Bulan romawi mengikuti Tanggal Pembuatan.'}</p></div>
  ${L('Kode Rekening *', `<select id="b_kod" class="${CL}">${opts}</select>`)}
  <div><div class="flex justify-between items-center mb-1"><label class="text-xs font-semibold text-slate-600">Rincian Pembelian BBM *</label><span class="text-xs">Total: <b id="bit_tot">Rp 0</b></span></div>
    <div id="bit_box" class="overflow-x-auto"></div>
    <button onclick="const p=BIT[BIT.length-1]||{};BIT.push({b:p.b||'Pertamax',j:'',h:p.h||'',l:'',t:'',k:p.k||''});bitDraw()" class="mt-2 border border-slate-300 rounded-lg px-3 py-1.5 text-xs">+ Tambah Baris</button>
    <p class="text-[11px] text-slate-500 mt-1">Liter dihitung otomatis dari Jumlah Harga ÷ Harga per liter, dan boleh diubah sesuai nota.</p></div>
  ${L('Uraian * <span class="font-normal text-slate-400">(tampil di bawah terbilang)</span>', `<textarea id="b_ur" rows="2" class="${CL}" placeholder="mis. Pembelian BBM Untuk Kendaraan Dinas Jabatan Kabag Hukum">${e(r.uraian)}</textarea>`)}
  ${mbtn(0, 'b', 'svBbm()', 'Simpan')}`, 'max-w-bbm');
  bbmUpd(); bitDraw();
}
function bbmUpd() {
  if (!$('b_noin')) return;
  if ($('b_tgl') && $('b_tgl').value) BNOM.rom = romTgl($('b_tgl').value);
  const j = $('b_jenis').value, n = $('b_noin').value.trim(), suf = '/UM/' + (j || '_______') + '/' + BNOM.rom + '/' + BNOM.th;
  $('b_nopv').textContent = '000.3.2/' + (n || '____') + suf;
  $('b_nomor').value = n && j ? '000.3.2/' + n + suf : (n ? '' : BNOM.lama);
}
/* ---------- Rincian pembelian BBM: b=jenis barang, j=jumlah harga, h=harga/liter, l=liter, t=tanggal nota, k=keperluan ---------- */
var BIT = [];
var lt2 = n => (+n || 0).toLocaleString('id-ID', {minimumFractionDigits: 2, maximumFractionDigits: 2});
function bitDraw() {
  $('bit_box').innerHTML = `<table class="w-full text-xs table-fixed" style="min-width:820px"><thead><tr class="text-slate-400 text-left"><th style="width:110px">Jenis Barang</th><th style="width:120px">Jumlah Harga</th><th style="width:105px">Harga/Liter</th><th style="width:90px">Liter</th><th style="width:150px">Tgl Nota</th><th>Keperluan</th><th style="width:24px"></th></tr></thead><tbody>
  ${BIT.map((x, i) => `<tr><td class="pr-1 pb-1"><input value="${e(x.b)}" oninput="BIT[${i}].b=this.value" class="${CS}"></td><td class="pr-1"><input type="number" value="${e(x.j)}" oninput="BIT[${i}].j=this.value;bitL(${i})" class="${CS}"></td><td class="pr-1"><input type="number" value="${e(x.h)}" oninput="BIT[${i}].h=this.value;bitL(${i})" class="${CS}"></td><td class="pr-1"><input id="bl_${i}" type="number" step="0.01" value="${e(x.l)}" oninput="BIT[${i}].l=this.value;bitTot()" class="${CS}"></td><td class="pr-1"><input type="date" value="${e(x.t)}" oninput="BIT[${i}].t=this.value" class="${CS}"></td><td class="pr-1"><input value="${e(x.k)}" oninput="BIT[${i}].k=this.value" placeholder="mis. Kendaraan Dinas Kabag. Hukum (KU 44 A)" class="${CS}"></td><td><button onclick="BIT.splice(${i},1);bitDraw()" class="text-rose-500" title="Hapus baris">✕</button></td></tr>`).join('') || '<tr><td colspan="7" class="py-3 text-center text-slate-400">Belum ada rincian. Klik + Tambah Baris.</td></tr>'}</tbody></table>`;
  bitTot();
}
function bitL(i) { const x = BIT[i]; if (+x.h > 0 && +x.j > 0) { x.l = (Math.round(x.j / x.h * 100) / 100).toFixed(2); const el = $('bl_' + i); if (el) el.value = x.l; } bitTot(); }
function bitTot() { const t = rd(BIT.reduce((a, x) => a + (+x.j || 0), 0)), l = BIT.reduce((a, x) => a + (+x.l || 0), 0); if ($('bit_tot')) $('bit_tot').textContent = rp(t) + ' • ' + lt2(l) + ' Liter'; }
function svBbm() {
  bbmUpd();
  const g = k => $(k).value.trim(), er = $('b_err'), miss = [];
  if (!g('b_jenis')) miss.push('Jenis BBM'); if (!g('b_tgl')) miss.push('Tanggal Pembuatan'); if (!g('b_nomor')) miss.push('Nomor (isi nomor urut)'); if (!g('b_kod')) miss.push('Kode Rekening'); if (!g('b_ur')) miss.push('Uraian');
  if (!BIT.length || BIT.some(x => !String(x.b || '').trim() || !(+x.j > 0) || !(+x.h > 0) || !(+x.l > 0) || !x.t)) miss.push('Rincian Pembelian BBM (setiap baris: jenis, jumlah harga, harga/liter, liter, tgl nota)');
  if (miss.length) { er.textContent = 'Wajib diisi: ' + miss.join(', ') + '.'; return; }
  const items = JSON.stringify(BIT.map(x => ({b: String(x.b).trim(), j: rd(x.j), h: +x.h || 0, l: Math.round((+x.l || 0) * 100) / 100, t: x.t, k: String(x.k || '').trim()})));
  const o = {jenis: g('b_jenis'), tgl: g('b_tgl'), nomor: g('b_nomor'), kodrek: g('b_kod'), uraian: g('b_ur'), items: items};
  if ((S.bbm || []).some(x => x.id != BBM_ID && String(x.nomor).trim().toLowerCase() == o.nomor.toLowerCase())) { er.textContent = 'Nomor ' + o.nomor + ' sudah digunakan.'; return; }
  const lama = BBM_ID ? (S.bbm || []).find(x => x.id == BBM_ID) : null;
  o.id = BBM_ID || uid(); o.dibuat = lama ? lama.dibuat : new Date().toISOString();
  S.bbm = (S.bbm || []).filter(x => x.id != o.id).concat([o]);
  $('md').innerHTML = ''; draw(); notify('Reg BBM tersimpan.', 'ok');
  tulis('saveBbm', [o], null, x => { notify(x.message); refresh(); });
}
/* ---------- Cetak Reg BBM ---------- */
TPL.bbm = r => {
  let it = []; try { it = JSON.parse(r.items || '[]'); } catch (x) {} if (!Array.isArray(it)) it = [];
  const st = S.set, tot = rd(it.reduce((a, x) => a + (+x.j || 0), 0)), lit = it.reduce((a, x) => a + (+x.l || 0), 0);
  const rpc = n => `<span style="float:left">Rp</span>${fmt(n)}`;
  const tn = d => { const p = pd(d); return p.length < 3 || !p[0] ? '-' : String(p[2]).padStart(2, '0') + '/' + String(p[1]).padStart(2, '0') + '/' + p[0]; };
  const pptk = st.pptk_nama ? {nama: st.pptk_nama, nip: st.pptk_nip} : {nama: st.ppk_nama, nip: st.ppk_nip};
  return `<div style="font-family:'Times New Roman',Times,serif;font-size:12pt">${kopH()}
  <div style="margin-top:16px;line-height:1.5">Nomor : ${e(r.nomor)}<br>Nomor Rekening : ${e(r.kodrek)}</div>
  <table class="t bb" style="margin-top:6px"><tr><th style="width:34px">No</th><th style="width:100px">Jenis Barang</th><th style="width:105px">Jumlah liter</th><th style="width:95px">Harga</th><th style="width:120px">Jumlah Harga</th><th style="width:90px">Tanggal Nota</th><th>Keperluan</th></tr>
  ${it.map((x, i) => `<tr><td align="center">${i + 1}</td><td align="center">${e(x.b)}</td><td align="center">${lt2(x.l)} Liter</td><td>${rpc(x.h)}</td><td>${rpc(x.j)}</td><td align="center">${tn(x.t)}</td><td>${e(x.k)}</td></tr>`).join('') || '<tr><td colspan="7" align="center">(rincian belum diisi)</td></tr>'}
  <tr><td colspan="2" align="center"><b>JUMLAH</b></td><td align="center"><b>${lt2(lit)} Liter</b></td><td></td><td><b>${rpc(tot)}</b></td><td></td><td></td></tr></table>
  <p style="margin:8px 0 0"><b>Terbilang : ${terb(tot)}</b></p>
  <p style="margin:6px 0">${e(r.uraian)}</p>
  <div class="sg" style="margin-top:44px"><div>&nbsp;<br>Mengetahui<br><b>Kuasa Pengguna Anggaran</b><div class="sp"></div><span class="u">${e(st.kpa_nama || '..............')}</span><br>${nip(st.kpa_nip)}</div>
  <div>${e(st.kota)}, ${dl(r.tgl)}<br>&nbsp;<br><b>PPTK</b><div class="sp"></div><span class="u">${e(pptk.nama || '..............')}</span><br>${nip(pptk.nip)}</div></div></div>`;
};
/** Total Jumlah Harga rincian Reg BBM. */
var bbmTot = r => { try { const a = JSON.parse(r.items || '[]'); return Array.isArray(a) ? rd(a.reduce((t, x) => t + (+x.j || 0), 0)) : 0; } catch (x) { return 0; } };
/** Kuitansi BBM: format sama dengan kuitansi SPK, data dari Reg BBM. */
TPL.kwBbm = r => {
  const st = S.set, n = bbmTot(r), pptk = st.pptk_nama ? {nama: st.pptk_nama, nip: st.pptk_nip} : {nama: st.ppk_nama, nip: st.ppk_nip};
  return `${kopH(true)}<div class="dj" style="letter-spacing:.4em;margin-top:2px">KUITANSI</div>
  <table class="kwr" style="margin:6px 0 0 auto;border-collapse:collapse;white-space:nowrap"><tr><td style="padding:5px 0">No. Kuitansi</td><td style="padding:5px 4px 5px 14px">:</td><td style="padding:5px 0">&nbsp;</td></tr><tr><td style="padding:5px 0">Kode Rekening</td><td style="padding:5px 4px 5px 14px">:</td><td style="padding:5px 0">${e(r.kodrek || '-')}</td></tr></table>
  <div class="kw" style="margin-top:8px">${kv([['Sudah Terima Dari', 'Bendahara Pengeluaran Pembantu ' + e(st.satker || '..............')], ['Sebesar', 'Rp&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' + fmt(n) + ',00'], ['Terbilang', e(terb(n).replace(/\b\w/g, m => m.toUpperCase()))], ['Untuk Pengeluaran', e(r.uraian)]], false, 1)}</div>
  <div style="text-align:right;margin-top:12px"><div style="display:inline-block;text-align:center;min-width:230px">${e(st.kota)}, ${dl(r.tgl)}<br>Tanda Tangan Penerima<div class="sp spm"></div>..............................</div></div>
  <div class="rl"></div>
  <div class="sg3"><div>${ttd('Menyetujui', 'Kuasa Pengguna Anggaran', st.kpa_nama, nip(st.kpa_nip))}</div><div>${ttd('&nbsp;', '<span style="letter-spacing:.3em">PPTK</span>', pptk.nama, nip(pptk.nip))}</div><div><span style="display:inline-block;text-align:left">${e(st.kota)},<br>Bendahara Pengeluaran Pembantu</span><div class="sp"></div><span class="u">${e(st.bend_nama || '..............')}</span><br>${nip(st.bend_nip)}</div></div>`;
};
function cetakBbm(id, kw) {
  const r = (S.bbm || []).find(x => x.id == id); if (!r) return;
  PRH = kw ? TPL.kwBbm(r) : TPL.bbm(r);
  $('md').innerHTML = `<div class="fixed inset-0 bg-black/60 z-50 flex flex-col p-3"><div class="flex justify-between items-center flex-wrap gap-2 mb-2 text-white text-sm"><b>Pratinjau ${kw ? 'Kuitansi BBM' : 'Reg BBM'} — Kertas Legal</b><div class="flex gap-2 items-center flex-wrap"><button onclick="cetakNow()" class="bg-blue-600 text-white rounded-lg px-4 py-1.5 font-semibold">🖨 Cetak</button><button onclick="openFull()" title="Jika dialog cetak tidak muncul (mode sematan Google Sites), buka aplikasi di tab baru" class="bg-slate-700 text-white rounded-lg px-3 py-1.5">⤢ Layar Penuh</button><button onclick="$('md').innerHTML=''" class="bg-slate-700 text-white rounded-lg px-4 py-1.5">Tutup</button></div></div><div class="flex-1 overflow-auto"><div id="pp" class="paper dc">${PRH}</div></div></div>`;
}
function hpsBbm(id) {
  const r = (S.bbm || []).find(x => x.id == id); if (!r) return;
  ask('Hapus Reg BBM ' + r.nomor + '?', () => { S.bbm = S.bbm.filter(x => x.id != id); draw(); tulis('delBbm', [id], null, x => { notify(x.message); refresh(); }); });
}

/* ---------- ANGGARAN ---------- */
var ANG = [['umum', 'Bagian Umum'], ['bupati', 'Bupati'], ['wabup', 'Wakil Bupati'], ['setda', 'Sekretaris Daerah']];
var fcode = a => a.sub && a.rek ? a.sub + '.' + a.rek : (a.rek || a.sub || '');
var realis = full => full ? S.rows.filter(r => String(r.kodrek || '').trim() == full).reduce((t, r) => t + ctx(r.id).total, 0) : 0;
function angView() {
  if (!(window.SESI && SESI.role == 'admin')) return '<div class="text-center py-20 text-slate-400">Menu Anggaran hanya dapat diakses oleh administrator.</div>';
  const un = view.split(':')[1] || 'umum', nm = (ANG.find(x => x[0] == un) || ANG[0])[1], adm = window.SESI && SESI.role == 'admin';
  const rows = (S.ang || []).filter(a => a.unit == un).map(a => { const full = fcode(a), pagu = +a.pagu || 0, real = realis(full); return {a, full, pagu, real, sisa: pagu - real}; });
  const gs = []; rows.forEach(r => { const k = r.a.sub || ''; let g = gs.find(x => x.sub == k); if (!g) gs.push(g = {sub: k, rows: []}); g.rows.push(r); });
  const sm = (arr, k) => arr.reduce((t, r) => t + r[k], 0), P = sm(rows, 'pagu'), R = sm(rows, 'real');
  const bar = (p, r) => { const x = p > 0 ? Math.min(100, Math.round(r / p * 100)) : 0; return `<div class="flex items-center gap-2"><div class="bar flex-1" style="min-width:60px"><i style="width:${x}%"></i></div><span class="text-[11px]">${x}%</span></div>`; };
  const card = (t, v) => `<div class="bg-white rounded-xl border border-slate-200 p-4"><span class="text-slate-500 text-xs">${t}</span><div class="text-xl font-extrabold mt-1">${v}</div></div>`;
  return `<div class="flex justify-between items-start flex-wrap gap-2 mb-4"><div><h1 class="text-xl font-extrabold">Anggaran — ${nm}</h1><p class="text-slate-500 text-xs">Tahun Anggaran ${e(S.set.tahun)}. Realisasi dihitung dari SPK yang Kode Rekeningnya sama persis dengan kode di bawah.</p></div>${adm ? `<div class="flex flex-wrap gap-2 no-print"><button onclick="tplAng(0)" class="border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold">⬇ Unduh Template</button><button onclick="tplAng(1)" class="border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold">⬇ Unduh Data Saat Ini</button><label class="border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold cursor-pointer hover:bg-slate-50">⬆ Unggah Excel<input type="file" accept=".xlsx,.xls,.csv" class="hidden" onchange="impAng(this)"></label><button onclick="frmAng()" class="bg-navy text-white rounded-lg px-3.5 py-2 text-xs font-semibold">+ Tambah Rekening</button></div>` : ''}</div>
  <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">${card('Total Pagu', rp(P))}${card('Realisasi (SPK)', rp(R))}${card('Sisa Anggaran', rp(P - R))}</div>
  <div class="bg-white rounded-xl border border-slate-200 tw"><table class="w-full text-left"><thead class="text-[10px] uppercase tracking-wide text-slate-400"><tr><th class="p-3">Kode Rekening</th><th class="p-3">Uraian</th><th class="p-3 text-right">Pagu</th><th class="p-3 text-right">Realisasi</th><th class="p-3 text-right">Sisa</th><th class="p-3">Serapan</th>${adm ? '<th class="p-3"></th>' : ''}</tr></thead><tbody class="divide-y divide-slate-100">
  ${gs.map(g => `<tr class="bg-slate-50"><td colspan="${adm ? 7 : 6}" class="p-2.5 text-xs"><b>Sub Kegiatan</b> <span class="font-mono">${e(g.sub) || '(kode belum diisi)'}</span>${g.rows[0].a.subkeg ? ' — ' + e(g.rows[0].a.subkeg) : ' <span class="text-amber-600">(nama belum diisi — klik Ubah)</span>'}<span class="float-right text-slate-500">Pagu ${rp(sm(g.rows, 'pagu'))} • Realisasi ${rp(sm(g.rows, 'real'))}</span></td></tr>` + g.rows.map(r => `<tr><td class="p-3 font-mono text-xs whitespace-nowrap">${r.a.sub ? `<span class="text-slate-400">${e(r.a.sub)}.</span>` : ''}<b>${e(r.a.rek) || '-'}</b></td><td class="p-3">${e(r.a.uraian) || '<span class="text-slate-400">-</span>'}</td><td class="p-3 text-right">${rp(r.pagu)}</td><td class="p-3 text-right">${rp(r.real)}</td><td class="p-3 text-right ${r.sisa < 0 ? 'text-rose-600 font-semibold' : ''}">${rp(r.sisa)}</td><td class="p-3" style="min-width:110px">${bar(r.pagu, r.real)}</td>${adm ? `<td class="p-3 text-right whitespace-nowrap"><button onclick="frmAng('${r.a.id}')" class="border border-slate-300 rounded-lg px-2.5 py-1 text-xs">Ubah</button> <button onclick="hpsAng('${r.a.id}')" class="border border-slate-300 rounded-lg px-2.5 py-1 text-xs text-rose-600">Hapus</button></td>` : ''}</tr>`).join('')).join('') || `<tr><td colspan="7" class="p-10 text-center text-slate-400">Belum ada rekening anggaran.</td></tr>`}</tbody></table></div>${adm ? '' : '<p class="text-[11px] text-slate-400 mt-2">Hanya administrator yang dapat mengubah data anggaran.</p>'}`;
}
/* ---------- TEMPLATE & IMPOR EXCEL ANGGARAN ---------- */
/** Memuat pustaka Excel (SheetJS) hanya saat dibutuhkan. */
function xl(cb) {
  if (window.XLSX) return cb();
  const s = document.createElement('script');
  s.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
  s.onload = cb; s.onerror = () => notify('Pustaka Excel gagal dimuat. Periksa koneksi internet.');
  document.head.appendChild(s);
}
var TPL_ANG = [
  ['Program', '4.01.01 - PROGRAM PENUNJANG URUSAN PEMERINTAHAN DAERAH KABUPATEN/KOTA', ''],
  ['Kegiatan', '4.01.01.2.06 - Administrasi Umum Perangkat Daerah', ''],
  ['Sub Kegiatan', '4.01.01.2.06.0002 - Penyediaan Peralatan dan Perlengkapan Kantor', ''],
  ['5.1.02.01.001.00024', 'Belanja Alat/Bahan untuk Kegiatan Kantor-Alat Tulis Kantor', 104955200],
  ['5.1.02.01.001.00025', 'Belanja Alat/Bahan untuk Kegiatan Kantor- Kertas dan Cover', 26106000],
  ['5.1.02.01.001.00027', 'Belanja Alat/Bahan untuk Kegiatan Kantor-Benda Pos', 40800000],
  ['5.1.02.01.001.00029', 'Belanja Alat/Bahan untuk Kegiatan Kantor-Bahan Komputer', 108283000],
  ['5.1.02.01.001.00030', 'Belanja Alat/Bahan untuk Kegiatan Kantor-Perabot Kantor', 149001200],
  ['5.1.02.01.001.00036', 'Belanja Alat/Bahan untuk Kegiatan Kantor-Alat/Bahan untuk Kegiatan Kantor Lainnya', 32000000],
  ['5.1.02.01.004.00123', 'Belanja Peralatan dan Mesin-Alat Kantor dan Rumah Tangga-Alat Rumah Tangga-Alat Rumah Tangga Lainnya (Home Use)', 858000]
];
/** cur=0: template contoh sesuai format; cur=1: data anggaran unit yang sedang dibuka dalam format yang sama. */
function tplAng(cur) {
  const un = view.split(':')[1] || 'umum', nm = (ANG.find(x => x[0] == un) || ANG[0])[1];
  xl(() => {
    let a = TPL_ANG;
    if (cur) {
      a = []; const gs = {};
      (S.ang || []).filter(x => x.unit == un).forEach(x => { (gs[x.sub || ''] = gs[x.sub || ''] || []).push(x); });
      Object.keys(gs).forEach(k => {
        const f = gs[k][0];
        a.push(['Program', f.program || '', ''], ['Kegiatan', f.kegiatan || '', ''], ['Sub Kegiatan', (k ? k + ' - ' : '') + (f.subkeg || ''), '']);
        gs[k].forEach(x => a.push([x.rek, x.uraian || '', +x.pagu || 0]));
        a.push(['', '', '']);
      });
      if (!a.length) { notify('Belum ada data anggaran pada unit ini.'); return; }
    }
    const ws = XLSX.utils.aoa_to_sheet(a);
    ws['!cols'] = [{wch: 24}, {wch: 95}, {wch: 20}];
    a.forEach((r, i) => { const c = ws['C' + (i + 1)]; if (c && c.t == 'n') c.z = '"Rp."#,##0.00'; });
    const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, 'Anggaran');
    XLSX.writeFile(wb, cur ? 'Anggaran_' + nm.replace(/\s+/g, '_') + '.xlsx' : 'Template_Anggaran.xlsx');
  });
}
var parsePagu = v => {
  if (typeof v == 'number') return Math.round(v);
  let s = String(v || '').replace(/[^\d,.\-]/g, ''); if (!s) return 0;
  if (s.indexOf(',') >= 0) s = s.replace(/\./g, '').replace(',', '.');        // 104.955.200,00
  else if ((s.match(/\./g) || []).length > 1 || /\.\d{3}$/.test(s)) s = s.replace(/\./g, ''); // 104.955.200
  return Math.round(+s) || 0;
};
var cdName = t => { const m = String(t).trim().match(/^(\d[\d.]*)\s*[-–—]\s*(.+)$/); return m ? {code: m[1], name: m[2].trim()} : {code: '', name: String(t).trim()}; };
function impAng(inp) {
  const f = inp.files[0], un = view.split(':')[1] || 'umum', nm = (ANG.find(x => x[0] == un) || ANG[0])[1];
  inp.value = ''; if (!f) return;
  xl(() => {
    const rd = new FileReader();
    rd.onerror = () => notify('File tidak dapat dibaca.');
    rd.onload = ev => {
      let wb; try { wb = XLSX.read(new Uint8Array(ev.target.result), {type: 'array'}); } catch (x) { notify('File Excel tidak valid.'); return; }
      const out = [], err = []; let pr = '', kg = '', sk = '', sub = '';
      wb.SheetNames.forEach(sn => {
        XLSX.utils.sheet_to_json(wb.Sheets[sn], {header: 1, raw: true, defval: ''}).forEach((r, i) => {
          const a = String(r[0]).trim(), la = a.toLowerCase().replace(/\s+/g, ' '), b = String(r[1]).trim();
          if (la == 'program') { pr = cdName(b).name; kg = ''; sk = ''; sub = ''; }
          else if (la == 'kegiatan') kg = cdName(b).name;
          else if (la == 'sub kegiatan') { const x = cdName(b); sub = x.code; sk = x.name; if (!sub) err.push('Sheet ' + sn + ' baris ' + (i + 1) + ': kode Sub Kegiatan tidak ditemukan (format: kode - nama).'); }
          else if (/^\d+(\.\d+)*$/.test(a)) {
            if (!sub) { err.push('Sheet ' + sn + ' baris ' + (i + 1) + ': rekening ' + a + ' belum berada di bawah baris Sub Kegiatan.'); return; }
            out.push({sub: sub, rek: a, uraian: b, pagu: parsePagu(r[2]), program: pr, kegiatan: kg, subkeg: sk});
          }
        });
      });
      if (err.length) { notify(err.slice(0, 3).join('\n') + (err.length > 3 ? '\n(+' + (err.length - 3) + ' kesalahan lain)' : '')); return; }
      if (!out.length) { notify('Tidak ada baris rekening yang terbaca. Gunakan format template (Unduh Template).'); return; }
      const subs = new Set(out.map(x => x.sub)).size, tot = out.reduce((t, x) => t + x.pagu, 0);
      ask('Unggah anggaran ke ' + nm + '?\n' + out.length + ' rekening pada ' + subs + ' sub kegiatan • total pagu ' + rp(tot) + '.\nRekening yang sudah ada akan diperbarui (uraian & pagu), yang baru ditambahkan. Tidak ada data yang dihapus.', () => {
        tulis('importAng', [un, out], r => notify('Impor selesai: ' + r.added + ' rekening ditambahkan, ' + r.updated + ' diperbarui.', 'ok'));
      }, 'Ya, unggah');
    };
    rd.readAsArrayBuffer(f);
  });
}
function frmAng(id) {
  const un = view.split(':')[1] || 'umum', a = id ? S.ang.find(x => x.id == id) : {unit: un, sub: '', rek: '', uraian: '', pagu: ''};
  const subs = [...new Set((S.ang || []).filter(x => x.unit == a.unit).map(x => x.sub).filter(Boolean))];
  mdl(`<h3 class="font-bold">${id ? 'Ubah' : 'Tambah'} Rekening — ${ANG.find(x => x[0] == a.unit)[1]}</h3><datalist id="subl">${subs.map(s => `<option value="${e(s)}">`).join('')}</datalist>
  ${L('Kode Sub Kegiatan (mis. 4.01.01.2.06.0002)', inp('g_sub', '', 'text', `value="${e(a.sub)}" list="subl" onchange="angSub('${a.unit}')"`))}${L('Kode Rekening (mis. 5.1.02.01.001.00024)', inp('g_rek', '', 'text', `value="${e(a.rek)}"`))}
  ${L('Uraian', inp('g_ur', '', 'text', `value="${e(a.uraian)}"`))}${L('Pagu Anggaran (Rp)', inp('g_pagu', '0', 'number', `value="${e(a.pagu)}"`))}
  <div class="rounded-lg border border-slate-200 p-3 space-y-2"><div class="text-xs font-semibold text-slate-600">Nama Program / Kegiatan / Sub Kegiatan</div>
  ${L('Program', inp('g_prog', 'mis. PENUNJANG URUSAN PEMERINTAHAN KABUPATEN/KOTA', 'text', `value="${e(a.program)}"`))}${L('Kegiatan', inp('g_keg', 'mis. Fasilitasi Kerumahtanggaan Sekretariat Daerah', 'text', `value="${e(a.kegiatan)}"`))}${L('Sub Kegiatan', inp('g_subk', 'mis. Penyediaan Kebutuhan Rumah Tangga Kepala Daerah', 'text', `value="${e(a.subkeg)}"`))}
  <p class="text-[11px] text-slate-500">Berlaku untuk semua rekening pada kode sub kegiatan yang sama, dan otomatis terisi di form SPK/SPB.</p></div>${mbtn(0, 'g', "svAng('" + (id || '') + "','" + a.unit + "')", 'Simpan')}`);
}
/** Isi nama Program/Kegiatan/Sub Kegiatan dari rekening lain pada sub kegiatan yang sama. */
function angSub(unit) {
  const sub = $('g_sub').value.trim(), x = (S.ang || []).find(a => a.unit == unit && String(a.sub) == sub && (a.program || a.kegiatan || a.subkeg));
  if (x) [['g_prog', 'program'], ['g_keg', 'kegiatan'], ['g_subk', 'subkeg']].forEach(f => { if (!$(f[0]).value) $(f[0]).value = x[f[1]] || ''; });
}
function svAng(id, unit) {
  const g = k => $('g_' + k).value.trim(), er = $('g_err'), ok = $('g_ok');
  const o = {unit, sub: g('sub'), rek: g('rek'), uraian: g('ur'), pagu: +g('pagu') || 0, program: g('prog'), kegiatan: g('keg'), subkeg: g('subk')}; if (id) o.id = id;
  ok.disabled = true; ok.textContent = 'Menyimpan...';
  tulis('saveAng', [o], () => { $('md').innerHTML = ''; draw(); }, x => { er.textContent = x.message; ok.disabled = false; ok.textContent = 'Simpan'; });
}
function hpsAng(id) {
  ask('Hapus baris anggaran ini?', () => {
  S.ang = (S.ang || []).filter(x => x.id != id); draw(); tulis('delAng', [id]);
  });
}

/** Notifikasi & konfirmasi di dalam aplikasi (alert/confirm bawaan browser diblokir pada sematan Google Sites). */
function notify(msg, kind) {
  const box = $('tst'); if (!box) return;
  const ok = kind ? kind == 'ok' : /berhasil|tersimpan/i.test(msg);
  const d = document.createElement('div');
  d.setAttribute('role', ok ? 'status' : 'alert');
  d.className = 'tst ' + (ok ? 'tst-ok' : 'tst-err');
  d.innerHTML = `<span class="tst-ic">${ok ? '✓' : '!'}</span><span></span>`;
  d.lastChild.textContent = String(msg);
  const tutup = () => { d.classList.add('tst-out'); setTimeout(() => d.remove(), 200); };
  d.onclick = tutup; box.appendChild(d); setTimeout(tutup, ok ? 3500 : 6500);
}
/** Konfirmasi memakai <dialog> bawaan browser (Esc dan klik di luar = Batal). */
function ask(msg, yes, label) {
  const d = document.createElement('dialog'), bahaya = /^hapus/i.test(String(msg));
  d.className = 'ask no-print' + (bahaya ? ' bahaya' : '');
  d.innerHTML = `<div><p class="ask-ic">${bahaya ? '!' : '?'}</p><p class="ask-msg"></p><div class="ask-bt"><button type="button" data-n>Batal</button><button type="button" data-y>${e(label || (bahaya ? 'Ya, hapus' : 'Ya, lanjutkan'))}</button></div></div>`;
  d.querySelector('.ask-msg').textContent = msg;
  d.querySelector('[data-n]').onclick = () => d.close();
  d.querySelector('[data-y]').onclick = () => { d.close(); yes(); };
  d.addEventListener('click', ev => { if (ev.target === d) d.close(); });
  d.addEventListener('close', () => d.remove());
  document.body.appendChild(d); d.showModal(); d.querySelector(bahaya ? '[data-n]' : '[data-y]').focus();
}
/** Semua pop-up di #md: tombol Esc, label aksesibilitas, fokus ke isian pertama, kembalikan fokus saat ditutup. */
(function () {
  const md = $('md'); if (!md || md.__obs) return; md.__obs = 1; let asal = null;
  new MutationObserver(() => {
    const o = md.firstElementChild;
    if (!o) { if (asal && asal.focus && document.contains(asal)) asal.focus(); asal = null; return; }
    if (!asal) asal = document.activeElement;
    const p = o.firstElementChild; if (!p || p.hasAttribute('role')) return;
    p.setAttribute('role', 'dialog'); p.setAttribute('aria-modal', 'true'); p.tabIndex = -1;
    const h = p.querySelector('h1,h3'); if (h) { h.id = h.id || 'md_t'; p.setAttribute('aria-labelledby', h.id); }
    const f = p.querySelector('input:not([type=hidden]):not([readonly]):not([disabled]):not([type=checkbox]),select:not([disabled]),textarea:not([readonly])');
    const desk = matchMedia('(min-width:768px)').matches; // di HP tidak fokus otomatis agar keyboard tidak langsung muncul
    setTimeout(() => (desk && f ? f : p).focus({preventScroll: true}), 30);
  }).observe(md, {childList: true});
  document.addEventListener('keydown', ev => {
    if (ev.key == 'Escape' && md.firstElementChild && !document.querySelector('dialog[open]')) md.innerHTML = '';
  });
})();
function openFull() { const w = window.open(location.href.split('#')[0], '_blank'); if (!w) notify('Pop-up diblokir browser. Izinkan pop-up untuk membuka layar penuh.'); }
/** Kembali ke halaman login (token dihapus dari browser). */
function toLogin() {
  API.clearToken();
  try { sessionStorage.removeItem('sp_brand'); sessionStorage.removeItem('sk_boot'); } catch (e) {}
  window.SESI = null;
  location.replace('index.html');
}
function keluar() { const t = SESI.t; API.run.withSuccessHandler(toLogin).withFailureHandler(toLogin).logout(t); }

/* ---------- PENGATURAN & AUDIT LOG ---------- */
function pengaturan() {
  const f = (k, t) => L(t, `<input id="s_${k}" value="${e(S.set[k])}" class="${CL}">`);
  return `<div class="max-w-xl"><h1 class="text-xl font-extrabold mb-4">Pengaturan</h1><div class="bg-white rounded-xl border border-slate-200 p-5 space-y-3">${f('tahun', 'Tahun Anggaran')}${f('nama', 'Nama Pejabat')}${f('nip', 'NIP')}${f('jabatan', 'Jabatan (PPTK / PPK / Bendahara)')}${f('satker', 'Satuan Kerja (untuk surat, mis. Bagian Umum Sekretariat Daerah Kabupaten Bulungan)')}
  <div class="text-xs font-bold pt-3 border-t border-slate-200">Kop Surat</div>${f('kop1', 'Baris 1 (instansi induk)')}${f('kop2', 'Baris 2 (unit kerja)')}${f('kop3', 'Baris 3 (alamat, telepon, faks)')}${f('kota', 'Kota / tempat surat')}
  ${kopCard()}
  <div class="text-xs font-bold pt-3 border-t border-slate-200">Pejabat Penandatangan</div>${f('ppk_nama', 'Nama Pejabat Pembuat Komitmen (PPK)')}${f('ppk_nip', 'NIP PPK')}${f('ppk_jab', 'Jabatan PPK')}${f('pptk_nama', 'Nama Pejabat Pelaksana Teknis Kegiatan (PPTK)')}${f('pptk_nip', 'NIP PPTK')}${f('kpa_nama', 'Nama Kuasa Pengguna Anggaran (KPA)')}${f('kpa_nip', 'NIP KPA')}${f('kpa_jab', 'Jabatan KPA (mis. Kepala Bagian Umum)')}${f('bend_nama', 'Nama Bendahara Pengeluaran Pembantu')}${f('bend_nip', 'NIP Bendahara Pengeluaran Pembantu')}
  <div class="text-xs font-bold pt-3 border-t border-slate-200">Nomor DPA</div>
  <div id="dpa_box" class="space-y-2">${(dpaList().length ? dpaList() : ['']).map(dpaRow).join('')}</div>
  <button type="button" onclick="dpaAdd()" class="border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-semibold">+ Tambah Nomor DPA</button>
  <p class="text-[11px] text-slate-500">Nomor DPA yang diisi di sini menjadi pilihan pada form Buat SPK/SPB.</p>

  <button onclick="svSet()" class="bg-navy text-white rounded-lg px-4 py-2 font-semibold">Simpan Pengaturan</button><p class="text-[11px] text-slate-500">Database: <a class="text-brand underline" target="_blank" href="${e(S.url)}">buka Google Sheets</a></p></div>${akunCard()}${window.SESI && SESI.role == 'admin' ? logoCard() : ''}</div>`;
}
/* ---------- LOGO KOP SURAT / DOKUMEN ---------- */
var KG = '';
function kopCard() {
  const adm = window.SESI && SESI.role == 'admin', k = window.KOP || '';
  return `<div class="rounded-lg border border-slate-200 p-3 space-y-2"><div class="text-xs font-semibold text-slate-600">Logo Kop Surat / Dokumen</div>
  <div class="dc rounded-lg border border-slate-200 p-3" style="background:#fff"><div class="flex items-center gap-3 pb-2" style="border-bottom:3px double #000"><img id="kp_pv" src="${e(k)}" class="h-14 w-auto ${k ? '' : 'hidden'}"><span id="kp_ph" class="text-[10px] text-slate-400 ${k ? 'hidden' : ''}">(tanpa logo)</span><div class="flex-1 text-center leading-tight" style="color:#000"><div class="text-[11px]">${e(S.set.kop1)}</div><div class="text-sm font-bold">${e(S.set.kop2)}</div><div class="text-[9px] italic">${e(S.set.kop3)}</div></div></div><div class="text-[10px] text-slate-400 mt-1">Pratinjau kop pada SPK/SPB, BAPP, BAPHP, BAST, BAP, Kuitansi, dan Ringkasan Belanja.</div></div>
  ${adm ? `<div class="flex items-center gap-2 flex-wrap"><label class="border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-semibold cursor-pointer hover:bg-slate-50">📁 Pilih Gambar Logo<input id="kp_f" type="file" accept="image/png,image/jpeg" onchange="pilihKop(this)" class="hidden"></label><button id="kp_up" onclick="unggahKop()" disabled class="bg-navy text-white rounded-lg px-3 py-1.5 text-xs font-semibold disabled:opacity-40">⬆ Unggah Logo Kop</button><button onclick="hapusKop()" class="border border-slate-300 rounded-lg px-3 py-1.5 text-xs">Kembalikan Bawaan</button></div>
  <p id="kp_msg" class="text-[11px] text-slate-500">PNG atau JPG, disarankan latar transparan/putih. Gambar dikecilkan otomatis.</p>` : '<p class="text-[11px] text-slate-500">Logo kop hanya dapat diganti oleh administrator.</p>'}</div>`;
}
/** Kecilkan gambar (sisi terpanjang maks. 600 px — tajam saat dicetak), PNG tetap PNG agar transparansi terjaga. */
function pilihKop(i) {
  const f = i.files[0], m = $('kp_msg'); KG = ''; $('kp_up').disabled = true;
  if (!f) return;
  if (!/^image\/(png|jpeg)$/.test(f.type)) { m.textContent = 'File harus berformat PNG atau JPG.'; return; }
  if (f.size > 8e6) { m.textContent = 'Ukuran file maksimal 8 MB.'; return; }
  const r = new FileReader();
  r.onload = () => {
    const im = new Image();
    im.onerror = () => { m.textContent = 'File gambar tidak dapat dibaca.'; };
    im.onload = () => {
      const png = f.type == 'image/png'; let u = '';
      for (let mx = 600; mx >= 120; mx = Math.floor(mx * .75)) {
        const k = Math.min(1, mx / Math.max(im.width, im.height)), c = document.createElement('canvas');
        c.width = Math.max(1, Math.round(im.width * k)); c.height = Math.max(1, Math.round(im.height * k));
        const x = c.getContext('2d'); if (!png) { x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height); }
        x.drawImage(im, 0, 0, c.width, c.height); u = png ? c.toDataURL('image/png') : c.toDataURL('image/jpeg', .92);
        if (u.length <= 400000) break;
      }
      if (u.length > 400000) { m.textContent = 'Gambar terlalu besar/kompleks. Gunakan gambar yang lebih sederhana.'; return; }
      KG = u; $('kp_pv').src = u; $('kp_pv').classList.remove('hidden'); $('kp_ph').classList.add('hidden'); $('kp_up').disabled = false;
      m.textContent = 'Pratinjau siap (' + Math.round(u.length / 1024) + ' KB). Klik Unggah Logo Kop untuk menyimpan.';
    };
    im.src = r.result;
  };
  r.readAsDataURL(f);
}
function unggahKop() {
  const b = $('kp_up'), m = $('kp_msg'); b.disabled = true; m.textContent = 'Mengunggah...';
  API.run.withSuccessHandler(() => { window.KOP = KG; KG = ''; dropBrand(); m.textContent = '✔ Logo kop tersimpan dan langsung dipakai pada semua dokumen cetak.'; notify('Logo kop surat berhasil disimpan.'); })
    .withFailureHandler(x => { m.textContent = 'Gagal: ' + x.message; b.disabled = false; }).saveKop(SESI.t, KG);
}
function hapusKop() {
  ask('Kembalikan logo kop surat ke logo bawaan?', () => {
  API.run.withSuccessHandler(k => { window.KOP = k || ''; dropBrand(); draw(); notify('Logo kop dikembalikan ke bawaan.', 'ok'); }).withFailureHandler(x => notify(x.message)).resetKop(SESI.t);
  });
}

var LG = '';
function logoCard() {
  const has = !!window.LOGO;
  return `<div class="bg-white rounded-xl border border-slate-200 p-5 mt-4"><h3 class="font-bold text-sm mb-1">Logo Aplikasi</h3><p class="text-[11px] text-slate-500 mb-3">Unggah file PNG (disarankan latar transparan). Logo tampil di halaman login (dengan animasi) dan sidebar. Ukuran dikecilkan otomatis.</p>
  <div class="flex items-center gap-4 flex-wrap"><div class="w-24 h-24 rounded-xl border border-dashed border-slate-300 bg-slate-100 grid place-items-center overflow-hidden"><img id="lg_pv" src="${e(window.LOGO || '')}" class="max-w-full max-h-full ${has ? '' : 'hidden'}"><span id="lg_ph" class="text-[10px] text-slate-400 ${has ? 'hidden' : ''}">Logo bawaan</span></div>
  <div class="space-y-2"><input id="lg_f" type="file" accept="image/png" onchange="pilihLogo(this)" class="text-xs"><div class="flex gap-2 flex-wrap"><button id="lg_up" onclick="unggahLogo()" disabled class="bg-navy text-white rounded-lg px-3 py-1.5 text-xs font-semibold disabled:opacity-40">Unggah &amp; Terapkan</button><button onclick="hapusLogo()" class="border border-slate-300 rounded-lg px-3 py-1.5 text-xs">Kembalikan Bawaan</button></div><p id="lg_msg" class="text-[11px] text-slate-500"></p></div></div></div>`;
}
function pilihLogo(i) {
  const f = i.files[0], m = $('lg_msg'); LG = ''; $('lg_up').disabled = true;
  if (!f) return;
  if (f.type != 'image/png') { m.textContent = 'File harus berformat PNG.'; return; }
  if (f.size > 5e6) { m.textContent = 'Ukuran file maksimal 5 MB.'; return; }
  const r = new FileReader();
  r.onload = () => {
    const im = new Image();
    im.onerror = () => { m.textContent = 'File gambar tidak dapat dibaca.'; };
    im.onload = () => {
      let u = '';
      for (let mx = 480; mx >= 96; mx = Math.floor(mx * .7)) {
        const k = Math.min(1, mx / Math.max(im.width, im.height)), c = document.createElement('canvas');
        c.width = Math.max(1, Math.round(im.width * k)); c.height = Math.max(1, Math.round(im.height * k));
        c.getContext('2d').drawImage(im, 0, 0, c.width, c.height); u = c.toDataURL('image/png');
        if (u.length <= 400000) break;
      }
      if (u.length > 400000) { m.textContent = 'Gambar terlalu kompleks. Gunakan PNG yang lebih sederhana.'; return; }
      LG = u; $('lg_pv').src = u; $('lg_pv').classList.remove('hidden'); $('lg_ph').classList.add('hidden'); $('lg_up').disabled = false;
      m.textContent = 'Pratinjau siap (' + Math.round(u.length / 1024) + ' KB). Klik Unggah & Terapkan.';
    };
    im.src = r.result;
  };
  r.readAsDataURL(f);
}
function unggahLogo() {
  const b = $('lg_up'), m = $('lg_msg'); b.disabled = true; m.textContent = 'Mengunggah...';
  API.run.withSuccessHandler(() => { window.LOGO = LG; dropBrand(); m.textContent = '✔ Logo diterapkan. Muat ulang halaman untuk melihatnya di sidebar dan halaman login.'; })
    .withFailureHandler(x => { m.textContent = 'Gagal: ' + x.message; b.disabled = false; }).saveLogo(SESI.t, LG);
}
function hapusLogo() {
  ask('Kembalikan ke logo bawaan?', () => {
  API.run.withSuccessHandler(() => { window.LOGO = ''; dropBrand(); draw(); }).withFailureHandler(x => notify(x.message)).resetLogo(SESI.t);
  });
}
var dpaRow = v => `<div class="flex gap-2"><input class="s_dpa ${CL}" value="${e(v)}" placeholder="mis. DPA/A.1/4.01.0.00.0.00.01.0000/001/2026"><button type="button" title="Hapus" onclick="this.parentNode.remove()" class="border border-slate-300 rounded-lg px-3 text-rose-600">✕</button></div>`;
function dpaAdd() { $('dpa_box').insertAdjacentHTML('beforeend', dpaRow('')); const x = $('dpa_box').querySelectorAll('.s_dpa'); x[x.length - 1].focus(); }
function svSet() {
  const o = Object.assign({}, S.set); ['tahun', 'nama', 'nip', 'jabatan', 'satker', 'kop1', 'kop2', 'kop3', 'kota', 'ppk_nama', 'ppk_nip', 'ppk_jab', 'pptk_nama', 'pptk_nip', 'kpa_nama', 'kpa_nip', 'kpa_jab', 'bend_nama', 'bend_nip'].forEach(k => o[k] = $('s_' + k).value.trim());
  o.dpa_list = [...new Set([...document.querySelectorAll('.s_dpa')].map(x => x.value.trim()).filter(Boolean))];
  API.run.withSuccessHandler(r => { S.set = r; init(); notify('Pengaturan tersimpan.'); }).saveSet(SESI.t, o);
}
function showLog() { busy(1); API.run.withSuccessHandler(d => { busy(0); S.log = d; renderLog(); }).withFailureHandler(x => { busy(0); notify(x.message); }).getLog(SESI.t); }
function renderLog() {
  $('md').innerHTML = `<div class="fixed inset-0 bg-black/50 z-50 grid place-items-center p-4" onclick="if(event.target==this)this.remove()"><div class="bg-white rounded-xl p-5 w-full max-w-xl max-h-[85vh] overflow-auto"><div class="flex justify-between mb-3"><h3 class="font-bold">Audit Log (30 terakhir)</h3><button onclick="$('md').innerHTML=''">✕</button></div>${S.log.map(l => `<div class="border-b border-slate-100 py-2 text-xs"><b>${e(l[2])}</b><div class="text-slate-400">${e(l[0])} • ${e(l[1])}</div></div>`).join('') || '<div class="text-slate-400 py-6 text-center">Belum ada aktivitas.</div>'}</div></div>`;
}

/** Hari, tanggal, dan jam digital di sidebar (mengikuti waktu perangkat). */
function jam() {
  const h = $('jm_h'), t = $('jm_t'); if (!h || !t) return;
  const d = new Date();
  h.textContent = HARI[d.getDay()] + ', ' + d.getDate() + ' ' + BLN[d.getMonth()] + ' ' + d.getFullYear();
  t.textContent = [d.getHours(), d.getMinutes(), d.getSeconds()].map(x => String(x).padStart(2, '0')).join(':');
}

/** Diagnosa: error saat klik Cetak/Edit ditampilkan sebagai pesan merah. */
['pratinjau', 'frmBuat', 'frmDok'].forEach(n => {
  const f = window[n]; if (typeof f != 'function') return;
  window[n] = function () { try { return f.apply(this, arguments); } catch (x) { console.error(x); notify('Error di ' + n + ': ' + x.message); } };
});

/* ---------- MULAI: pakai data hasil login (sessionStorage) atau minta ke server dengan token tersimpan ---------- */
(function boot() {
  const tok = API.token();
  if (!tok) { location.replace('index.html'); return; }
  const start = (sesi, data) => {
    window.SESI = sesi;
    if (data && data.rows) { S = data; firstLoad = false; lastRef = Date.now(); init(); } else refresh();
    setTimeout(loadBrand, 50);
    jam(); clearInterval(window.__jm); window.__jm = setInterval(jam, 1000);
  };
  let pre = null;
  try { pre = JSON.parse(sessionStorage.getItem('sk_boot') || 'null'); sessionStorage.removeItem('sk_boot'); } catch (x) {}
  if (pre && pre.sesi && pre.sesi.t === tok) { start(pre.sesi, pre.data); return; }
  busy(1);
  API.run.withSuccessHandler(r => { busy(0); start(r.sesi, r.data); }).withFailureHandler(x => {
    busy(0);
    if (/Sesi berakhir/.test(x.message)) { toLogin(); return; }
    $('v').innerHTML = '<div class="text-center py-20 text-rose-600">Gagal memuat: ' + e(x.message) + '<br><button onclick="location.reload()" class="mt-3 border border-slate-300 rounded-lg px-4 py-2 text-sm">Coba lagi</button></div>';
  }).mulai(tok);
})();
