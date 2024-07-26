document.addEventListener('DOMContentLoaded', function() {
    const scrollTopBtn = document.getElementById('scroll-top-btn');
    let isScrolling;

    window.addEventListener('scroll', function() {
        scrollTopBtn.classList.remove('show');

        window.clearTimeout(isScrolling);

        isScrolling = setTimeout(function() {
            scrollTopBtn.classList.add('show');
        }, 300); // Adjust the timeout as needed
    });
});