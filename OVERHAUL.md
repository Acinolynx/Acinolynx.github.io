# Acinolynx Portfolio — Overhaul PRD & Progress Log

> Dokumen hidup. Diperbarui di akhir setiap phase.
> Dipakai sebagai sumber kebenaran progres — kalau sesi terputus, buka file ini.

**Dibuat:** 2026-09-30 · **Branch:** `new-features` · **Deploy:** GitHub Pages (`acinolynx.github.io`)

---

## 1. Konteks Project

| Aspek | Nilai |
|---|---|
| Stack | HTML + CSS + JS murni (tanpa framework, tanpa build step) |
| Halaman | `index.html`, `gallery.html` |
| Stylesheet | `style.css`, `gallery-style.css` |
| Script | `script.js` (shared kedua halaman) |
| Asset | `Asset/` (gallery foto, video, design, game) · `Download/` (CV PDF) |
| Deploy | GitHub Pages dari branch, **case-sensitive** |

### Constraint (keputusan pemilik project)

| # | Constraint | Alasan |
|---|---|---|
| C1 | **Section `#about` tetap di-comment** | Mungkin dipakai lagi nanti. Tidak boleh dihapus. |
| C2 | **24 aset unused (23 MB) di-compress, TIDAK dihapus** | Masih dibutuhkan (±20 `street*.webp`) |
| C3 | **Repo publik, sudah pernah di-push** | History **tidak boleh** di-rewrite (`filter-repo` dibatalkan) |
| C4 | **Tetap static, tanpa framework** | Tidak ada kebutuhan; hindari over-engineering |
| C5 | **Gallery navbar: restore + modernize** | Navbar di `HEAD` masih punya link, di disk ter-comment |

---

## 2. Temuan Awal — Root Cause Gallery Hidden

### 2.1 Akar masalah: `core.ignorecase = true`

```
.git/config → core.ignorecase = true
```

Git menganggap `Gallery.html` dan `gallery.html` **file yang sama**. Keadaan saat penulisan PRD ini:

| | Isi |
|---|---|
| **Disk** | `gallery.html` (50.5 KB) ✅ · `Gallery.html` ❌ tidak ada |
| **Git HEAD** | `Gallery.html` (48.9 KB) ✅ · `gallery.html` tidak dikenal |
| **`git status`** | `D Gallery.html` — `gallery.html` **tidak muncul sebagai untracked** |
| **`git add gallery.html`** | **tidak melakukan apa-apa** |

**Dampak:** pekerjaan Gallery belum pernah masuk git. `git commit -am` akan commit
*penghapusan* `Gallery.html` → situs live kehilangan halaman Gallery.

**Koreksi atas asumsi awal:** di situs live **saat ini** Gallery sebenarnya berfungsi
(`index.html` di HEAD → `./Gallery.html` → cocok). Yang rusak adalahsinkronisasi
local ↔ git, bukan tampilan live.

### 2.2 Navbar Gallery — kondisi sebenarnya (koreksi)

Diasumsikan awal bahwa navbar Gallery di disk adalah "regresi lokal yang belum di-commit".
**Ternyata SALAH.** Perbandingan byte menunjukkan `gallery.html` (disk) dan
`HEAD:Gallery.html` **identik modulo line ending** (`diff --strip-trailing-cr` → 0 baris beda).
Selisih ukuran 1.626 byte = jumlah baris = efek CRLF, bukan perubahan isi.

Artinya: **navbar Gallery yang hanya berisi logo itu sudah ada di git dan sudah live.**
Ini bukan regresi lokal, tapi fitur yang memang belum pernah dikerjakan (C5 tetap berlaku —
kita restore dari `Gallery.html:34-55` yang masih tersimpan di dalam blok komentar, lalu modernize).

### 2.3 Case-sensitivity trap (akan muncul setelah Phase 0)

Setelah `gallery.html` benar-benar ter-track, link `./Gallery.html` di
`index.html` **akan** 404 di GitHub Pages. Wajib diubah ke `./gallery.html`.

### 2.4 Temuan lain (ringkas)

| Kategori | Temuan |
|---|---|
| Asset | `Photography/Nature8.webp` tidak ada (harusnya `Nature/8.webp`) |
| Asset | `Video/Sine Hijab.webm` tidak ada (file: `Sine hijab.webm`) |
| Asset | `A Fishermen's Life.webm` perlu URL-encoding |
| Asset | `Asset/Home/About.webp` referenced di section yang di-comment (C1) |
| Button | `.btn` **tidak pernah ada sebagai class global** — hanya scoped `.header .box .btn` & `.form-box form .btn` |
| Button | `<button>` membungkus `<a>` → invalid HTML, 2 elemen interaktif |
| Video | `<iframe class="lightbox-video">` diisi `.webm` lokal → **tidak bisa diputar** |
| AOS | `AOS.init()` dipanggil 2× (inline + `script.js:14`) |
| AOS | `data-aos-duration="9000"` & `"5000"` → elemen hilang 5–9 detik |
| AOS | Filter gallery bentrok dengan AOS (keduanya controlling `opacity`/`transform`) |
| CSS | Hanya **1** breakpoint (`450px`) — tidak ada tablet range |
| CSS | `.header .box { transform: translate(80%,-50%) }` tidak di-reset untuk 451–992px |
| CSS | `.lightbox-close { right: 350px }` hardcode → keluar layar di 375px |
| CSS | `scroll-snap-type: y mandatory` + section >100vh → scroll tersangkut |
| CSS | `background-attachment: fixed` → lag di iOS |
| CSS | `h1 { font-size:50px; line-height:50px }` px tetap → teks multi-baris terpotong |
| CSS | **Nol** `:focus-visible` di seluruh project |
| CSS | `.gallery-item .overlay` hanya di `:hover` → tidak ada affordance di touch |
| HTML | `<li><li>...</li></li>` tidak valid (`index.html:24-29`) |
| HTML | `id="text"` duplikat ×3 (`index.html:192,197,201`) |
| HTML | `<textarea id="">` (`index.html:204`) |
| HTML | 9 dari 16 `<img>` di `index.html` tanpa `alt` |
| HTML | 0 dari 102 `<img>` gallery punya `width`/`height` → CLS |
| HTML | `lang="en"` (index) vs `lang="id"` (gallery) → inkonsisten |
| Form | Tidak ada `<label>`, `required`, validasi, honeypot, feedback sukses/gagal |
| A11y | 102 `.gallery-item` = `<div>` + click handler → **0 item bisa diakses keyboard** |
| A11y | Lightbox tanpa `role="dialog"`/`aria-modal`/focus trap |
| A11y | `<div class="navbar">` bukan `<nav>`; tidak ada `<main>`; tidak ada skip-link |
| Nav | Halaman Gallery tidak punya navigasi sama sekali (user terjebak) |
| Nav | `position: absolute` → hilang saat scroll |
| Dead | `Gallery (old).html`, `script (old).js`, `style_gallery (old).css` ikut ter-deploy |
| SEO | Tidak ada meta description, OG, canonical, `robots.txt`, `sitemap.xml`, `404.html`, manifest, JSON-LD |
| Perf | `AOS` via `unpkg.com/aos@next` — tag mengambang, belum di-pin |
| Perf | Font dimuat semua weight `300..900` + italic 2 arah |
| Perf | Hero via CSS `background-image` → tidak bisa di-preload |

---

## 3. Baseline (sebelum overhaul)

| Metrik | Nilai |
|---|---|
| Ukuran repo total | **2.0 GB** |
| `Asset/` | **203 MB** |
| `.git/` | **1.8 GB** (`size-pack: 0 bytes` — semua loose object) |
| Blob terbesar di history | 64.2 MB (`A Fishermen's Life.webm`) |
| Blob >100 MB (blokir push) | **0** ✅ |
| File >1 MB | **76** |
| Aset unused | 24 file / **23 MB** |
| Gallery items | **102** (photography 52, design 36, game 8, video 5) |
| File >1MB di gallery | 179.8 MB |
| Link mati / 404 | 6 |

### Target setelah selesai

| Metrik | Target |
|---|---|
| `Asset/` | ~45 MB (compress 24 aset + set `src` ke thumbnail) |
| Bobot homepage (works grid) | ~1.5 MB (dari 30–50 MB) |
| Thumbnail gallery | ~4 MB |
| Link mati / 404 | **0** |
| Breakpoint | 4 (450 / 768 / 992 / 1200) |
| Item bisa diakses keyboard | 100% |

---

## 4. Timeline Phase

| Phase | Status | Isi | Estimasi |
|---|---|---|---|
| **0** | ☑ | Amankan repo: `core.ignorecase`, commit baseline, tag, `.gitignore` | 5 m ✅ |
| **1** | ☐ | P0: bug pemblokir (link case, `.btn`, video, asset 404) | 40 m |
| **2** | ☐ | Optimasi gambar (thumbnail, compress, anti-CLS) | 30 m |
| **3** | ☐ | `git gc --aggressive` | 15 m |
| **4** | ☐ | UI/UX & responsive | 90 m |
| **5** | ☐ | Aksesibilitas | 60 m |
| **6** | ☐ | Fitur baru (lightbox nav, filter URL sync) | 90 m |
| **7** | ☐ | SEO & cleanup | 40 m |

---

## 5. Detail Per Phase

### ☑ Phase 0 — Amankan Repo *(WAJIB, kerjakan duluan)* — **SELESAI 2026-09-30**

- [x] `git config core.ignorecase false` → kunci sensitivitas case
- [x] `git add -A` → `gallery.html` ter-track sebagai **rename** (`R Gallery.html -> gallery.html`)
- [x] Verifikasi `git status` → working tree bersih (0 perubahan)
- [x] Commit baseline → `3908dad`
- [x] `git tag pre-overhaul` → titik rollback
- [x] Tulis `.gitignore`
- [x] `git rm --cached` 3 file `(old)` → tetap di disk, kini **tidak** ikut deploy

**Rollback:** `git reset --hard pre-overhaul`

**Catatan tambahan:** saat Phase 0 dilakukan, ternyata `.gitignore` **tidak langsung
berfungsi** untuk file `(old)` karena ketiganya sudah ter-track (gitignore hanya berlaku
untuk file untracked). Solusinya `git rm --cached` — ini dipindahkan dari Phase 7 ke
Phase 0 karena tanpa itu `.gitignore` jadi tidak berguna. File tetap ada di disk ✅

**Status `.git`:** masih 1.8 GB — akan ditangani di Phase 3.

### ☐ Phase 1 — P0: Bug PembLocker

| File:Line | Aksi |
|---|---|
| `index.html:26,156,236` | `./Gallery.html` → `./gallery.html` |
| `style.css` | Tambah `.btn` **global**; rapikan rule scoped yang jadi duplikat |
| `gallery.html:1592` | `<iframe class="lightbox-video">` → `<video controls playsinline>` |
| `script.js:122-136` | Sesuaikan branch video; hapus logika iframe |
| `gallery.html:199` | `Photography/Nature8.webp` → `Photography/Nature/8.webp` |
| `gallery.html:1384` | `Video/Sine Hijab.webm` → `Video/Sine%20hijab.webm` |
| `gallery.html:1356` | URL-encode `A%20Fishermen%27s%20Life.webm` |
| `index.html:269`, `gallery.html:1583` | `<button><a></a></button>` → `<button><i></i></button>` |

> Catatan: footer `#about` (C1) **disisakan**, diberi komentar penanda agar sinkron
> saat section di-uncomment nanti.

### ☐ Phase 2 — Optimasi Gambar

Tool tersedia: **ffmpeg 9.0.2**, **ImageMagick 7.1.2**, **Pillow 12.3 (WebP ✅)**

- [ ] Generate `Asset/Thumb/<struktur sama>/` — 600px wide, WebP q72
- [ ] `gallery.html`: `src` → thumb; `data-src` tetap full (lightbox lazy-load)
- [ ] `index.html` works grid → thumb + `alt` deskriptif (9 img kosong)
- [ ] `Hero.webp`: varian mobile/compressed + `preload` + `fetchpriority="high"`
- [ ] **Compress 24 aset unused (C2)** — bukan hapus
- [ ] Tambah `width`/`height` di 102 `<img>` gallery → anti-CLS
- [ ] Video 32 MB tetap (dibutuhkan); `poster` sudah ada

### ☐ Phase 3 — Perbaikan `.git`

- [ ] `git gc --aggressive --prune=now`
- [ ] Catat ukuran sebelum/sesudah
- [ ] ~~`git filter-repo`~~ **DIBATALKAN** (C3 — repo publik, history tidak boleh di-rewrite)

### ☐ Phase 4 — UI/UX & Responsive

- [ ] `@media` 992px & 768px: grid 3→2 kolom
- [ ] Reset `.header .box { translate(80%) }` untuk range tablet
- [ ] Hamburger menu untuk mobile
- [ ] `h1/h2/p` → `clamp()`
- [ ] Fix `.lightbox-close { right: 350px }` → responsif
- [ ] `.gallery-item .overlay` → affordance di touch (bukan hanya `:hover`)
- [ ] Hapus `AOS 9000ms`/`5000ms` → cap ~800ms
- [ ] Ubah `scroll-snap-type` dari `mandatory` → `proximity`
- [ ] Navbar `absolute` → `fixed` + shrink saat scroll + active link indicator
- [ ] Ganti `background-attachment: fixed` (lag iOS)
- [ ] **Restore + modernize navbar Gallery** (C5)
- [ ] Tambah "scroll down" indicator di hero

### ☐ Phase 5 — Aksesibilitas

- [ ] 102 `.gallery-item` → bisa diakses keyboard
- [ ] Lightbox: `role="dialog"`, `aria-modal`, focus trap, return focus
- [ ] Close lightbox → `<button>` + `aria-label`
- [ ] Tambah `:focus-visible` **global**
- [ ] Fix `id="text"` duplikat ×3; tambah `<label>`, `required`
- [ ] Validasi client-side + honeypot + feedback sukses/gagal
- [ ] Landmarks: `<nav>`, `<main>`, skip-link, heading hierarchy
- [ ] `aria-label` di semua icon-only link
- [ ] Fix `<ul>/<li>` nesting, `<textarea id="">`
- [ ] Seragamkan `lang`
- [ ] Section About **tetap commented** (C1)

### ☐ Phase 6 — Fitur Baru

- [ ] Lightbox prev/next + keyboard `←/→` + counter "12 / 102"
- [ ] Filter URL sync (`#filter=design`) + `history.replaceState` + back button
- [ ] Filter: `type="button"`, `aria-pressed`, jumlah item, empty state
- [ ] Fix konflik filter ↔ AOS (+ `AOS.refresh()`)
- [ ] Navbar aktif di halaman Gallery

### ☐ Phase 7 — SEO & Cleanup

- [ ] `meta description`, Open Graph, Twitter card, `canonical`, `theme-color`
- [ ] `robots.txt`, `sitemap.xml`, `404.html` custom, `manifest.json`
- [ ] JSON-LD `Person`
- [ ] `<title>` SEO-friendly; `Copyright` auto-update tahun
- [ ] Hapus 3 file `(old)` dari tracking
- [ ] Pin AOS ke versi exact (ganti `@next`)
- [ ] Subset font weight yang dipakai
- [ ] Update `OVERHAUL.md` dengan angka final

---

## 6. Catatan Keputusan

| # | Keputusan | Alasan |
|---|---|---|
| D1 | `git filter-repo` **dibatalkan** | Repo publik + sudah di-push → rewrite history merusak semua clone. Blob 64 MB sudah diterima GitHub; yang memblokir push hanya >100 MB, dan **tidak ada**. |
| D2 | Gallery navbar → restore + modernize | Navbar di `HEAD` masih berfungsi; versi disk adalah regresi lokal |
| D3 | 24 aset → compress, bukan hapus | Diminta pemilik project (C2) |
| D4 | `index.html` → commit baseline dulu | Titik balik yang aman sebelum edit |
| D5 | Skill dari "Gemini" di-skip | Kandidat (`gemini-api-dev`, `agents-cli`) untuk development aplikasi AI — tidak relevan dengan site statis |
| D6 | 5 agent skill dipasang | `ponytail` (anti-over-engineering), `frontend-design`, `web-design-guidelines`, `redesign-existing-projects`, `web-perf` |
| D7 | Asumsi "navbar Gallery = regresi lokal" **DIBATALKAN** | `diff --strip-trailing-cr` membuktikan `gallery.html` identik dengan `HEAD:Gallery.html`. Selisih 1.626 byte murni efek CRLF. Kondisi navbar sudah live, bukan perubahan lokal. |

---

## 7. Verifikasi Akhir

- [ ] Semua referensi asset resolve (tidak ada file hilang)
- [ ] Tidak ada horizontal overflow di 375 / 768 / 1024 / 1440
- [ ] Semua link internal valid (tidak ada 404)
- [ ] Valid HTML (nested list, id unik)
- [ ] Semua gambar punya `alt` + dimensi
- [ ] Keyboard: tab thru navbar → works → filter → gallery item → lightbox
- [ ] Lightbox: buka, next, prev, tutup (Esc) → focus return
- [ ] Form: validasi + submit + feedback
- [ ] `git status` bersih, `OVERHAUL.md` ter-update

---

## 8. Catatan Eksplorasi

> Area yang perlu dicatat saat eksekusi — terutama temuan tak terduga.

_(kosong — akan diisi selama eksekusi)_
