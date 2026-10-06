import { materias as staticArticles } from "./materias-data.js";

const articleFiles =
  typeof import.meta.glob === "function"
    ? import.meta.glob(["../../materias/*.html", "!../../materias/index.html"], {
        query: "?raw",
        import: "default",
        eager: true,
      })
    : {};
const articleImages =
  typeof import.meta.glob === "function"
    ? import.meta.glob("../materias/**/*.{jpg,jpeg,png,webp,gif}", {
        query: "?url",
        import: "default",
        eager: true,
      })
    : {};

const autoGroup = document.querySelector("#auto-group");
const autoArticles = document.querySelector("#auto-articles");
const existingLinks = new Set(
  [...document.querySelectorAll("[data-article] a[href]")].map((link) =>
    link.getAttribute("href"),
  ),
);

function normalizedThemes(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function articleData(path, source) {
  const document = new DOMParser().parseFromString(source, "text/html");
  const hero = document.querySelector(".article-hero") || document.querySelector("main");
  const filename = path.split("/").pop();
  const eyebrow = hero?.querySelector(".eyebrow")?.textContent.trim() || "Matéria";
  const title =
    hero?.querySelector("h1")?.textContent.trim() ||
    document.querySelector("title")?.textContent.split("—")[0].trim() ||
    filename.replace(/\.html$/, "").replaceAll("-", " ");
  const summarySource =
    hero?.querySelector(".dek") || document.querySelector(".article-body p");
  const summary = summarySource?.textContent.trim() || "Leia a matéria completa.";
  const image = hero?.querySelector(".hero-image img");
  const readingTime = [...(hero?.querySelectorAll(".byline span") || [])]
    .map((item) => item.textContent.trim())
    .find((text) => text.includes("min"));

  return {
    filename,
    title,
    eyebrow,
    summary,
    imageSrc: image?.getAttribute("src"),
    imageAlt: image?.getAttribute("alt") || title,
    readingTime: readingTime || "Leia agora",
    themes: normalizedThemes(`${eyebrow} ${title} ${summary}`),
  };
}

function resolveArticleImage(article) {
  if (!article.imageSrc) return article;

  const imageModulePath = article.imageSrc.replace("../assets/", "../");
  return {
    ...article,
    imageSrc: articleImages[imageModulePath] || article.imageSrc,
  };
}

function createAutoCard(data, number) {
  const article = document.createElement("article");
  article.className = "article-card";
  article.dataset.article = "";
  article.dataset.themes = data.themes;

  const link = document.createElement("a");
  link.href = data.filename;

  if (data.imageSrc) {
    const imageWrap = document.createElement("div");
    imageWrap.className = "card-image";
    const image = document.createElement("img");
    image.src = data.imageSrc;
    image.alt = data.imageAlt;
    const badge = document.createElement("span");
    badge.textContent = data.eyebrow.split("/")[0].trim();
    imageWrap.append(image, badge);
    link.append(imageWrap);
  }

  const copy = document.createElement("div");
  copy.className = "card-copy";
  const eyebrow = document.createElement("p");
  eyebrow.className = "eyebrow";
  eyebrow.textContent = data.eyebrow;
  const title = document.createElement("h3");
  title.textContent = data.title;
  const summary = document.createElement("p");
  summary.textContent = data.summary;
  const meta = document.createElement("div");
  meta.className = "card-meta";
  const time = document.createElement("span");
  time.textContent = data.readingTime;
  const index = document.createElement("b");
  index.textContent = `${String(number).padStart(2, "0")} ↗`;
  meta.append(time, index);
  copy.append(eyebrow, title, summary, meta);
  link.append(copy);
  article.append(link);

  return article;
}

const catalogArticles = Object.keys(articleFiles).length
  ? Object.entries(articleFiles).map(([path, source]) => articleData(path, source))
  : staticArticles;

const discoveredArticles = catalogArticles
  .map(resolveArticleImage)
  .filter((article) => !existingLinks.has(article.filename))
  .sort((a, b) => a.title.localeCompare(b.title, "pt-BR"));

const staticArticleCount = existingLinks.size;
discoveredArticles.forEach((article, index) => {
  autoArticles.append(createAutoCard(article, staticArticleCount + index + 1));
});
autoGroup.hidden = discoveredArticles.length === 0;

const filterButtons = document.querySelectorAll("[data-filter]");
const articles = [...document.querySelectorAll("[data-article]")];
const groups = document.querySelectorAll("[data-group]");
const resultCount = document.querySelector("#result-count");
const emptyState = document.querySelector("#empty-state");
const archiveCopy = document.querySelector(".archive-copy");
const archiveMenuToggle = document.querySelector(".archive-menu-toggle");

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

    if (window.matchMedia("(max-width: 650px)").matches) {
      archiveCopy.classList.remove("is-open");
      archiveMenuToggle.setAttribute("aria-expanded", "false");
    }
  });
});

archiveMenuToggle.addEventListener("click", () => {
  const isOpen = archiveCopy.classList.toggle("is-open");
  archiveMenuToggle.setAttribute("aria-expanded", String(isOpen));
});

updateArchive();
