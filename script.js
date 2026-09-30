// JavaScript untuk interaktivitas website portfolio
// Kode untuk scroll snapping, filter galeri, lightbox, dll. akan ditambahkan di sini.

document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM sepenuhnya dimuat dan di-parse");
  // Setiap init dibungkus sendiri: AOS datang dari CDN, dan kalau CDN itu
  // gagal (offline, adblock, outage) seluruh halaman ini harus tetap punya
  // filter + lightbox. Sebelumnya initAOS() melempar ReferenceError dan
  // membatalkan dua init setelahnya.
  for (const [name, fn] of [
    ["AOS", initAOS],
    ["gallery filter", initGalleryFilter],
    ["lightbox", initLightbox],
    ["scroll-top", initScrollTopButton],
    ["footer year", initFooterYear],
  ]) {
    try {
      fn();
    } catch (err) {
      console.error(`init ${name} gagal:`, err);
    }
  }
});

// --- Konfigurasi Animasi ---
// Ubah hanya blok ini untuk mengatur seluruh animasi di site.
//   enabled : false -> AOS.init({disable:true}) menghapus semua atribut
//                      data-aos*, jadi seluruh animasi mati total.
//   effect  : diterapkan ke tiap .gallery-item dari sini, jadi mengganti
//             efek cukup ubah satu baris (tidak perlu edit 101 di HTML).
//   duration / easing / delay / once : diteruskan ke AOS.init, yang
//             menyalinnya ke body[data-aos-*] sehingga berlaku ke semua
//             elemen tanpa perlu menulis atribut per elemen.
const ANIMATION = {
  enabled: true,
  effect: "fade-up",
  duration: 700,
  easing: "ease-out",
  delay: 0,
  offset: 120,
  once: true,
};

// --- Fungsi Inisialisasi AOS ---
function initAOS() {
  AOS.init({
    disable: !ANIMATION.enabled,
    duration: ANIMATION.duration,
    easing: ANIMATION.easing,
    delay: ANIMATION.delay,
    offset: ANIMATION.offset,
    once: ANIMATION.once,
  });

  if (!ANIMATION.enabled) return;

  const items = document.querySelectorAll(".gallery-item");
  let changed = false;

  items.forEach((item) => {
    if (item.getAttribute("data-aos") !== ANIMATION.effect) {
      item.setAttribute("data-aos", ANIMATION.effect);
      changed = true;
    }
  });

  if (changed) window.AOS.refreshHard();
}

// --- Tahun Copyright di Footer ---
// Teks fallback tahun sudah ditulis di dalam elemen <span data-year>, jadi
// kalau JavaScript gagal atau telat, footernya tetap menampilkan tahun.
function initFooterYear() {
  const year = String(new Date().getFullYear());
  document
    .querySelectorAll("[data-year]")
    .forEach((el) => (el.textContent = year));
}

// --- Fungsi Scroll-to-Top Button (dipindah ke luar) ---
function initScrollTopButton() {
  const scrollTopBtn = document.getElementById("scroll-top-btn");
  if (!scrollTopBtn) return; // Cek dulu, biar gak error kalau gak ada elemennya

  window.addEventListener("scroll", function () {
    if (window.pageYOffset > 300) {
      scrollTopBtn.classList.add("show");
    } else {
      scrollTopBtn.classList.remove("show");
    }
  });

  scrollTopBtn.addEventListener("click", function (e) {
    e.preventDefault();
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  });
}

// --- Fungsi Filter Galeri ---
function initGalleryFilter() {
  const filterContainer = document.querySelector(".filter-buttons");
  const galleryGrid = document.querySelector(".gallery-grid");

  if (!filterContainer || !galleryGrid) return;

  const galleryItems = galleryGrid.querySelectorAll(".gallery-item");

  function applyFilter(filterValue, { pushUrl = false } = {}) {
    const btn = filterContainer.querySelector(`[data-filter="${filterValue}"]`);
    if (!btn) return;

    filterContainer
      .querySelectorAll(".filter-btn")
      .forEach((b) => {
        const on = b === btn;
        b.classList.toggle("active", on);
        b.setAttribute("aria-pressed", String(on));
      });

    galleryItems.forEach((item) => {
      const show = filterValue === "all" || item.getAttribute("data-category") === filterValue;
      item.style.display = show ? "block" : "none";
      item.classList.toggle("is-filtered-out", !show);
    });

    // AOS mengcache `position` setiap elemen SEKALI saat AOS.init(). Filter di
    // atas mengubah layout (display:none -> grid menyusut), tapi MutationObserver
    // AOS hanya memantau childList/removedNodes, BUKAN atribut style, jadi
    // refresh() tidak pernah terpanggil otomatis.
    //
    // Akibatnya `o.in` (≈ absTop - innerHeight + offset) tile design tetap di
    // angka lamanya: filter "design" hanya menyisakan 12 baris sehingga halaman
    // cuma bisa di-scroll sampai ~4200px, sedangkan o.in tile design pertama
    // masih ~5100px. Syarat scrollY >= o.in tidak akan pernah terpenuhi =>
    // tile tetap opacity:0 DAN pointer-events:none selamanya.
    //
    // refresh() hitung ulang position lalu langsung jalankan handleScroll pada
    // pageYOffset saat ini. `?.` wajib: AOS dari CDN, dan tanpa guard satu
    // ReferenceError akan mematikan seluruh filter.
    window.AOS?.refresh();

    if (pushUrl) {
      const url = filterValue === "all"
        ? location.pathname
        : `${location.pathname}#filter=${filterValue}`;
      history.pushState({ filter: filterValue }, "", url);
    }
  }

  filterContainer.addEventListener("click", (e) => {
    const btn = e.target.closest(".filter-btn");
    if (btn) applyFilter(btn.getAttribute("data-filter"), { pushUrl: true });
  });

  // Baca #filter= dari URL saat load, supaya link galeri bisa di-share.
  function filterFromUrl() {
    const m = location.hash.match(/filter=([a-z]+)/i);
    const value = m ? m[1].toLowerCase() : "all";
    return filterContainer.querySelector(`[data-filter="${value}"]`) ? value : "all";
  }

  applyFilter(filterFromUrl());

  window.addEventListener("hashchange", () => applyFilter(filterFromUrl()));
  window.addEventListener("popstate", () => applyFilter(filterFromUrl()));
}

// --- Fungsi Lightbox ---
function initLightbox() {
  const lightbox = document.getElementById("lightbox");
  if (!lightbox) return; // Hanya jalankan jika lightbox ada

  const lightboxImage = lightbox.querySelector(".lightbox-image");
  const lightboxVideo = lightbox.querySelector(".lightbox-video");
  const lightboxTitle = lightbox.querySelector(".lightbox-title");
  const lightboxDesc = lightbox.querySelector(".lightbox-desc");
  const lightboxPlayBtn = lightbox.querySelector(".lightbox-play-btn"); // Ambil tombol play
  const closeBtn = lightbox.querySelector(".lightbox-close");
  const prevBtn = lightbox.querySelector(".lightbox-prev");
  const nextBtn = lightbox.querySelector(".lightbox-next");
  const galleryItems = [...document.querySelectorAll(".gallery-item")];

  let lastFocused = null;
  let currentIndex = -1;

  // Hanya item yang lolos filter yang boleh dinavigasi. Kalau tidak, user
  // menekan panah dan melompat ke kategori yang sedang disembunyikan.
  function visibleItems() {
    return galleryItems.filter((el) => !el.classList.contains("is-filtered-out"));
  }

  function step(delta) {
    const list = visibleItems();
    if (!list.length) return;
    const pos = list.indexOf(lastFocused);
    const next = list[(pos + delta + list.length) % list.length];
    if (next) openItem(next, { moveFocus: true });
  }

  prevBtn.addEventListener("click", () => step(-1));
  nextBtn.addEventListener("click", () => step(1));

  function openItem(item, opts = {}) {
    lastFocused = item;
    currentIndex = galleryItems.indexOf(item);
      const imgSrc = item.getAttribute("data-src");
      const videoSrc = item.getAttribute("data-video-src");
      const title = item.getAttribute("data-title") || ""; // Default ke string kosong
      const desc = item.getAttribute("data-desc") || ""; // Default ke string kosong
      const category = item.getAttribute("data-category"); // Ambil kategori
      const gameUrl = item.getAttribute("data-game-url"); // Ambil URL game

      // Reset tampilan
      lightboxImage.style.display = "none";
      lightboxVideo.style.display = "none";
      lightboxPlayBtn.style.display = "none"; // Sembunyikan tombol play secara default
      lightboxImage.removeAttribute("src");
      lightboxVideo.removeAttribute("src");
      lightboxVideo.load(); // Putuskan koneksi jaringan ke video
      lightboxPlayBtn.href = "#"; // Reset href tombol play

      if (videoSrc) {
        // Tampilkan video
        lightboxVideo.src = videoSrc;
        lightboxVideo.style.display = "block";
        // Autoplay dipisahkan dari langkah tampil: kalau play() melempar, lightbox
        // tetap harus terbuka. Sebelumnya satu error di sini membatalkan
        // seluruh openItem sehingga lightbox tidak pernah muncul.
        try {
          const p = lightboxVideo.play();
          if (p && typeof p.catch === "function") {
            p.catch(() => {
              /* autoplay ditolak browser — user tetap bisa tekan play manual */
            });
          }
        } catch (_) {
          /* play() tidak didukung — video tetap bisa diputar manual */
        }
      } else if (imgSrc) {
        // Tampilkan gambar
        lightboxImage.src = imgSrc;
        lightboxImage.style.display = "block";
      }

      // Handle Tombol Mainkan Game
      if (category === "game" && gameUrl) {
        lightboxPlayBtn.href = gameUrl;
        lightboxPlayBtn.style.display = "inline-block"; // Tampilkan tombol jika game
      }

      // Set caption
      lightboxTitle.textContent = title;
      lightboxDesc.textContent = desc;

      // Tampilkan lightbox
      lightbox.classList.add("active");
      document.body.style.overflow = "hidden"; // Cegah scroll body saat lightbox aktif
      if (opts.moveFocus) item.focus();
      else closeBtn.focus();

      const onlyOne = visibleItems().length < 2;
      prevBtn.hidden = nextBtn.hidden = onlyOne;
      if (onlyOne) closeBtn.focus();
  }

  galleryItems.forEach((item) => {
    item.addEventListener("click", () => openItem(item));
    item.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") {
        e.preventDefault();
        openItem(item);
      }
    });
  });

  // Fungsi untuk menutup lightbox
  function closeLightbox() {
    lightbox.classList.remove("active");
    document.body.style.overflow = ""; // Kembalikan scroll body
    // Hentikan dan lepaskan video saat ditutup
    lightboxVideo.pause();
    lightboxVideo.removeAttribute("src");
    lightboxVideo.load();
    lightboxImage.removeAttribute("src");
    lightboxPlayBtn.style.display = "none"; // Sembunyikan tombol play saat lightbox ditutup
    lightboxPlayBtn.href = "#"; // Reset href saat ditutup
    // Kembalikan fokus ke tile asal, kalau tidak user kehilangan posisi
    // keyboard dan fokus jatuh ke <body>.
    lastFocused?.focus();
  }

  // Event listener untuk tombol close
  closeBtn.addEventListener("click", closeLightbox);

  // Event listener untuk klik di luar konten lightbox
  lightbox.addEventListener("click", (e) => {
    // Hanya tutup jika klik tepat pada background lightbox (bukan kontennya)
    if (e.target === lightbox) {
      closeLightbox();
    }
  });

  // Event listener untuk tombol Escape
  document.addEventListener("keydown", (e) => {
    if (lightbox.classList.contains("active")) {
      if (e.key === "Escape") {
        closeLightbox();
        return;
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        step(-1);
        return;
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        step(1);
        return;
      }
      // Trap fokus: dialog modal harus menahan Tab di dalam dirinya.
      if (e.key === "Tab") {
        const focusable = [...lightbox.querySelectorAll(
          'button, a[href], video[controls], [tabindex]:not([tabindex="-1"])'
        )].filter((el) => el.offsetParent !== null);
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
  });
}
