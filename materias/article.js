const progress = document.querySelector(".progress");

function updateProgress() {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const percentage = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
  progress.style.width = `${Math.min(percentage, 100)}%`;
}

window.addEventListener("scroll", updateProgress, { passive: true });
updateProgress();
