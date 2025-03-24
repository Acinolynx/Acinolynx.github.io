document.addEventListener("DOMContentLoaded", function () {
  // Scroll to top button functionality
  const scrollTopBtn = document.getElementById("scroll-top-btn");

  // Show/hide scroll to top button
  window.addEventListener("scroll", function () {
    if (window.pageYOffset > 300) {
      scrollTopBtn.classList.add("show");
    } else {
      scrollTopBtn.classList.remove("show");
    }
  });

  // Smooth scroll to top
  scrollTopBtn.addEventListener("click", function (e) {
    e.preventDefault();
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  });

  // Initialize AOS animations
  AOS.init({
    duration: 1000,
    once: true,
  });
});
