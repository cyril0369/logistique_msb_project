const MENU_CONFIG = {
  guest: [
    { label: "Accueil", href: "/" },
    { label: "À propos", href: "/about_us" },
    { label: "Connexion / Inscription", href: "/login" }
  ],
  user: [
    { label: "Accueil", href: "/" },
    { label: "Mon profil", href: "/dashboard" },
    { label: "Commander des goodies", href: "/goodies" }
  ],
  staff: [
    { label: "Accueil", href: "/" },
    { label: "Mon profil", href: "/dashboard" },
    { label: "Documents utiles", href: "/documents" }
  ],
  admin: [
    { label: "Accueil", href: "/" },
    { label: "Espace personnel", href: "/dashboard" },
    { label: "Gestion utilisateurs", href: "/users" },
    { label: "Gestion des jobs", href: "/jobs" },
    { label: "Commandes goodies", href: "/order_detail" }
  ]
};

function ensureDrawer() {
  if (document.getElementById("side-drawer")) return;
  const drawer = document.createElement("aside");
  drawer.id = "side-drawer";
  drawer.innerHTML = `
    <div class="drawer-header">
      <button class="drawer-close-btn" type="button" aria-label="Fermer le menu" onclick="closeHamburger()">
        Fermer
      </button>
    </div>
    <nav class="drawer-nav">
      <ul id="drawer-links"></ul>
    </nav>
  `;
  document.body.appendChild(drawer);

  drawer.addEventListener("click", (evt) => {
    if (evt.target.closest("a")) {
      closeHamburger();
    }
  });
}

function renderMenu(status) {
  const list = document.getElementById("drawer-links");
  if (!list) return;
  const items = MENU_CONFIG[status] || MENU_CONFIG.guest;
  list.innerHTML = items
    .map((item) => `<h3><a href="${item.href}">${item.label}</a></h3>`)
    .join("");
  document.body.setAttribute("data-menu-status", status);
}

async function loadStatus() {
  try {
    const res = await fetch("/session-info", { credentials: "include" });
    if (!res.ok) throw new Error("bad status");
    const data = await res.json();
    return data?.status || "guest";
  } catch (e) {
    return "guest";
  }
}

async function initDrawer() {
  ensureDrawer();
  const status = await loadStatus();
  renderMenu(status);
}

document.addEventListener("DOMContentLoaded", initDrawer);

function toggleHamburger(button) {
  if (!button) return;
  const isOpen = button.classList.toggle("open");
  button.setAttribute("aria-pressed", String(isOpen));

  const menuIcon = button.querySelector(".icon-menu");
  const closeIcon = button.querySelector(".icon-close");
  if (menuIcon && closeIcon) {
    menuIcon.setAttribute("aria-hidden", String(isOpen));
    closeIcon.setAttribute("aria-hidden", String(!isOpen));
  }

  document.body.classList.toggle("menu-open", isOpen);
}

function closeHamburger() {
  document.body.classList.remove("menu-open");
  const btn = document.querySelector(".hamburger-btn.open");
  if (!btn) return;
  btn.classList.remove("open");
  btn.setAttribute("aria-pressed", "false");
  const menuIcon = btn.querySelector(".icon-menu");
  const closeIcon = btn.querySelector(".icon-close");
  if (menuIcon && closeIcon) {
    menuIcon.setAttribute("aria-hidden", "false");
    closeIcon.setAttribute("aria-hidden", "true");
  }
}
