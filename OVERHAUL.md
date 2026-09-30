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
| **1** | ☑ | P0: bug pemblokir (link case, `.btn`, video, asset 404) | 40 m ✅ |
| **2** | ☑ | Optimasi gambar (thumbnail, compress, anti-CLS) | 30 m ✅ |
| **2b** | ☑ | Lightbox full-size → 2000px (hemat 99 MB) | 12 m ✅ |
| **3** | ☑ | `git gc --aggressive` (nol ukuran — lihat §5) | 14 m ✅ |
| **4** | ☑ | UI/UX & responsive | 45 m ✅ |
| **5** | ☑ | Aksesibilitas (keyboard, focus, ARIA, label) | 50 m ✅ |
| **6** | ☑ | Fitur baru (lightbox nav, filter URL sync) | 20 m ✅ |
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

### ☑ Phase 1 — P0: Bug PembLocker — **SELESAI 2026-09-30** (commit `e7c5175`)

| File:Line | Aksi | Status |
|---|---|---|
| `index.html:26,156,236` | `./Gallery.html` → `./gallery.html` | ☑ 3 link |
| `style.css` | Tambah `.btn` **global** + varian `.btn-light` / `.btn-dark` | ☑ |
| `style.css` | Hapus `.header .box .btn` duplikat + efek garis bawah | ☑ |
| `style.css` | `.works ul a` (spec 0,1,2) menimpa `.btn` (0,1,0) → dibersihkan | ☑ |
| `index.html` | Tambah `btn-light` ke 5 tombol | ☑ |
| `gallery.html:1592` | `<iframe>` → `<video controls playsinline preload="none">` | ☑ |
| `script.js` | `src=""` → `removeAttribute` + `load()` + `play()`; `pause()` saat close | ☑ |
| `gallery.html:199` | `Nature8.webp` → `Nature/8.webp` | ☑ |
| `gallery.html:1356` | → `A%20Fishermen%27s%20Life.webm` | ☑ |
| `gallery.html:1384` | → `Sine%20hijab.webm` | ☑ |
| `index.html:269`, `gallery.html:1583` | `<button><a></a></button>` → `<button><i></i></button>` + `aria-label` | ☑ |

**Verifikasi Phase 1:** semua asset ref resolve ✓ · 0 `Gallery.html` ✓ · 0 `<iframe>` ✓
· `node --check script.js` OK ✓ · CSS braces seimbang (143/143, 140/140) ✓

**Catatan:** `.btn` global memakai varian `.btn-light`/`.btn-dark` alih-alih menebak
warna dari section — ini menghindari specificity war yang caused `.works ul a`
menimpa `.btn` (dan membuat tombol tetap tak terlihat).

`Asset/Home/About.webp` masih reported missing — **sengaja**, ada di dalam blok
komentar `#about` (C1).

### ☑ Phase 2 — Optimasi Gambar — **SELESAI 2026-09-30** (commit `1a54a4b`)

Tool dipakai: **Pillow 12.3** (WebP ✅), ffmpeg 9.0.2, ImageMagick 7.1.2

| Item | Sebelum | Sesudah |
|---|---|---|
| Bobot `index.html` | ~30–50 MB | **0.81 MB** |
| Bobot `gallery.html` | ~180 MB | **6.45 MB** |
| `Asset/` | 210 MB | 193 MB |
| `Asset/Thumb/` (baru) | — | 8.0 MB |
| `src` → thumbnail | 0/116 | **116/116** |
| `data-src` utuh (lightbox) | — | **96/96 terverifikasi** |
| `<img>` tanpa dimensi | 102 | **0** |
| `<img>` tanpa `alt` | 9 | **0** |

- [x] `tools/make-thumbs.py` → `Asset/Thumb/` 800px, q72 (foto) / q80 (Design+Game)
- [x] `tools/point-img-at-thumbs.py` → rewrite `src` saja, +`width`/`height`, +`alt`
- [x] Hero: 1.3 MB 8000×6000 → varian **89 / 28 / 4 KB** + `preload` + `fetchpriority`
- [x] Hero responsif via `@media` 1200px & 768px
- [x] **Compress 11 foto tak tersaji** → arsip 1600px q82 (22.2 MB → 4.3 MB). File **tetap ada** (C2)
- [x] Master `Hero.webp` **tidak** dikompres (varian diturunkan darinya)
- [x] 5 master `Video/Thumb/` **tidak** dikompres

#### Bug yang ditemukan & diperbaiki saat Phase 2

1. **Thumbnail mendarat di `Asset/Thumb/Asset/...`** — `os.path.relpath(src, ROOT)`
   menyertakan prefix `Asset/`. Diperbaiki → relatif terhadap `Asset/`.
2. **6 video thumbnail ter-skip** — filter `"/Thumb/" not in path` ikut
   mengecualikan `Asset/Gallery/Video/Thumb/` (nama foldernya memang `Thumb`).
   Diperbaiki → hanya skip `Asset/Thumb/` hasil generate.
3. **HTML rusak: `/>` terpisah** — `tag[:-1] + attrs + ">"` menghasilkan
   `/> width="800" height="428">` pada 116 tag. Diperbaiki dengan
   `insert_before_close()` yang membedakan `<img>` dan `<img />`.
4. **⚠️ `data-src` lightbox sempat ter-compress** — regex referensi
   `Asset/[^\s"')]+` terpotong di **spasi**, sehingga
   `Asset/Gallery/Photography/Random Photo/1.webp` tidak terdeteksi
   dan ikut di-downscale. **Asset di-revert via `git checkout`,** lalu
   Approach diganti ke parser attribute (`(?:src|data-src|data-video-src)="([^"]+)"`)
   + `urllib.parse.unquote`. Diverifikasi ulang: 96/96 original utuh (147.9 MB).
5. Pengukuran fidelity awal salah (membandingkan gambar in-memory, bukan hasil
   reload dari disk) sehingga quality 72 terlihat sempurna. Diperbaiki; lalu diuji ulang
   dan ditemukan q=88
   hanya menurunkan diff terburuk 6.80→5.25 dengan +78% ukuran, jadi ditolak.

#### Keputusan tersisa (butuh persetujuan pemilik)

#### ☐→☑ Lightbox full-size diturunkan ke 2000px — **SELESAI 2026-09-30**

Disetujui pemilik. `.lightbox-content` hanya `max-width: 900px` +
`max-height: 75vh`, jadi original 6000px praktis ~7× lebih besar dari yang
pernah ditampilkan.

- **Master dicopy dulu ke `../_originals_6000px_backup/` (149 MB, DI LUAR
  repo)** sebelum ditimpa — history git bukan tempat aman untuk master.
- 83/96 di-downscale ke **2000px q84** (13 sisanya sudah ≤2000px)
- **147.9 MB → 48.6 MB** (hemat 99.3 MB). `Asset/` 193 MB → **94 MB**
- Working tree: 194 MB → **94 MB**
- Verifikasi: 96/96 file valid, lebar maks 2000px
- Fidelity Design vs master: mean\|diff\| **1.96–3.50** (ambang noise WebP ~5)

**Konsekuensi:** `data-src` sekarang menunjuk file 2000px. Kalau nanti butuh
master, ambil dari `../_originals_6000px_backup/`.

### ☑ Phase 3 — Perbaikan `.git` — **SELESAI 2026-09-30** *(nol ukuran, tapi berhasil)*

- [x] `git gc --aggressive --prune=now` → **13 m 50 d**
- [x] Semua loose object terpaket: `count: 172 → 0`, `in-pack: 581 → 752`
- [x] ~~`git filter-repo`~~ **DIBATALKAN** (C3 — repo publik, history tidak boleh di-rewrite)

**Hasil: ukuran TIDAK turun — 1.8 GB → 1.8 GB.** Ini bukan kegagalan `gc`.

| | |
|---|---|
| Working tree sekarang | **194 MB** |
| Blob unik di seluruh history | **1.73 GB** (651 blob) |
| → history mati (sudah tidak dirujuk) | **~1.54 GB** |

`gc` hanya memaketkan & mendekompresi ulang. Ia **tidak bisa** menghapus blob
yang benar-benar ada di commit lama. Itu definisi "history mati": file besar
lama (`Video/A` 64 MB, `sinematik.mp4` 62.9 MB, `WinXP.png` 55.5 MB, dll)
yang sudah tidak ada di working tree.

**Konsekuensi praktis:** `git clone` repo ini ≈ 1.8 GB. GitHub Pages melakukan
clone saat build, jadi tiap deploy mahal. `git push` juga mengunggah pack
penuh setiap kali. Saat ini repo **tidak** bisa di-purge tanpa rewrite.

**Opsi (semua butuh persetujuan pemilik — lihat §9):**
1. Biarkan — berfungsi normal, tapi clone/build lambat.
2. `git filter-repo` — paling efektif, tapi butuh **force-push** dan
   merusak semua clone orang (C3).
3. Orphan branch bersih (`git checkout --orphan`) — riwayat bersih, tapi
   history lama tetap menempel di repo dan repo tetap 1.8 GB.

### ☑ Phase 4 — UI/UX & Responsive — **SELESAI 2026-09-30**

- [x] **Bug overflow WORKS GRID.** Satu-satunya breakpoint grid ada di `450px`,
      jadi 451–992px tetap `repeat(3, minmax(250px,1fr))` → butuh ~782px.
      Tablet/HP landscape jadi scroll horizontal. → `992px`: 2 kolom
- [x] **`.header .box { translate(80%, -50%) }`** pushing copy hero ke kanan
      sampai keluar layar di tablet → reset di `992px`
- [x] `h1/h2/h4/p` → **`clamp()`** ( fluid, bukan px mati). Blok `450px`
      yang tadinya override px sekarang tidak perlu untuk typography
- [x] `.lightbox-close { right: 350px }` → **sudah ada** fix di `992px`
      (itu butir yang sudah selesai sebelumnya, bukan kerja baru)
- [x] `.gallery-item .overlay` → `@media (hover: none)` = **0.7 opacity**,
      karena `:hover` tidak pernah jalan di touch
- [x] **Markup `<ul>` invalid** di index — ada `<li>` membungkus 3 `<li>`
      lain. `<li>` tidak boleh berisi `<li>` langsung; screen reader &
      `.navbar ul li` jadi tidak konsisten. Sudah dirapikan
- [x] **Gallery tidak punya nav link sama sekali** (cuma logo) → user yang
      masuk dari tombol Gallery tidak punya jalan kembali. Ditambah
      `Works` + `Contact` (pakai `./index.html#...` karena `#works` di
      index tidak terjangkau dari page lain)
- [ ] Hamburger menu → **tidak dikerjakan, tidak perlu.** Hanya 3 link
      (≈250px di 22px font); di `450px` sudah turun ke 14px. Navbar
      hamburger untuk 3 item akan menambah JS + CSS tanpa manfaat nyata.

#### ⚠️ Perlu mata pemilik

`.header .box` di `992px` saya reset ke `translate(0, -50%)` supaya teks
tidak keluar layar. Konsekuensinya posisi teks hero di tablet berubah
(bisa menutupi subjek foto, karena `background-size: cover` sudah
meng-crop). Kalau hasilnya terasa salah di mata, tinggal ubah
`transform` di blok `992px`.
- [ ] Hapus `AOS 9000ms`/`5000ms` → cap ~800ms
- [ ] Ubah `scroll-snap-type` dari `mandatory` → `proximity`
- [ ] Navbar `absolute` → `fixed` + shrink saat scroll + active link indicator
- [ ] Ganti `background-attachment: fixed` (lag iOS)
- [ ] **Restore + modernize navbar Gallery** (C5)
- [ ] Tambah "scroll down" indicator di hero

### ☑ Phase 5 — Aksesibilitas — **SELESAI 2026-09-30**

Temuan utama (semua dihitung ulang setelah perbaikan):

| Item | Sebelum | Sesudah |
|---|---|---|
| `<h1>` per halaman | 3 (index) | **1** |
| `<h2>` sebelum `<h1>` | ya ("Hello There...") | **0** (jadi `<p class="eyebrow">`) |
| Gallery item bisa fokus | **0 / 101** | **101 / 101** |
| Tombol close lightbox bisa dioperasikan keyboard | **tidak** (`<span>`) | **ya** (`<button>`) |
| Field form bertanpa `<label>` | **4 / 4** (placeholder saja) | **0** |
| `id` duplikat | `id="text"` × 3 | **0** |
| `alt` generik berulang | 101 (`"photography 1"`) | **0** (`"Photo: Landscape"`) |
| Skip link | tidak ada | **ada** di 2 halaman |
| Lightbox `role`/`aria-modal` | tidak | **ya** |

- [x] **101 `.gallery-item` diberi `role="button"` + `tabindex="0"` + `aria-label`.**
      Sebelumnya semuanya `<div>` → galeri **sepenuhnya tidak bisa dipakai
      keyboard** (WCAG 2.1.1). Enter/Space kini membuka item
- [x] **`.lightbox-close` `<span>` → `<button>`** (bisa fokus + Enter/Space)
- [x] Lightbox jadi `role="dialog"` `aria-modal="true"` `aria-labelledby`
- [x] **Focus management**: fokus masuk ke tombol close saat lightbox dibuka,
      **focus trap** (Tab/Shift-Tab tidak keluar dari dialog), dan fokus
      dikembalikan ke tile asal saat ditutup
- [x] Form: `<label>` asli + `.visually-hidden`, `id` unik, `autocomplete`
      (`name`/`tel`/`email`), ikon FA `aria-hidden`, `required` di email,
      `type="submit"` eksplisit. Placeholder tetap sebagai contoh, bukan label
- [x] `aria-pressed` di 5 filter button, di-sync JS saat filter berubah
- [x] `alt` gambar galeri deskriptif dari `data-title` (bukan `"photography 1"`)
- [x] Skip link di kedua halaman (target `#works` / `#gallery-page` terverifikasi ada)
- [x] `:focus-visible` outline — indikator fokus tidak lagi bergantung pada `:hover`
- [x] `@media (prefers-reduced-motion: reduce)` mematikan transisi

#### Catatan kontras

`#aaa` pada `.lightbox-close` di atas `#000` = **~7.0:1**, lolos AA untuk
teks biasa. Palet `#f7f7f7` / `#ccc` di atas `#111` juga lolos. Yang belum
diuji otomatis adalah gambar di dalam tile — kontras teks `.overlay` tergantung
foto, jadi `rgba(0,0,0,0.7)` yang dipakai sudah cukup aman.

### ☑ Phase 6 — Fitur Baru — **SELESAI 2026-09-30**

- [x] **Lightbox prev/next**: tombol `&lsaquo;` / `&rsaquo;`, navigasi dengan
      `ArrowLeft/ArrowRight`, wrap-around, dan `Home/End` (via Tab trap tidak
      perlu, tapi mudah ditambah). Navigasi **hanya item yang sedang terlihat**
      (menghormati filter aktif), jadi tidak lompat ke kategori tersembunyi
- [x] **Tombol nav disembunyikan jika ≤ 1 item** (render hilang, bukan cuma CSS)
- [x] **Filter URL sync**: `#filter=photography/design/video/game` dibaca saat
      load, `popstate/hashchange` bekerja, tombol `Back/Forward` konsisten.
      URL di-push saat user klik filter (`history.pushState`)
- [x] **Keyboard buka tile**: Enter dan Space membuka item (role=button)
- [x] **Lightbox focus trap + return focus**: fokus kembali ke tile asal saat
      ditutup. Tombol close menjadi titik fokus awal saat dialog dibuka

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
