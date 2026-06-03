// === ui.js ===
// Everything that touches the DOM: rendering cards, tags, modal

// Render all recipe cards into the grid
function renderRecipeCards(meals) {
  const grid = document.getElementById("recipe-grid");
  grid.innerHTML = "";

  meals.forEach(meal => {
    const matchCount = meal._matchCount || 1;
    const total = meal._totalIngredients || 1;
    const allMatch = matchCount === total;

    const badgeText = total > 1 ? `${matchCount}/${total} matched` : "";
    const badgeStyle = allMatch
      ? "background: rgba(61,107,79,0.85); color: #fff;"
      : "background: rgba(232,168,76,0.85); color: #fff;";

    const card = document.createElement("div");
    card.className = "recipe-card";
    card.innerHTML = `
      <img src="${meal.strMealThumb}" alt="${meal.strMeal}" loading="lazy" />
      <div class="recipe-card-overlay"></div>
      ${badgeText ? `<span class="match-badge" style="${badgeStyle}">${badgeText}</span>` : ""}
      <div class="recipe-card-body">
        <h3 class="recipe-card-title">${meal.strMeal}</h3>
        <p class="recipe-card-desc">${meal.strCategory || ""} ${meal.strArea ? "· " + meal.strArea : ""}</p>
      </div>
    `;

    card.addEventListener("click", () => openModal(meal.idMeal));
    grid.appendChild(card);
  });
}
  
  // Add a tag to the tag container
  function renderTag(ingredient, onRemove) {
    const container = document.getElementById("tag-container");
    const tag = document.createElement("div");
    tag.className = "tag";
    tag.dataset.ingredient = ingredient;
    tag.innerHTML = `
      <span>${ingredient}</span>
      <button class="tag-remove" aria-label="Remove ${ingredient}">x</button>
    `;
  
    tag.querySelector(".tag-remove").addEventListener("click", () => {
      tag.remove();
      onRemove(ingredient);
    });
  
    container.appendChild(tag);
  }
  
  // Show or hide the error message
  function showError(visible) {
    const el = document.getElementById("error-msg");
    el.classList.toggle("hidden", !visible);
  }
  
  // Show a loading state in the grid
  function showLoading() {
    const grid = document.getElementById("recipe-grid");
    grid.innerHTML = `
      <div class="loading-msg">Searching for recipes...</div>
    `;
  }
  
  // Open modal and load full recipe details
  async function openModal(mealId) {
    const overlay = document.getElementById("modal-overlay");
    const modal = document.getElementById("modal");
    const body = document.getElementById("modal-body");
  
    // Show modal immediately with loading state
    overlay.classList.remove("hidden");
    modal.classList.remove("hidden");
    body.innerHTML = `<p style="padding: 1rem;">Loading recipe...</p>`;
  
    // Fetch full details (nested request)
    const meal = await fetchMealById(mealId);
    if (!meal) {
      body.innerHTML = `<p style="padding: 1rem;">Could not load recipe. Please try again.</p>`;
      return;
    }
  
    // Build ingredient list from meal data
    // TheMealDB stores ingredients as strIngredient1, strIngredient2, ... up to 20
    const ingredients = [];
    for (let i = 1; i <= 20; i++) {
      const name = meal[`strIngredient${i}`];
      const measure = meal[`strMeasure${i}`];
      if (name && name.trim()) {
        ingredients.push({ name, measure: measure || "" });
      }
    }
  
    // Store base ingredients for portion calculator
    const baseIngredients = [...ingredients];
    const BASE_PORTIONS = 4;
  
body.innerHTML = `
  <img class="modal-hero-img" src="${meal.strMealThumb}" alt="${meal.strMeal}" />
  <div class="modal-body-content">
    <h2 class="modal-title">${meal.strMeal}</h2>
    <p class="modal-subtitle">${meal.strCategory || ""} ${meal.strArea ? "· " + meal.strArea : ""}</p>

    <div class="modal-grid">
      <div class="modal-ingredients">
        <p class="modal-section-label">Ingredients</p>
        <div class="portion-row">
          <label for="portion-input">Portions:</label>
          <input type="number" id="portion-input" value="${BASE_PORTIONS}" min="1" max="99" />
        </div>
        <ul id="ingredient-list">
          ${baseIngredients.map(ing => `
            <li data-base="${ing.measure}">
              ${ing.measure} ${ing.name}
            </li>
          `).join("")}
        </ul>
        <button class="btn-favorite" id="fav-btn" data-id="${meal.idMeal}" data-name="${meal.strMeal}">
          Save to Cook List
        </button>
      </div>

      <div class="modal-instructions">
        <p class="modal-section-label">Instructions</p>
        <p>${meal.strInstructions || "No instructions available."}</p>
      </div>
    </div>
  </div>
`;
  
    // Portion calculator logic
    const portionInput = document.getElementById("portion-input");
    portionInput.addEventListener("input", () => {
      const portions = parseFloat(portionInput.value) || 1;
      const factor = portions / BASE_PORTIONS;
      const items = document.querySelectorAll("#ingredient-list li");
  
      items.forEach((li, index) => {
        const baseMeasure = baseIngredients[index].measure;
        const name = baseIngredients[index].name;
        const scaled = scaleMeasure(baseMeasure, factor);
        li.textContent = `${scaled} ${name}`;
      });
    });
  
    // Favorite button
    document.getElementById("fav-btn").addEventListener("click", () => {
      toggleFavorite(meal.idMeal, meal.strMeal, meal.strMealThumb);
      updateFavBtn(meal.idMeal);
    });
  
    updateFavBtn(meal.idMeal);
  }
  
  // Update favorite button label based on current state
  function updateFavBtn(mealId) {
    const btn = document.getElementById("fav-btn");
    if (!btn) return;
    const isFav = isFavorite(mealId);
    btn.textContent = isFav ? "Remove from Cook List" : "Save to Cook List";
    btn.style.background = isFav ? "var(--green)" : "";
    btn.style.color = isFav ? "var(--white)" : "";
  }
  
  // Close the modal
  function closeModal() {
    document.getElementById("modal").classList.add("hidden");
    document.getElementById("modal-overlay").classList.add("hidden");
    document.getElementById("modal-body").innerHTML = "";
  }
  
  // Scale a measure string by a factor
  // e.g. "200g" * 2 = "400g", "1 cup" * 1.5 = "1.5 cup"
  function scaleMeasure(measure, factor) {
    if (!measure || !measure.trim()) return "";
  
    // Try to find a number at the start of the measure string
    const match = measure.trim().match(/^([\d./]+)(.*)/);
    if (!match) return measure; // No number found, return as-is
  
    let number = eval(match[1]); // Handles fractions like "1/2"
    const rest = match[2];
  
    const scaled = Math.round(number * factor * 10) / 10;
    return `${scaled}${rest}`;
  }