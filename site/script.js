const topbar = document.querySelector(".topbar");
const counters = document.querySelectorAll("[data-count]");

const setTopbarState = () => {
  topbar.classList.toggle("is-solid", window.scrollY > 24);
};

setTopbarState();
window.addEventListener("scroll", setTopbarState, { passive: true });

const countObserver = new IntersectionObserver((entries, observer) => {
  for (const entry of entries) {
    if (!entry.isIntersecting) continue;

    const node = entry.target;
    const target = Number(node.dataset.count);
    const duration = 900;
    const start = performance.now();

    const tick = (time) => {
      const progress = Math.min((time - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      node.textContent = `${(target * eased).toFixed(target < 10 ? 2 : 1)}%`;
      if (progress < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
    observer.unobserve(node);
  }
}, { threshold: 0.35 });

counters.forEach((counter) => countObserver.observe(counter));
