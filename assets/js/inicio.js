const menuButton = document.querySelector(".menu-button");
const menu = document.querySelector("#main-menu");

function closeMenu() {
  menuButton.classList.remove("is-open");
  menu.classList.remove("is-open");
  menuButton.setAttribute("aria-expanded", "false");
  menuButton.setAttribute("aria-label", "Abrir menu");
}

menuButton.addEventListener("click", () => {
  const isOpen = menuButton.classList.toggle("is-open");
  menu.classList.toggle("is-open", isOpen);
  menuButton.setAttribute("aria-expanded", String(isOpen));
  menuButton.setAttribute("aria-label", isOpen ? "Fechar menu" : "Abrir menu");
});

menu.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", closeMenu);
});
