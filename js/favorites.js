// === favorites.js ===
const STORAGE_KEY = "mealmaker_favorites";

function getFavorites() {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

function isFavorite(mealId) {
  return getFavorites().some(fav => fav.id === mealId);
}

function toggleFavorite(mealId, mealName, mealThumb) {
  let favorites = getFavorites();
  if (isFavorite(mealId)) {
    favorites = favorites.filter(fav => fav.id !== mealId);
  } else {
    favorites.push({ id: mealId, name: mealName, thumb: mealThumb });
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
  renderCookList();
}

function renderCookList() {
  const list = document.getElementById("favorites-list");
  const favorites = getFavorites();

  if (favorites.length === 0) {
    list.innerHTML = `<li class="cooklist-empty">No recipes saved yet.</li>`;
    return;
  }

  list.innerHTML = "";
  favorites.forEach(fav => {
    const li = document.createElement("li");
    li.className = "cooklist-item";
    li.innerHTML = `
      <img src="${fav.thumb}" alt="${fav.name}" />
      <span class="cooklist-item-name">${fav.name}</span>
      <button class="cooklist-item-remove" aria-label="Remove ${fav.name}">x</button>
    `;

    // Click on name/image opens modal
    li.querySelector("img").addEventListener("click", () => openModal(fav.id));
    li.querySelector(".cooklist-item-name").addEventListener("click", () => openModal(fav.id));

    // Remove button
    li.querySelector(".cooklist-item-remove").addEventListener("click", (e) => {
      e.stopPropagation();
      toggleFavorite(fav.id, fav.name, fav.thumb);
      updateFavBtn(fav.id);
    });

    list.appendChild(li);
  });
  // Update toggle button count and visibility
  const toggle = document.getElementById("cooklist-toggle");
  const count = document.getElementById("cooklist-count");
  const favs = getFavorites();
  count.textContent = favs.length;
  if (favs.length > 0) {
    toggle.classList.remove("hidden");
  } else {
    toggle.classList.add("hidden");
  }
}

