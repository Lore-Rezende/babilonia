const filterButtons = document.querySelectorAll("[data-filter]");
const articles = [...document.querySelectorAll("[data-article]")];
const groups = document.querySelectorAll("[data-group]");
const resultCount = document.querySelector("#result-count");
const emptyState = document.querySelector("#empty-state");

let activeFilter = "todos";

function updateArchive() {
  let visibleCount = 0;

  articles.forEach((article) => {
    const themes = article.dataset.themes;
    const matchesFilter =
      activeFilter === "todos" || themes.includes(activeFilter);
    const visible = matchesFilter;

    article.hidden = !visible;
    if (visible) visibleCount += 1;
  });

  groups.forEach((group) => {
    const hasVisibleArticle = [...group.querySelectorAll("[data-article]")].some(
      (article) => !article.hidden,
    );
    group.hidden = !hasVisibleArticle;
  });

  resultCount.textContent = String(visibleCount).padStart(2, "0");
  emptyState.hidden = visibleCount !== 0;
}

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activeFilter = button.dataset.filter;
    filterButtons.forEach((item) => item.classList.toggle("active", item === button));
    updateArchive();
  });
});
