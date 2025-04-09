// JavaScript untuk interaktivitas website portfolio
// Kode untuk scroll snapping, filter galeri, lightbox, dll. akan ditambahkan di sini.

document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM sepenuhnya dimuat dan di-parse");
  initAOS();
  initGalleryFilter();
  initLightbox();
  initScrollTopButton(); // Panggil di sini, tetap global
});

// --- Fungsi Inisialisasi AOS ---
function initAOS() {
  AOS.init({
    duration: 1000,
    once: true,
  });
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

  filterContainer.addEventListener("click", (e) => {
    if (e.target.classList.contains("filter-btn")) {
      filterContainer.querySelector(".active")?.classList.remove("active");
      e.target.classList.add("active");

      const filterValue = e.target.getAttribute("data-filter");

      galleryItems.forEach((item) => {
        const itemCategory = item.getAttribute("data-category");

        if (filterValue === "all" || itemCategory === filterValue) {
          item.style.display = "block";
          item.classList.remove("hidden");
          item.classList.add("visible");
        } else {
          item.style.display = "none";
          item.classList.remove("visible");
          item.classList.add("hidden");
        }
      });
    }
  });

  const style = document.createElement("style");
  style.textContent = `
    .gallery-item {
      transition: opacity 0.5s ease-in-out, transform 0.5s ease-in-out;
    }
    .gallery-item.hidden {
      opacity: 0;
      transform: scale(0.9);
    }
    .gallery-item.visible {
      opacity: 1;
      transform: scale(1);
    }
  `;
  document.head.appendChild(style);
  galleryItems.forEach((item) => item.classList.add("visible"));
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
  const galleryItems = document.querySelectorAll(".gallery-item");

  galleryItems.forEach((item) => {
    item.addEventListener("click", () => {
      const imgSrc = item.getAttribute("data-src");
      const videoSrc = item.getAttribute("data-video-src");
      const title = item.getAttribute("data-title") || ""; // Default ke string kosong
      const desc = item.getAttribute("data-desc") || ""; // Default ke string kosong
      const category = item.getAttribute("data-category"); // Ambil kategori
      const gameUrl = item.getAttribute("data-game-url"); // Ambil URL game

      // Reset display
      lightboxImage.style.display = "none";
      lightboxVideo.style.display = "none";
      lightboxPlayBtn.style.display = "none"; // Sembunyikan tombol play secara default
      lightboxImage.src = "";
      lightboxVideo.src = "";
      lightboxPlayBtn.href = "#"; // Reset href tombol play

      if (videoSrc) {
        // Tampilkan video
        lightboxVideo.src = videoSrc;
        lightboxVideo.style.display = "block";
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
    });
  });

  // Fungsi untuk menutup lightbox
  function closeLightbox() {
    lightbox.classList.remove("active");
    document.body.style.overflow = ""; // Kembalikan scroll body
    // Hentikan video saat ditutup
    lightboxVideo.src = "";
    lightboxImage.src = "";
    lightboxPlayBtn.style.display = "none"; // Sembunyikan tombol play saat lightbox ditutup
    lightboxPlayBtn.href = "#"; // Reset href saat ditutup
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
    if (e.key === "Escape" && lightbox.classList.contains("active")) {
      closeLightbox();
    }
  });
}
