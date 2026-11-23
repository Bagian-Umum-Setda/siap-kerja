/**
 * SIAP-KERJA — klien REST API ke backend Google Apps Script.
 *
 * Semua permintaan memakai fetch():
 *   GET  GAS_URL?action=infoPublik
 *   POST GAS_URL  body: {action, args, token}   (Content-Type text/plain agar TIDAK memicu CORS preflight)
 * Backend selalu membalas JSON {success, data} atau {success:false, message}.
 *
 * API.run meniru gaya pemanggilan lama agar kode aplikasi tetap ringkas:
 *   API.run.withSuccessHandler(fnOk).withFailureHandler(fnGagal).namaAksi(arg1, arg2, ...)
 */
(function () {
  const KUNCI_TOKEN = 'sk_t';
  const GET_AKSI = {infoPublik: 1}; // aksi publik ringan lewat GET

  function url() { return String(window.GAS_URL || '').trim(); }
  function ready() { return /^https:\/\/script\.google(usercontent)?\.com\/.+/.test(url()) && url().indexOf('GANTI_DENGAN') < 0; }

  function token() { try { return localStorage.getItem(KUNCI_TOKEN) || ''; } catch (e) { return ''; } }
  function setToken(t) { try { localStorage.setItem(KUNCI_TOKEN, t); } catch (e) {} }
  function clearToken() { try { localStorage.removeItem(KUNCI_TOKEN); } catch (e) {} }

  async function baca(res) {
    const teks = await res.text();
    try { return JSON.parse(teks); } catch (e) {
      throw new Error('Respons server bukan JSON. Periksa deployment Web App (akses harus "Siapa saja") dan GAS_URL di js/config.js.');
    }
  }

  /** Panggil satu aksi backend; mengembalikan data atau melempar Error(pesan). */
  async function call(action, args) {
    if (!ready()) throw new Error('GAS_URL belum diisi di js/config.js.');
    let res;
    try {
      if (GET_AKSI[action] && !(args && args.length)) {
        res = await fetch(url() + '?action=' + encodeURIComponent(action), {method: 'GET', redirect: 'follow'});
      } else {
        res = await fetch(url(), {
          method: 'POST',
          redirect: 'follow',
          headers: {'Content-Type': 'text/plain;charset=utf-8'}, // WAJIB text/plain (bukan application/json)
          body: JSON.stringify({action: action, args: args || [], token: token()})
        });
      }
    } catch (e) {
      throw new Error('Tidak dapat terhubung ke server. Periksa koneksi internet Anda.');
    }
    const j = await baca(res);
    if (!j || !j.success) throw new Error((j && j.message) || 'Terjadi kesalahan di server.');
    return j.data;
  }

  /** Pemanggil berantai: withSuccessHandler / withFailureHandler / <namaAksi>(...args). */
  function rantai(h) {
    return new Proxy({}, {
      get(_, k) {
        if (k === 'withSuccessHandler') return f => rantai(Object.assign({}, h, {ok: f}));
        if (k === 'withFailureHandler') return f => rantai(Object.assign({}, h, {gagal: f}));
        if (typeof k !== 'string') return undefined;
        return function () {
          const args = Array.prototype.slice.call(arguments);
          call(k, args).then(
            r => { if (h.ok) h.ok(r); },
            err => { if (h.gagal) h.gagal(err); else console.error('[' + k + ']', err); }
          );
        };
      }
    });
  }

  window.API = {call: call, run: rantai({}), token: token, setToken: setToken, clearToken: clearToken, ready: ready};
})();
