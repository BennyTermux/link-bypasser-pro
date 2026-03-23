// Fake stats animation
document.addEventListener('DOMContentLoaded', () => {
  const counters = document.querySelectorAll('.stat-number');
  const duration = 2500;

  counters.forEach(counter => {
    const target = +counter.getAttribute('data-target');
    let count = 0;
    const increment = target / (duration / 16);

    const update = () => {
      count += increment;
      if (count < target) {
        counter.textContent = Math.ceil(count).toLocaleString();
        requestAnimationFrame(update);
      } else {
        counter.textContent = target.toLocaleString();
      }
    };
    update();
  });

  // Testimonial carousel
  const reviews = document.querySelectorAll('.review');
  if (reviews.length === 0) return;

  let current = 0;

  function showNext() {
    reviews.forEach(r => r.classList.remove('active'));
    reviews[current].classList.add('active');
    current = (current + 1) % reviews.length;
  }

  showNext();
  setInterval(showNext, 6000);
});
