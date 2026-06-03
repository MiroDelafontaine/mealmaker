// === app.js ===
// Main logic — connects ui.js, api.js and favorites.js

const ingredients = [];

// Variables declared at the top — important!
let activeFilter = null;
let lastResults = [];

const CATEGORIES = [
  "Vegetarian", "Vegan", "Seafood", "Beef",
  "Chicken", "Pasta", "Dessert", "Breakfast"
];

// DOM elements
const input = document.getElementById("ingredient-input");
const addBtn = document.getElementById("add-btn");
const searchBtn = document.getElementById("search-btn");
const modalClose = document.getElementById("modal-close");
const modalOverlay = document.getElementById("modal-overlay");

// === ADD INGREDIENT ===

function addIngredient() {
  const value = input.value.trim();
  if (!value) return;
  if (ingredients.includes(value.toLowerCase())) {
    input.value = "";
    return;
  }
  ingredients.push(value.toLowerCase());
  renderTag(value, removeIngredient);
  input.value = "";
}

function removeIngredient(ingredient) {
  const index = ingredients.indexOf(ingredient.toLowerCase());
  if (index !== -1) {
    ingredients.splice(index, 1);
  }
}

addBtn.addEventListener("click", addIngredient);


// === SEARCH RECIPES ===

searchBtn.addEventListener("click", async () => {
  showError(false);
  activeFilter = null; // Reset filter on every new search

  if (ingredients.length === 0) {
    showError(true);
    document.getElementById("error-msg").textContent =
      "Please add at least one ingredient first.";
    return;
  }

  showLoading();

  try {
    const meals = await fetchMealsByIngredients(ingredients);

    if (meals.length === 0) {
      document.getElementById("recipe-grid").innerHTML = "";
      showError(true);
      document.getElementById("error-msg").textContent =
        "No recipes found for this combination. Try different ingredients.";
      return;
    }

    lastResults = meals;
    document.getElementById("filter-bar").classList.remove("hidden");
    renderFilterButtons(); // Re-render so active state is cleared
    renderRecipeCards(meals);

document.getElementById("results-section").scrollIntoView({
  behavior: "smooth"
});

  } catch (error) {
    document.getElementById("recipe-grid").innerHTML = "";
    showError(true);
    document.getElementById("error-msg").textContent =
      "Something went wrong. Please check your connection and try again.";
    console.error(error);
  }
});

// === MODAL CLOSE ===

modalClose.addEventListener("click", closeModal);
modalOverlay.addEventListener("click", closeModal);

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeModal();
});

// === CATEGORY FILTER ===

function renderFilterButtons() {
  const container = document.getElementById("filter-buttons");
  container.innerHTML = "";

  CATEGORIES.forEach(cat => {
    const btn = document.createElement("button");
    btn.className = "filter-btn" + (activeFilter === cat ? " active" : "");
    btn.textContent = cat;

    btn.addEventListener("click", () => {
      activeFilter = activeFilter === cat ? null : cat;
      renderFilterButtons();
      applyFilter();
    });

    container.appendChild(btn);
  });
}

async function applyFilter() {
  showError(false);

  if (!activeFilter) {
    renderRecipeCards(lastResults);
    return;
  }

  // Get all meal IDs for this category from API
  const categoryMeals = await fetchMealsByCategory(activeFilter);
  const categoryIds = new Set(categoryMeals.map(m => m.idMeal));

  // Keep only meals from lastResults that are in this category
  const filtered = lastResults.filter(meal => categoryIds.has(meal.idMeal));

  if (filtered.length === 0) {
    document.getElementById("recipe-grid").innerHTML = "";
    showError(true);
    document.getElementById("error-msg").textContent =
      `No "${activeFilter}" recipes found. Try a different filter.`;
  } else {
    renderRecipeCards(filtered);
  }
}

// === INITIALIZE ===
renderCookList();
renderFilterButtons();

// === NAVBAR SCROLL EFFECT ===
window.addEventListener("scroll", () => {
  const navbar = document.querySelector(".navbar");
  navbar.classList.toggle("scrolled", window.scrollY > 10);
});

// === COOK LIST DRAWER ===
const cooklistToggle = document.getElementById("cooklist-toggle");
const cooklistDrawer = document.getElementById("cooklist-drawer");
const cooklistOverlay = document.getElementById("cooklist-overlay");
const cooklistClose = document.getElementById("cooklist-close");

function openCooklist() {
  cooklistDrawer.classList.remove("hidden");
  cooklistOverlay.classList.remove("hidden");
  setTimeout(() => cooklistDrawer.classList.add("open"), 10);
}

function closeCooklist() {
  cooklistDrawer.classList.remove("open");
  setTimeout(() => {
    cooklistDrawer.classList.add("hidden");
    cooklistOverlay.classList.add("hidden");
  }, 350);
}

cooklistToggle.addEventListener("click", openCooklist);
cooklistClose.addEventListener("click", closeCooklist);
cooklistOverlay.addEventListener("click", closeCooklist);